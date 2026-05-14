/* ============================================================
   行业监控系统 v0.9 — 共享核心逻辑
   娱乐资本论
   ============================================================ */
const V = '1.1';

// === BLOCKED DOMAINS (compliance filter) ===
const BLOCKED_DOMAINS = [
  'epochtimes.com','theepochtimes.com','ntd.com','ntdtv.com','ntdtv.org',
  'rfi.fr','rfi.cn','rfa.org','voanews.com','voacambodia.com','voachinese.com',
  'dw.com','dw.de','dw.cn','bbc.com','bbc.co.uk','bbc.co',
  'nytimes.com','cn.nytimes.com','nyt.com',
  'theguardian.com','washingtonpost.com','wsj.com',
  'reuters.com','apnews.com','bloomberg.com',
  'economist.com','ft.com','scmp.com',
  'amnesty.org','hrw.org','chinaaid.org','boxedcat.com',
  'boxun.com','wenxuecity.com','6park.com','creaders.net',
  'secretchina.com','visiontimes.com','kanzhongguo.com',
  'chinadigitaltimes.net','chinachange.org','chinainperspective.com',
  'news.google.com'
];

// === AI PROVIDER PRESETS ===
const AI_PROVIDERS = {
  zhipu:{name:'智谱 GLM',url:'https://open.bigmodel.cn/api/paas/v4/chat/completions',model:'glm-4-flash'},
  deepseek:{name:'DeepSeek',url:'https://api.deepseek.com/v1/chat/completions',model:'deepseek-chat'},
  gemini:{name:'Google Gemini',url:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',model:'gemini-2.0-flash'},
  openai:{name:'OpenAI 兼容',url:'',model:'gpt-3.5-turbo'},
  custom:{name:'自定义',url:'',model:''}
};

// === CORS PROXIES ===
// 优先使用自建Cloudflare Worker代理（解决CORS问题），公共代理作为降级备选
function getSelfProxyBase() {
  // 如果部署在Cloudflare Workers上，使用自身域名作为代理
  const loc = typeof location !== 'undefined' ? location.origin : '';
  if (loc && (loc.includes('lishuhang.com') || loc.includes('workers.dev'))) return loc + '/api/proxy?url=';
  // 否则使用Cloudflare Worker专用域名
  return 'https://yz-monitor.lishuhang.workers.dev/api/proxy?url=';
}
// Only use self-hosted Worker proxy — public proxies (corsproxy.io, allorigins.win) are unreliable
const PROXIES = [getSelfProxyBase()];
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// === PAGE NOISE FILTER ===
const PAGE_NOISE = /(?:ICP备|ICP证|公网安备|版权所有|技术支持|浏览器推荐|推荐使用|分辨率|访问量|主办单位|承办单位|联系我们|信访|投诉|举报|网站地图|设为首页|加入收藏|刷新过于频繁|稍后再试|页面不存在|已删除|error|404|403|forbidden)/i;

// === SUBSYSTEM DEFINITIONS ===
const SYS = {
  chaowan:{
    id:'chaowan',name:'潮玩行业每日监控',icon:'🎮',
    desc:'实时掌握潮玩行业舆情动态、产品热度、价格波动、竞品动作',
    accent:'#E91E8C',
    file:'chaowan.html',
    defaultSources:[
      {name:'中外玩具网-潮玩',url:'https://www.ctoy.com.cn/n/all-66',type:'page',category:'行业门户'},
      {name:'泡泡玛特IR',url:'https://www.popmart.com.cn/home/investor',type:'page',category:'上市公司'},
      {name:'52TOYS新闻',url:'https://www.52toys.com/news',type:'page',category:'品牌动态'},
      {name:'TOP TOY资讯',url:'https://www.toptoyglobal.com/news/2.html',type:'page',category:'品牌动态'},
      {name:'娱乐资本论',url:'https://ylzbl.com',type:'page',category:'行业媒体'},
      {name:'36氪快讯',url:'https://36kr.com/newsflashes',type:'page',category:'综合资讯'},
      {name:'界面新闻-文娱',url:'https://www.jiemian.com/',type:'page',category:'综合资讯'},
      {name:'微博-娱乐资本论',url:'/api/weibo/5666751910',type:'rss',category:'行业媒体'},
    ],
    defaultKeywords:['泡泡玛特','盲盒','潮玩','TOP TOY','52TOYS','寻找独角兽','Skullpanda','Molly','Dimoo','LABUBU','popmart','手办','扭蛋','潮品','文创产品','玩具行业','盲盒市场','潮玩市场','IP联名','潮流玩具','收藏玩具','二次元周边','模型玩具','高达','万代','好利来联名','名创优品','海贼王','火影','三丽鸥','迪士尼','奥特曼','蛋仔派对','谷子','二次元消费','ACG周边'],
    defaultAlertKeywords:['泡泡玛特','违规','召回','下架','监管','侵权','假货','质量问题','安全事故'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于潮玩行业。请根据监控数据生成{type}摘要：1.潮玩行业重大事件与新品动态；2.品牌风险与合规警示；3.IP联名与市场趋势判断。简明扼要，中文。'
  },
  guangdian:{
    id:'guangdian',name:'广电总局数据监控',icon:'📡',
    desc:'覆盖项目发行、节目备案、传播数据、播出资质、违规风险',
    accent:'#1565C0',
    file:'guangdian.html',
    defaultSources:[
      {name:'广电总局-通知公告',url:'https://www.nrta.gov.cn/col/col68/index.html',type:'page',category:'政府公告'},
      {name:'广电总局-电视剧备案公示',url:'https://www.nrta.gov.cn/col/col2081/index.html',type:'page',category:'备案公示'},
      {name:'广电总局-网络视听节目备案',url:'https://dsbei.nrta.gov.cn',type:'page',category:'备案系统'},
      {name:'国家电影局-备案公示',url:'https://www.chinafilm.gov.cn/xxgk/gsxx/dybalx/',type:'page',category:'备案公示'},
      {name:'国家电影局-公映许可公示',url:'https://www.chinafilm.gov.cn/xxgk/gsxx/dygyxkz/',type:'page',category:'许可证'},
      {name:'国家电影局首页',url:'https://www.chinafilm.gov.cn',type:'page',category:'政策法规'},
      {name:'娱乐资本论',url:'https://ylzbl.com',type:'page',category:'行业媒体'},
      {name:'微博-广电时评',url:'/api/weibo/3244303712',type:'rss',category:'行业媒体'},
    ],
    defaultKeywords:['备案','审查','许可证','播出','违规','下架','限令','综艺','电视剧','网络剧','动画片','广播电视','电影局','放映许可证','龙标','备案公示','广电总局','网络视听','内容审核','电视剧备案','网络剧备案','影视剧审查','播出许可','广播电视法','网信办','文娱监管','影视监管','播出资质','微短剧备案','动画片审查','引进片','进口片','合拍片','内容安全'],
    defaultAlertKeywords:['下架','违规','处罚','限令','整改','禁播','约谈','封杀','行政处罚','吊销许可'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于广电政策与合规。请根据监控数据生成{type}摘要：1.政策法规变化与影响分析；2.违规下架风险与案例；3.备案审查动态与趋势。简明扼要，中文。'
  },
  piaofang:{
    id:'piaofang',name:'中国电影票房监控',icon:'🎬',
    desc:'实时采集影片票房、排片占比、上座率、口碑评分、舆情动态',
    accent:'#D97706',
    file:'piaofang.html',
    defaultSources:[
      {name:'猫眼专业版',url:'https://piaofang.maoyan.com/dashboard',type:'page',category:'票房数据'},
      {name:'猫眼年度排行',url:'https://piaofang.maoyan.com/rankings/year',type:'page',category:'票房排行'},
      {name:'1905电影网',url:'https://www.1905.com',type:'page',category:'电影资讯'},
      {name:'艺恩-电影票房',url:'https://ys.endata.cn/BoxOffice/Movie',type:'page',category:'票房数据'},
      {name:'灯塔专业版',url:'https://piaofang.taopiaopiao.com',type:'page',category:'票房数据'},
      {name:'骨朵剧集排行',url:'https://www.guduodata.com',type:'page',category:'数据平台'},
      {name:'娱乐资本论',url:'https://ylzbl.com',type:'page',category:'行业媒体'},
      {name:'微博-中国电影报道',url:'/api/weibo/1726235753',type:'rss',category:'电影资讯'},
    ],
    defaultKeywords:['票房','排片','上座率','预售','破亿','口碑','豆瓣评分','档期','院线','观影人次','票房冠军','票房纪录','春节档','国庆档','暑期档','国产电影','引进片','票房收入','票房突破','电影市场','首日票房','总票房','单片票房','银幕数','场均人次','电影票房','密钥','延期','撤档','点映','猫眼','淘票票','灯塔','艺恩'],
    defaultAlertKeywords:['票房破亿','撤档','偷票房','口碑崩','票房惨败','退票','盗版','偷漏票房'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于电影市场。请根据监控数据生成{type}摘要：1.票房排行榜及趋势分析；2.重点影片口碑与排片走势；3.档期市场动态与预测。简明扼要，中文。'
  },
  duanju:{
    id:'duanju',name:'短剧数据监控',icon:'📱',
    desc:'聚焦全网短剧行业，实时采集播放量、热度、竞品动态、政策',
    accent:'#7C3AED',
    file:'duanju.html',
    defaultSources:[
      {name:'新腕儿',url:'https://www.xinwanr.com',type:'page',category:'行业研究'},
      {name:'DataEye媒体中心',url:'https://www.dataeye.com/media-center.html',type:'page',category:'数据平台'},
      {name:'DataEye行业报告',url:'https://www.dataeye.com/report.html',type:'page',category:'行业报告'},
      {name:'短剧自习室',url:'https://duanju007.com',type:'page',category:'行业社区'},
      {name:'广电总局-通知公告',url:'https://www.nrta.gov.cn/col/col68/index.html',type:'page',category:'政府公告'},
      {name:'重点网络影视剧备案',url:'https://dsbei.nrta.gov.cn',type:'page',category:'备案系统'},
      {name:'娱乐资本论',url:'https://ylzbl.com',type:'page',category:'行业媒体'},
      {name:'36氪快讯',url:'https://36kr.com/newsflashes',type:'page',category:'综合资讯'},
      {name:'微博-新腕儿',url:'/api/weibo/7399094435',type:'rss',category:'行业研究'},
    ],
    defaultKeywords:['短剧','微短剧','小程序剧','竖屏剧','投流','短剧备案','快手短剧','抖音短剧','短剧出海','付费短剧','免费短剧','短剧平台','DataEye','短剧爆款','短剧投流','短剧充值','短剧制作','短剧发行','横屏短剧','竖屏短剧','长视频平台','短视频平台','短剧监管','微短剧备案','短剧市场','新腕儿','九州文化','短剧投流ROI','短剧制作成本','ReelShort','短剧女演员','短剧男演员','短剧编剧','短剧导演','点众科技','中文在线短剧'],
    defaultAlertKeywords:['下架','监管','备案','违规','处罚','禁播','约谈','整改','劣迹艺人'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于短剧产业。请根据监控数据生成{type}摘要：1.短剧爆款趋势与平台动态；2.监管合规与备案风险；3.投流ROI与出海机遇。简明扼要，中文。'
  },
  shangshi:{
    id:'shangshi',name:'娱乐传媒上市公司监控',icon:'📈',
    desc:'实时监控财报、营收、利润、股价、公告、舆情、项目动态',
    accent:'#0D9488',
    file:'shangshi.html',
    defaultSources:[
      {name:'巨潮资讯网',url:'https://www.cninfo.com.cn',type:'page',category:'公告披露'},
      {name:'东方财富-文娱传媒',url:'https://quote.eastmoney.com/zz/2.H30365.html',type:'page',category:'行业板块'},
      {name:'东方财富-行业研报',url:'https://stock.eastmoney.com/hangye/hy1266.html',type:'page',category:'研报'},
      {name:'港交所-披露易',url:'https://www.hkexnews.hk',type:'page',category:'港股公告'},
      {name:'泡泡玛特IR',url:'https://www.popmart.com.cn/home/investor',type:'page',category:'公司公告'},
      {name:'娱乐资本论',url:'https://ylzbl.com',type:'page',category:'行业媒体'},
      {name:'36氪快讯',url:'https://36kr.com/newsflashes',type:'page',category:'综合资讯'},
      {name:'界面新闻',url:'https://www.jiemian.com/',type:'page',category:'综合资讯'},
      {name:'微博-娱乐资本论',url:'/api/weibo/5666751910',type:'rss',category:'行业媒体'},
    ],
    defaultKeywords:['财报','营收','利润','股价','公告','增持','减持','定增','重组','立案','退市','业绩预告','年度报告','证监会','分红','股权质押','光线传媒','华谊兄弟','万达电影','博纳影业','欢瑞世纪','慈文传媒','华策影视','芒果超媒','中文在线','阅文集团','快手','哔哩哔哩','爱奇艺','传媒板块','影视股','娱乐股','文娱行业','传媒行业','影视公司','上市公司公告','股转','新三板','泡泡玛特','猫眼娱乐','IMAX中国','猫眼','阿里影业','腾讯音乐'],
    defaultAlertKeywords:['立案','退市','亏损','暴跌','证监会','处罚','违规','诉讼','冻结','强平','ST','退市风险','商誉减值','业绩变脸'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于传媒上市公司。请根据监控数据生成{type}摘要：1.重要财报与业绩动态；2.股价异动与风险事件；3.监管处罚与合规风险。简明扼要，中文。'
  }
};

// === STORAGE HELPERS ===
function sk(id,k){return `mon_${id}_${k}`}
function lg(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function ls(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('LS fail:',e)}}

// === TOAST ===
function toast(msg,cls=''){
  const c=document.getElementById('tc');if(!c)return;
  const el=document.createElement('div');el.className='tst '+cls;el.textContent=msg;
  c.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(20px)';setTimeout(()=>el.remove(),300)},4000);
}

// === LOADING BAR ===
function ldBar(pct){
  const bar=document.getElementById('ldBar');if(!bar)return;
  if(pct<=0){bar.classList.remove('on');bar.style.width='0';return}
  bar.classList.add('on');bar.style.width=pct+'%';
  if(pct>=100)setTimeout(()=>ldBar(0),500);
}

// === THEME ===
function toggleTheme(){
  const cur=document.documentElement.getAttribute('data-theme');
  const nxt=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',nxt);ls('mon_theme',nxt);
}

// === ESCAPE ===
function esc(s){return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):''}

// === FORMAT TIME ===
function fmtTime(ts){return ts?new Date(ts).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'--:--'}
function fmtDate(ts){return ts?new Date(ts).toLocaleDateString('zh-CN'):'--'}

// === KEYWORD HIGHLIGHT ===
function hlKw(text,kws){
  if(!kws||!kws.length)return text;
  const allKw=[...kws].sort((a,b)=>b.length-a.length);
  let r=text;
  allKw.forEach(kw=>{const re=new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');r=r.replace(re,m=>`<span class="kw-h">${m}</span>`)});
  return r;
}

// === KEYWORD MATCH (strict: avoids substring false positives) ===
function kwMatch(text, keywords){
  const txt = text.toLowerCase();
  return keywords.some(kw => {
    const kwLow = kw.toLowerCase();
    if (kwLow.length >= 4) return txt.includes(kwLow);
    try { return new RegExp('\\b' + kwLow.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b').test(txt); }
    catch { return txt.includes(kwLow); }
  });
}

// === CONTENT RELEVANCE SCORE ===
function relevanceScore(title, keywords){
  if(!title) return 0;
  const txt = title.toLowerCase();
  let score = 0;
  keywords.forEach(kw => {
    const kwLow = kw.toLowerCase();
    if (txt.includes(kwLow)) {
      score += kwLow.length >= 4 ? 2 : 1; // longer keywords = more relevant
    }
  });
  return score;
}

// === COMPLIANCE CHECK ===
function isBlocked(url){
  const cfg=lg('mon_global',{compliance:true});
  if(!cfg.compliance)return false;
  // Internal API routes are never blocked
  if(url.startsWith('/api/'))return false;
  try{
    const u=new URL(url);
    const host=u.hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(d=>host===d||host.endsWith('.'+d));
  }catch{return false}
}

// === FETCH WITH PROXY ===
async function fetchProxy(url){
  if(isBlocked(url))throw new Error('源被合规过滤屏蔽');
  // Internal API routes (/api/weibo/) are served by the same Worker - fetch directly
  if(url.startsWith('/api/')){
    const base=typeof location!=='undefined'?location.origin:'https://yz-monitor.lishuhang.workers.dev';
    const fullUrl=base+url;
    try{
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),20000);
      const resp=await fetch(fullUrl,{signal:ctrl.signal});
      clearTimeout(tid);
      if(!resp.ok)throw new Error('HTTP '+resp.status);
      const buf=await resp.arrayBuffer();
      return new TextDecoder('utf-8').decode(buf);
    }catch(e){throw e}
  }
  let lastErr=null;
  for(const proxy of PROXIES){
    try{
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),15000);
      let fetchUrl=proxy+encodeURIComponent(url)+'&_t='+Date.now();
      const resp=await fetch(fetchUrl,{signal:ctrl.signal});
      clearTimeout(tid);
      // Worker proxy always returns 200; check X-Original-Status for real status
      const origStatus=resp.headers.get('X-Original-Status');
      const proxyErr=resp.headers.get('X-Proxy-Error');
      if(proxyErr)throw new Error('Proxy error: '+proxyErr);
      const buf=await resp.arrayBuffer();
      const text=new TextDecoder('utf-8').decode(buf);
      // Check if the content is valid (not empty and not an error page)
      if(text.length<200&&origStatus&&origStatus!=='200')throw new Error('HTTP '+origStatus);
      if(text.length<50)throw new Error('Empty response');
      return text;
    }catch(e){lastErr=e}
  }
  throw lastErr||new Error('All proxies failed');
}

// === PARSE RSS XML ===
function parseRSS(xml,src){
  try{
    const doc=new DOMParser().parseFromString(xml,'text/xml');
    if(doc.querySelector('parsererror'))return[];
    const items=doc.querySelectorAll('item, entry');const out=[];
    items.forEach(el=>{
      let title=el.querySelector('title')?.textContent?.trim();
      let link=el.querySelector('link')?.textContent?.trim();
      if(!link){const le=el.querySelector('link[href]');if(le)link=le.getAttribute('href')}
      let pubDate=el.querySelector('pubDate, published, updated')?.textContent?.trim();
      if(!title||!link)return;
      if(isBlocked(link))return;
      let source=src.name;
      if(title.includes(' - ')&&title.split(' - ').pop().length<20){source=title.split(' - ').pop();title=title.split(' - ').slice(0,-1).join(' - ')}
      let ts=Date.now();if(pubDate){const p=new Date(pubDate).getTime();if(!isNaN(p))ts=p}
      out.push({id:link+'_'+ts,title,url:link,source,srcId:src.id,ts,type:src.type,cat:src.category||'默认',read:false,important:false});
    });
    return out.slice(0,10);
  }catch{return[]}
}

// === PARSE RSS2JSON ===
function parseRSS2JSON(data,src){
  try{
    if(!data.items||!Array.isArray(data.items))return[];
    return data.items.map(item=>{
      let title=item.title||'';let link=item.link||'';
      if(isBlocked(link))return null;
      let source=src.name;
      if(title.includes(' - ')&&title.split(' - ').pop().length<20){source=title.split(' - ').pop();title=title.split(' - ').slice(0,-1).join(' - ')}
      let ts=item.pubDate?new Date(item.pubDate).getTime():Date.now();
      if(isNaN(ts))ts=Date.now();
      return{id:link+'_'+ts,title,url:link,source,srcId:src.id,ts,type:src.type,cat:src.category||'默认',read:false,important:false};
    }).filter(Boolean).slice(0,10);
  }catch{return[]}
}

// === PARSE PAGE ===
function parsePage(html,src,snapshot){
  try{
    if(html.length<200||/<title>\s*(error|404|403|forbidden|not found)/i.test(html))return[];
    const doc=new DOMParser().parseFromString(html,'text/html');
    const body=doc.body;if(!body)return[];
    body.querySelectorAll('script,style,nav,footer,header,.footer,.header,.nav,.navbar,.breadcrumb,.copyright,.icp,#footer,#header,#nav').forEach(s=>s.remove());
    const text=body.innerText||'';
    const lines=text.split('\n').map(l=>l.trim()).filter(l=>l.length>10&&l.length<300&&!PAGE_NOISE.test(l));
    if(!lines.length)return[];
    if(!snapshot){return lines.slice(0,15).map((line,i)=>({id:src.id+'_init_'+Date.now()+'_'+i,title:line.substring(0,120),url:src.url,source:src.name,srcId:src.id,ts:Date.now(),type:'page',cat:src.category||'默认',read:false,important:false}))}
    const oldSet=new Set(snapshot.split('\n').map(l=>l.trim()).filter(l=>l.length>10&&!PAGE_NOISE.test(l)));
    const newLines=lines.filter(l=>!oldSet.has(l));
    if(!newLines.length)return[];
    return newLines.slice(0,20).map((line,i)=>({id:src.id+'_'+Date.now()+'_'+i,title:line.substring(0,120),url:src.url,source:src.name,srcId:src.id,ts:Date.now(),type:'page',cat:src.category||'默认',read:false,important:false}));
  }catch{return[]}
}

// === AI CALL ===
async function callAI(prompt){
  const aiCfg=lg('mon_ai',{});
  const provider=aiCfg.provider||'zhipu';
  const preset=AI_PROVIDERS[provider]||AI_PROVIDERS.zhipu;
  const url=aiCfg.url||preset.url;
  const model=aiCfg.model||preset.model;
  const key=aiCfg.key;
  if(!key)throw new Error('未配置API Key');
  if(!url)throw new Error('未配置API地址');
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,messages:[{role:'user',content:prompt}],temperature:0.7,max_tokens:1000})});
  if(!r.ok)throw new Error('API '+r.status);
  const data=await r.json();
  return data.choices?.[0]?.message?.content||'无摘要';
}

// === TEST AI ===
async function testAI(){
  const aiCfg=lg('mon_ai',{});
  if(!aiCfg.key){toast('请先填写API Key','err');return}
  toast('正在测试AI连接...','');
  try{const r=await callAI('请用一句话介绍你自己。');toast('AI连接成功: '+r.substring(0,50),'ok')}
  catch(e){toast('AI连接失败: '+e.message,'err')}
}

// === EXPORT CSV (UTF-8 BOM) ===
function exportCSV(items,filename){
  const BOM='\uFEFF';
  const header='标题,URL,来源,分类,时间,重要\n';
  const rows=items.map(i=>`"${(i.title||'').replace(/"/g,'""')}","${i.url||''}","${(i.source||'').replace(/"/g,'""')}","${i.cat||'默认'}","${fmtTime(i.ts)}","${i.important?'是':'否'}"`).join('\n');
  const blob=new Blob([BOM+header+rows],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  toast('CSV已导出','ok');
}

// === EXPORT SETTINGS JSON ===
function exportSettingsJSON(data,filename){
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  toast('设置已导出','ok');
}

// === IMPORT JSON ===
function importJSON(cb){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();r.onload=ev=>{try{cb(JSON.parse(ev.target.result))}catch{toast('导入失败','err')}};r.readAsText(f);
  };inp.click();
}

// === WORD CLOUD ===
function renderWordCloud(container,keywords,counts){
  if(!keywords||!keywords.length){container.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:40px">暂无数据</div>';return}
  const colors=['#E91E8C','#1565C0','#D97706','#7C3AED','#0D9488','#E53E3E','#38A169','#DD6B20','#3182CE','#805AD5'];
  const maxCount=Math.max(...(counts||keywords.map(()=>1)),1);
  container.innerHTML=keywords.map((kw,i)=>{
    const c=counts?counts[i]:1;
    const size=Math.max(12,Math.min(36,12+24*(c/maxCount)));
    const color=colors[i%colors.length];
    return `<span class="wc-w" style="font-size:${size}px;color:${color};font-weight:${c>maxCount*0.5?900:600}">${esc(kw)}</span>`;
  }).join('');
}

// === CHARTS ===
function renderPieChart(container,cats){
  const entries=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){container.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:40px">暂无数据</div>';return}
  const total=entries.reduce((s,e)=>s+e[1],0);
  const colors=['#E91E8C','#1565C0','#D97706','#7C3AED','#0D9488','#E53E3E','#38A169','#DD6B20'];
  let paths='',legend='',angle=0;
  entries.forEach(([cat,count],i)=>{
    const pct=count/total;const sA=angle;const eA=angle+pct*360;
    const sR=sA*Math.PI/180;const eR=eA*Math.PI/180;
    const x1=100+80*Math.cos(sR-Math.PI/2);const y1=100+80*Math.sin(sR-Math.PI/2);
    const x2=100+80*Math.cos(eR-Math.PI/2);const y2=100+80*Math.sin(eR-Math.PI/2);
    const la=pct>.5?1:0;
    paths+=`<path d="M100,100 L${x1},${y1} A80,80 0 ${la},1 ${x2},${y2} Z" fill="${colors[i%colors.length]}" opacity="0.8"><title>${esc(cat)}: ${count}条 (${(pct*100).toFixed(1)}%)</title></path>`;
    legend+=`<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="width:10px;height:10px;border-radius:2px;background:${colors[i%colors.length]};flex-shrink:0"></span><span style="font-size:11px;color:var(--text-secondary)">${esc(cat)} ${count}</span></div>`;
    angle=eA;
  });
  container.innerHTML=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${paths}<circle cx="100" cy="100" r="35" fill="var(--bg-card)"/><text x="100" y="96" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="900">${total}</text><text x="100" y="112" text-anchor="middle" fill="var(--text-muted)" font-size="9">总计</text></svg><div style="position:absolute;right:8px;top:8px">${legend}</div>`;
}

function renderBarChart(container,srcCount){
  const entries=Object.entries(srcCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!entries.length){container.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:40px">暂无数据</div>';return}
  const max=Math.max(...entries.map(e=>e[1]));
  const barW=30,gap=8,chartH=140,baseY=160,startX=60;
  let bars='',labels='';
  entries.forEach(([name,count],i)=>{
    const x=startX+i*(barW+gap);const h=max>0?(count/max)*chartH:0;
    bars+=`<rect x="${x}" y="${baseY-h}" width="${barW}" height="${h}" rx="3" fill="var(--accent)" opacity="0.8"><title>${esc(name)}: ${count}条</title></rect>`;
    bars+=`<text x="${x+barW/2}" y="${baseY-h-4}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="700">${count}</text>`;
    labels+=`<text x="${x+barW/2}" y="${baseY+14}" text-anchor="middle" fill="var(--text-muted)" font-size="8" transform="rotate(-30,${x+barW/2},${baseY+14})">${esc(name.length>6?name.slice(0,6)+'…':name)}</text>`;
  });
  container.innerHTML=`<svg viewBox="0 0 ${startX+entries.length*(barW+gap)+20} 190" xmlns="http://www.w3.org/2000/svg"><line x1="${startX-5}" y1="${baseY}" x2="${startX+entries.length*(barW+gap)+10}" y2="${baseY}" stroke="var(--border)" stroke-width="1"/>${bars}${labels}</svg>`;
}

