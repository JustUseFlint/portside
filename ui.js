/* Portside — interactions */
(function(){
'use strict';
const P=window.PS; const {$,$$,esc,ic,money,money0,fdate,E,byId,refundAmt,deadline,isRefundable,dutyTotal,toast,audit,save,days}=P;
const S=()=>P.state();
const route=()=>P.route();

/* ---------- dialogs ---------- */
function dialog(html, cls){
  closeDialog();
  const bg=document.createElement('div'); bg.className='dlg-bg on'; bg.id='dlg';
  bg.innerHTML=`<div class="dlg ${cls||''}" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click',e=>{if(e.target===bg) closeDialog()});
  document.body.appendChild(bg);
  const f=bg.querySelector('[autofocus]')||bg.querySelector('button.primary'); f&&f.focus();
  return bg;
}
function closeDialog(){const d=$('#dlg'); if(d){d.remove(); return true} return false}
P.dialog=dialog; P.closeDialog=closeDialog;

/* packet */
function openPacket(ids){
  if(!ids||!ids.length){ ids=E().filter(isRefundable).map(e=>e.id); }
  const ents=ids.map(byId).filter(Boolean);
  const tot=ents.reduce((a,e)=>a+refundAmt(e),0);
  const iorBad=ents.filter(e=>e.status==='notior'), windowBad=ents.filter(e=>!isRefundable(e)&&e.status!=='hold'), ach=S().settings.ach;
  const ok=ents.filter(isRefundable);
  const ck=[[iorBad.length?'bad':'ok','Importer of record matches',iorBad.length?`${iorBad.length} entr${iorBad.length>1?'ies have':'y has'} a different importer of record`:'Juniper & Oak Home LLC · 87-4410293-00'],
    [ach?'ok':'warn',ach?'ACH refund enrollment on file':'ACH refund enrollment not confirmed',ach?'Bank details confirmed in Settings':'CBP will hold refunds until bank details are on file. Confirm in Settings.'],
    [windowBad.length?'bad':'ok','Entries within eligibility window',windowBad.length?`${windowBad.length} already filed, paid or past the window; they will be skipped`:'All entries can be declared or protested']];
  const icn={ok:'check',warn:'alert',bad:'xcircle'};
  const tbl=ents.map(e=>`<tr><td class="mono">${e.no}</td><td>${P.pill(e.status)}</td><td class="num">${money(refundAmt(e))}</td></tr>`).join('');
  const bg=dialog(`<div class="dh"><h2>Refund packet</h2><button class="btn ghost icon" data-close aria-label="Close (Esc)">${ic('x')}</button></div>
  <div class="db"><div class="pk"><div><div class="tbl-wrap" style="max-height:340px"><table class="t"><thead><tr><th>Entry</th><th>Status</th><th class="num">IEEPA</th></tr></thead><tbody>${tbl}</tbody><tfoot><tr><td colspan="2">${ents.length} selected · ${ok.length} ready</td><td class="num">${money(tot)}</td></tr></tfoot></table></div></div>
  <div><div class="overline" style="margin-bottom:6px">Checks</div><ul class="checks">${ck.map(c=>`<li><span class="${c[0]}">${ic(icn[c[0]])}</span><div>${c[1]}<small>${esc(c[2])}</small></div></li>`).join('')}</ul></div></div></div>
  <div class="df"><div class="legal">Portside prepares this packet. A licensed customs broker or the importer files it in ACE or CAPE. The CSV lists entries for a CAPE declaration; confirm the format with your broker. Findings are not legal advice.</div>
  <div class="acts"><button class="btn sec" data-dl ${ok.length?'':'disabled'}>${ic('download')} Download CAPE-ready CSV</button><button class="btn primary" data-send ${ok.length?'':'disabled'}>Send to broker partner</button></div></div>`);
  bg.querySelector('[data-close]').onclick=closeDialog;
  bg.querySelector('[data-dl]').onclick=()=>{capeCSV(ok);toast(`Downloaded CAPE-ready CSV · ${ok.length} entries`)};
  bg.querySelector('[data-send]').onclick=()=>{
    const prev=ok.map(e=>({e,status:e.status,broker:e.broker,n:e.activity.length}));
    ok.forEach(e=>{e.status='filed';e.broker='Sent to Meridian Customs';e.activity.push({t:P.TODAY,who:'Priya Shah',what:'Sent to broker partner in refund packet'})});
    audit(`Sent refund packet: ${ok.length} entries, ${money(ok.reduce((a,e)=>a+refundAmt(e),0))}`); save(); closeDialog(); P.writeSel(new Set());
    toast(`Sent ${ok.length} entries (${money0(ok.reduce((a,e)=>a+refundAmt(e),0))}) to Meridian Customs · simulated`,()=>{prev.forEach(p=>{p.e.status=p.status;p.e.broker=p.broker;p.e.activity.length=p.n});audit('Undid refund packet');save();P.render();});
  };
}
P.openPacket=openPacket;
function capeCSV(ents){
  const rows=[['Entry Number','Importer of Record Number','Entry Date','Liquidation Date','Country of Origin','HTS Numbers','Entered Value','IEEPA Duty Paid','Request Type']];
  ents.forEach(e=>rows.push([e.no.replace(/-/g,''),e.iorNo.replace(/-/g,''),e.date,e.liq||'',e.origin,e.lines.map(l=>l.hts).join(' '),e.value.toFixed(2),e.duties.ieepa.toFixed(2),e.status==='protest'?'Protest':'CAPE declaration']));
  P.download(`portside-cape-${P.TODAY}.csv`, `# Portside CAPE-ready packet · SAMPLE DATA · generated ${new Date().toISOString()} · rule r2025.04\r\n# Filed by a licensed customs broker or the importer. Not legal advice.\r\n`+P.toCSV(rows));
}

/* export */
function exportRows(){
  const r=route(); const hdr=[`# Portside export · ${r.name} · SAMPLE DATA`,`# Generated ${new Date().toISOString()}`,`# Rule version ${P.CURRENT_RULE}; findings are not legal advice`];
  if(r.name==='landed'){
    const rows=[['SKU','Product','Origin','HTS','Unit cost','MFN','Section 301','Section 232','Fees','Freight','Landed','Price','Margin %','Landed Jul 23','Rule version']];
    P.skus().forEach(s=>{const c=P.skuCalc(s,'now'),b=P.skuCalc(s,'jul23');rows.push([s.sku,s.product,s.origin,s.hts,c.cost.toFixed(2),c.mfn.toFixed(2),c.s301.toFixed(2),c.s232.toFixed(2),c.fees.toFixed(2),c.freight.toFixed(2),c.landed.toFixed(2),s.price.toFixed(2),(c.margin*100).toFixed(1),b.landed.toFixed(2),P.CURRENT_RULE])});
    return {hdr,rows,name:'landed-cost'};
  }
  let ents;
  const set=P.selSet();
  if(set.size) ents=[...set].map(byId).filter(Boolean);
  else if(r.name==='ledger') ents=P.ledgerRows(r.q);
  else if(r.name==='refunds') ents=E().filter(e=>e.status!=='none');
  else ents=E();
  const rows=[['Entry number','Entry date','Liquidation date','Origin','HTS','Entered value','MFN','IEEPA','Section 122','Section 301','Section 232','AD/CVD','Duty paid','Status','Protest deadline','Importer of record','Rule version']];
  ents.forEach(e=>rows.push([e.no,e.date,e.liq||'',e.origin,e.lines.map(l=>l.hts).join(' '),e.value.toFixed(2),e.duties.mfn.toFixed(2),e.duties.ieepa.toFixed(2),e.duties.s122.toFixed(2),e.duties.s301.toFixed(2),e.duties.s232.toFixed(2),e.duties.adcvd.toFixed(2),dutyTotal(e).toFixed(2),P.ST[e.status].l,deadline(e)||'',e.ior,e.date<'2026-02-21'?'r2025.04':e.date<'2026-07-24'?'r2026.02':P.CURRENT_RULE]));
  return {hdr,rows,name:r.name==='refunds'?'refunds':'ledger'};
}
function openExport(){
  const x=exportRows();
  const bg=dialog(`<div class="dh"><h2>Export ${x.name.replace('-',' ')}</h2><button class="btn ghost icon" data-close aria-label="Close">${ic('x')}</button></div>
  <div class="db"><p class="t2" style="margin:0 0 12px">${x.rows.length-1} rows from the current view${P.selSet().size?' (selected rows)':''}. Includes rule versions and the date generated.</p><div class="legal">Sample data. Not legal advice.</div></div>
  <div class="df"><div class="acts"><button class="btn sec" data-pdf>${ic('file')} PDF (print)</button><button class="btn primary" data-csv autofocus>${ic('download')} Download CSV</button></div></div>`,'sm');
  bg.querySelector('[data-close]').onclick=closeDialog;
  bg.querySelector('[data-csv]').onclick=()=>{P.download(`portside-${x.name}-${P.TODAY}.csv`,x.hdr.join('\r\n')+'\r\n'+P.toCSV(x.rows));closeDialog();toast(`Exported ${x.rows.length-1} rows to CSV`);audit(`Exported ${x.name} CSV`);save();};
  bg.querySelector('[data-pdf]').onclick=()=>{closeDialog();setTimeout(()=>window.print(),50)};
}
P.openExport=openExport;

function openKeys(){
  const K=[['Command palette',['⌘','K']],['Go to Ledger',['G','L']],['Go to Refunds',['G','R']],['Go to Landed Cost',['G','C']],['Go to Tariff Radar',['G','T']],['Go to Overview',['G','O']],['Next / previous row',['J','K']],['Open inspector',['Enter']],['Close inspector or dialog',['Esc']],['Select row (Shift for range)',['X']],['Build refund packet from selection',['⌘','Enter']],['Focus search',['/']],['Open filters',['F']],['Export current view',['E']],['Shortcuts',['?']]];
  const bg=dialog(`<div class="dh"><h2>Keyboard shortcuts</h2><button class="btn ghost icon" data-close aria-label="Close">${ic('x')}</button></div><div class="db"><div class="keys">${K.map(k=>`<span>${k[0]}</span><span class="ks">${k[1].map(x=>`<kbd>${x}</kbd>`).join('')}</span>`).join('')}</div><p class="note">Every shortcut also has a button or menu item.</p></div>`,'sm');
  bg.querySelector('[data-close]').onclick=closeDialog;
}
function openMore(){
  const items=[['radar','Tariff Radar','radar'],['drawback','Drawback · Phase 2','drawback'],['suppliers','Suppliers','suppliers'],['settings','Settings','settings']];
  const bg=dialog(`<div class="dh"><h2>More</h2><button class="btn ghost icon" data-close aria-label="Close">${ic('x')}</button></div><div class="db" style="padding:8px">${items.map(i=>`<a class="pal-like srow" href="#/${i[0]}" style="align-items:center;color:var(--t1);text-decoration:none;min-height:56px">${ic(i[2])}<span>${i[1]}</span></a>`).join('')}<button class="srow" data-keys style="align-items:center;min-height:56px">${ic('keyboard')}<span>Keyboard shortcuts</span></button></div>`,'sm');
  bg.querySelector('[data-close]').onclick=closeDialog; bg.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeDialog()));
  bg.querySelector('[data-keys]').onclick=openKeys;
}
function notify(id){
  const x=S().data.radar.find(y=>y.id===id); const im=P.impact(x);
  const bg=dialog(`<div class="dh"><h2>Notify team</h2><button class="btn ghost icon" data-close aria-label="Close">${ic('x')}</button></div><div class="db">
  <label class="field">Message<textarea rows="5" id="nt">${esc(`${x.name} (${x.auth}), effective ${P.fdateFull(x.date)}. ${im.text}. Open in Portside to review affected SKUs.`)}</textarea></label>
  <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap"><label style="display:flex;gap:8px;align-items:center;min-height:44px"><input type="checkbox" checked id="n-slack"> Slack #ops-tariffs</label><label style="display:flex;gap:8px;align-items:center;min-height:44px"><input type="checkbox" checked id="n-mail"> Email team (2)</label></div></div>
  <div class="df"><div class="legal">Simulated in this demo; nothing is sent.</div><div class="acts"><button class="btn primary" data-go>${ic('send')} Send summary</button></div></div>`,'sm');
  bg.querySelector('[data-close]').onclick=closeDialog;
  bg.querySelector('[data-go]').onclick=()=>{closeDialog();audit('Notified team about '+x.name);save();toast('Summary sent to Slack and email · simulated',()=>{audit('Recalled team notification');save()})};
}

