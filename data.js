/* Portside sample data — fictional. Juniper & Oak Home. Deterministic. */
(function(){
const P = window.PS = window.PS || {};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
P.rng = rng;
const D = s => new Date(s+'T00:00:00');
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addDays = (s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return iso(d)};
P.iso=iso; P.addDays=addDays; P.D=D;

P.ORIGINS = {VN:{name:'Vietnam',ieepa:.20,s301:.125,group:'Group 3 · 12.5%'},IN:{name:'India',ieepa:.25,s301:.10,group:'Group 2 · 10%'},CN:{name:'China',ieepa:.30,s301:.125,group:'Group 3 · 12.5%'},MX:{name:'Mexico',ieepa:0,s301:0,group:'USMCA · 0%'}};

/* Rule versions (sample, simplified) */
P.RULES = [
  {v:'r2025.04',name:'IEEPA reciprocal and fentanyl duties',from:'2025-02-04',to:'2026-02-20',src:'https://www.cbp.gov/trade'},
  {v:'r2026.02',name:'Section 122 surcharge, 10% all origins',from:'2026-02-24',to:'2026-07-24',src:'https://www.cbp.gov/trade'},
  {v:'r2026.07',name:'Section 301 origin groups (10% / 12.5%)',from:'2026-07-24',to:null,src:'https://ustr.gov/'},
  {v:'r2026.08',name:'Section 232 full customs value for steel, aluminum, copper derivatives',from:'2026-08-18',to:null,src:'https://www.cbp.gov/trade'},
];
P.CURRENT_RULE='r2026.08';

/* SKU catalog: [sku, product, origin, hts, mfnRate, unitCost, freight, price, unitsPerMonth, metalShare, desc] */
const S = [
 ['JO-TBL-OAK72','Oak dining table, 72 in','VN','9403.60.8081',0,286,41,899,38,0,'Wooden dining tables'],
 ['JO-CHR-OAK','Oak dining chair','VN','9401.61.6011',0,58,9.5,189,160,0,'Upholstered wooden seats'],
 ['JO-BNC-WAL','Walnut bench','VN','9403.60.8081',0,92,14,289,44,0,'Wooden furniture, other'],
 ['JO-NST-OAK','Oak nightstand','VN','9403.50.9045',0,74,11,239,70,0,'Bedroom furniture, wood'],
 ['JO-DRS-6D','Six-drawer dresser','VN','9403.50.9045',0,212,33,749,26,0,'Bedroom furniture, wood'],
 ['JO-BKS-5','Five-shelf bookcase','VN','9403.60.8081',0,118,19,369,31,0,'Wooden furniture, other'],
 ['JO-CNS-RAT','Rattan console','VN','9403.83.0000',0,96,16,329,22,0,'Furniture of rattan'],
 ['JO-BSK-SET','Rattan basket set of 3','VN','4602.12.4500',.04,21,4.2,79,240,0,'Basketwork of rattan'],
 ['JO-LMP-CER','Ceramic table lamp','VN','9405.21.8000',.039,34,6.5,129,95,0,'Electric table lamps'],
 ['JO-STL-BAR','Steel bar stool','VN','9401.79.0050',0,39,7,149,120,.85,'Seats with metal frames'],
 ['JO-PLN-CER','Ceramic planter, large','VN','6913.90.5000',.06,16,5,64,180,0,'Ceramic ornamental articles'],
 ['JO-THR-COT','Cotton throw','VN','6301.30.0020',.085,13,1.6,69,310,0,'Blankets of cotton'],
 ['JO-CSH-LIN','Linen cushion cover','VN','6304.99.6040',.06,6.4,.8,39,420,0,'Furnishing articles, other'],
 ['JO-MIR-WAL','Oak wall mirror','VN','7009.92.5000',.065,48,9,179,58,0,'Framed glass mirrors'],
 ['JO-CBD-TEAK','Teak cutting board','VN','4419.19.9000',.032,11,1.4,54,260,0,'Tableware of wood'],
 ['JO-RUG-58','Wool flatweave rug, 5x8','IN','5702.31.2000',.027,88,12,349,64,0,'Woven carpets of wool'],
 ['JO-RUG-912','Wool flatweave rug, 9x12','IN','5702.31.2000',.027,214,26,899,21,0,'Woven carpets of wool'],
 ['JO-DUV-Q','Cotton duvet cover, queen','IN','6302.31.9020',.067,19,2.1,119,280,0,'Bed linen of cotton'],
 ['JO-TWL-SET','Organic towel set','IN','6302.60.0020',.091,14,1.9,74,350,0,'Terry towels of cotton'],
 ['JO-QLT-K','Block-print quilt, king','IN','6302.21.9020',.067,31,3.4,189,140,0,'Printed bed linen'],
 ['JO-DIN-12','Stoneware dinner set, 12 pc','CN','6912.00.4810',.098,24,5.8,119,210,0,'Ceramic tableware'],
 ['JO-GLS-6','Ribbed glass tumblers, set of 6','CN','7013.49.5000',.075,7.2,1.9,42,380,0,'Glassware for table use'],
 ['JO-PAN-SS','Stainless saute pan','CN','7323.93.0080',.02,17,2.4,89,190,1,'Stainless kitchen articles'],
 ['JO-LMP-BRS','Brass floor lamp','CN','9405.29.6000',.06,47,9.5,229,48,.6,'Electric lamps, other'],
 ['JO-SHF-STL','Steel wall shelf','CN','9403.20.0090',0,22,4,89,150,.9,'Metal furniture, other'],
 ['JO-BED-MTL','Metal bed frame, queen','CN','9403.20.0050',0,96,22,449,36,.95,'Metal bedroom furniture'],
 ['JO-CLK-WAL','Wall clock','CN','9105.21.8000',.06,12,1.8,59,140,0,'Wall clocks, electric'],
 ['JO-CND-SET','Candle holder set','CN','9405.50.4000',.06,9,1.5,44,230,.3,'Non-electric lamps, other'],
];
const FEES = .003464 + .00125; // MPF + HMF (simplified, ad valorem)
P.FEES = FEES;

/* Landed cost under a rule set (sample, simplified).
   mode: 'jul23' (Section 122, 232 on metal content), 'aug17' (301 groups, 232 metal content), 'now' (r2026.08), 'prop' (Group 3 at 15%) */
P.calcSku = function(s, o){
  o = o || {}; const mode = o.mode || 'now';
  const origin = o.origin || s.origin, cost = o.cost!=null?o.cost:s.cost, freight = o.freight!=null?o.freight:s.freight;
  const og = P.ORIGINS[origin];
  const mfn = cost*s.mfn;
  const s122 = mode==='jul23' ? cost*(origin==='MX'?0:.10) : 0;
  let r301 = mode==='jul23' ? 0 : og.s301; if(mode==='prop' && r301===.125) r301=.15;
  const s301 = cost*r301;
  const full = mode==='now'||mode==='prop';
  const s232 = s.metal ? (full ? cost*.5*s.metal : cost*s.metal*.5*.53) : 0;
  const fees = cost*FEES;
  const duty = mfn+s122+s301+s232;
  const landed = cost+duty+fees+freight;
  const margin = (s.price-landed)/s.price;
  return {cost,freight,mfn,s122,s301,s232,fees,duty,landed,margin,origin};
};
P.buildSkus = function(){
  return S.map(r=>({sku:r[0],product:r[1],origin:r[2],hts:r[3],mfn:r[4],cost:r[5],freight:r[6],price:r[7],units:Math.round(r[8]*1.7794),metal:r[9],desc:r[10]}));
};

/* Entries */
P.buildSample = function(){
  const R = rng(20261101);
  const skus = P.buildSkus();
  const byO = {VN:skus.filter(s=>s.origin==='VN'),IN:skus.filter(s=>s.origin==='IN'),CN:skus.filter(s=>s.origin==='CN')};
  const ports = ['Long Beach, CA (2704)','Los Angeles, CA (2704)','Savannah, GA (1703)','Newark, NJ (4601)'];
  const out = [];
  let d = D('2025-02-06'); let n=0;
  const used = new Set();
  function entryNo(filer){let s;do{s=String(Math.floor(R()*9000000)+1000000)}while(used.has(s));used.add(s);return filer+'-'+s+'-'+Math.floor(R()*10)}
  const IE_N=83, step=378/82;
  while(d < D('2026-10-29')){
    if(n<IE_N){d=D('2025-02-06');d.setDate(d.getDate()+Math.round(n*step));} 
    const o = R()<.5?'VN':R()<.55?'CN':'IN';
    const pick = byO[o]; const nl = 1+Math.floor(R()*3); const lines=[]; const seen=new Set();
    for(let i=0;i<nl;i++){const s=pick[Math.floor(R()*pick.length)]; if(seen.has(s.sku))continue; seen.add(s.sku);
      const qty = Math.round((s.units*(1.2+R()*2.2))/10)*10; lines.push({hts:s.hts,desc:s.product,sku:s.sku,qty,value:+(qty*s.cost).toFixed(2),mfn:s.mfn,metal:s.metal});}
    out.push({no:entryNo(R()<.86?'K4P':'9RT'),date:iso(d),origin:o,port:ports[Math.floor(R()*ports.length)],lines});
    n++; if(n>=IE_N){ if(n===IE_N) d=D('2026-02-24'); else d.setDate(d.getDate()+4+Math.floor(R()*3)); }
  }
  // duties by regime
  out.forEach(e=>{
    const og=P.ORIGINS[e.origin]; const t=e.date;
    let mfn=0,ieepa=0,s122=0,s301=0,s232=0;
    e.lines.forEach(l=>{mfn+=l.value*l.mfn;
      if(t<'2026-02-21'){ieepa+=l.value*og.ieepa*(l.metal?0:1); s232+= l.metal? l.value*l.metal*.25:0}
      else if(t<'2026-07-24'){s122+=l.value*.10; s232+= l.metal? l.value*l.metal*.5*.4:0}
      else {s301+=l.value*og.s301; s232+= l.metal? l.value*.5*l.metal:0}});
    e.value=+e.lines.reduce((a,l)=>a+l.value,0).toFixed(2);
    e.duties={mfn,ieepa,s122,s301,s232,adcvd:0};
    const liq = P.addDays(t,314);
    e.liq = liq<=P.iso(new Date(2026,10,1)) ? liq : null;
    e.ior='Juniper & Oak Home LLC'; e.iorNo='87-4410293-00';
    e.status='none';
  });
  // IEEPA statuses
  const ie = out.filter(e=>e.duties.ieepa>0 || e.date<'2026-02-21');
  const plan = [];
  for(let i=0;i<ie.length;i++){
    let s;
    if(i<34) s = (i===5||i===18)?'notior':(i===26?'hold':'paid');
    else if(i<40) s='protest'; else if(i<51) s='paid'; else if(i<60) s='filed'; else if(i===60) s='hold'; else if(i===61) s='notior'; else s='eligible';
    plan.push(s);
  }
  // ensure exactly 21 eligible
  ie.forEach((e,i)=>{e.status=plan[i]; if(e.duties.ieepa===0) e.duties.ieepa=e.value*.1;});
  const elig = ie.filter(e=>e.status==='eligible');
  // protest overrides
  const prot = ie.filter(e=>e.status==='protest');
  const pd = ['2026-11-05','2026-11-07','2026-11-19','2026-11-28','2026-12-27','2027-01-14'];
  prot.forEach((e,i)=>{e.liq=P.addDays(pd[i],-180)});
  const k = prot[4]; k.no='K4P-0412881-3'; k.date='2025-02-12'; k.liq='2026-06-30';
  // scale groups to KPI targets (cents)
  function scale(list,target){const sum=list.reduce((a,e)=>a+e.duties.ieepa,0);let acc=0;
    list.forEach((e,i)=>{let v = i<list.length-1 ? Math.round(e.duties.ieepa/sum*target*100)/100 : Math.round((target-acc)*100)/100; e.duties.ieepa=v; acc+=v;});}
  scale(elig.slice(0,21),35339.60);
  const others = prot.filter(e=>e!==k); scale(others,3990.40);
  k.duties={mfn:1204.10,ieepa:8880.00,s122:0,s301:0,s232:0,adcvd:0}; k.value=59200.00;
  k.lines=[{hts:'9403.60.8081',desc:'Oak dining table, 72 in',sku:'JO-TBL-OAK72',qty:120,value:34320},{hts:'9401.61.6011',desc:'Oak dining chair',sku:'JO-CHR-OAK',qty:429,value:24880}];
  k.origin='VN'; k.port='Long Beach, CA (2704)';
  // hold: missing ACH; notior: IOR is a distributor
  ie.filter(e=>e.status==='notior').forEach(e=>{e.ior='Harbor & Pine Distribution Inc.'; e.iorNo='—'; e.no='HPD-'+e.no.slice(4)});
  // round all duties
  out.forEach(e=>{for(const kk in e.duties) e.duties[kk]=Math.round(e.duties[kk]*100)/100});
  // scale 2026 YTD total to 612,904.00 by scaling non-IEEPA components
  const y = out.filter(e=>e.date>='2026-01-01');
  const tot = e=>Object.values(e.duties).reduce((a,b)=>a+b,0);
  const ieY = y.reduce((a,e)=>a+e.duties.ieepa,0), restY = y.reduce((a,e)=>a+tot(e)-e.duties.ieepa,0);
  const f = (612904-ieY)/restY;
  let acc=0; y.forEach(e=>{['mfn','s122','s301','s232'].forEach(kk=>{e.duties[kk]=Math.round(e.duties[kk]*f*100)/100}); acc+=tot(e)});
  const last=y[y.length-1]; last.duties.mfn=Math.round((last.duties.mfn+(612904-acc))*100)/100;
  // claim meta
  const people=['PS','DO'];
  out.forEach((e,i)=>{
    e.id=e.no; e.assignee = e.status==='none'?null:people[i%2];
    e.claim = (e.status==='filed'||e.status==='paid') ? 'CAPE-'+(e.status==='paid'?'26-0':'26-1')+String(40000+i*137).slice(-5) : null;
    e.broker = {eligible:'Ready to file',protest:'Protest not filed',filed:'Accepted by CBP',paid:'Refund posted',hold:'Waiting on ACH',notior:'Distributor is IOR',none:'—'}[e.status];
    e.activity=[{t:e.date,who:'Portside',what:'Imported from ACE entry summary report'}];
    if(e.liq) e.activity.push({t:e.liq,who:'Portside',what:'Liquidation date recorded'});
    if(e.status==='paid') e.activity.push({t:'2026-06-'+String(2+i%25).padStart(2,'0'),who:'Meridian Customs',what:'Refund posted by CBP'});
  });
  out.sort((a,b)=>b.date.localeCompare(a.date));
  return {entries:out, skus, suppliers:P.buildSuppliers(), radar:P.buildRadar()};
};

P.buildSuppliers = function(){return [
  {id:'s1',name:'Thanh Long Furniture Co.',country:'VN',type:'Manufacturer',ior:true,passed:0,status:'n/a',contact:'export@thanhlong.example'},
  {id:'s2',name:'Saigon Weave Co.',country:'VN',type:'Manufacturer',ior:true,passed:0,status:'n/a',contact:'sales@saigonweave.example'},
  {id:'s3',name:'Jaipur Loom Works',country:'IN',type:'Manufacturer',ior:true,passed:0,status:'n/a',contact:'orders@jaipurloom.example'},
  {id:'s4',name:'Ningbo Hearth Ceramics',country:'CN',type:'Manufacturer',ior:true,passed:0,status:'n/a',contact:'trade@ningbohearth.example'},
  {id:'s5',name:'Harbor & Pine Distribution Inc.',country:'US',type:'Distributor',ior:false,passed:18400,status:'not sent',contact:'ap@harborpine.example'},
  {id:'s6',name:'Westcoast Lighting Supply',country:'US',type:'Distributor',ior:false,passed:6250,status:'sent',contact:'accounts@westcoastlighting.example',log:[{t:'2026-10-14',what:'Request sent to accounts@westcoastlighting.example'}]},
  {id:'s7',name:'Atlas Home Wholesale',country:'US',type:'Wholesaler',ior:false,passed:3910,status:'responded',contact:'finance@atlashome.example',log:[{t:'2026-09-22',what:'Request sent'},{t:'2026-10-03',what:'Reply: reviewing CAPE filing with their broker'}]},
]};

P.buildRadar = function(){return [
  {id:'r301',name:'Section 301 origin groups',auth:'Section 301',state:'In effect',date:'2026-07-24',headline:'12.5% for 54 economies, 10% for six',
   summary:'The 10% Section 122 surcharge expired and was replaced by Section 301 duties sorted into four treatment groups by origin. Vietnam and China fall in the 12.5% group; India in the 10% group.',
   groups:['Group 1 · 0% (USMCA, none of your origins)','Group 2 · 10% · India','Group 3 · 12.5% · Vietnam, China, and 52 others','Group 4 · under review'],excl:['Annex II pharmaceuticals and critical minerals','Goods in transit before Jul 24, 2026'],kind:'301'},
  {id:'r232',name:'Section 232 full-value rule',auth:'Section 232',state:'In effect',date:'2026-08-18',headline:'Steel, aluminum and copper derivatives taxed on full customs value',
   summary:'Section 232 duties on derivative products now apply to the full customs value instead of only the metal content, at rates up to 50%. Your steel stools, shelves, bed frames and pans are affected.',
   groups:['All origins'],excl:['Products with under 10% metal by weight (sample assumption)'],kind:'232'},
  {id:'rcape3',name:'CAPE Phase 3 for finally liquidated entries',auth:'IEEPA refunds',state:'In effect',date:'2026-10-06',headline:'Older liquidated entries, only with a CIT case',
   summary:'CBP opened Phase 3 of CAPE for older, finally liquidated entries, available only to importers with a case at the Court of International Trade. Entries past their protest window need a broker or trade attorney to review.',
   groups:['All origins'],excl:[],kind:'info'},
  {id:'r301cn',name:'Proposed increase for Group 3 origins',auth:'Section 301',state:'Proposed',date:'2027-01-15',headline:'Group 3 rate from 12.5% to 15% (sample scenario)',
   summary:'A proposed modification would raise the Group 3 rate to 15%. Comments close Dec 1, 2026. This is a fictional scenario included to show how proposed rules appear.',
   groups:['Group 3 · Vietnam, China'],excl:[],kind:'prop'},
  {id:'r122',name:'Section 122 surcharge expired',auth:'Section 122',state:'In effect',date:'2026-07-24',headline:'10% surcharge on all origins ended',
   summary:'The temporary 10% balance-of-payments surcharge ended Jul 24, 2026. Refund eligibility for Section 122 payments is not yet settled and is tracked as a Phase 2 check.',groups:['All origins'],excl:[],kind:'122'},
  {id:'rieepa',name:'IEEPA tariffs ruled unlawful',auth:'IEEPA',state:'In effect',date:'2026-02-20',headline:'Supreme Court, 6–3; CIT refund order Mar 4, 2026',
   summary:'The Supreme Court held the IEEPA tariffs unlawful. On Mar 4, 2026 the Court of International Trade ordered refunds for all importers of record, claimed through CBP\u2019s CAPE system.',groups:['All origins'],excl:[],kind:'info'},
]};
})();