function renderLineChart(container,days){
  const max=Math.max(...days.map(d=>d.count),1);
  const chartW=350,chartH=120,padX=50,padY=20,baseY=chartH+padY;
  const step=chartW/(days.length-1||1);
  let points='',grid='',xLabels='';
  days.forEach((day,i)=>{
    const x=padX+i*step;const y=baseY-(day.count/max)*chartH;
    points+=(i===0?'M':'L')+`${x},${y}`;
    grid+=`<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)"><title>${day.label}: ${day.count}条</title></circle>`;
    grid+=`<text x="${x}" y="${baseY+16}" text-anchor="middle" fill="var(--text-muted)" font-size="9">${day.label}</text>`;
  });
  container.innerHTML=`<svg viewBox="0 0 ${chartW+padX+20} ${chartH+padY+30}" xmlns="http://www.w3.org/2000/svg"><line x1="${padX}" y1="${baseY}" x2="${padX+chartW+10}" y2="${baseY}" stroke="var(--border)" stroke-width="1"/><line x1="${padX}" y1="${padY}" x2="${padX}" y2="${baseY}" stroke="var(--border)" stroke-width="1"/><path d="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/><path d="${points} L${padX+(days.length-1)*step},${baseY} L${padX},${baseY} Z" fill="var(--accent)" opacity="0.1"/>${grid}</svg>`;
}