/* ---------- palette ---------- */
let palIdx=0, palItems=[];
function openPalette(){
  closeDialog();
  let bg=$('#pal'); if(!bg){bg=document.createElement('div');bg.id='pal';bg.className='pal-bg';bg.innerHTML=`<div class="pal" role="dialog" aria-label="Command palette"><span class="ps">${ic('search')}</span><input id="pal-in" placeholder="Search entries, SKUs, actions…" autocomplete="off" aria-label="Search entries, SKUs, actions"><div class="res" id="pal-res" role="listbox"></div><div class="pf"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> run</span><span><kbd>Esc</kbd> close</span></div></div>`;document.body.appendChild(bg);
    bg.addEventListener('click',e=>{if(e.target===bg) closePalette()});
    const inp=$('#pal-in',bg); inp.addEventListener('input',()=>{palIdx=0;palRender()});
    inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){palIdx=Math.min(palItems.length-1,palIdx+1);palRender(true);e.preventDefault()} else if(e.key==='ArrowUp'){palIdx=Math.max(0,palIdx-1);palRender(true);e.preventDefault()} else if(e.key==='Enter'){const it=palItems[palIdx]; if(it){closePalette();it.run()} e.preventDefault()} else if(e.key==='Escape'){closePalette();e.preventDefault()}});
    $('#pal-res',bg).addEventListener('click',e=>{const b=e.target.closest('[data-i]'); if(b){const it=palItems[+b.dataset.i]; closePalette(); it.run();}});
  }
  bg.classList.add('on'); const inp=$('#pal-in'); inp.value=''; palIdx=0; palRender(); setTimeout(()=>inp.focus(),10);
}
function closePalette(){const bg=$('#pal'); if(bg&&bg.classList.contains('on')){bg.classList.remove('on');return true} return false}
function palRender(keep){
  const q=$('#pal-in').value.trim().toLowerCase();
  const G=[];
  const nav=[['Overview','overview','overview',['G','O']],['Ledger','ledger','ledger',['G','L']],['Refunds','refunds','refunds',['G','R']],['Landed Cost','landed','landed',['G','C']],['Tariff Radar','radar','radar',['G','T']],['Drawback','drawback','drawback',[]],['Suppliers','suppliers','suppliers',['G','S']],['Settings','settings','settings',[]]];
  G.push(['Navigate',nav.map(n=>({l:'Go to '+n[0],i:n[2],k:n[3],run:()=>P.go(n[1])}))]);
  if(q){
    const ents=E().filter(e=>e.no.toLowerCase().replace(/-/g,'').includes(q.replace(/-/g,''))).slice(0,6);
    G.push(['Entries',ents.map(e=>({l:`${e.no} · ${money(dutyTotal(e))}`,sub:P.ST[e.status].l,i:'file',k:['↵'],run:()=>P.go('ledger',{entry:e.id})}))]);
    const sk=P.skus().filter(s=>(s.sku+' '+s.product).toLowerCase().includes(q)).slice(0,5);
    G.push(['SKUs',sk.map(s=>({l:`${s.sku} · ${s.product}`,i:'package',k:[],run:()=>P.go('landed',{sku:s.sku})}))]);
  }
  G.push(['Actions',[{l:'Build refund packet',i:'package',k:['⌘','↵'],run:()=>openPacket([...P.selSet()])},{l:'Export ledger',i:'download',k:['E'],run:()=>{P.go('ledger');setTimeout(openExport,30)}},{l:'Download sample ACE CSV',i:'download',k:[],run:()=>P.sampleCSV()},{l:'Import new data',i:'upload',k:[],run:()=>P.go('onboarding')},{l:'Reset sample data',i:'rotate',k:[],run:()=>resetSample()}]]);
  G.push(['Help',[{l:'Keyboard shortcuts',i:'keyboard',k:['?'],run:openKeys},{l:'About the data (sample, not legal advice)',i:'info',k:[],run:()=>toast('All data is fictional sample data. Findings are informational, not legal advice.')}]]);
  palItems=[]; let html='';
  G.forEach(([g,items])=>{const f=items.filter(it=>!q||g==='Entries'||g==='SKUs'||it.l.toLowerCase().includes(q)); if(!f.length) return;
    html+=`<div class="g">${g}</div>`+f.map(it=>{const i=palItems.length;palItems.push(it);return `<button class="it ${i===palIdx?'on':''}" data-i="${i}" role="option">${ic(it.i)}<span>${esc(it.l)}${it.sub?` <span class="t3">· ${esc(it.sub)}</span>`:''}</span><span class="r">${(it.k||[]).map(k=>`<kbd>${k}</kbd>`).join('')}</span></button>`}).join('')});
  if(!palItems.length) html='<div class="t3" style="padding:16px">No results</div>';
  const res=$('#pal-res'); res.innerHTML=html; if(keep){const on=res.querySelector('.on'); on&&on.scrollIntoView({block:'nearest'})}
}
P.openPalette=openPalette;

