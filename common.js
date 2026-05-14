/* ============================================================
   行业监控系统 v0.8 — 共享核心逻辑
   娱乐资本论
   ============================================================ */
const V = '0.8';

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
const PROXIES = ['https://corsproxy.io/?','https://api.allorigins.win/raw?url='];
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// === PAGE NOISE FILTER ===
const PAGE_NOISE = /(?:ICP备|ICP证|公网安备|版权所有|技术支持|浏览器推荐|推荐使用|分辨率|访问量|主办单位|承办单位|联系我们|信访|投诉|举报|网站地图|设为首页|加入收藏|刷新过于频繁|稍后再试|页面不存在|已删除|error|404|403|forbidden)/i;

// === SUBSYSTEM DEFINITIONS ===
const SYS = {
  chaowan:{
    id:'chaowan',name:'潮玩行业每日监控',icon:'🎮',
    desc:'实时掌握潮玩行业舆情动态、产品热度、价格波动、竞品动作',
    accent:'#E91E8C',
    defaultSources:[
      {name:'虎嗅-消费',url:'https://rss.huxiu.com/',type:'rss',category:'行业'},
      {name:'36氪-消费',url:'https://36kr.com/newsflashes',type:'page',category:'快讯'},
      {name:'IT之家',url:'https://www.ithome.com/rss/',type:'rss',category:'科技'},
      {name:'澎湃新闻',url:'https://feedx.net/rss/thepaper.xml',type:'rss',category:'综合'},
    ],
    defaultKeywords:['泡泡玛特','盲盒','潮玩','TOP TOY','52TOYS','寻找独角兽','Skullpanda','Molly','Dimoo','新品','联名','限量','涨价','名创优品','IP授权','手办','二次元','LABUBU','popmart','玩具','手作','模型','国潮','收藏','二次元经济','文化消费','新消费','零售','国货','文创','IP','动漫','游戏','娱乐','周边','扭蛋'],
    defaultAlertKeywords:['泡泡玛特','违规','召回','下架','监管','侵权','假货'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于潮玩行业。请根据监控数据生成{type}摘要：1.潮玩行业重大事件与新品动态；2.品牌风险与合规警示；3.行业趋势判断。简明扼要，中文。'
  },
  guangdian:{
    id:'guangdian',name:'广电总局数据监控',icon:'📡',
    desc:'覆盖项目发行、节目备案、传播数据、播出资质、违规风险',
    accent:'#1565C0',
    defaultSources:[
      {name:'广电总局-通知公告',url:'http://www.nrta.gov.cn/art/chengwenxingwj/gztg.shtml',type:'page',category:'政务'},
      {name:'重点网络影视剧备案',url:'http://211.146.10.138:8080/YSJBA/',type:'page',category:'备案'},
      {name:'虎嗅',url:'https://rss.huxiu.com/',type:'rss',category:'行业'},
      {name:'澎湃新闻',url:'https://feedx.net/rss/thepaper.xml',type:'rss',category:'综合'},
      {name:'36氪',url:'https://36kr.com/newsflashes',type:'page',category:'快讯'},
    ],
    defaultKeywords:['备案','审查','许可证','播出','违规','下架','限令','综艺','电视剧','网络剧','动画片','广播电视','电影局','放映许可证','龙标','备案公示','广电','总署','文化','影视','节目','发行','上映','审查通过','审批','监管','文化部','宣传部','文娱','视频','短剧','网剧','备案公示','内容审核','内容监管','网络视听'],
    defaultAlertKeywords:['下架','违规','处罚','限令','整改','禁播','约谈'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于广电政策与合规。请根据监控数据生成{type}摘要：1.政策法规变化；2.违规下架风险；3.备案审查动态。简明扼要，中文。'
  },
  piaofang:{
    id:'piaofang',name:'中国电影票房监控',icon:'🎬',
    desc:'实时采集影片票房、排片占比、上座率、口碑评分、舆情动态',
    accent:'#D97706',
    defaultSources:[
      {name:'1905电影网',url:'https://www.1905.com/rss',type:'rss',category:'电影'},
      {name:'猫眼专业版',url:'https://piaofang.maoyan.com/dashboard',type:'page',category:'票房数据'},
      {name:'虎嗅',url:'https://rss.huxiu.com/',type:'rss',category:'行业'},
      {name:'澎湃新闻',url:'https://feedx.net/rss/thepaper.xml',type:'rss',category:'综合'},
      {name:'36氪',url:'https://36kr.com/newsflashes',type:'page',category:'快讯'},
    ],
    defaultKeywords:['票房','排片','上座率','首日','预售','破亿','口碑','豆瓣','档期','院线','观影人次','票房冠军','票房纪录','春节档','国庆档','暑期档','国产片','引进片','电影','影片','上映','导演','主演','影院','影城','银幕','动画','票房收入','票房突破','电影市场','院线','发行'],
    defaultAlertKeywords:['票房破亿','撤档','偷票房','口碑崩','票房惨败'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于电影市场。请根据监控数据生成{type}摘要：1.票房排行榜及趋势；2.重点影片口碑与排片；3.档期市场动态。简明扼要，中文。'
  },
  duanju:{
    id:'duanju',name:'短剧数据监控',icon:'📱',
    desc:'聚焦全网短剧行业，实时采集播放量、热度、竞品动态、政策',
    accent:'#7C3AED',
    defaultSources:[
      {name:'虎嗅',url:'https://rss.huxiu.com/',type:'rss',category:'行业'},
      {name:'澎湃新闻',url:'https://feedx.net/rss/thepaper.xml',type:'rss',category:'综合'},
      {name:'36氪',url:'https://36kr.com/newsflashes',type:'page',category:'快讯'},
      {name:'IT之家',url:'https://www.ithome.com/rss/',type:'rss',category:'科技'},
    ],
    defaultKeywords:['短剧','微短剧','小程序剧','竖屏剧','充值','爆款','投流','ROI','短剧备案','快手短剧','抖音短剧','短剧出海','付费短剧','免费短剧','短剧平台','DataEye','横屏','竖屏','小程序','短剧','长视频','短视频','影视','网文','IP改编','短内容','流量','内容','剧集','电视剧','网剧','视频','流量变现','内容创作'],
    defaultAlertKeywords:['下架','监管','备案','违规','处罚','禁播','约谈'],
    defaultAIPrompt:'你是{sys}的数据分析师，专注于短剧产业。请根据监控数据生成{type}摘要：1.短剧爆款趋势；2.监管与合规风险；3.平台与投流动态。简明扼要，中文。'
  },
  shangshi:{
    id:'shangshi',name:'娱乐传媒上市公司监控',icon:'📈',
    desc:'实时监控财报、营收、利润、股价、公告、舆情、项目动态',
    accent:'#0D9488',
    defaultSources:[
      {name:'巨潮资讯网',url:'http://www.cninfo.com.cn/new/disclosure/stock?stockId=&orgId=&tabname=fulltext',type:'page',category:'公告'},
      {name:'虎嗅',url:'https://rss.huxiu.com/',type:'rss',category:'行业'},
      {name:'澎湃新闻',url:'https://feedx.net/rss/thepaper.xml',type:'rss',category:'综合'},
      {name:'IT之家',url:'https://www.ithome.com/rss/',type:'rss',category:'科技'},
      {name:'36氪',url:'https://36kr.com/newsflashes',type:'page',category:'快讯'},
    ],
    defaultKeywords:['财报','营收','利润','股价','公告','增持','减持','定增','重组','立案','退市','业绩预告','年度报告','证监会','IPO','分红','股权','质押','光线传媒','华谊兄弟','万达电影','上市','A股','港股','纳斯达克','传媒','娱乐','文娱','影视','游戏','公司','资本','融资','投资','市值','交易','收购','并购','新三板','北交所','科创板','创业板'],
    defaultAlertKeywords:['立案','退市','亏损','暴跌','证监会','处罚','违规','诉讼','冻结','强平'],
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

// === KEYWORD HIGHLIGHT ===
function hlKw(text,kws){
  if(!kws||!kws.length)return text;
  const allKw=[...kws].sort((a,b)=>b.length-a.length);
  let r=text;
  allKw.forEach(kw=>{const re=new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');r=r.replace(re,m=>`<span class="kw-h">${m}</span>`)});
  return r;
}

// === COMPLIANCE CHECK ===
function isBlocked(url){
  const cfg=lg('mon_global',{compliance:true});
  if(!cfg.compliance)return false;
  try{
    const u=new URL(url);
    const host=u.hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(d=>host===d||host.endsWith('.'+d));
  }catch{return false}
}

// === FETCH WITH PROXY ===
async function fetchProxy(url){
  if(isBlocked(url))throw new Error('源被合规过滤屏蔽');
  let lastErr=null;
  for(const proxy of PROXIES){
    try{
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),15000);
      const resp=await fetch(proxy+encodeURIComponent(url)+'&_t='+Date.now(),{signal:ctrl.signal});
      clearTimeout(tid);if(!resp.ok)throw new Error('HTTP '+resp.status);
      const buf=await resp.arrayBuffer();return new TextDecoder('utf-8').decode(buf);
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
  // AI config
  const aiExist=localStorage.getItem('mon_ai');
  if(!aiExist){
    ls('mon_ai',{provider:'zhipu',url:'https://open.bigmodel.cn/api/paas/v4/chat/completions',model:'glm-4-flash',key:'89cf52e166744146a966eb905597a5ba.YvQflJOFgM3yX1o8',summarizePrompt:'',dedupPrompt:''});
  }else{
    const aiParsed=JSON.parse(aiExist);
    if(!aiParsed.key){aiParsed.key='89cf52e166744146a966eb905597a5ba.YvQflJOFgM3yX1o8';ls('mon_ai',aiParsed)}
  }
  // Global config
  if(!localStorage.getItem('mon_global')){
    ls('mon_global',{compliance:true});
  }
  // Theme
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
  {v:'0.8',date:'2026-05-14',changes:[
    '多文件架构拆分（index.html + monitor.html + common.css + common.js）',
    '移除Google News RSS默认源（避免敏感内容）',
    '新增合规内容过滤（屏蔽境外被墙源，可开关）',
    '页面打开自动运行一次监测',
    '首页子系统卡片有新内容时变色提醒',
    '世界地图替换为专业SVG剪影',
    '新增关键字词云可视化',
    '打印功能改为生成出版物风格报告（含表格/图表）',
    '深色模式等设置项统一收入设置面板',
    '抓取内容支持CSV导出（UTF-8 BOM，Excel不乱码）',
    '设置项支持JSON导入导出',
    'Changelog改为倒序',
    '关键字相关性过滤：通用RSS仅保留匹配关键字的条目',
    '页面解析噪声过滤（ICP/版权/错误页等）',
    '自定义AI服务商（智谱/DeepSeek/Gemini/自定义）+自定义Prompt',
    'AI连接测试 + 单条AI摘要'
  ]},
  {v:'0.7',date:'2026-05-13',changes:['关键字相关性过滤','修复AI Key预填','修复国家电影局URL','页面解析过滤噪声']},
  {v:'0.6',date:'2026-05-13',changes:['Google News RSS订阅','仪表盘可视化','自定义AI','可打印输出','页面首次访问返回内容']},
  {v:'0.5',date:'2026-05-13',changes:['修复portal返回数据刷新','子系统进入时重新加载']},
  {v:'0.4',date:'2026-05-13',changes:['修复去重逻辑','改进关键字匹配']},
  {v:'0.3',date:'2026-05-13',changes:['rss2json备选方案']},
  {v:'0.2',date:'2026-05-13',changes:['修复默认信息源','添加进度条']},
  {v:'0.1',date:'2026-05-13',changes:['初始版本：5子系统、RSS采集、页面轮询、关键字告警、AI摘要']}
];

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
  h+=`<div class="fg"><label class="fl">API Key</label><input class="inp" type="password" id="aiKey" value="${esc(aiCfg.key||'')}"><div class="fh">Key仅存储在浏览器本地。首次使用已预填测试Key</div></div>`;
  h+=`<div class="fg"><label class="fl">单条摘要提示词</label><textarea class="inp" id="aiSumPrompt" rows="2">${esc(aiCfg.summarizePrompt||'')}</textarea></div>`;
  h+=`<div class="fg"><label class="fl">去重提示词</label><textarea class="inp" id="aiDedupPrompt" rows="2">${esc(aiCfg.dedupPrompt||'')}</textarea></div>`;
  h+=`<div style="display:flex;gap:var(--space-sm)"><button class="btn btn-p" onclick="saveAICfg()">保存AI配置</button><button class="btn btn-o" onclick="testAI()">测试连接</button></div>`;

  // Global settings
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>全局设置</h3></div>`;
  h+=`<div class="fg"><label class="fl">深色模式</label><label class="tog"><input type="checkbox" ${document.documentElement.getAttribute('data-theme')==='dark'?'checked':''} onchange="toggleTheme();document.getElementById('sModal').querySelector('.mdl-b').innerHTML='';renderSettingsBody&&(document.getElementById('sModal').querySelector('.mdl-b').innerHTML=renderSettingsBody(currentSysId,sysData))"><span class="tog-t"><span class="tog-k"></span></span><span>${document.documentElement.getAttribute('data-theme')==='dark'?'开启':'关闭'}</span></label></div>`;
  h+=`<div class="fg"><label class="fl">合规检查</label><label class="tog"><input type="checkbox" id="complianceChk" ${globalCfg.compliance?'checked':''} onchange="lg('mon_global',{compliance:this.checked});ls('mon_global',{compliance:this.checked})"><span class="tog-t"><span class="tog-k"></span></span><span>在中国大陆使用，请进行严格的合规检查</span></label><div class="fh">勾选后将屏蔽被墙的境外新闻源，防止敏感内容出现在监控结果中</div></div>`;

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

  // About
  h+=`<div class="abt" style="margin-top:var(--space-xl)"><h3>关于</h3>
    <p>行业监控系统 是由 <strong>娱乐资本论</strong> 自主研发的全网内容实时巡检与自动化采集平台。</p>
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