// === GET 7-DAY DATA ===
function get7DayData(items){
  const days=[];const now=new Date();
  for(let i=6;i>=0;i--){
    const day=new Date(now);day.setDate(day.getDate()-i);day.setHours(0,0,0,0);
    const next=new Date(day);next.setDate(next.getDate()+1);
    days.push({label:`${day.getMonth()+1}/${day.getDate()}`,count:items.filter(it=>it.ts>=day.getTime()&&it.ts<next.getTime()).length});
  }
  return days;
}

// === INIT GLOBAL CONFIG ===
function initGlobalConfig(){
  const aiExist=localStorage.getItem('mon_ai');
  if(!aiExist){
    ls('mon_ai',{provider:'zhipu',url:'https://open.bigmodel.cn/api/paas/v4/chat/completions',model:'glm-4-flash',key:'89cf52e166744146a966eb905597a5ba.YvQflJOFgM3yX1o8',summarizePrompt:'',dedupPrompt:''});
  }else{
    const aiParsed=JSON.parse(aiExist);
    if(!aiParsed.key){aiParsed.key='89cf52e166744146a966eb905597a5ba.YvQflJOFgM3yX1o8';ls('mon_ai',aiParsed)}
  }
  if(!localStorage.getItem('mon_global')){
    ls('mon_global',{compliance:true});
  }
  document.documentElement.setAttribute('data-theme',lg('mon_theme','light'));
}