function resetSample(){
  const prev=JSON.stringify(S());
  P.setState(P.freshState(P.buildSample())); S().checklist.dismissed=true; S().pulse=false; save();
  P.render(); toast('Sample data reset',()=>{P.setState(JSON.parse(prev));P.render()});
}

/* ---------- list navigation ---------- */
function rowsInView(){return $$('#content [data-act="open-entry"],#content [data-act="open-sku"],#content [data-act="open-sup"]').filter(el=>el.offsetParent!==null)}
function rowKey(el){return {act:el.dataset.act,id:el.dataset.id}}
function curKey(){const q=route().q; return q.get('entry')||q.get('sku')||q.get('sup')||q.get('cur')}
function moveRow(d,extend){
  const rows=rowsInView(); if(!rows.length) return;
  const ck=curKey(); let i=rows.findIndex(r=>r.dataset.id===ck); i = i<0 ? (d>0?0:rows.length-1) : Math.max(0,Math.min(rows.length-1,i+d));
  const k=rowKey(rows[i]); const q=route().q; const open=q.has('entry')||q.has('sku')||q.has('sup');
  const patch={cur:k.id};
  if(open){patch.entry=null;patch.sku=null;patch.sup=null;patch[{['open-entry']:'entry',['open-sku']:'sku',['open-sup']:'sup'}[k.act]]=k.id;}
  if(extend&&k.act==='open-entry'){const s=P.selSet();s.add(k.id);if(ck)s.add(ck);patch.sel=[...s].join(',')}
  P.setQ(patch);
  const el=rowsInView().find(r=>r.dataset.id===k.id); el&&el.scrollIntoView({block:'nearest'});
}
function openCur(){
  const ck=curKey(); const rows=rowsInView(); const el=rows.find(r=>r.dataset.id===ck)||rows[0]; if(!el) return;
  const map={'open-entry':'entry','open-sku':'sku','open-sup':'sup'}; P.setQ({[map[el.dataset.act]]:el.dataset.id,cur:el.dataset.id});
}
let lastSel=null;
function toggleSel(id,shift){
  const s=P.selSet();
  if(shift&&lastSel){const ids=rowsInView().filter(r=>r.dataset.act==='open-entry').map(r=>r.dataset.id);const a=ids.indexOf(lastSel),b=ids.indexOf(id);if(a>=0&&b>=0){const [x,y]=a<b?[a,b]:[b,a];ids.slice(x,y+1).forEach(i=>s.add(i));}}
  else {s.has(id)?s.delete(id):s.add(id)}
  lastSel=id; P.writeSel(s);
}

