/* Portside — views */
(function(){
'use strict';
const P=window.PS; const V=P.views={};
const {esc,ic,money,money0,pct,spct,smoney,fdate,fdateFull,days,rel,chip,pill,ST,GROUP_ORDER,E,byId,dutyTotal,refundAmt,deadline,isRefundable,o2,skus,skuCalc,impact,isMobile,TODAY}=P;
const S=()=>P.state();
const DUTY=[['mfn','MFN'],['ieepa','IEEPA'],['s122','Section 122'],['s301','Section 301'],['s232','Section 232'],['adcvd','AD/CVD']];

/* ===== Overview ===== */
V.overview=function(r){
  const range=r.q.get('range')||'1y';
  const ents=E();
  const ref=ents.filter(isRefundable), refAmt=ref.reduce((a,e)=>a+refundAmt(e),0);
  const y0=String(P.today.getFullYear())+'-01-01', d90=P.addDays(TODAY,-90);
  const inR=e=> range==='all'?true: range==='90d'? e.date>=d90 : e.date>=y0;
  const paid=ents.filter(inR).reduce((a,e)=>a+dutyTotal(e),0), nPaid=ents.filter(inR).length;
  const dls=ents.map(e=>({e,d:deadline(e)})).filter(x=>x.d&&days(x.d)>=0&&x.e.status!=='missed').sort((a,b)=>a.d.localeCompare(b.d));
  const d30=dls.filter(x=>days(x.d)<=30);
  let num=0,den=0; skus().forEach(s=>{num+=skuCalc(s,'now').landed*s.units;den+=skuCalc(s,'jul23').landed*s.units}); const lc=num/den-1;
  const st=S(); const pulse=st.pulse; if(pulse){st.pulse=false;P.save();}
  const groups=['eligible','protest','filed','paid','hold'].map(k=>({k,amt:ents.filter(e=>e.status===k).reduce((a,e)=>a+refundAmt(e),0),n:ents.filter(e=>e.status===k).length}));
  const gt=groups.reduce((a,g)=>a+g.amt,0);
  const shades={eligible:'#EDEDED',protest:'#A1A1A1',filed:'#7A7A7A',paid:'#3D3D3D',hold:'#525252'};
  const rangeLbl={'90d':'Duties paid, last 90 days','1y':'Duties paid this year','all':'Duties paid, all time'}[range];
  const ck=st.checklist;
  const radar=st.data.radar.filter(x=>x.state==='In effect'||x.state==='Proposed').slice(0,3);
  return `
  <div class="phead"><h1>Overview</h1><div class="actions">
    <div class="seg" role="tablist" aria-label="Date range">${[['90d','90D'],['1y','1Y'],['all','All']].map(x=>`<button class="${range===x[0]?'on':''}" data-act="q" data-k="range" data-v="${x[0]}" role="tab" aria-selected="${range===x[0]}">${x[1]}</button>`).join('')}</div>
    <button class="btn sec" data-act="export">${ic('download')} Export <kbd class="hide-m">E</kbd></button></div></div>
  ${!ck.dismissed?`<div class="card checklist" style="margin-bottom:16px"><div class="ch"><h3>Finish setup</h3><span class="t3 mono" style="font-size:12px">${[ck.ior,ck.ach,ck.map].filter(Boolean).length} of 3</span><button class="btn ghost icon sm" data-act="dismiss-ck" aria-label="Dismiss checklist">${ic('x')}</button></div><div class="cb" style="padding-top:4px;padding-bottom:4px">
    ${[['ior','Confirm importer of record','Juniper & Oak Home LLC · 87-4410293-00','settings'],['ach','Check ACH refund enrollment','CBP holds refunds without bank details','settings'],['map','Map top SKUs','28 of 340 SKUs mapped to HTS lines','landed']].map(x=>`<div class="ci ${ck[x[0]]?'done':''}"><button class="chk ${ck[x[0]]?'on':''}" data-act="ck" data-k="${x[0]}" aria-label="Mark ${x[1]} done" style="width:22px;height:22px"></button><span>${x[1]}<br><small class="t3">${x[2]}</small></span><a class="btn ghost sm" href="#/${x[3]}">Open</a></div>`).join('')}
  </div></div>`:''}
  <div class="kpis">
    <a class="kpi ${pulse?'pulse':''}" href="#/ledger?status=refundable" aria-label="Refundable now: ${Math.round(refAmt)} dollars across ${ref.length} entries"><span class="l">Refundable now</span><span class="v">${money0(refAmt)}</span><span class="s">across ${ref.length} entries · IEEPA</span></a>
    <a class="kpi" href="#/ledger?range=${range==='1y'?'2026':range}"><span class="l">${rangeLbl}</span><span class="v">${money0(paid)}</span><span class="s">${nPaid} entries · all duty types</span></a>
    <a class="kpi ${d30.length?'amber':''}" href="#/refunds"><span class="l">Deadlines in 30 days</span><span class="v">${d30.length}</span><span class="s">${d30.length?money0(d30.reduce((a,x)=>a+refundAmt(x.e),0))+' at stake · protest clocks':'Nothing due'}</span></a>
    <a class="kpi" href="#/landed"><span class="l">Landed cost since Jul 24</span><span class="v">${spct(lc)}</span><span class="s">Weighted by monthly units · rule ${P.CURRENT_RULE}</span></a>
  </div>
  <div class="ov">
    <div class="l8 grid">
      <div class="card"><div class="ch"><h3>Refunds by status</h3><span class="mono t2" style="font-size:12px">${money0(gt)} IEEPA</span></div><div class="cb">
        <div class="stack" role="img" aria-label="Refunds by status">${groups.filter(g=>g.amt>0).map(g=>`<div style="flex:${g.amt};background:${shades[g.k]}" data-tip="${ST[g.k].g} · ${money(g.amt)}" data-act="nav" data-to="refunds"></div>`).join('')}</div>
        <div class="legend">${groups.map(g=>`<a href="#/ledger?status=${g.k}"><i style="background:${shades[g.k]}"></i>${ST[g.k].l} <span class="t3 mono">${g.n}</span><span class="mono">${money0(g.amt)}</span></a>`).join('')}</div>
      </div></div>
      <div class="card"><div class="ch"><h3>Next deadlines</h3><a class="btn ghost sm" href="#/refunds">All refunds ${ic('arrowr')}</a></div>
        ${isMobile()? `<div>${dls.slice(0,6).map(x=>`<button class="srow" data-act="open-entry" data-id="${x.e.id}"><div class="bd"><div class="l1"><span class="mono">${x.e.no}</span><span class="amt">${money(refundAmt(x.e))}</span></div><div class="l2">${chip(x.d)}${pill(x.e.status)}</div></div></button>`).join('')}</div>`
        : `<table class="t"><thead><tr><th>Entry</th><th>Origin</th><th>Status</th><th class="num">IEEPA</th><th>Protest deadline</th></tr></thead><tbody>
        ${dls.slice(0,6).map(x=>`<tr data-act="open-entry" data-id="${x.e.id}"><td class="mono">${x.e.no}</td><td>${o2(x.e.origin)}</td><td>${pill(x.e.status)}</td><td class="num">${money(refundAmt(x.e))}</td><td>${chip(x.d)}</td></tr>`).join('')}</tbody></table>`}
      </div>
    </div>
    <div class="r4"><div class="card"><div class="ch"><h3>Tariff Radar</h3><a class="btn ghost sm" href="#/radar">View all</a></div><div class="feed">
      ${radar.map(x=>{const im=impact(x);return `<a href="#/radar/${x.id}"><div class="fn"><span>${esc(x.name)}</span>${x.state==='Proposed'?'<span class="pill blue">Proposed</span>':''}</div><div class="fi">${x.state==='Proposed'?'Effective ':''}${fdate(x.date)} · ${esc(im.text)}</div></a>`}).join('')}
    </div></div>
    <p class="note">Sample data. Rule math is simplified for this demo (rule version ${P.CURRENT_RULE}); findings are informational, not legal advice.</p></div>
  </div>`;
};

/* ===== Ledger ===== */
const VIEWS=[['all','All'],['ieepa','IEEPA'],['s301','Section 301'],['s232','Section 232'],['unliq','Unliquidated']];
function ledgerRows(q){
  const view=q.get('view')||'all', st=q.get('status')||'', og=q.get('origin')||'', du=q.get('duty')||'', rg=q.get('range')||'', s=(q.get('q')||'').trim().toLowerCase();
  const d90=P.addDays(TODAY,-90);
  return E().filter(e=>{
    if(view==='ieepa'&&!(e.duties.ieepa>0))return false;
    if(view==='s301'&&!(e.duties.s301>0))return false;
    if(view==='s232'&&!(e.duties.s232>0))return false;
    if(view==='unliq'&&e.liq)return false;
    if(st==='refundable'){if(!isRefundable(e))return false} else if(st&&e.status!==st)return false;
    if(og&&e.origin!==og)return false;
    if(du&&!(e.duties[du]>0))return false;
    if(rg==='2025'&&!e.date.startsWith('2025'))return false;
    if(rg==='2026'&&!e.date.startsWith('2026'))return false;
    if(rg==='90d'&&e.date<d90)return false;
    if(s){const hay=(e.no+' '+e.origin+' '+P.ORIG(e.origin)+' '+e.lines.map(l=>l.hts+' '+l.desc+' '+l.sku).join(' ')+' '+ST[e.status].l).toLowerCase(); if(!hay.includes(s))return false}
    return true;
  });
}
P.ledgerRows=ledgerRows;
function sel(name,k,cur,opts){return `<select class="select ${cur?'set':''}" data-act="qsel" data-k="${k}" aria-label="${name}">${opts.map(o=>`<option value="${o[0]}" ${o[0]===cur?'selected':''}>${o[1]}</option>`).join('')}</select>`}
V.ledger=function(r){
  const q=r.q, view=q.get('view')||'all', group=q.get('group')==='status', set=P.selSet(), cur=q.get('cur')||q.get('entry');
  const rows=ledgerRows(q);
  const counts={}; VIEWS.forEach(v=>{const qq=new URLSearchParams(q);qq.set('view',v[0]);counts[v[0]]=ledgerRows(qq).length});
  const tot={v:0,d:0,i:0}; rows.forEach(e=>{tot.v+=e.value;tot.d+=dutyTotal(e);tot.i+=e.duties.ieepa});
  const anyF=['status','origin','duty','range','q'].some(k=>q.get(k));
  const fbar=`<div class="fbar ${q.get('fo')?'open':''}" id="fbar">
    <label class="search"><span class="sr">Search entries</span>${ic('search')}<input id="search" class="input" type="search" placeholder="Search entry, HTS, SKU…" value="${esc(q.get('q')||'')}" data-act="search" autocomplete="off"><kbd class="hide-m">/</kbd></label>
    <button class="btn sec ftoggle" data-act="ftoggle">${ic('filter')} Filters${anyF?' ·':''}</button>
    <div class="filters">
      ${sel('Status','status',q.get('status')||'',[['','Status: any'],['refundable','Refundable now'],...GROUP_ORDER.concat(['none']).map(k=>[k,ST[k].l])])}
      ${sel('Origin','origin',q.get('origin')||'',[['','Origin: any'],['VN','VN Vietnam'],['IN','IN India'],['CN','CN China']])}
      ${sel('Duty type','duty',q.get('duty')||'',[['','Duty type: any'],['mfn','MFN'],['ieepa','IEEPA'],['s122','Section 122'],['s301','Section 301'],['s232','Section 232']])}
      ${sel('Date range','range',q.get('range')||'',[['','Dates: all'],['90d','Last 90 days'],['2026','2026'],['2025','2025']])}
    </div>
    <span class="spacer hide-m"></span>
    ${anyF?`<button class="btn ghost" data-act="clearf">Clear</button>`:''}
    <button class="btn ${group?'sec':'ghost'}" data-act="q" data-k="group" data-v="${group?'':'status'}" aria-pressed="${group}">${ic('layers')} Group by status</button>
  </div>`;
  let body='';
  const ordered = group ? GROUP_ORDER.concat(['none']).map(k=>({k,rows:rows.filter(e=>e.status===k)})).filter(g=>g.rows.length) : [{k:null,rows}];
  if(!rows.length) body=`<div class="empty">${ic('search')}<h2>No entries match</h2><p>Try a different search or clear the filters.</p><button class="btn primary" data-act="clearf">Clear filters</button></div>`;
  else if(isMobile()){
    body=`<div class="rows">${ordered.map(g=>(g.k?`<div class="sgrp"><span class="overline">${ST[g.k].g}</span><span class="t3 mono" style="font-size:12px">${g.rows.length}</span><span class="mono">${money(g.rows.reduce((a,e)=>a+dutyTotal(e),0))}</span></div>`:'')+g.rows.map(e=>`
      <div class="srow ${set.has(e.id)?'sel':''}" data-act="open-entry" data-id="${e.id}" role="button" tabindex="0">
        <button class="cbx" data-act="toggle-sel" data-id="${e.id}" aria-label="Select ${e.no}"><span class="chk ${set.has(e.id)?'on':''}"></span></button>
        <div class="bd"><div class="l1"><span class="mono">${e.no}</span><span class="amt">${money(dutyTotal(e))}</span></div>
        <div class="l2"><span>${pill(e.status)}</span><span>${deadline(e)?chip(deadline(e)):'<span class="dl t3">'+fdate(e.date)+'</span>'}</span></div>
        <div class="l2"><span><span class="mono">${e.origin}</span> · <span class="mono">${e.lines[0].hts}</span>${e.lines.length>1?' +'+(e.lines.length-1):''}</span><span class="mono t3">IEEPA ${money(e.duties.ieepa)}</span></div></div>
      </div>`).join('')).join('')}
      <div class="stot"><span>${rows.length} entries</span><span>Duty ${money(tot.d)}</span><span>IEEPA ${money(tot.i)}</span></div></div>`;
  } else {
    const all = rows.length && rows.every(e=>set.has(e.id));
    body=`<div class="tbl-wrap tall"><table class="t ${set.size?'anysel':''}" id="ltable"><thead><tr><th class="cb"><button class="chk ${all?'on':''}" data-act="sel-all" aria-label="Select all"></button></th><th>Entry</th><th>Entry date</th><th>Liquidated</th><th>Origin</th><th>HTS</th><th class="num">Entered value</th><th class="num">Duty paid</th><th class="num">IEEPA</th><th>Status</th><th>Deadline</th></tr></thead><tbody>
    ${ordered.map(g=>(g.k?`<tr class="grp"><td colspan="6"><span class="overline">${ST[g.k].g}</span> <span class="t3 mono" style="font-size:12px;margin-left:6px">${g.rows.length}</span></td><td class="num t2">${money(g.rows.reduce((a,e)=>a+e.value,0))}</td><td class="num">${money(g.rows.reduce((a,e)=>a+dutyTotal(e),0))}</td><td class="num">${money(g.rows.reduce((a,e)=>a+e.duties.ieepa,0))}</td><td colspan="2"></td></tr>`:'')+g.rows.map(e=>`
      <tr data-act="open-entry" data-id="${e.id}" class="${set.has(e.id)?'sel':''} ${cur===e.id?'cur':''}" title="Open · Enter">
      <td class="cb"><button class="chk ${set.has(e.id)?'on':''}" data-act="toggle-sel" data-id="${e.id}" aria-label="Select ${e.no}"></button></td>
      <td class="mono">${e.no}</td><td class="mono t2">${fdate(e.date)}</td><td class="mono t2">${e.liq?fdate(e.liq):'<span class="t3">—</span>'}</td><td>${o2(e.origin)}</td>
      <td class="mono">${e.lines[0].hts}${e.lines.length>1?` <span class="t3">+${e.lines.length-1}</span>`:''}</td><td class="num t2">${money(e.value)}</td><td class="num">${money(dutyTotal(e))}</td><td class="num">${e.duties.ieepa?money(e.duties.ieepa):'<span class="t3">—</span>'}</td><td>${pill(e.status)}</td><td>${chip(deadline(e))}</td></tr>`).join('')).join('')}
    </tbody><tfoot><tr><td></td><td colspan="5">${rows.length} entries</td><td class="num">${money(tot.v)}</td><td class="num">${money(tot.d)}</td><td class="num">${money(tot.i)}</td><td colspan="2" class="t3" style="font-weight:400;font-size:12px">Rule ${P.CURRENT_RULE}</td></tr></tfoot></table></div>`;
  }
  return `<div class="phead"><h1>Ledger<div class="sub">${E().length} entries from ${esc(S().source.name)}</div></h1><div class="actions"><button class="btn sec" data-act="export">${ic('download')} Export <kbd class="hide-m">E</kbd></button><button class="btn primary" data-act="packet">Build refund packet</button></div></div>
  <div class="tabs" role="tablist">${VIEWS.map(v=>`<button role="tab" class="${view===v[0]?'on':''}" data-act="q" data-k="view" data-v="${v[0]==='all'?'':v[0]}">${v[1]}<span class="ct">${counts[v[0]]}</span></button>`).join('')}</div>
  ${fbar}${body}`;
};

/* ===== Entry inspector ===== */
P.inspEntry=function(e){
  const dl=deadline(e); const n=dl?days(dl):null;
  const tl=[[`Entered`,fdateFull(e.date),e.port,''],[e.liq?'Liquidated':'Liquidation (estimated)',e.liq?fdateFull(e.liq):fdateFull(P.addDays(e.date,314)),e.liq?'Liquidation date from ACE':'About 314 days after entry',e.liq?'':'off']];
  if(dl) tl.push(['Protest deadline',fdateFull(dl)+' · '+rel(n),'180 days after liquidation',P.dlCls(n)]);
  if(e.status==='filed') tl.push(['Filed in CAPE',e.claim,'Broker partner confirmed acceptance','']);
  if(e.status==='paid') tl.push(['Refund posted',e.claim,'Paid to ACH account on file','green']);
  const finding={
    eligible:`IEEPA duties of ${money(e.duties.ieepa)} on this entry appear refundable under the Court of International Trade order of Mar 4, 2026. ${e.liq?'The entry is liquidated and still inside the protest window.':'The entry is unliquidated, so it can be declared in CAPE.'}`,
    protest:`This entry liquidated on ${fdateFull(e.liq)} with IEEPA duties included. A protest (CBP Form 19) must be filed by ${fdateFull(dl)} to preserve the ${money(e.duties.ieepa)} refund.`,
    filed:`Declared in CAPE as ${e.claim}. Awaiting refund certification to Treasury.`,
    paid:`Refund of ${money(e.duties.ieepa)} posted under ${e.claim}.`,
    hold:`CBP accepted the claim, but the refund is on hold because no ACH refund enrollment is on file for importer ${e.iorNo}.`,
    notior:`${esc(e.ior)} is the importer of record. Only the importer of record or its broker can claim. Ask them to share the refund (see Suppliers).`,
    missed:`The protest window closed ${fdateFull(dl)}. Recovery may need a case at the Court of International Trade (CAPE Phase 3). Talk to a trade attorney.`,
    none:`No IEEPA duties on this entry. Section 122 and 301 payments are not refundable under the current order; Section 122 checks arrive in Phase 2.`}[e.status];
  const dt=dutyTotal(e);
  return `<div class="ih"><div class="tt"><span class="mono">${e.no}</span>${pill(e.status)}</div><button class="btn ghost icon" data-act="close-insp" aria-label="Close (Esc)">${ic('x')}</button></div>
  <div class="ib">
    <div class="sec"><h4>Timeline</h4><ul class="tl">${tl.map(t=>`<li class="${t[3]}"><div class="tx"><div>${t[0]} · <span class="mono">${esc(t[1])}</span></div><div>${esc(t[2])}</div></div></li>`).join('')}</ul></div>
    <div class="sec"><h4>Duty breakdown <span class="mono">${money(dt)}</span></h4>${DUTY.map(d=>`<div class="kv"><span class="k">${d[1]}</span><span class="mono">${money(e.duties[d[0]]||0)}</span></div>`).join('')}<div class="kv tot"><span>Entered value</span><span class="mono">${money(e.value)}</span></div></div>
    <div class="sec"><h4>Lines <span class="t3">${e.lines.length}</span></h4>${e.lines.map(l=>`<div class="kv" style="align-items:flex-start;padding:4px 0"><span><span class="mono">${l.hts}</span><br><span class="t2" style="font-size:12px">${esc(l.desc)}${l.sku?` · <a href="#/landed?sku=${esc(l.sku)}">${esc(l.sku)}</a>`:''}</span></span><span class="mono">${money(l.value)}</span></div>`).join('')}</div>
    <div class="sec"><h4>Refund</h4><div class="finding">${finding}<div class="meta">Finding, not legal advice · Rule r2025.04 (IEEPA) · Source: <a href="https://www.cbp.gov/trade" target="_blank" rel="noopener">CBP trade guidance ${P.ic('ext')}</a></div></div>
      <div class="kv" style="margin-top:8px"><span class="k">Importer of record</span><span>${esc(e.ior)}</span></div><div class="kv"><span class="k">Broker status</span><span>${esc(e.broker)}</span></div></div>
    <div class="sec"><h4>Activity</h4>${e.activity.slice().reverse().map(a=>`<div class="kv" style="align-items:flex-start"><span>${esc(a.what)}<br><span class="t3" style="font-size:12px">${esc(a.who)}</span></span><span class="mono t3" style="font-size:12px">${fdate(a.t.slice(0,10))}</span></div>`).join('')}</div>
  </div>
  <div class="if"><button class="btn primary" data-act="packet-one" data-id="${e.id}" ${isRefundable(e)?'':'disabled'}>Add to packet</button><button class="btn sec" data-act="ask-broker" data-id="${e.id}">Ask broker</button><span class="hide-m t3" style="margin-left:auto;font-size:12px;align-self:center"><kbd>J</kbd> <kbd>K</kbd> move</span></div>`;
};

/* ===== Refunds ===== */
V.refunds=function(r){
  const set=P.selSet(); const closed=new Set((r.q.get('closed')||'').split(',').filter(Boolean));
  const ents=E().filter(e=>e.status!=='none');
  const urgentE=ents.filter(e=>e.status==='protest'&&deadline(e)&&days(deadline(e))<=7&&days(deadline(e))>=0);
  const grp=GROUP_ORDER.map(k=>{let rows=ents.filter(e=>e.status===k);
    rows.sort((a,b)=>{const da=deadline(a),db=deadline(b); if(da&&db) return da.localeCompare(db); if(da) return -1; if(db) return 1; return b.date.localeCompare(a.date)});
    return {k,rows,amt:rows.reduce((a,e)=>a+refundAmt(e),0)}}).filter(g=>g.rows.length);
  const av=e=>e.assignee?`<span class="avatar sm" title="${e.assignee==='PS'?'Priya Shah':'Daniel Ortiz'}">${e.assignee}</span>`:'';
  return `<div class="phead"><h1>Refunds<div class="sub">${money0(ents.filter(isRefundable).reduce((a,e)=>a+refundAmt(e),0))} refundable now across ${ents.filter(isRefundable).length} entries</div></h1><div class="actions"><button class="btn sec" data-act="export">${ic('download')} Export</button><button class="btn primary" data-act="packet">Build refund packet</button></div></div>
  ${urgentE.length?`<div class="banner red" role="alert">${ic('alert')}<span>${urgentE.length} protest deadline${urgentE.length>1?'s':''} in 7 days · ${money(urgentE.reduce((a,e)=>a+refundAmt(e),0))} at stake</span><button class="btn sec" data-act="review-urgent" data-ids="${urgentE.map(e=>e.id).join(',')}">Review ${urgentE.length} entr${urgentE.length>1?'ies':'y'}</button></div>`:''}
  <div class="rows">${grp.map(g=>`<div class="rg ${closed.has(g.k)?'closed':''}"><button class="rg-h" data-act="rg" data-k="${g.k}" aria-expanded="${!closed.has(g.k)}">${ic('chevd','chev')}<span>${ST[g.k].g}</span><span class="ct">${g.rows.length}</span><span class="sum">${money(g.amt)}</span></button><div class="rg-b">
    ${g.rows.map(e=>`<div class="rrow ${set.has(e.id)?'sel':''}" data-act="open-entry" data-id="${e.id}" role="button" tabindex="0"><button class="cbx" data-act="toggle-sel" data-id="${e.id}" aria-label="Select ${e.no}" style="min-height:32px;display:grid;place-items:center"><span class="chk ${set.has(e.id)?'on':''}"></span></button>
      <span class="id">${e.claim||e.no}</span><span class="amt">${money(refundAmt(e))}</span><span class="m">${chip(deadline(e))}${av(e)}<span class="t2">${esc(e.broker)}</span></span></div>`).join('')}
  </div></div>`).join('')}</div>
  <p class="note">Amounts are IEEPA duties per entry (sample data). Eligibility is a finding with its rule and source, not legal advice. Filing happens through a licensed customs broker or the importer in ACE.</p>`;
};

/* ===== Landed cost ===== */
function dutyBar(c,max){const w=v=>(v/max*120).toFixed(1)+'px';
  return `<span class="duty" data-tip="MFN ${money(c.mfn)} · 301 ${money(c.s301)} · 232 ${money(c.s232)} · fees ${money(c.fees)}"><i style="width:${w(c.mfn)};background:#EDEDED"></i><i style="width:${w(c.s301)};background:#A1A1A1"></i><i style="width:${w(c.s232)};background:#7A7A7A"></i><i style="width:${w(c.fees)};background:#525252"></i></span>`}
V.landed=function(r){
  const q=r.q, grp=q.get('og')||'', below=q.get('below')==='1', rule=q.get('rule')||'';
  const tgt=(S().settings.margin||40)/100;
  let list=skus().map(s=>({s,c:skuCalc(s,'now'),b:skuCalc(s,'jul23')}));
  const max=Math.max(...list.map(x=>x.c.duty+x.c.fees));
  if(grp==='g3') list=list.filter(x=>x.s.origin==='VN'||x.s.origin==='CN'); if(grp==='g2') list=list.filter(x=>x.s.origin==='IN');
  if(below) list=list.filter(x=>x.c.margin<tgt);
  if(rule){const rr=S().data.radar.find(x=>x.id===rule); if(rr){const im=impact(rr);const ids=new Set(im.rows.map(x=>x.s.sku)); list=list.filter(x=>ids.has(x.s.sku));}}
  const sq=(q.get('q')||'').toLowerCase(); if(sq) list=list.filter(x=>(x.s.sku+' '+x.s.product+' '+x.s.hts).toLowerCase().includes(sq));
  const cur=q.get('sku');
  const delta=x=>{const d=(x.c.landed-x.b.landed)/x.b.landed; return `<span class="delta ${d>.0005?'up':d<-.0005?'down':'flat'}">${Math.abs(d)<.0005?'0.0%':spct(d)}</span>`};
  const mg=x=>`<span style="${x.c.margin<tgt?'color:var(--amber)':''}">${pct(x.c.margin)}</span>`;
  const rr=rule?S().data.radar.find(x=>x.id===rule):null;
  let body;
  if(!list.length) body=`<div class="empty">${ic('landed')}<h2>No SKUs match</h2><p>Clear the filters to see all mapped SKUs.</p><button class="btn primary" data-act="nav" data-to="landed">Clear filters</button></div>`;
  else if(isMobile()) body=`<div class="rows">${list.map(x=>`<div class="srow ${cur===x.s.sku?'sel':''}" data-act="open-sku" data-id="${x.s.sku}" role="button" tabindex="0"><div class="bd">
    <div class="l1"><span><b style="font-weight:500">${esc(x.s.product)}</b></span><span class="amt">${money(x.c.landed)}</span></div>
    <div class="l2"><span class="mono">${x.s.sku} · ${x.s.origin}</span><span>Margin ${mg(x)} · ${delta(x)}</span></div>
    <div class="l2">${dutyBar(x.c,max)}<span class="mono t3">duty ${money(x.c.duty)}/u</span></div></div></div>`).join('')}</div>`;
  else body=`<div class="tbl-wrap tall"><table class="t"><thead><tr><th>SKU</th><th>Product</th><th>Origin</th><th>HTS</th><th class="num">Unit cost</th><th class="num">Duty/unit</th><th>Duty stack</th><th class="num">Freight/unit</th><th class="num">Landed</th><th class="num">Price</th><th class="num">Margin</th><th class="num">Since Jul 24</th></tr></thead><tbody>
    ${list.map(x=>`<tr data-act="open-sku" data-id="${x.s.sku}" class="${cur===x.s.sku?'cur':''}"><td class="mono">${x.s.sku}</td><td>${esc(x.s.product)}</td><td>${o2(x.s.origin)}</td><td class="mono">${x.s.hts}</td><td class="num">${money(x.c.cost)}</td><td class="num">${money(x.c.duty)}</td><td>${dutyBar(x.c,max)}</td><td class="num t2">${money(x.c.freight)}</td><td class="num">${money(x.c.landed)}</td><td class="num t2">${money(x.s.price)}</td><td class="num">${mg(x)}</td><td class="num">${delta(x)}</td></tr>`).join('')}
    </tbody></table></div>`;
  return `<div class="phead"><h1>Landed Cost<div class="sub">${skus().length} mapped SKUs · rule ${P.CURRENT_RULE} · duty stack: MFN, 301, 232, fees</div></h1><div class="actions"><button class="btn sec" data-act="export">${ic('download')} Export</button></div></div>
  ${rr?`<div class="banner blue">${ic('radar')}<span>Showing ${list.length} SKUs affected by ${esc(rr.name)}</span><button class="btn ghost" data-act="q" data-k="rule" data-v="">Show all</button></div>`:''}
  <div class="fbar">
    <label class="search"><span class="sr">Search SKUs</span>${ic('search')}<input id="search" class="input" type="search" placeholder="Search SKU, product, HTS…" value="${esc(q.get('q')||'')}" data-act="search" autocomplete="off"><kbd class="hide-m">/</kbd></label>
    <div class="seg">${[['','All origins'],['g3','Group 3 · VN, CN'],['g2','Group 2 · IN']].map(o=>`<button class="${grp===o[0]?'on':''}" data-act="q" data-k="og" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>
    <button class="btn ${below?'sec':'ghost'}" data-act="q" data-k="below" data-v="${below?'':'1'}" aria-pressed="${below}">Margin below ${Math.round(tgt*100)}%</button>
  </div>${body}
  <p class="note">Sample SKUs and simplified rules: MFN by HTS, Section 301 by origin group, Section 232 on full value for metal derivatives, MPF and HMF as ad valorem fees. Not legal advice.</p>`;
};

/* ===== SKU inspector ===== */
P.inspSku=function(s){
  const st=S(); st.whatif=st.whatif||{}; const w=st.whatif[s.sku]||{};
  const now=skuCalc(s,'now'), wi=P.calcSku(s,{origin:w.origin,cost:w.cost,freight:w.freight});
  return `<div class="ih"><div class="tt"><span class="mono">${s.sku}</span><span class="t2" style="font-size:13px">${esc(s.product)}</span></div><button class="btn ghost icon" data-act="close-insp" aria-label="Close (Esc)">${ic('x')}</button></div>
  <div class="ib">
    <div class="sec"><h4>Unit cost to landed cost <span class="mono" id="wf-total">${money(wi.landed)}</span></h4><div class="wf" id="wf">${waterfall(wi)}</div></div>
    <div class="sec"><h4>What if</h4><div class="whatif">
      <label class="field">Origin<select class="select" id="wi-origin">${['VN','IN','CN','MX'].map(o=>`<option value="${o}" ${(w.origin||s.origin)===o?'selected':''}>${o} · ${P.ORIG(o)} · ${P.ORIGINS[o].group}</option>`).join('')}</select></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="field">Supplier price<input class="input mono" id="wi-cost" inputmode="decimal" value="${(w.cost!=null?w.cost:s.cost).toFixed(2)}"></label><label class="field">Freight per unit<input class="input mono" id="wi-freight" inputmode="decimal" value="${(w.freight!=null?w.freight:s.freight).toFixed(2)}"></label></div>
      <div class="res" id="wi-res">${wiRes(now,wi,s)}</div>
      <button class="btn ghost sm" data-act="wi-reset" data-id="${s.sku}" style="justify-self:start">${ic('rotate')} Reset to current</button>
    </div></div>
    <div class="sec"><h4>Rule versions applied</h4>${P.RULES.filter(x=>!x.to).map(x=>`<div class="kv" style="align-items:flex-start;padding:4px 0"><span><span class="mono">${x.v}</span> · ${esc(x.name)}<br><a href="${x.src}" target="_blank" rel="noopener" style="font-size:12px">Source ${ic('ext')}</a></span><span class="mono t3" style="font-size:12px">${fdate(x.from)}</span></div>`).join('')}
      <div class="kv"><span class="k">HTS</span><span class="mono">${s.hts} · MFN ${pct(s.mfn)}</span></div><div class="kv"><span class="k">Price</span><span class="mono">${money(s.price)}</span></div><div class="kv"><span class="k">Units per month</span><span class="mono">${s.units}</span></div></div>
  </div>
  <div class="if"><a class="btn sec" href="#/ledger?q=${s.sku}">Entries with this SKU</a></div>`;
};
function waterfall(c){
  const steps=[['Unit cost',c.cost],['MFN',c.mfn],['Section 301',c.s301],['Section 232',c.s232],['Fees',c.fees],['Freight',c.freight]];
  let acc=0; const tot=c.landed;
  return steps.map(st=>{const l=acc/tot*100,w=Math.max(st[1]/tot*100,st[1]>0?.6:0);acc+=st[1];return `<div class="wr"><span class="l">${st[0]}</span><span class="bar"><i style="left:${l}%;width:${w}%"></i></span><span class="num">${st[0]==='Unit cost'?'':'+'}${money(st[1])}</span></div>`}).join('')+`<div class="wr tot"><span class="l" style="color:var(--t1)">Landed</span><span class="bar"><i style="left:0;width:100%"></i></span><span class="num">${money(tot)}</span></div>`;
}
function wiRes(now,wi,s){const dl=wi.landed-now.landed, dm=wi.margin-now.margin;
  return `<div><div class="t3" style="font-size:12px">Landed cost</div><div class="v">${money(wi.landed)}</div><div class="s ${Math.abs(dl)<.005?'t3':dl>0?'delta up':'delta down'}">${Math.abs(dl)<.005?'Same as now':smoney(dl)+' vs now'}</div></div>
  <div><div class="t3" style="font-size:12px">Margin</div><div class="v">${pct(wi.margin)}</div><div class="s ${Math.abs(dm)<.0005?'t3':dm<0?'delta up':'delta down'}">${Math.abs(dm)<.0005?'Same as now':(dm>0?'+':P.MINUS)+Math.abs(dm*100).toFixed(1)+' pts'}</div></div>`}
P.wiUpdate=function(s){
  const o=P.$('#wi-origin').value, c=parseFloat(P.$('#wi-cost').value), f=parseFloat(P.$('#wi-freight').value);
  const bad=[['#wi-cost',c],['#wi-freight',f]].map(([id,v])=>{const el=P.$(id);const b=!(v>=0);el.classList.toggle('bad',b);return b}).some(Boolean);
  if(bad) return;
  const st=S(); st.whatif=st.whatif||{}; st.whatif[s.sku]={origin:o,cost:c,freight:f}; P.save();
  const now=skuCalc(s,'now'), wi=P.calcSku(s,{origin:o,cost:c,freight:f});
  P.$('#wf').innerHTML=waterfall(wi); P.$('#wf-total').textContent=money(wi.landed); P.$('#wi-res').innerHTML=wiRes(now,wi,s);
};

/* ===== Radar ===== */
V.radar=function(r){
  if(r.arg) return V.change(r);
  const f=r.q.get('f')||'me';
  let list=S().data.radar.slice().sort((a,b)=>b.date.localeCompare(a.date));
  if(f==='me') list=list.filter(x=>impact(x).n>0);
  if(f==='prop') list=list.filter(x=>x.state==='Proposed');
  if(f==='eff') list=list.filter(x=>x.state==='In effect');
  return `<div class="phead"><h1>Tariff Radar<div class="sub">Rule changes mapped to your ${skus().length} HTS codes and 3 origins</div></h1></div>
  <div class="tabs">${[['me','Affects me'],['all','All'],['prop','Proposed'],['eff','In effect']].map(x=>`<button class="${f===x[0]?'on':''}" data-act="q" data-k="f" data-v="${x[0]==='me'?'':x[0]}">${x[1]}</button>`).join('')}</div>
  <div style="max-width:860px">${list.map(x=>{const im=impact(x);const n=days(x.date);return `<a class="rcard" href="#/radar/${x.id}"><div class="top"><span class="pill plain">${esc(x.auth)}</span>${x.state==='Proposed'?'<span class="pill blue">Proposed</span>':'<span class="pill">In effect</span>'}<span class="dl ${n>=0?P.dlCls(n):''}">${fdate(x.date)} <span class="rel">· ${rel(n)}</span></span></div>
    <h3>${esc(x.name)} · <span class="t2" style="font-weight:400">${esc(x.headline)}</span></h3><p>${esc(x.summary)}</p><div class="imp"><span>Impact on you: ${esc(im.text)}</span><span class="t3">Open ${ic('arrowr')}</span></div></a>`}).join('')||`<div class="empty">${ic('radar')}<h2>Nothing here</h2><p>No rule changes match this filter.</p></div>`}</div>
  <p class="note">Sample feed for demonstration. Summaries are informational, not legal advice.</p>`;
};
V.change=function(r){
  const x=S().data.radar.find(y=>y.id===r.arg); if(!x) return `<div class="empty"><h2>Change not found</h2><a class="btn primary" href="#/radar">Back to Radar</a></div>`;
  const im=impact(x); const n=days(x.date);
  const rows=im.rows.slice().sort((a,b)=>b.m-a.m);
  return `<div style="margin-bottom:12px"><a class="btn ghost sm" href="#/radar">${ic('chevl')} Tariff Radar</a></div>
  <div class="phead"><h1>${esc(x.name)}<div class="sub">${esc(x.auth)} · ${x.state} · effective ${fdateFull(x.date)} (${rel(n)})</div></h1><div class="actions"><button class="btn sec" data-act="notify" data-id="${x.id}">${ic('bell')} Notify team</button>${rows.length?`<a class="btn primary" href="#/landed?rule=${x.id}">Open in Landed Cost</a>`:''}</div></div>
  <div class="split" style="margin-bottom:16px">
    <div class="card"><div class="ch"><h3>Summary</h3></div><div class="cb"><p style="margin:0 0 12px;color:var(--t2);line-height:20px">${esc(x.summary)}</p><div class="kv"><span class="k">Impact on you</span><span class="mono">${esc(im.text)}</span></div><div class="kv"><span class="k">Rule version</span><span class="mono">${x.kind==='232'?'r2026.08':x.kind==='301'?'r2026.07':'—'}</span></div></div></div>
    <div class="card"><div class="ch"><h3>Origin groups and exclusions</h3></div><div class="cb">${x.groups.map(g=>`<div class="kv"><span>${esc(g)}</span></div>`).join('')}${x.excl.length?`<div class="overline" style="margin-top:10px">Exclusions</div>${x.excl.map(g=>`<div class="kv"><span class="t2">${esc(g)}</span></div>`).join('')}`:''}</div></div>
  </div>
  ${rows.length?(isMobile()?`<div class="rows">${rows.map(y=>`<div class="srow" data-act="open-sku" data-id="${y.s.sku}" role="button" tabindex="0"><div class="bd"><div class="l1"><span>${esc(y.s.product)}</span><span class="amt">${money(y.b.landed)}</span></div><div class="l2"><span class="mono">${y.s.sku} · ${y.s.origin}</span><span class="mono">${money(y.a.landed)} → ${money(y.b.landed)}</span></div><div class="l2"><span>Margin ${pct(y.a.margin)} → ${pct(y.b.margin)}</span><span class="mono delta up">${smoney(y.m,false)}/mo</span></div></div></div>`).join('')}</div>`
  :`<div class="tbl-wrap"><table class="t"><thead><tr><th>SKU</th><th>Product</th><th>Origin</th><th class="num">Landed before</th><th class="num">Landed after</th><th class="num">Change</th><th class="num">Margin before</th><th class="num">Margin after</th><th class="num">Per month</th></tr></thead><tbody>
    ${rows.map(y=>`<tr data-act="open-sku" data-id="${y.s.sku}"><td class="mono">${y.s.sku}</td><td>${esc(y.s.product)}</td><td>${o2(y.s.origin)}</td><td class="num t2">${money(y.a.landed)}</td><td class="num">${money(y.b.landed)}</td><td class="num"><span class="delta ${y.d>0?'up':'down'}">${smoney(y.d)}</span></td><td class="num t2">${pct(y.a.margin)}</td><td class="num">${pct(y.b.margin)}</td><td class="num">${smoney(y.m,false)}</td></tr>`).join('')}
    </tbody><tfoot><tr><td colspan="8">${rows.length} SKUs affected</td><td class="num">${smoney(im.monthly,false)}</td></tr></tfoot></table></div>`):`<div class="card"><div class="cb t2">No mapped SKUs change landed cost under this rule.</div></div>`}
  <p class="note">Sample data. Before and after use the rule versions bracketing the effective date. Not legal advice.</p>`;
};

/* ===== Drawback ===== */
V.drawback=function(){
  const ex=E().filter(e=>e.duties.mfn+e.duties.s301+e.duties.s232>800).slice(0,7);
  const rows=ex.map((e,i)=>{const share=[.12,.08,.15,.1,.06,.2,.09][i];const elig=(e.duties.mfn+e.duties.s301+e.duties.s232+e.duties.ieepa)*share*.99;return {e,share,elig,ship:'EXP-26-'+String(3301+i*17),dest:i%2?'Maple & Main Home, Toronto':'Nordhaus Living, Vancouver',date:P.addDays(e.date,40+i*6)}});
  const tot=rows.reduce((a,x)=>a+x.elig,0);
  return `<div class="phead"><h1>Drawback<div class="sub">Phase 2 preview · estimates on goods you exported</div></h1><div class="actions"><button class="btn primary" data-act="drawback-packet">Prepare broker packet</button></div></div>
  <div class="banner blue">${ic('info')}<span>Drawback Finder is planned for Phase 2. This preview uses sample export shipments matched to your entries; estimates assume 99% recovery of duties on the exported share.</span></div>
  ${isMobile()?`<div class="rows">${rows.map(x=>`<div class="srow" data-act="open-entry" data-id="${x.e.id}" role="button" tabindex="0"><div class="bd"><div class="l1"><span class="mono">${x.ship}</span><span class="amt">${money(x.elig)}</span></div><div class="l2"><span>${esc(x.dest)}</span><span class="mono t3">${fdate(x.date)}</span></div><div class="l2"><span class="mono">${x.e.no}</span><span class="mono t3">${pct(x.share,0)} exported</span></div></div></div>`).join('')}<div class="stot"><span>${rows.length} shipments</span><span>Est. ${money(tot)}</span></div></div>`
  :`<div class="tbl-wrap"><table class="t"><thead><tr><th>Export shipment</th><th>Date</th><th>Destination</th><th>Matched entry</th><th class="num">Exported share</th><th class="num">Duty on share</th><th class="num">Est. drawback</th></tr></thead><tbody>
  ${rows.map(x=>`<tr data-act="open-entry" data-id="${x.e.id}"><td class="mono">${x.ship}</td><td class="mono t2">${fdate(x.date)}</td><td>${esc(x.dest)}</td><td class="mono">${x.e.no}</td><td class="num">${pct(x.share,0)}</td><td class="num t2">${money(x.elig/.99)}</td><td class="num">${money(x.elig)}</td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="6">${rows.length} shipments · estimate only</td><td class="num">${money(tot)}</td></tr></tfoot></table></div>`}
  <p class="note">Sample data. Drawback claims are filed by a licensed customs broker. Not legal advice.</p>`;
};

/* ===== Suppliers ===== */
const RS={'not sent':'','sent':'blue','responded':'amber','agreed':'green','n/a':''};
V.suppliers=function(r){
  const list=S().data.suppliers; const top=list.filter(s=>!s.ior&&s.status==='not sent').sort((a,b)=>b.passed-a.passed)[0];
  const cur=r.q.get('sup');
  return `<div class="phead"><h1>Suppliers<div class="sub">Who imported your goods, and who owes you a share of refunds</div></h1></div>
  ${top?`<div class="banner amber">${ic('alert')}<span>You paid duties through ${esc(top.name)} (estimated ${money0(top.passed)}). They are the importer of record.</span><button class="btn sec" data-act="open-sup" data-id="${top.id}">Draft request</button></div>`:''}
  ${isMobile()?`<div class="rows">${list.map(s=>`<div class="srow ${cur===s.id?'sel':''}" data-act="open-sup" data-id="${s.id}" role="button" tabindex="0"><div class="bd"><div class="l1"><span>${esc(s.name)}</span><span class="amt">${s.passed?money0(s.passed):'—'}</span></div><div class="l2"><span class="mono">${s.country} · ${s.type}</span>${s.ior?'<span class="t3">You are IOR</span>':`<span class="pill ${RS[s.status]}">${cap(s.status)}</span>`}</div></div></div>`).join('')}</div>`
  :`<div class="tbl-wrap"><table class="t"><thead><tr><th>Supplier or distributor</th><th>Country</th><th>Type</th><th>Importer of record</th><th class="num">Est. duties passed through</th><th>Request status</th><th></th></tr></thead><tbody>
  ${list.map(s=>`<tr data-act="open-sup" data-id="${s.id}" class="${cur===s.id?'cur':''}"><td>${esc(s.name)}</td><td class="mono">${s.country}</td><td class="t2">${s.type}</td><td>${s.ior?'<span class="t2">You (Juniper &amp; Oak)</span>':'<span>They are</span>'}</td><td class="num">${s.passed?money(s.passed):'<span class="t3">—</span>'}</td><td>${s.ior?'<span class="t3">Not needed</span>':`<span class="pill ${RS[s.status]}">${cap(s.status)}</span>`}</td><td class="t3" style="text-align:right">${s.ior?'':'Open request'}</td></tr>`).join('')}
  </tbody></table></div>`}
  <p class="note">Sample data. Requests are drafted here; sending is simulated in this demo and no email leaves the app.</p>`;
};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
P.letterFor=function(s){
  const st=S(); if(st.letters[s.id]!=null) return st.letters[s.id];
  return `Hello ${s.name} team,

Juniper & Oak Home bought goods from you between February 2025 and February 2026 on which you paid IEEPA duties as the importer of record. We estimate about ${money0(s.passed)} of those duties were passed through to us in our purchase prices.

Following the Court of International Trade order of March 4, 2026, importers of record can claim IEEPA refunds through CBP's CAPE system. We'd like to ask whether you plan to file, and to agree on sharing the refund for the portion we paid.

Attached is a list of our purchase orders and invoice amounts for the period. Could you reply by November 30, 2026 with your plans?

Thank you,
Priya Shah
COO, Juniper & Oak Home`;
};
P.inspSupplier=function(s){
  if(s.ior) return `<div class="ih"><div class="tt"><span>${esc(s.name)}</span></div><button class="btn ghost icon" data-act="close-insp" aria-label="Close (Esc)">${ic('x')}</button></div><div class="ib"><div class="sec"><div class="kv"><span class="k">Country</span><span class="mono">${s.country}</span></div><div class="kv"><span class="k">Type</span><span>${s.type}</span></div><div class="kv"><span class="k">Contact</span><span>${esc(s.contact)}</span></div><div class="finding" style="margin-top:8px">Juniper &amp; Oak Home is the importer of record for goods from this supplier, so refunds come to you directly. No request needed.</div></div></div>`;
  const log=(s.log||[]);
  return `<div class="ih"><div class="tt"><span>${esc(s.name)}</span><span class="pill ${RS[s.status]}">${cap(s.status)}</span></div><button class="btn ghost icon" data-act="close-insp" aria-label="Close (Esc)">${ic('x')}</button></div>
  <div class="ib">
    <div class="sec"><h4>Refund-sharing request</h4><div class="kv"><span class="k">Estimated duties passed through</span><span class="mono">${money(s.passed)}</span></div>
      <label class="field" style="margin-top:8px">To<input class="input" id="sup-to" value="${esc(s.contact)}"></label>
      <label class="field" style="margin-top:10px">Letter<textarea id="sup-letter" rows="14">${esc(P.letterFor(s))}</textarea></label>
      <div class="legal" style="margin-top:8px">Drafted by Portside from your ledger. Edit freely. This is a business request, not legal advice.</div></div>
    <div class="sec"><h4>Status</h4><div class="seg" style="flex-wrap:wrap;height:auto">${['not sent','sent','responded','agreed'].map(x=>`<button class="${s.status===x?'on':''}" data-act="sup-status" data-id="${s.id}" data-v="${x}" style="min-height:var(--tap)">${cap(x)}</button>`).join('')}</div></div>
    <div class="sec"><h4>Send log</h4>${log.length?log.slice().reverse().map(l=>`<div class="kv" style="align-items:flex-start"><span>${esc(l.what)}</span><span class="mono t3" style="font-size:12px">${fdate(l.t)}</span></div>`).join(''):'<div class="t3" style="font-size:13px">Nothing sent yet.</div>'}</div>
  </div>
  <div class="if"><button class="btn primary" data-act="sup-send" data-id="${s.id}">${ic('send')} Send request</button><button class="btn sec" data-act="sup-copy">Copy letter</button></div>`;
};

/* ===== Settings ===== */
V.settings=function(){
  const st=S(), se=st.settings;
  const tg=(k,l,d)=>`<div class="row"><div class="tx"><div>${l}</div><div>${d}</div></div><button class="toggle ${se[k]?'on':''}" data-act="tg" data-k="${k}" role="switch" aria-checked="${!!se[k]}" aria-label="${l}"></button></div>`;
  return `<div class="phead"><h1>Settings</h1></div><div class="set">
  <div class="card"><div class="ch"><h3>Workspace</h3></div><div class="row"><div class="tx"><div>Juniper &amp; Oak Home LLC</div><div>Importer of record 87-4410293-00 · sample workspace</div></div><button class="btn sec sm" data-act="ior-confirm">${st.checklist.ior?ic('check')+' Confirmed':'Confirm importer of record'}</button></div>
    ${tg('ach','ACH refund enrollment confirmed','CBP holds refunds when no bank details are on file. Confirm in ACE, then switch this on.')}
    <div class="row"><div class="tx"><div>Target margin</div><div>Used by the Landed Cost filter</div></div><input class="input mono" style="width:90px" id="set-margin" inputmode="numeric" value="${se.margin}"> <span class="t3">%</span></div></div>
  <div class="card"><div class="ch"><h3>Members and roles</h3></div>${[['PS','Priya Shah','priya@juniperoak.example','Owner'],['DO','Daniel Ortiz','daniel@juniperoak.example','Viewer'],['MB','Meridian Customs (broker)','filings@meridiancustoms.example','Broker · Phase 2']].map(m=>`<div class="row"><span class="avatar">${m[0]}</span><div class="tx"><div>${m[1]}</div><div>${m[2]}</div></div><span class="t2">${m[3]}</span></div>`).join('')}</div>
  <div class="card"><div class="ch"><h3>Data sources</h3></div><div class="row"><div class="tx"><div>${esc(st.source.name)}</div><div>${st.source.kind==='csv'?'Uploaded CSV':'Sample data'} · ${new Date(st.source.at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${P.E().length} entries</div></div><a class="btn sec sm" href="#/onboarding">Import again</a></div>
    <div class="row"><div class="tx"><div>Shopify and Amazon SKU sync</div><div>Phase 2</div></div><button class="btn sec sm" disabled>Connect</button></div></div>
  <div class="card"><div class="ch"><h3>Broker partners</h3></div><div class="row"><div class="tx"><div>Meridian Customs Brokerage (fictional)</div><div>Licensed customs broker · files CAPE declarations and protests for you. Disclosure: Portside receives no referral fee from this partner in this sample.</div></div></div></div>
  <div class="card"><div class="ch"><h3>Notifications</h3></div>${tg('email','Email','Deadline alerts to priya@juniperoak.example')}${tg('slack','Slack','#ops-tariffs (simulated)')}${tg('a60','Alert at 60 days','')}${tg('a30','Alert at 30 days','')}${tg('a7','Alert at 7 days','')}</div>
  <div class="card"><div class="ch"><h3>Density and theme</h3></div><div class="row"><div class="tx"><div>Table density</div><div>Compact 32px, default 36px, comfortable 40px rows</div></div><div class="seg">${['compact','default','comfortable'].map(d=>`<button class="${se.density===d?'on':''}" data-act="density" data-v="${d}">${cap(d)}</button>`).join('')}</div></div>
    <div class="row"><div class="tx"><div>Theme</div><div>Light theme comes after the dark set is finished</div></div><div class="seg"><button class="on">Dark</button><button disabled style="color:var(--td);cursor:not-allowed">Light</button></div></div></div>
  <div class="card"><div class="ch"><h3>Billing</h3></div><div class="row"><div class="tx"><div>Growth · $499/mo</div><div>Sample plan. No billing in this demo.</div></div></div></div>
  <div class="card"><div class="ch"><h3>Audit log</h3><button class="btn ghost sm" data-act="audit-export">${ic('download')} Export</button></div>${st.audit.slice(0,12).map(a=>`<div class="row"><div class="tx"><div>${esc(a.what)}</div><div>${esc(a.who)}</div></div><span class="mono t3" style="font-size:12px">${new Date(a.t).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span></div>`).join('')}</div>
  <div class="card"><div class="ch"><h3>Reset</h3></div><div class="row"><div class="tx"><div>Reset sample data</div><div>Restores every entry, status and letter to the original sample</div></div><button class="btn danger sm" data-act="reset">Reset</button></div>
    <div class="row"><div class="tx"><div>Start over</div><div>Clears local data and returns to onboarding</div></div><button class="btn danger sm" data-act="startover">Start over</button></div></div>
  <p class="note">Portside is software, not a customs broker. Data stays in this browser (localStorage).</p></div>`;
};
})();