// === INIT SUBSYSTEM DATA ===
function initSysData(id){
  const sys=SYS[id];if(!sys)return null;
  const sources=lg(sk(id,'src'),null);
  const items=lg(sk(id,'items'),[]);
  const keywords=lg(sk(id,'kw'),null);
  const alertKw=lg(sk(id,'akw'),null);
  const settings=lg(sk(id,'cfg'),{});
  const aiPrompt=lg(sk(id,'aiprompt'),null);
  const snaps=lg(sk(id,'snap'),{});
  const data={
    sources:sources||sys.defaultSources.map((s,i)=>({...s,id:`${id}_s${i}`,enabled:true})),
    items,keywords:keywords||sys.defaultKeywords,
    alertKw:alertKw||sys.defaultAlertKeywords,
    aiPrompt:aiPrompt||sys.defaultAIPrompt||'',
    cfg:Object.assign({interval:30,auto:true,notif:true,maxItems:500,blacklist:'',whitelist:'',notifFreq:'realtime',reportTime:'18:00'},settings),
    snaps,loading:false
  };
  if(sources===null)ls(sk(id,'src'),data.sources);
  if(keywords===null)ls(sk(id,'kw'),data.keywords);
  if(alertKw===null)ls(sk(id,'akw'),data.alertKw);
  if(aiPrompt===null)ls(sk(id,'aiprompt'),data.aiPrompt);
  return data;
}

