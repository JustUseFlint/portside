/* Portside — app core. Sample data only; not legal advice. */
(function(){
'use strict';
const P = window.PS;
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='portside.v1';

/* ---------- icons (Lucide paths) ---------- */
const IP = {
 overview:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 ledger:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 9v12"/>',
 refunds:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
 landed:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
 radar:'<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62A10 10 0 1 0 21.31 8.35M16.24 7.76A6 6 0 1 0 8.23 16.67M12 18h.01M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
 drawback:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
 suppliers:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
 settings:'<path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 chevd:'<path d="m6 9 6 6 6-6"/>', chevr:'<path d="m9 18 6-6-6-6"/>', chevl:'<path d="m15 18-6-6 6-6"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
 upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
 file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 13h4M10 17h4"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
 store:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
 xcircle:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
 filter:'<path d="M3 6h18M7 12h10M10 18h4"/>',
 ext:'<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
 send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
 more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
 keyboard:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
 package:'<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
 arrowr:'<path d="M5 12h14M12 5l7 7-7 7"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
 layers:'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
 plus:'<path d="M5 12h14M12 5v14"/>',
 rotate:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};
const ic = (n,c='') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${IP[n]||''}</svg>`;
const LOGO = `<svg class="mark" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2.75" y="2.75" width="18.5" height="18.5" rx="4" fill="none" stroke="#EDEDED" stroke-width="1.5"/><path d="M2.75 16.5 21.25 9" stroke="#EDEDED" stroke-width="1.5"/></svg>`;

/* ---------- format ---------- */
const nf2 = new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const nf0 = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const MINUS='\u2212';
const money = (v,c=true)=> (v<0?MINUS:'')+'$'+(c?nf2:nf0).format(Math.abs(v));
const money0 = v=>money(v,false);
const pct = (v,d=1)=> (v<0?MINUS:'')+Math.abs(v*100).toFixed(d)+'%';
const spct = (v,d=1)=> (v>0?'+':v<0?MINUS:'')+Math.abs(v*100).toFixed(d)+'%';
const smoney = (v,c=true)=> (v>0?'+':v<0?MINUS:'')+'$'+(c?nf2:nf0).format(Math.abs(v));
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const today = (()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const TODAY = P.iso(today);
const dd = s => P.D(s);
const fdate = s => {if(!s)return '—';const d=dd(s);return MON[d.getMonth()]+' '+d.getDate()+(d.getFullYear()!==today.getFullYear()?', '+d.getFullYear():'')};
const fdateFull = s => {if(!s)return '—';const d=dd(s);return MON[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()};
const days = s => Math.round((dd(s)-today)/864e5);
const rel = n => n===0?'today':n===1?'tomorrow':n===-1?'yesterday':n>0?`in ${n} days`:`${-n} days ago`;
const dlCls = n => n<=7?'red':n<=30?'amber':'';
const chip = s => {if(!s)return '<span class="dl t3">—</span>';const n=days(s);return `<span class="dl ${dlCls(n)}">${fdate(s)} <span class="rel">· ${rel(n)}</span></span>`};

/* ---------- state ---------- */
let S;
function freshState(data, source){
  return {v:1, onboarded:true, source:source||{kind:'sample',name:'Sample ACE entry summary (Juniper & Oak Home)',at:new Date().toISOString()},
    data, settings:{density:'default',ach:false,margin:40,email:true,slack:true,a60:true,a30:true,a7:true,owner:'Priya Shah'},
    checklist:{dismissed:false,ior:false,ach:false,map:false}, audit:[{t:new Date().toISOString(),who:'Priya Shah',what:'Built ledger from '+(source?source.name:'sample data')}],
    letters:{}, pulse:true};
}
function load(){try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&j.v===1)return j}catch(e){} return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
S = load();
P.state = ()=>S;

/* ---------- domain ---------- */
const ST = {
 eligible:{l:'Eligible',g:'Eligible now',c:'blue'}, protest:{l:'Needs protest',g:'Needs protest',c:'amber'}, filed:{l:'Filed',g:'Filed',c:''},
 paid:{l:'Paid',g:'Paid',c:'green'}, hold:{l:'On hold',g:'On hold: bank details missing',c:'red'}, notior:{l:'Not IOR',g:'Not importer of record',c:''},
 missed:{l:'Window closed',g:'Past protest window',c:'red'}, none:{l:'No claim',g:'No refund claim',c:''}
};
const GROUP_ORDER=['eligible','protest','filed','paid','hold','notior','missed'];
const pill = st => {const m=ST[st]||ST.none; if(st==='none') return `<span class="pill plain t3" style="background:transparent;padding:0">No claim</span>`; return `<span class="pill ${m.c}">${m.l}</span>`};
const E = ()=>S.data.entries;
const byId = id => E().find(e=>e.id===id);
const dutyTotal = e => Object.values(e.duties).reduce((a,b)=>a+b,0);
const refundAmt = e => e.duties.ieepa;
const deadline = e => (e.liq && ['eligible','protest','hold','missed'].includes(e.status)) ? P.addDays(e.liq,180) : null;
const isRefundable = e => e.status==='eligible'||e.status==='protest';
const ORIG = c => (P.ORIGINS[c]||{name:c}).name;
const o2 = c => `<span class="o2"><span class="mono">${esc(c)}</span><span>${esc(ORIG(c))}</span></span>`;
function skus(){return S.data.skus}
const skuCalc = (s,mode)=>P.calcSku(s,{mode});

/* radar impacts */
function impact(r){
  const sk=skus(); let pairs=null, text='';
  if(r.kind==='301') pairs=['jul23','aug17'];
  else if(r.kind==='232') pairs=['aug17','now'];
  else if(r.kind==='prop') pairs=['now','prop'];
  if(pairs){
    const rows=sk.map(s=>{const a=skuCalc(s,pairs[0]),b=skuCalc(s,pairs[1]);return {s,a,b,d:b.landed-a.landed,m:(b.duty-a.duty)*s.units}}).filter(x=>Math.abs(x.d)>.005);
    const monthly=rows.reduce((a,x)=>a+x.m,0);
    return {rows,pairs,monthly,n:rows.length,text:`Affects ${rows.length} SKUs · ${smoney(monthly,false)}/mo`};
  }
  if(r.kind==='122') return {rows:[],n:0,monthly:0,text:'Replaced by Section 301 groups · see that change'};
  if(r.id==='rcape3'){const n=E().filter(e=>e.status==='missed').length;return {rows:[],n,monthly:0,text:n?`${n} entries past their protest window`:'0 entries affected · no CIT case on file'}}
  const ref=E().filter(isRefundable);return {rows:[],n:ref.length,monthly:0,text:`${money0(ref.reduce((a,e)=>a+refundAmt(e),0))} refundable now across ${ref.length} entries`};
}

/* ---------- routing ---------- */
function route(){
  const h=location.hash.replace(/^#\/?/,''); const [path,qs]=h.split('?');
  const parts=(path||'overview').split('/'); return {name:parts[0]||'overview', arg:parts[1], q:new URLSearchParams(qs||'')};
}
function go(name, q, replace){
  const qs = q ? (q instanceof URLSearchParams ? q.toString() : new URLSearchParams(q).toString()) : '';
  const h = '#/'+name+(qs?'?'+qs:'');
  if(replace) {history.replaceState(null,'',h); render();} else location.hash=h;
}
function setQ(patch){
  const r=route(); for(const k in patch){ if(patch[k]==null||patch[k]===''||patch[k]===false) r.q.delete(k); else r.q.set(k,patch[k]); }
  go(r.name+(r.arg?'/'+r.arg:''), r.q, true);
}
P.go=go; P.setQ=setQ; P.route=route;

/* ---------- shell ---------- */
const NAV=[['overview','Overview','overview','G O'],['ledger','Ledger','ledger','G L'],['refunds','Refunds','refunds','G R'],['landed','Landed Cost','landed','G C'],['radar','Tariff Radar','radar','G T'],['drawback','Drawback','drawback',null,'Phase 2'],['suppliers','Suppliers','suppliers','G S']];
const mq = matchMedia('(max-width:767px)');
const isMobile = ()=>mq.matches;
function urgent(){return E().filter(e=>{const d=deadline(e);return d&&e.status==='protest'&&days(d)<=7&&days(d)>=0}).length}

function shell(r){
  const cur = r.name==='radar'?'radar':r.name;
  const navHtml = NAV.map(n=>`<a href="#/${n[0]}" class="${cur===n[0]?'on':''}">${ic(n[2])}<span>${n[1]}</span>${n[4]?`<span class="ph">${n[4]}</span>`:n[3]?`<span class="k">${n[3].split(' ').map(k=>`<kbd>${k}</kbd>`).join('')}</span>`:''}</a>`).join('');
  const crumbs = {overview:'Overview',ledger:'Ledger',refunds:'Refunds',landed:'Landed Cost',radar:'Tariff Radar',drawback:'Drawback',suppliers:'Suppliers',settings:'Settings'}[r.name]||'Overview';
  const u=urgent();
  return `
  <div class="shell">
    <aside class="side" aria-label="Sidebar">
      <button class="ws" data-act="nav" data-to="settings" aria-label="Workspace">${LOGO}<div class="n"><b>Juniper &amp; Oak Home</b><span>Importer 87-4410293-00</span></div>${ic('chevd','t3')}</button>
      <nav class="nav">${navHtml}<div class="sep"></div><a href="#/settings" class="${cur==='settings'?'on':''}">${ic('settings')}<span>Settings</span></a></nav>
      <div class="foot">
        <button class="nav-a btn ghost" style="width:100%;justify-content:flex-start" data-act="keys">${ic('keyboard')} Keyboard shortcuts <span style="margin-left:auto"><kbd>?</kbd></span></button>
        <div class="user"><span class="avatar">PS</span><div>Priya Shah<span>COO · Owner</span></div></div>
      </div>
    </aside>
    <div class="main" id="main">
      <header class="topbar">
        <div class="crumbs"><span class="logo-m">${LOGO}</span><span class="t3 hide-m">Juniper &amp; Oak</span><span class="t3">/</span><b>${crumbs}</b></div>
        <button class="searchbtn" data-act="palette" aria-label="Open command palette">${ic('search')}<span class="lbl">Search or jump to…</span><kbd>⌘K</kbd></button>
        <span class="avatar" title="Priya Shah">PS</span>
      </header>
      <div class="samplebar">${ic('info')}<span><b>Sample data</b> · fictional company and entries. Findings are informational, not legal advice. A licensed customs broker or the importer files.</span></div>
      <div class="content" id="content"></div>
    </div>
    <div class="bulk" id="bulk"></div>
  </div>
  <nav class="tabbar" aria-label="Tabs">
    ${[['overview','Overview','overview'],['ledger','Ledger','ledger'],['refunds','Refunds','refunds'],['landed','Landed','landed']].map(t=>`<a href="#/${t[0]}" class="${cur===t[0]?'on':''}">${ic(t[2])}<span>${t[1]}</span>${t[0]==='refunds'&&u?`<span class="badge">${u}</span>`:''}</a>`).join('')}
    <button data-act="more" class="${['radar','drawback','suppliers','settings'].includes(cur)?'on':''}">${ic('more')}<span>More</span></button>
  </nav>`;
}

/* ---------- render ---------- */
let lastShellKey='';
function render(){
  const r=route();
  document.body.className='d-'+((S&&S.settings.density)||'default');
  if(!S || !S.onboarded || r.name==='onboarding'){ if(r.name!=='onboarding'){history.replaceState(null,'','#/onboarding')} document.getElementById('app').innerHTML=P.views.onboarding(); P.bindOnboarding(); closeInspector(true); return; }
  const key=r.name+'|'+urgent();
  if(key!==lastShellKey || !$('#content')){ $('#app').innerHTML=shell(r); lastShellKey=key; }
  const v=P.views[r.name]||P.views.overview;
  const c=$('#content'); c.innerHTML=v(r);
  P.after && P.after(r);
  syncInspector(r);
  renderBulk(r);
  document.title = 'Portside · '+(({overview:'Overview',ledger:'Ledger',refunds:'Refunds',landed:'Landed Cost',radar:'Tariff Radar',drawback:'Drawback',suppliers:'Suppliers',settings:'Settings'})[r.name]||'Overview');
}
P.render=render;

/* ---------- selection ---------- */
function selSet(){const r=route();const s=r.q.get('sel');return new Set(s?s.split(',').filter(Boolean):[])}
function writeSel(set){setQ({sel:[...set].join(',')})}
P.selSet=selSet; P.writeSel=writeSel;
function renderBulk(r){
  const b=$('#bulk'); if(!b) return;
  const set=selSet(); const ok=['ledger','refunds'].includes(r.name)&&set.size>0;
  if(ok){const ents=[...set].map(byId).filter(Boolean);const tot=ents.reduce((a,e)=>a+refundAmt(e),0);
    b.innerHTML=`<div class="n">${set.size} selected<span class="mono">${money(tot)} IEEPA</span></div>
    <button class="btn ghost" data-act="clearsel">Clear</button><button class="btn sec" data-act="export">${ic('download')}<span class="hide-s">Export</span></button><button class="btn primary" data-act="packet">Add to refund packet <kbd class="hide-m">⌘↵</kbd></button>`;}
  b.classList.toggle('on',ok);
}

/* ---------- inspector ---------- */
function syncInspector(r){
  const id=r.q.get('entry'), sk=r.q.get('sku'), sup=r.q.get('sup');
  let el=$('#insp'); if(!el){el=document.createElement('aside');el.id='insp';el.className='insp';el.setAttribute('aria-label','Inspector');document.body.appendChild(el);
    const sc=document.createElement('div');sc.id='scrim';sc.className='scrim insp-s';sc.addEventListener('click',()=>closeInspector());document.body.appendChild(sc);}
  let html=null;
  if(id && byId(id)) html=P.inspEntry(byId(id));
  else if(sk) {const s=skus().find(x=>x.sku===sk); if(s) html=P.inspSku(s);}
  else if(sup){const s=S.data.suppliers.find(x=>x.id===sup); if(s) html=P.inspSupplier(s);}
  const open=!!html;
  if(open){ const keepScroll = el.dataset.k===(id||sk||sup) ? ($('.ib',el)||{}).scrollTop : 0; el.innerHTML=html; el.dataset.k=id||sk||sup; const ib=$('.ib',el); if(ib&&keepScroll) ib.scrollTop=keepScroll; P.bindInspector&&P.bindInspector(el);}
  el.classList.toggle('on',open); $('#scrim').classList.toggle('on',open);
  const m=$('#main'); if(m) m.classList.toggle('push',open);
  document.documentElement.style.overflow = (open&&isMobile())?'hidden':'';
}
function closeInspector(silent){
  const el=$('#insp'); if(el){el.classList.remove('on');} const sc=$('#scrim'); if(sc) sc.classList.remove('on'); const m=$('#main'); if(m) m.classList.remove('push');
  document.documentElement.style.overflow='';
  if(!silent){const r=route(); if(r.q.has('entry')||r.q.has('sku')||r.q.has('sup')) setQ({entry:null,sku:null,sup:null});}
}
P.closeInspector=closeInspector;

/* ---------- toast ---------- */
function toast(msg, undo){
  let w=$('#toasts'); if(!w){w=document.createElement('div');w.id='toasts';w.className='toasts';w.setAttribute('role','status');w.setAttribute('aria-live','polite');document.body.appendChild(w)}
  const t=document.createElement('div'); t.className='toast'; t.innerHTML=`<span>${esc(msg)}</span>${undo?'<button class="btn sec sm">Undo</button>':''}<button class="btn ghost icon sm" aria-label="Dismiss">${ic('x')}</button>`;
  w.appendChild(t); const kill=()=>{t.remove()}; const tm=setTimeout(kill,5000);
  if(undo) t.querySelector('.btn.sec').onclick=()=>{clearTimeout(tm);kill();undo();};
  t.querySelector('.btn.ghost').onclick=()=>{clearTimeout(tm);kill()};
}
function audit(what){S.audit.unshift({t:new Date().toISOString(),who:S.settings.owner||'Priya Shah',what}); if(S.audit.length>60) S.audit.length=60;}

/* ---------- CSV ---------- */
function csvCell(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCSV(rows){return rows.map(r=>r.map(csvCell).join(',')).join('\r\n')}
function download(name, text, type){const b=new Blob([text],{type:type||'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function parseCSV(text){
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++} else q=false } else f+=c; }
    else if(c==='"') q=true; else if(c===','){row.push(f);f=''} else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(f);f=''; if(row.length>1||row[0]!=='') rows.push(row); row=[]} else f+=c;}
  if(f!==''||row.length){row.push(f);rows.push(row)}
  return rows;
}

Object.assign(P,{$, $$, esc, ic, LOGO, money, money0, pct, spct, smoney, fdate, fdateFull, days, rel, chip, dlCls, pill, ST, GROUP_ORDER, E, byId, dutyTotal, refundAmt, deadline, isRefundable, ORIG, o2, skus, skuCalc, impact, isMobile, toast, audit, save, toCSV, download, parseCSV, freshState, TODAY, today, urgent, MINUS,
  setState:(ns)=>{S=ns;save();}});

let _lastPage=null; window.addEventListener('hashchange',()=>{const pg=(location.hash.split('?')[0]||'');render(); if(pg!==_lastPage){window.scrollTo(0,0);const m=document.querySelector('.main');if(m)m.scrollTop=0;} _lastPage=pg;});
mq.addEventListener('change',render);
document.addEventListener('DOMContentLoaded',()=>{render(); if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});});
})();