/* ---------- clicks ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const a=t.dataset.act, id=t.dataset.id;
  switch(a){
    case 'nav': P.go(t.dataset.to); break;
    case 'q': P.setQ({[t.dataset.k]:t.dataset.v||null}); break;
    case 'open-entry': P.setQ({entry:id,cur:id,sku:null,sup:null}); break;
    case 'open-sku': if(route().name!=='landed'&&route().name!=='radar') P.go('landed',{sku:id}); else P.setQ({sku:id,cur:id}); break;
    case 'open-sup': if(route().name!=='suppliers') P.go('suppliers',{sup:id}); else P.setQ({sup:id,cur:id}); break;
    case 'close-insp': P.closeInspector(); break;
    case 'toggle-sel': e.stopPropagation(); toggleSel(id,e.shiftKey); break;
    case 'sel-all': {const ids=P.ledgerRows(route().q).map(x=>x.id);const s=P.selSet();const all=ids.every(i=>s.has(i));P.writeSel(all?new Set():new Set(ids));break;}
    case 'clearsel': P.writeSel(new Set()); break;
    case 'clearf': P.setQ({status:null,origin:null,duty:null,range:null,q:null}); break;
    case 'ftoggle': P.setQ({fo:route().q.get('fo')?null:'1'}); break;
    case 'packet': openPacket([...P.selSet()]); break;
    case 'packet-one': openPacket([id]); break;
    case 'export': openExport(); break;
    case 'palette': openPalette(); break;
    case 'keys': openKeys(); break;
    case 'more': openMore(); break;
    case 'notify': notify(id); break;
    case 'ask-broker': {const en=byId(id); en.activity.push({t:P.TODAY,who:'Priya Shah',what:'Asked Meridian Customs about this entry'}); save(); P.render(); toast(`Question sent to Meridian Customs about ${en.no} · simulated`,()=>{en.activity.pop();save();P.render()}); break;}
    case 'review-urgent': {P.setQ({sel:t.dataset.ids,entry:t.dataset.ids.split(',')[0]}); break;}
    case 'rg': {const q=route().q; const c=new Set((q.get('closed')||'').split(',').filter(Boolean)); c.has(t.dataset.k)?c.delete(t.dataset.k):c.add(t.dataset.k); P.setQ({closed:[...c].join(',')}); break;}
    case 'dismiss-ck': S().checklist.dismissed=true; save(); P.render(); toast('Checklist dismissed',()=>{S().checklist.dismissed=false;save();P.render()}); break;
    case 'ck': S().checklist[t.dataset.k]=!S().checklist[t.dataset.k]; if(t.dataset.k==='ach') S().settings.ach=S().checklist.ach; save(); P.render(); break;
    case 'tg': {const k=t.dataset.k; S().settings[k]=!S().settings[k]; if(k==='ach'){S().checklist.ach=S().settings.ach; audit((S().settings.ach?'Confirmed':'Unconfirmed')+' ACH refund enrollment')} save(); P.render(); break;}
    case 'ior-confirm': S().checklist.ior=true; audit('Confirmed importer of record'); save(); P.render(); toast('Importer of record confirmed'); break;
    case 'density': S().settings.density=t.dataset.v; save(); P.render(); break;
    case 'reset': resetSample(); break;
    case 'startover': if(confirm('Clear all local data and start over?')){localStorage.removeItem('portside.v1'); P.setState(null); localStorage.removeItem('portside.v1'); location.hash='#/onboarding'; location.reload();} break;
    case 'audit-export': P.download(`portside-audit-${P.TODAY}.csv`,P.toCSV([['Time','Who','What'],...S().audit.map(a=>[a.t,a.who,a.what])])); break;
    case 'wi-reset': {delete (S().whatif||{})[id]; save(); P.render(); break;}
    case 'sup-status': {const s=S().data.suppliers.find(x=>x.id===id); const prev=s.status; s.status=t.dataset.v; s.log=s.log||[]; s.log.push({t:P.TODAY,what:'Status set to '+t.dataset.v}); save(); P.render(); toast(`${s.name}: ${t.dataset.v}`,()=>{s.status=prev;s.log.pop();save();P.render()}); break;}
    case 'sup-send': {const s=S().data.suppliers.find(x=>x.id===id); const to=$('#sup-to').value.trim(); if(!/^\S+@\S+\.\S+$/.test(to)){$('#sup-to').classList.add('bad');toast('Enter a valid email address for the recipient');break;}
      S().letters[s.id]=$('#sup-letter').value; const prev=s.status; s.status='sent'; s.log=s.log||[]; s.log.push({t:P.TODAY,what:'Request sent to '+to}); audit('Sent refund-sharing request to '+s.name); save(); P.render();
      toast(`Request sent to ${to} · simulated`,()=>{s.status=prev;s.log.pop();save();P.render()}); break;}
    case 'sup-copy': {const v=$('#sup-letter').value; (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('Letter copied')).catch(()=>toast('Copy not available here')); break;}
    case 'drawback-packet': {toast('Drawback packets arrive in Phase 2. This preview stays read-only.'); break;}
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.act==='qsel') P.setQ({[t.dataset.k]:t.value||null});
  if(t.id==='set-margin'){const v=parseInt(t.value,10); if(v>0&&v<100){S().settings.margin=v;save();toast('Target margin set to '+v+'%')} else {t.classList.add('bad');toast('Enter a margin between 1 and 99')}}
  if(t.id==='wi-origin'){const s=P.skus().find(x=>x.sku===route().q.get('sku')); s&&P.wiUpdate(s)}
});
let st;
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.act==='search'){clearTimeout(st); st=setTimeout(()=>{const pos=t.selectionStart; P.setQ({q:t.value||null}); const n=$('#search'); if(n){n.focus(); try{n.setSelectionRange(pos,pos)}catch(_){}}},180);}
  if(t.id==='wi-cost'||t.id==='wi-freight'){const s=P.skus().find(x=>x.sku===route().q.get('sku')); s&&P.wiUpdate(s)}
  if(t.id==='sup-letter'){const id=route().q.get('sup'); S().letters[id]=t.value; save();}
});
document.addEventListener('keydown',e=>{
  const el=e.target; const typing=el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT'||el.isContentEditable);
  if(el&&el.matches&&el.matches('[role="button"][data-act]')&&(e.key==='Enter'||e.key===' ')&&!typing){e.preventDefault();el.click();return}
});

/* ---------- keyboard ---------- */
let gPending=0;
document.addEventListener('keydown',e=>{
  const mod=e.metaKey||e.ctrlKey; const el=e.target; const typing=el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT'||el.isContentEditable);
  if(mod&&e.key.toLowerCase()==='k'){e.preventDefault(); $('#pal.on')?closePalette():openPalette(); return}
  if($('#pal.on')) return;
  if(e.key==='Escape'){ if(closeDialog()) return; if(typing){el.blur();return} if(route().q.has('entry')||route().q.has('sku')||route().q.has('sup')){P.closeInspector();return} if(P.selSet().size){P.writeSel(new Set());return} return;}
  if(!S()||!S().onboarded||route().name==='onboarding') return;
  if(mod&&e.key==='Enter'){e.preventDefault(); openPacket([...P.selSet()]); return}
  if(typing||mod||e.altKey) return;
  if($('#dlg')) return;
  const k=e.key;
  if(gPending&&Date.now()-gPending<1200){gPending=0; const m={l:'ledger',r:'refunds',c:'landed',t:'radar',o:'overview',s:'suppliers',d:'drawback'}[k.toLowerCase()]; if(m){e.preventDefault();P.go(m)} return}
  if(k==='g'){gPending=Date.now();return}
  if(k==='j'||k==='J'){e.preventDefault();moveRow(1,e.shiftKey);return}
  if(k==='k'||k==='K'){e.preventDefault();moveRow(-1,e.shiftKey);return}
  if(k==='Enter'&&!(el&&el.closest&&el.closest('button,a'))){e.preventDefault();openCur();return}
  if(k==='x'||k==='X'){const ck=curKey(); if(ck&&byId(ck)){e.preventDefault();toggleSel(ck,e.shiftKey)} return}
  if(k==='/'){const s=$('#search'); if(s){e.preventDefault();s.focus()} else {e.preventDefault();openPalette()} return}
  if(k==='f'||k==='F'){const fb=$('#fbar'); if(fb){e.preventDefault(); if(P.isMobile()) P.setQ({fo:'1'}); setTimeout(()=>{const s=$('#fbar .filters select'); s&&s.focus()},30)} return}
  if(k==='e'||k==='E'){e.preventDefault();openExport();return}
  if(k==='?'){e.preventDefault();openKeys();return}
});

/* ---------- tooltip ---------- */
let tipEl, tipT;
document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]'); if(!t) return; clearTimeout(tipT);
  tipT=setTimeout(()=>{if(!tipEl){tipEl=document.createElement('div');tipEl.className='tip';document.body.appendChild(tipEl)} tipEl.textContent=t.dataset.tip; const r=t.getBoundingClientRect(); tipEl.style.display='block'; const w=tipEl.offsetWidth; tipEl.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'; tipEl.style.top=(r.top-34)+'px';},400)});
document.addEventListener('mouseout',e=>{if(e.target.closest('[data-tip]')){clearTimeout(tipT); if(tipEl) tipEl.style.display='none'}});

P.bindInspector=function(){};
P.after=function(){};
})();