// === CHANGELOG (reverse order) ===
const CHANGELOG = [
  {v:'1.1',date:'2026-05-14',changes:[
    'Worker内置微博RSS采集（/api/weibo/{uid}端点）',
    '各板块新增微博信息源（娱乐资本论、广电时评、中国电影报道、新腕儿等）',
    'Worker代理始终返回200，通过X-Original-Status传递真实状态码',
    '移除失效的公共CORS代理（corsproxy.io、allorigins.win）',
    '修复界面新闻URL（jiemian.com/article_list/146.html→404，改为首页）',
    '移除合规检查设置中的AI添加描述文本',
  ]},
  {v:'1.0',date:'2026-05-14',changes:[
    '部署到Cloudflare Workers，自建CORS代理解决跨域问题',
    '修复CORS跨域报错（corsproxy.io/allorigins.win不可用问题）',
    '修复广电板块信息源URL（广电总局公告、备案公示等）',
    '修复骨朵数据平台URL（d2.guduomedia.com改为guduodata.com）',
    '36氪快讯从RSS改为页面轮询（RSS地址不可用）',
    '界面文娱URL从移动端改为桌面端',
    '移除合规检查设置中的多余说明文字',
  ]},
  {v:'0.9',date:'2026-05-14',changes:[
    '拆分为独立子系统页面（5个独立HTML文件）',
    '全面替换行业专属信息源（中外玩具网、新腕儿、DataEye、国家电影局等）',
    '扩充关键字库（潮玩增加谷子/二次元消费等，短剧增加ROI/出海等）',
    '新增出版物风格PDF报告生成（含封面、表格、图表、页眉页脚）',
    '首页自动运行监控，有新内容时卡片变色+脉冲动画提醒',
    '设置面板增加README说明文档',
    '优化内容相关性评分，仅保留高相关度条目',
    '合规检查默认开启，屏蔽敏感境外源',
    '移除Google News RSS作为默认源',
    '深色模式等设置项统一收入设置面板',
  ]},
  {v:'0.8',date:'2026-05-14',changes:[
    '多文件架构拆分（index.html + monitor.html + common.css + common.js）',
    '移除Google News RSS默认源',
    '新增合规内容过滤',
    '页面打开自动运行一次监测',
    '新增关键字词云可视化',
  ]},
  {v:'0.7',date:'2026-05-13',changes:['关键字相关性过滤','修复AI Key预填','修复国家电影局URL']},
  {v:'0.6',date:'2026-05-13',changes:['仪表盘可视化','自定义AI','可打印输出']},
  {v:'0.5',date:'2026-05-13',changes:['修复portal返回数据刷新']},
  {v:'0.4',date:'2026-05-13',changes:['修复去重逻辑','改进关键字匹配']},
  {v:'0.3',date:'2026-05-13',changes:['rss2json备选方案']},
  {v:'0.2',date:'2026-05-13',changes:['修复默认信息源','添加进度条']},
  {v:'0.1',date:'2026-05-13',changes:['初始版本']}
];

