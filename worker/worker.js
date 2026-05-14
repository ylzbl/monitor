// yz-monitor Cloudflare Worker
// Serves static files from GitHub + CORS proxy + Weibo RSS micro-service

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/ylzbl/monitor/main/';

const CONTENT_TYPES = {
  'html': 'text/html; charset=utf-8',
  'js': 'application/javascript; charset=utf-8',
  'css': 'text/css; charset=utf-8',
  'svg': 'image/svg+xml',
  'json': 'application/json; charset=utf-8',
  'md': 'text/markdown; charset=utf-8',
  'txt': 'text/plain; charset=utf-8',
  'ico': 'image/x-icon',
  'png': 'image/png',
};

function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    ...extra,
  };
}

// === CORS PROXY ===
async function handleProxy(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: corsHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 15000);
    const targetUrlObj = new URL(targetUrl);
    const resp = await fetch(targetUrl, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': targetUrlObj.origin + '/',
      },
    });
    clearTimeout(tid);
    const buf = await resp.arrayBuffer();
    const contentType = resp.headers.get('Content-Type') || 'text/html; charset=utf-8';
    return new Response(buf, {
      status: 200,
      headers: corsHeaders({
        'Content-Type': contentType,
        'X-Original-Status': resp.status.toString(),
        'Cache-Control': 'no-cache',
      }),
    });
  } catch (e) {
    return new Response('', {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Proxy-Error': (e.message || 'timeout').substring(0, 100),
        'Cache-Control': 'no-cache',
      }),
    });
  }
}

// === WEIBO RSS via visitor auth ===
async function handleWeiboRSS(request) {
  const url = new URL(request.url);
  const uid = url.pathname.match(/\/api\/weibo\/(\d+)/)?.[1];
  if (!uid) {
    return new Response(JSON.stringify({ error: 'Missing Weibo UID. Usage: /api/weibo/{uid}' }), {
      status: 400,
      headers: corsHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  try {
    // Step 1: Get visitor tid
    const gvResp = await fetch('https://passport.weibo.com/visitor/genvisitor', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://weibo.com/',
      },
      body: 'cb=visitor_gray_callback&from=weibo',
    });
    const gvText = await gvResp.text();
    const tidMatch = gvText.match(/"tid":"([^"]+)"/);
    if (!tidMatch) {
      return new Response(generateEmptyRSS(`weibo_user_${uid}`, 'Visitor auth failed'), {
        status: 200,
        headers: corsHeaders({ 'Content-Type': 'application/xml; charset=utf-8' }),
      });
    }
    const tid = tidMatch[1];

    // Step 2: Get visitor cookies
    const vResp = await fetch(`https://passport.weibo.com/visitor/visitor?a=incarn&t=${encodeURIComponent(tid)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://weibo.com/',
      },
      redirect: 'manual',
    });
    const setCookies = vResp.headers.getAll?.('set-cookie') || [];
    let subCookie = '';
    for (const sc of setCookies) {
      const subMatch = sc.match(/SUB=([^;]+)/);
      if (subMatch) { subCookie = 'SUB=' + subMatch[1]; break; }
    }
    if (!subCookie) {
      const vBody = await vResp.text();
      const subMatch2 = vBody.match(/SUB=([^;"]+)/);
      if (subMatch2) subCookie = 'SUB=' + subMatch2[1];
    }

    // Step 3: Fetch user timeline
    const apiHeaders = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      'Accept': 'application/json',
      'Referer': `https://m.weibo.cn/u/${uid}`,
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (subCookie) apiHeaders['Cookie'] = subCookie;

    const apiResp = await fetch(`https://m.weibo.cn/api/container/getIndex?containerid=107603${uid}&page=1`, {
      headers: apiHeaders,
    });
    const data = await apiResp.json();

    if (!data.ok || !data.data?.cards) {
      return new Response(generateEmptyRSS(`weibo_user_${uid}`, 'No data from Weibo API'), {
        status: 200,
        headers: corsHeaders({ 'Content-Type': 'application/xml; charset=utf-8' }),
      });
    }

    const items = [];
    let userName = `微博用户${uid}`;
    for (const card of data.data.cards) {
      const mblog = card.mblog;
      if (!mblog) continue;
      if (mblog.user?.screen_name) userName = mblog.user.screen_name;
      const rawText = (mblog.text || '').replace(/<[^>]+>/g, '').trim();
      const title = mblog.status_title || mblog.page_info?.title || truncateText(rawText, 80) || '微博动态';
      const link = mblog.mid ? `https://weibo.com/${mblog.user?.id || uid}/${mblog.mid}` : `https://m.weibo.cn/status/${mblog.id}`;
      const pubDate = mblog.created_at ? parseWeiboDate(mblog.created_at) : new Date().toUTCString();
      items.push({ title, link, pubDate, description: rawText || title });
    }

    const rssXml = generateRSS(`微博-${userName}`, `https://weibo.com/u/${uid}`, `${userName}的微博动态`, items);
    return new Response(rssXml, {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      }),
    });
  } catch (e) {
    return new Response(generateEmptyRSS(`weibo_user_${uid}`, e.message), {
      status: 200,
      headers: corsHeaders({ 'Content-Type': 'application/xml; charset=utf-8' }),
    });
  }
}

function parseWeiboDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toUTCString();
    return new Date().toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

function truncateText(text, maxLen) {
  if (!text) return '';
  text = text.trim();
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

function escapeXml(s) {
  return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : '';
}

function generateRSS(title, link, description, items) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(title)}</title>
<link>${escapeXml(link)}</link>
<description>${escapeXml(description)}</description>
<language>zh-CN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(item => `<item>
<title>${escapeXml(item.title)}</title>
<link>${escapeXml(item.link)}</link>
<pubDate>${escapeXml(item.pubDate)}</pubDate>
<description>${escapeXml(item.description)}</description>
</item>`).join('\n')}
</channel>
</rss>`;
}

function generateEmptyRSS(title, reason) {
  return generateRSS(title, '', reason || '暂无数据', []);
}

// === STATIC FILE SERVING ===
async function handleStatic(pathname) {
  let filePath = pathname === '/' || pathname === '' ? 'index.html' : pathname;
  if (filePath.startsWith('/')) filePath = filePath.slice(1);

  const githubUrl = GITHUB_RAW_BASE + filePath;
  try {
    const resp = await fetch(githubUrl, {
      headers: { 'User-Agent': 'Cloudflare-Worker' },
    });
    if (resp.ok) {
      const body = await resp.arrayBuffer();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': getContentType(filePath),
          'Cache-Control': 'public, max-age=60',
        },
      });
    }
  } catch (e) {}
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// === MAIN ROUTER ===
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/api/proxy') {
      return handleProxy(request);
    }

    if (url.pathname.match(/^\/api\/weibo\/\d+/)) {
      return handleWeiboRSS(request);
    }

    return handleStatic(url.pathname);
  },
};
