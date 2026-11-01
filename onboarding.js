/* Portside — onboarding (S1) and CSV import */
(function(){
'use strict';
const P=window.PS; const {$,esc,ic,money,money0}=P;
let parsed=null, busy=false;

P.sampleCSV=function(){
  const d=P.buildSample();
  const rows=[['entry_number','entry_date','liquidation_date','country_of_origin','port','hts_number','description','sku','quantity','entered_value','mfn_duty','ieepa_duty','section_122_duty','section_301_duty','section_232_duty','ad_cvd_duty','importer_of_record','refund_status']];
  d.entries.slice().reverse().forEach(e=>{
    e.lines.forEach(l=>{const f=e.value?l.value/e.value:1/e.lines.length; const c=k=>(e.duties[k]*f).toFixed(2);
      rows.push([e.no,e.date,e.liq||'',e.origin,e.port,l.hts,l.desc,l.sku||'',l.qty||'',l.value.toFixed(2),c('mfn'),c('ieepa'),c('s122'),c('s301'),c('s232'),c('adcvd'),e.ior,e.status==='none'?'':e.status]);});
  });
  P.download('juniper-oak-ace-entry-summary-SAMPLE.csv', P.toCSV(rows));
};

P.views.onboarding=function(){
  return `<div class="onb">
  <div class="brand">${P.LOGO}<span>portside</span></div>
  <div class="step" id="ob-step">Step 1 of 3 · Connect your data</div>
  <h1>See every dollar you've paid at the border.</h1>
  <p class="lead">Import your ACE entry summary report and Portside builds a ledger of every entry, every duty, and every refund you may be owed.</p>
  <label class="opt drop" id="ob-csv" for="ob-file"><span class="ic">${ic('upload')}</span><span class="tx"><b>Upload ACE entry summary CSV</b><span>Drop a .csv here or tap to choose. Parsed in your browser.</span></span>${ic('chevr','t3')}</label>
  <input type="file" id="ob-file" accept=".csv,text/csv" class="sr">
  <label class="opt drop" id="ob-pdf" for="ob-pdffile"><span class="ic">${ic('file')}</span><span class="tx"><b>Upload 7501 PDFs</b><span>Drag and drop entry summaries. OCR runs on the server version.</span></span>${ic('chevr','t3')}</label>
  <input type="file" id="ob-pdffile" accept="application/pdf" multiple class="sr">
  <div class="opt" id="ob-broker"><span class="ic">${ic('mail')}</span><span class="tx"><b>Connect your broker</b><span>Invite them by email to share entry data.</span>
    <span style="display:flex;gap:8px;margin-top:10px"><input class="input" id="ob-email" type="email" placeholder="broker@example.com" style="flex:1" aria-label="Broker email"><button class="btn sec" id="ob-invite">Invite</button></span></span></div>
  <div class="opt sec"><span class="ic">${ic('store')}</span><span class="tx"><b>Store connection</b><span>Shopify and Amazon SKU sync · Phase 2</span></span><button class="btn sec sm" disabled>Connect</button></div>
  <div class="alt"><span>No file handy?</span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="ob-dl">${ic('download')} Sample CSV</button><button class="btn sec" id="ob-sample">Use sample data</button></span></div>
  <div class="log" id="ob-log" aria-live="polite"><span class="t3">Waiting for a file…</span></div>
  <div class="prog"><i id="ob-prog"></i></div>
  <div class="pcounts"><span>Lines read <b id="c-lines">0</b></span><span>Entries matched <b id="c-ent">0</b></span><span>Needs review <b id="c-rev">0</b></span></div>
  <div class="foot"><button class="btn primary lg" id="ob-build" disabled>Build my ledger</button></div>
  <p class="note">Sample product demo. Your file never leaves this device; data is stored in this browser only. Portside is software, not a customs broker, and findings are not legal advice.</p>
  </div>`;
};

function logLine(html){const l=$('#ob-log'); if(!l) return; if(l.querySelector('.t3')&&!l.dataset.on){l.innerHTML='';l.dataset.on=1} l.insertAdjacentHTML('beforeend',html+'\n'); l.scrollTop=l.scrollHeight;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const ALIAS={no:['entry_number','entry number','entry no','entry','entry_no'],date:['entry_date','entry date','date'],liq:['liquidation_date','liquidation date','liquidated','liq_date'],origin:['country_of_origin','country of origin','origin country','origin','country','coo'],port:['port','port_of_entry'],hts:['hts_number','hts number','hts no','htsus number','tariff number','hts','hts code','hts_code','htsus'],desc:['description','desc','product'],sku:['sku'],qty:['quantity','qty'],value:['entered_value','value','entered value'],
  mfn:['mfn_duty','mfn','duty'],ieepa:['ieepa_duty','ieepa'],s122:['section_122_duty','s122','section 122'],s301:['section_301_duty','s301','section 301'],s232:['section_232_duty','s232','section 232'],adcvd:['ad_cvd_duty','adcvd','ad/cvd'],ior:['importer_of_record','ior'],status:['refund_status','status']};
function normDate(s){s=(s||'').trim(); if(!s) return null; let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`; m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if(m){const y=m[3].length===2?'20'+m[3]:m[3];return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`} return 'bad';}
const num=s=>{if(s==null||s==='') return 0; const v=parseFloat(String(s).replace(/[$,\s]/g,'')); return isNaN(v)?NaN:v};

async function parseFile(text, name){
  busy=true; parsed=null; $('#ob-build').disabled=true; const L=$('#ob-log'); L.innerHTML=''; L.dataset.on=1;
  $('#ob-step').textContent='Step 2 of 3 · Reconcile';
  logLine(`Reading ${esc(name)} · ${(text.length/1024).toFixed(1)} KB`); await sleep(120);
  const rows=P.parseCSV(text.replace(/^\uFEFF/,''));
  if(rows.length<2){logLine(`<span class="e">No data rows found. Export the ACE "Entry Summary Line Details" report as CSV and try again.</span>`);busy=false;return}
  const nh=h=>h.trim().toLowerCase().replace(/[_\-\s\.]+/g,' ').replace(/[()#]/g,'').trim(); const head=rows[0].map(nh); const col={};
  for(const k in ALIAS){col[k]=head.findIndex(h=>ALIAS[k].map(nh).includes(h))}
  const missing=['no','date','origin','hts','value'].filter(k=>col[k]<0);
  logLine(`Header: ${head.length} columns · mapped ${Object.values(col).filter(i=>i>=0).length}`);
  if(missing.length){logLine(`<span class="e">Missing required columns: ${missing.join(', ')}. Download the sample CSV to see the expected header.</span>`);busy=false;return}
  const map=new Map(); let review=0, read=0; const N=rows.length-1; const years=new Set(), origins=new Set();
  const g=(r,k)=>col[k]>=0?(r[col[k]]||'').trim():'';
  const tick=Math.max(1,Math.ceil(N/14));
  for(let i=1;i<rows.length;i++){
    const r=rows[i]; read++;
    const no=g(r,'no').toUpperCase(); const date=normDate(g(r,'date')); const liq=normDate(g(r,'liq')); const v=num(g(r,'value'));
    let bad=!no||!date||date==='bad'||liq==='bad'||isNaN(v)||!/^\d{4}\.\d{2}(\.\d{2,4})?$/.test(g(r,'hts'));
    if(bad){review++; if(review<=4) logLine(`<span class="w">Line ${i+1}: needs review (${!no?'no entry number':date==='bad'||!date?'unreadable date':isNaN(v)?'unreadable value':'HTS format'})</span>`); }
    if(no&&date&&date!=='bad'&&!isNaN(v)){
      let e=map.get(no); if(!e){e={no,id:no,date,liq:liq&&liq!=='bad'?liq:null,origin:(g(r,'origin')||'??').toUpperCase().slice(0,2),port:g(r,'port')||'—',lines:[],duties:{mfn:0,ieepa:0,s122:0,s301:0,s232:0,adcvd:0},value:0,ior:g(r,'ior')||'Juniper & Oak Home LLC',status:g(r,'status').toLowerCase()};map.set(no,e)}
      e.lines.push({hts:g(r,'hts')||'—',desc:g(r,'desc')||'—',sku:g(r,'sku')||null,qty:+g(r,'qty')||null,value:v}); e.value+=v;
      ['mfn','ieepa','s122','s301','s232','adcvd'].forEach(k=>{const x=num(g(r,k)); if(!isNaN(x)) e.duties[k]+=x});
      years.add(date.slice(0,4)); origins.add(e.origin);
    }
    if(i%tick===0||i===N){ $('#c-lines').textContent=read.toLocaleString(); $('#c-ent').textContent=map.size.toLocaleString(); $('#c-rev').textContent=review; $('#ob-prog').style.width=(i/N*90)+'%';
      logLine(`Read ${read.toLocaleString()} entry lines · ${map.size} entries · ${years.size} year${years.size>1?'s':''} · ${origins.size} origin${origins.size>1?'s':''}`); await sleep(90);}
  }
  // derive status
  const entries=[...map.values()];
  let refundable=0, nRef=0;
  entries.forEach((e,i)=>{
    for(const k in e.duties) e.duties[k]=Math.round(e.duties[k]*100)/100; e.value=Math.round(e.value*100)/100;
    const ok=['eligible','protest','filed','paid','hold','notior'];
    if(!ok.includes(e.status)){
      if(e.duties.ieepa>0){ if(e.ior && !/juniper/i.test(e.ior)) e.status='notior'; else if(!e.liq) e.status='eligible'; else {const dl=P.addDays(e.liq,180); const d=P.days(dl); const since=-P.days(e.liq); e.status= d<0?'missed': since<=80?'eligible':'protest';} }
      else e.status='none';
    }
    e.iorNo=/juniper/i.test(e.ior)?'87-4410293-00':'—';
    e.assignee=e.status==='none'?null:(i%2?'DO':'PS'); e.claim=(e.status==='filed'||e.status==='paid')?'CAPE-'+e.no.replace(/\D/g,'').slice(-7):null;
    e.broker={eligible:'Ready to file',protest:'Protest not filed',filed:'Accepted by CBP',paid:'Refund posted',hold:'Waiting on ACH',notior:'Distributor is IOR',missed:'Window closed',none:'—'}[e.status];
    e.activity=[{t:e.date,who:'Portside',what:'Imported from '+name}];
    if(P.isRefundable(e)){refundable+=e.duties.ieepa;nRef++}
  });
  entries.sort((a,b)=>b.date.localeCompare(a.date));
  $('#ob-prog').style.width='100%';
  logLine(`<span class="ok">Reconciled ${entries.length} entries · ${review} line${review===1?'':'s'} need review</span>`);
  logLine(`<span class="ok">Refundable now: ${money0(refundable)} across ${nRef} entries</span>`);
  $('#ob-step').textContent='Step 3 of 3 · Build your ledger';
  parsed={entries,name}; busy=false; $('#ob-build').disabled=!entries.length;
}

P.bindOnboarding=function(){
  const f=$('#ob-file'), z=$('#ob-csv');
  const take=file=>{ if(!file||busy) return; if(!/\.csv$/i.test(file.name)&&file.type!=='text/csv'){logLine(`<span class="e">${esc(file.name)} is not a CSV. Export the report from ACE as CSV.</span>`);return} const rd=new FileReader(); rd.onload=()=>parseFile(String(rd.result),file.name); rd.readAsText(file); };
  f.addEventListener('change',()=>take(f.files[0]));
  ['dragenter','dragover'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.remove('over')}));
  z.addEventListener('drop',e=>take(e.dataTransfer.files[0]));
  const pz=$('#ob-pdf'), pf=$('#ob-pdffile');
  const pdfs=files=>{ if(!files.length) return; logLine(`Received ${files.length} PDF${files.length>1?'s':''}: ${[...files].map(x=>esc(x.name)).join(', ')}`); logLine(`<span class="w">7501 OCR needs the Portside server, which this static demo doesn't have. Export the ACE entry summary as CSV instead.</span>`)};
  pf.addEventListener('change',()=>pdfs(pf.files));
  ['dragenter','dragover'].forEach(ev=>pz.addEventListener(ev,e=>{e.preventDefault();pz.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>pz.addEventListener(ev,e=>{e.preventDefault();pz.classList.remove('over')}));
  pz.addEventListener('drop',e=>pdfs(e.dataTransfer.files));
  $('#ob-invite').onclick=()=>{const em=$('#ob-email'); if(!/^\S+@\S+\.\S+$/.test(em.value.trim())){em.classList.add('bad');logLine('<span class="e">Enter a valid broker email.</span>');return} em.classList.remove('bad'); logLine(`Invite drafted for ${esc(em.value.trim())} · simulated, no email sent`); P.toast('Broker invite simulated · no email sent');};
  $('#ob-dl').onclick=()=>P.sampleCSV();
  $('#ob-sample').onclick=()=>{ if(busy) return; const d=P.buildSample(); const rows=['entry_number,entry_date,liquidation_date,country_of_origin,hts_number,entered_value,ieepa_duty'];
    // stream the sample through the same parser for a real log
    const csv=[['entry_number','entry_date','liquidation_date','country_of_origin','port','hts_number','description','sku','quantity','entered_value','mfn_duty','ieepa_duty','section_122_duty','section_301_duty','section_232_duty','ad_cvd_duty','importer_of_record','refund_status']];
    d.entries.forEach(e=>e.lines.forEach(l=>{const f=e.value?l.value/e.value:1;csv.push([e.no,e.date,e.liq||'',e.origin,e.port,l.hts,l.desc,l.sku||'',l.qty||'',l.value.toFixed(2),...['mfn','ieepa','s122','s301','s232','adcvd'].map(k=>(e.duties[k]*f).toFixed(2)),e.ior,e.status==='none'?'':e.status])}));
    parseFile(P.toCSV(csv),'Sample ACE entry summary (Juniper & Oak Home)').then(()=>{parsed={sample:d,name:'Sample ACE entry summary (Juniper & Oak Home)'}});
  };
  $('#ob-build').onclick=()=>{
    if(!parsed) return; const b=$('#ob-build'); b.disabled=true; b.innerHTML='<span class="spin"></span> Building';
    setTimeout(()=>{
      let data;
      if(parsed.sample) data=parsed.sample;
      else { const base=P.buildSample(); data={entries:parsed.entries, skus:base.skus, suppliers:base.suppliers, radar:base.radar}; }
      const st=P.freshState(data, parsed.sample?undefined:{kind:'csv',name:parsed.name,at:new Date().toISOString()});
      P.setState(st); parsed=null; location.hash='#/overview';
    },350);
  };
};
})();