// === README ===
const README = `
# 行业监控系统 v${V}

## 概述
行业监控系统是由**娱乐资本论**自主研发的全网内容实时巡检与自动化采集平台，覆盖潮玩、广电、票房、短剧、传媒上市公司五大行业板块。

## 功能特性
- **5大行业监控板块**：每个板块配备行业专属信息源、关键字、告警规则
- **自动采集**：支持RSS订阅、网页轮询和微博动态三种采集方式
- **微博RSS**：Worker内置微博Visitor Auth，实时抓取指定微博账号动态
- **AI智能摘要**：支持智谱GLM、DeepSeek、Gemini等AI服务商，可自定义Prompt
- **合规过滤**：默认开启合规检查，屏蔽敏感境外新闻源
- **出版物风格报告**：生成含封面、表格、图表的专业监控报告
- **数据可视化**：仪表盘含饼图、柱状图、折线图、词云
- **浏览器通知**：重要告警实时推送桌面通知

## 快速开始
1. 在浏览器中打开 index.html
2. 首页自动运行监控（或点击🔄按钮手动刷新）
3. 点击板块卡片进入子系统详细页面
4. 切换标签查看：仪表盘、信息源、时间线、关键字、报告

## 部署方式
1. 直接浏览器打开 index.html 即可使用
2. 部署到 GitHub Pages (ylzbl.github.io/monitor)
3. 部署到 Cloudflare Workers — 推荐部署方式，自带CORS代理和微博RSS
   - workers.dev: https://yz-monitor.lishuhang.workers.dev
   - 自定义域名: https://yz-monitor.lishuhang.com

## CORS代理说明
本系统通过Cloudflare Worker自建CORS代理解决浏览器跨域限制。
部署在 workers.dev 或 lishuhang.com 时，自动使用 /api/proxy 作为代理。
微博动态通过 /api/weibo/{uid} 端点获取，无需第三方RSSHub。

## 知识产权
本系统全部知识产权归 [娱乐资本论](https://ylzbl.com/) 所有。
`;

// === README / CHANGELOG VIEWER ===
function openDocViewer(docType) {
  let content = '';
  let title = '';
  if (docType === 'readme') {
    title = '📖 使用说明 README';
    content = formatReadme(README);
  } else {
    title = '📋 变更日志 Changelog';
    content = formatChangelog(CHANGELOG);
  }
  const overlay = document.createElement('div');
  overlay.className = 'mdl-o on';
  overlay.id = 'docViewer';
  overlay.innerHTML = `<div class="mdl" style="max-width:800px"><div class="mdl-h"><span class="mdl-t">${title}</span><button class="mdl-x" onclick="document.getElementById('docViewer').remove()">&times;</button></div><div class="mdl-b" style="max-height:75vh">${content}</div></div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function formatReadme(text) {
  let html = esc(text);
  // Headers
  html = html.replace(/^# (.+)$/gm, '<h2 style="font-size:20px;font-weight:900;color:var(--accent);margin:20px 0 10px;border-bottom:2px solid var(--accent);padding-bottom:6px">$1</h2>');
  html = html.replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:var(--accent);margin:16px 0 8px">$1</h3>');
  html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:700;color:var(--text);margin:12px 0 6px">$1</h4>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--accent)">$1</strong>');
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color:var(--accent)">$1</a>');
  // List items
  html = html.replace(/^- (.+)$/gm, '<div style="padding-left:16px;margin:4px 0;position:relative"><span style="position:absolute;left:0;color:var(--accent)">•</span>$1</div>');
  // Numbered items
  html = html.replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:20px;margin:4px 0"><span style="color:var(--accent);font-weight:700">$1.</span> $2</div>');
  // Wrap in container
  return `<div style="font-size:var(--font-sm);line-height:1.8;color:var(--text-secondary);white-space:pre-line">${html}</div>`;
}

function formatChangelog(changelog) {
  let html = '';
  changelog.forEach((cl, idx) => {
    const isFirst = idx === 0;
    html += `<div style="margin-bottom:20px;padding:16px;border-radius:var(--radius-sm);border:1px solid ${isFirst?'var(--accent)':'var(--border)'};${isFirst?'background:var(--accent-light)':''}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:16px;font-weight:900;color:${isFirst?'var(--accent)':'var(--text)'}">v${cl.v}</span>
        <span style="font-size:var(--font-xs);color:var(--text-muted)">${cl.date}</span>
        ${isFirst?'<span style="font-size:var(--font-xs);background:var(--accent);color:#fff;padding:1px 8px;border-radius:10px;font-weight:700">当前版本</span>':''}
      </div>
      <ul style="padding-left:20px;list-style:disc">`;
    cl.changes.forEach(c => {
      html += `<li style="font-size:var(--font-sm);color:var(--text-secondary);margin:3px 0;line-height:1.6">${esc(c)}</li>`;
    });
    html += `</ul></div>`;
  });
  return html;
}

// === SETTINGS RENDER ===
function renderSettingsBody(curSysId, D){
  const d=curSysId?D[curSysId]:null;
  const aiCfg=lg('mon_ai',{});
  const globalCfg=lg('mon_global',{compliance:true});
  let h='';

  // AI Provider
  h+=`<div class="abt"><h3>AI 服务配置</h3></div>`;
  h+=`<div class="fg"><label class="fl">AI 服务商</label><select class="inp" id="aiProvider" onchange="onAIProviderChange()">`;
  for(const[k,v]of Object.entries(AI_PROVIDERS)){h+=`<option value="${k}" ${aiCfg.provider===k?'selected':''}>${v.name}</option>`}
  h+=`</select><div class="fh">首次使用已预填测试Key，可替换为自己的Key</div></div>`;
  h+=`<div class="fg"><label class="fl">API 地址</label><input class="inp" id="aiUrl" value="${esc(aiCfg.url||AI_PROVIDERS[aiCfg.provider||'zhipu'].url)}" placeholder="https://api.example.com/v1/chat/completions"></div>`;
  h+=`<div class="fg"><label class="fl">模型名称</label><input class="inp" id="aiModel" value="${esc(aiCfg.model||AI_PROVIDERS[aiCfg.provider||'zhipu'].model)}"></div>`;
  h+=`<div class="fg"><label class="fl">API Key</label><input class="inp" type="password" id="aiKey" value="${esc(aiCfg.key||'')}"><div class="fh">Key仅存储在浏览器本地</div></div>`;
  h+=`<div class="fg"><label class="fl">单条摘要提示词</label><textarea class="inp" id="aiSumPrompt" rows="2">${esc(aiCfg.summarizePrompt||'')}</textarea></div>`;
  h+=`<div class="fg"><label class="fl">去重提示词</label><textarea class="inp" id="aiDedupPrompt" rows="2">${esc(aiCfg.dedupPrompt||'')}</textarea></div>`;
  h+=`<div style="display:flex;gap:var(--space-sm)"><button class="btn btn-p" onclick="saveAICfg()">保存AI配置</button><button class="btn btn-o" onclick="testAI()">测试连接</button></div>`;

  // Global settings
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>全局设置</h3></div>`;
  h+=`<div class="fg"><label class="fl">深色模式</label><label class="tog"><input type="checkbox" ${document.documentElement.getAttribute('data-theme')==='dark'?'checked':''} onchange="toggleTheme();document.getElementById('sModal').querySelector('.mdl-b').innerHTML='';typeof renderSettingsBody!=='undefined'&&(document.getElementById('sModal').querySelector('.mdl-b').innerHTML=renderSettingsBody(currentSysId,sysData))"><span class="tog-t"><span class="tog-k"></span></span><span>${document.documentElement.getAttribute('data-theme')==='dark'?'开启':'关闭'}</span></label></div>`;
  h+=`<div class="fg"><label class="fl">合规检查</label><label class="tog"><input type="checkbox" id="complianceChk" ${globalCfg.compliance?'checked':''} onchange="ls('mon_global',{compliance:this.checked})"><span class="tog-t"><span class="tog-k"></span></span><span>${globalCfg.compliance?'开启':'关闭'}</span></label></div>`;

  // System-specific settings
  if(d){
    const s=d.cfg;
    h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>当前系统：${SYS[curSysId].icon} ${SYS[curSysId].name}</h3></div>`;
    h+=`<div class="fg"><label class="fl">自动刷新间隔（分钟）</label><input class="inp" type="number" value="${s.interval}" min="5" max="1440" onchange="updCfg('interval',+this.value)"></div>`;
    h+=`<div class="fg"><label class="fl">自动刷新</label><label class="tog"><input type="checkbox" ${s.auto?'checked':''} onchange="updCfg('auto',this.checked)"><span class="tog-t"><span class="tog-k"></span></span><span>${s.auto?'开启':'关闭'}</span></label></div>`;
    h+=`<div class="fg"><label class="fl">浏览器通知</label><label class="tog"><input type="checkbox" ${s.notif?'checked':''} onchange="updCfg('notif',this.checked)"><span class="tog-t"><span class="tog-k"></span></span><span>${s.notif?'开启':'关闭'}</span></label></div>`;
    h+=`<div class="fg"><label class="fl">最大保留条数</label><input class="inp" type="number" value="${s.maxItems}" min="50" max="10000" onchange="updCfg('maxItems',+this.value)"></div>`;
    h+=`<div style="margin:var(--space-lg) 0;display:flex;gap:var(--space-sm);flex-wrap:wrap">`;
    h+=`<button class="btn btn-o" onclick="expAllSettings()">导出全部设置(JSON)</button>`;
    h+=`<button class="btn btn-o" onclick="impAllSettings()">导入设置(JSON)</button>`;
    h+=`<button class="btn btn-o" onclick="exportCSV(sysData[currentSysId].items,'monitor_${curSysId}_items.csv')">导出数据(CSV)</button>`;
    h+=`<button class="btn btn-d" onclick="if(confirm('确定清空当前系统所有数据？'))clrData()">清空数据</button>`;
    h+=`</div>`;
  } else {
    h+=`<div style="margin:var(--space-lg) 0;display:flex;gap:var(--space-sm);flex-wrap:wrap">`;
    h+=`<button class="btn btn-o" onclick="exportAllSystems()">导出全部系统(JSON)</button>`;
    h+=`<button class="btn btn-o" onclick="importAllSystems()">导入全部系统(JSON)</button>`;
    h+=`</div>`;
  }

  // Changelog
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>Changelog</h3><ul>`;
  CHANGELOG.forEach(cl=>{
    h+=`<li style="margin-bottom:var(--space-sm)"><strong>v${cl.v}</strong> (${cl.date})<ul>`;
    cl.changes.forEach(c=>{h+=`<li>${c}</li>`});
    h+=`</ul></li>`;
  });
  h+=`</ul></div>`;

  // README
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>README</h3><div style="white-space:pre-wrap;font-size:var(--font-sm);color:var(--text-secondary);line-height:1.7">${esc(README)}</div></div>`;

  // About
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>关于</h3>
    <p>行业监控系统 是由 <strong>娱乐资本论</strong> 自主研发的全网内容实时巡检与自动化采集平台。</p>
    <p style="margin-top:8px"><strong>版本：</strong>v${V}</p>
    <p style="margin-top:8px"><strong>知识产权：</strong>本系统全部知识产权归 <a href="https://ylzbl.com/" target="_blank">娱乐资本论</a> 所有。</p>
    <p style="margin-top:8px"><strong>部署方式：</strong>直接浏览器打开、GitHub Pages 或 Cloudflare Workers 均可使用。</p>
  </div>`;

  return h;
}

function onAIProviderChange(){
  const provider=document.getElementById('aiProvider').value;
  const preset=AI_PROVIDERS[provider];
  document.getElementById('aiUrl').value=preset.url;
  document.getElementById('aiModel').value=preset.model;
}

function saveAICfg(){
  const cfg={provider:document.getElementById('aiProvider').value,url:document.getElementById('aiUrl').value.trim(),model:document.getElementById('aiModel').value.trim(),key:document.getElementById('aiKey').value.trim(),summarizePrompt:document.getElementById('aiSumPrompt').value,dedupPrompt:document.getElementById('aiDedupPrompt').value};
  ls('mon_ai',cfg);toast('AI配置已保存','ok');
}

// === PDF REPORT GENERATION ===
function generatePDFReport(sysId, d, type) {
  const sys = SYS[sysId];
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric'});
  const items = d.items.slice(0, 100);
  const en = d.sources.filter(s=>s.enabled).length;
  const imp = items.filter(i=>i.important).length;
  const todayItems = items.filter(i => { const t = new Date(); t.setHours(0,0,0,0); return i.ts >= t.getTime(); });

  // Build publication-style report HTML
  let reportHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${sys.name} - ${type==='daily'?'日报':'周报'}</title>
<style>
@page{size:A4;margin:20mm 15mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Noto Sans SC","Microsoft YaHei",SimHei,sans-serif;color:#1a1a1a;line-height:1.8;font-size:13px}
.cover{text-align:center;padding:80px 40px 40px;border-bottom:3px solid ${sys.accent}}
.cover h1{font-size:28px;font-weight:900;color:${sys.accent};margin-bottom:12px}
.cover .subtitle{font-size:16px;color:#666;margin-bottom:24px}
.cover .meta{font-size:12px;color:#999}
.cover .logo{font-size:14px;color:${sys.accent};font-weight:700;margin-top:20px}
.section{margin:20px 0;page-break-inside:avoid}
.section h2{font-size:16px;font-weight:900;color:${sys.accent};border-left:4px solid ${sys.accent};padding-left:10px;margin-bottom:12px}
.section h3{font-size:14px;font-weight:700;color:#333;margin:12px 0 8px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
.stat-card{border:1px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center}
.stat-card .val{font-size:24px;font-weight:900;color:${sys.accent}}
.stat-card .label{font-size:11px;color:#999;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}
th{background:${sys.accent}15;color:${sys.accent};font-weight:700;padding:8px 10px;text-align:left;border-bottom:2px solid ${sys.accent}40}
td{padding:6px 10px;border-bottom:1px solid #eee}
tr:nth-child(even) td{background:#fafafa}
.imp{color:#e53e3e;font-weight:700}
.footer{text-align:center;font-size:10px;color:#999;margin-top:40px;padding-top:16px;border-top:1px solid #eee}
.kw-tag{display:inline-block;padding:2px 8px;margin:2px;border-radius:4px;font-size:11px;background:${sys.accent}15;color:${sys.accent}}
</style></head><body>`;

  // Cover
  reportHTML += `<div class="cover">
    <h1>${sys.icon} ${sys.name}</h1>
    <div class="subtitle">${type==='daily'?'每日监控日报':'每周监控周报'}</div>
    <div class="meta">报告日期：${dateStr} | 生成时间：${today.toLocaleString('zh-CN')} | 第${Math.ceil(today.getDate()/7)}周</div>
    <div class="logo">娱乐资本论 · 行业监控系统 v${V}</div>
  </div>`;

  // Stats
  reportHTML += `<div class="section"><h2>概览统计</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="val">${en}</div><div class="label">活跃信息源</div></div>
      <div class="stat-card"><div class="val">${items.length}</div><div class="label">监控条目</div></div>
      <div class="stat-card"><div class="val">${todayItems.length}</div><div class="label">今日新增</div></div>
      <div class="stat-card"><div class="val">${imp}</div><div class="label">重要/告警</div></div>
    </div>
  </div>`;

  // Keyword summary
  const kwCounts = {};
  d.keywords.slice(0, 15).forEach(kw => {
    kwCounts[kw] = items.filter(i => kwMatch(i.title||'',[kw])).length;
  });
  const topKw = Object.entries(kwCounts).sort((a,b) => b[1]-a[1]).slice(0,12);
  reportHTML += `<div class="section"><h2>关键字热度</h2><div>`;
  topKw.forEach(([kw, count]) => {
    reportHTML += `<span class="kw-tag">${esc(kw)} (${count})</span>`;
  });
  reportHTML += `</div></div>`;

  // Items by category
  const groups = {};
  items.forEach(i => { const c = i.cat||'默认'; if(!groups[c]) groups[c]=[]; groups[c].push(i); });
  for (const [cat, catItems] of Object.entries(groups)) {
    reportHTML += `<div class="section"><h2>${esc(cat)} (${catItems.length}条)</h2><table>
      <tr><th style="width:80px">时间</th><th style="width:60px">来源</th><th>标题</th><th style="width:40px">标记</th></tr>`;
    catItems.slice(0, 30).forEach(i => {
      reportHTML += `<tr><td>${fmtTime(i.ts)}</td><td>${esc(i.source)}</td><td>${esc(i.title)}</td><td>${i.important?'<span class="imp">!</span>':''}</td></tr>`;
    });
    reportHTML += `</table></div>`;
  }

  // Source stats
  reportHTML += `<div class="section"><h2>信息源采集统计</h2><table>
    <tr><th>信息源</th><th>类型</th><th>分类</th><th>采集量</th><th>状态</th></tr>`;
  d.sources.forEach(s => {
    const count = items.filter(i => i.source === s.name).length;
    reportHTML += `<tr><td>${esc(s.name)}</td><td>${s.type.toUpperCase()}</td><td>${esc(s.category||'默认')}</td><td>${count}</td><td>${s.enabled?'启用':'停用'}</td></tr>`;
  });
  reportHTML += `</table></div>`;

  // Footer
  reportHTML += `<div class="footer">本报告由 娱乐资本论 行业监控系统 v${V} 自动生成 | ${dateStr}<br>知识产权归 娱乐资本论 所有 | https://ylzbl.com</div>`;

  reportHTML += `</body></html>`;

  // Open in new window for printing
  const blob = new Blob([reportHTML], {type: 'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    w.onload = () => {
      setTimeout(() => { w.print(); }, 500);
    };
  } else {
    // Fallback: download the report HTML
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sysId}_${type}_report_${today.toISOString().split('T')[0]}.html`;
    a.click();
  }
  toast('报告已生成，请在弹出窗口中打印或保存为PDF', 'ok');
}
