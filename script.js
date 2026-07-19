const fmt = n => Math.round(n).toLocaleString('th-TH');

/* ---------------- Tabs ---------------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tax-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
  });
});

/* ---------------- Helpers ---------------- */
function num(id){ const el=document.getElementById(id); if(!el) return 0; const v=parseFloat(el.value); return isNaN(v)?0:v; }
function checked(id){ const el=document.getElementById(id); return el ? el.checked : false; }

/* ---------------- Animated numbers ---------------- */
const animState = {};
function animateNumber(el, target, suffix=''){
  if(!el) return;
  const key = el.id;
  const from = animState[key] !== undefined ? animState[key] : target;
  animState[key] = target;
  const start = performance.now();
  const dur = 550;
  function step(now){
    const p = Math.min((now-start)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const val = from + (target-from)*eased;
    el.innerHTML = fmt(val)+suffix;
    if(p<1) requestAnimationFrame(step);
    else el.innerHTML = fmt(target)+suffix;
  }
  requestAnimationFrame(step);
}
function thumpSeal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('thump'); void el.offsetWidth; el.classList.add('thump');
}

/* ---------------- Confetti ---------------- */
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = confettiCanvas.getContext('2d');
function resizeCanvas(){ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
let confettiParticles = [];
let confettiRunning = false;
function burstConfetti(){
  const colors = ['#C9A227','#17233F','#A83B25','#3D6B4F','#F7F2E6'];
  for(let i=0;i<70;i++){
    confettiParticles.push({
      x: innerWidth/2 + (Math.random()-0.5)*200,
      y: innerHeight*0.25,
      vx: (Math.random()-0.5)*8,
      vy: Math.random()*-6-2,
      g: 0.18+Math.random()*0.08,
      size: 4+Math.random()*4,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*360, vr:(Math.random()-0.5)*10,
      life: 0
    });
  }
  if(!confettiRunning){ confettiRunning = true; requestAnimationFrame(tickConfetti); }
}
function tickConfetti(){
  cctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiParticles.forEach(p=>{
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
    cctx.save();
    cctx.translate(p.x,p.y); cctx.rotate(p.rot*Math.PI/180);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
    cctx.restore();
  });
  confettiParticles = confettiParticles.filter(p=>p.y < innerHeight+40 && p.life<400);
  if(confettiParticles.length>0){ requestAnimationFrame(tickConfetti); }
  else { confettiRunning = false; cctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
}

/* ---------------- Gauge ---------------- */
function renderGauge(markerId, moodId, effRatePct){
  const marker = document.getElementById(markerId);
  const mood = document.getElementById(moodId);
  if(!marker || !mood) return;
  const pos = Math.min(Math.max(effRatePct/35*100, 0), 100);
  marker.style.left = pos+'%';
  let label;
  if(effRatePct<=0) label='ไม่มีภาระภาษี 🎉';
  else if(effRatePct<5) label='เบาหวิว 🙂';
  else if(effRatePct<15) label='กำลังดี 😌';
  else if(effRatePct<25) label='เข้มข้น 😐';
  else label='หนักหน่วง 😅';
  mood.textContent = label + ' · เฉลี่ย ' + effRatePct.toFixed(2) + '%';
}

/* ---------------- Ladder ---------------- */
function renderLadder(containerId, rows){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = rows.map(r=>{
    const active = r.taxable>0;
    const span = r.max===Infinity ? Math.max(r.min*0.4, 1000000) : (r.max-r.min);
    const fillPct = active ? Math.min(r.taxable/span*100, 100) : 0;
    return `<div class="ladder-seg ${active?'active':''}">
      <div class="fill" style="height:${fillPct}%"></div>
      <span class="ladder-rate">${(r.rate*100).toFixed(0)}%</span>
    </div>`;
  }).join('');
}

/* ---------------- Theme toggle ---------------- */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  const isNight = document.documentElement.getAttribute('data-theme')==='night';
  document.documentElement.setAttribute('data-theme', isNight ? 'day' : 'night');
  themeToggle.querySelector('.sun-moon').textContent = isNight ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isNight ? 'โหมดกลางวัน' : 'โหมดกลางคืน';
});

/* ---------------- Print ---------------- */
document.getElementById('printBtn').addEventListener('click', ()=>window.print());

/* ---------------- Quick presets (PIT) ---------------- */
const presetValues = {
  employee:{salaryIncome:420000, otherIncome:0, spouse:false, childCount:0, socialSecurity:9000, lifeIns:20000, healthIns:10000, pvd:25000},
  freelance:{salaryIncome:0, otherIncome:600000, expenseMode:'flat', socialSecurity:0, thaiesg:0, rmf:30000},
  family:{salaryIncome:600000, otherIncome:0, spouse:true, childCount:2, childNewRule:true, parentsCount:2, socialSecurity:9000, lifeIns:50000, healthIns:15000, parentHealthIns:15000, homeInterest:60000},
};
document.querySelectorAll('.preset-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.preset;
    document.querySelectorAll('#panel-pit input[type=number]').forEach(i=>i.value=0);
    document.querySelectorAll('#panel-pit input[type=checkbox]').forEach(i=>i.checked=false);
    document.getElementById('expenseMode').value='flat';
    document.getElementById('actualExpenseRow').style.display='none';
    if(key!=='reset' && presetValues[key]){
      const p = presetValues[key];
      Object.keys(p).forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return;
        if(el.type==='checkbox') el.checked = !!p[id];
        else el.value = p[id];
      });
    }
    calcPIT();
  });
});

function pitBrackets(){
  return [
    {min:0, max:150000, rate:0},
    {min:150000, max:300000, rate:0.05},
    {min:300000, max:500000, rate:0.10},
    {min:500000, max:750000, rate:0.15},
    {min:750000, max:1000000, rate:0.20},
    {min:1000000, max:2000000, rate:0.25},
    {min:2000000, max:5000000, rate:0.30},
    {min:5000000, max:Infinity, rate:0.35},
  ];
}
function corpBrackets(isSme){
  if(isSme){
    return [
      {min:0, max:300000, rate:0},
      {min:300000, max:3000000, rate:0.15},
      {min:3000000, max:Infinity, rate:0.20},
    ];
  }
  return [{min:0, max:Infinity, rate:0.20}];
}
function runBrackets(net, brackets){
  let tax=0; const rows=[];
  brackets.forEach(b=>{
    const taxable = Math.max(0, Math.min(net,b.max)-b.min);
    const t = taxable*b.rate;
    tax += t;
    rows.push({...b, taxable, tax:t});
  });
  return {tax, rows};
}
function renderBreakdown(tbodyEl, rows){
  tbodyEl.innerHTML = rows.map(r=>{
    const label = r.max===Infinity ? `มากกว่า ${fmt(r.min)}` : `${fmt(r.min)} – ${fmt(r.max)}`;
    const cls = r.taxable<=0 ? 'zero' : '';
    return `<tr class="${cls}"><td>${label}</td><td>${(r.rate*100).toFixed(0)}%</td><td class="num">${fmt(r.tax)}</td></tr>`;
  }).join('');
}

/* ---------------- PIT ---------------- */
const expenseModeEl = document.getElementById('expenseMode');
expenseModeEl.addEventListener('change', ()=>{
  document.getElementById('actualExpenseRow').style.display = expenseModeEl.value==='actual' ? 'flex':'none';
  calcPIT();
});

function calcPIT(){
  const salary = num('salaryIncome');
  const otherInc = num('otherIncome');
  const totalIncome = salary + otherInc;

  const expenseSalary = Math.min(salary*0.5, 100000);
  let expenseOther;
  if(expenseModeEl.value==='flat'){ expenseOther = otherInc*0.6; }
  else { expenseOther = Math.min(num('otherExpenseActual'), otherInc); }
  const totalExpense = expenseSalary + expenseOther;

  const personal = 60000;
  const spouse = checked('spouse') ? 60000 : 0;
  const childCount = Math.max(0, Math.floor(num('childCount')));
  const newRule = checked('childNewRule');
  let childDeduction = 0;
  if(childCount>=1){
    childDeduction += 30000; // first child
    if(childCount>1){
      const restRate = newRule ? 60000 : 30000;
      childDeduction += (childCount-1)*restRate;
    }
  }
  const parents = Math.max(0, Math.floor(num('parentsCount')))*30000;
  const disabled = Math.max(0, Math.floor(num('disabledCount')))*60000;

  const socialSecurity = Math.min(num('socialSecurity'), 9000);
  const lifeIns = num('lifeIns');
  const healthIns = Math.min(num('healthIns'), 25000);
  const lifeHealthCombined = Math.min(lifeIns+healthIns, 100000);
  const parentHealthIns = Math.min(num('parentHealthIns'), 15000);

  const retirementGroupRaw = num('pvd') + num('rmf') + num('ssf') + num('annuity');
  const retirementGroup = Math.min(retirementGroupRaw, 500000);

  const thaiesg = Math.min(num('thaiesg'), totalIncome*0.30, 300000);
  const homeInterest = Math.min(num('homeInterest'), 100000);
  const easyReceipt = Math.min(num('easyReceipt'), 50000);
  const donationParty = Math.min(num('donationParty'), 10000);

  const preDonationDeductions = personal+spouse+childDeduction+parents+disabled+socialSecurity+
    lifeHealthCombined+parentHealthIns+retirementGroup+thaiesg+homeInterest+easyReceipt+donationParty;

  const baseForDonation = Math.max(totalIncome - totalExpense - preDonationDeductions, 0);
  const donationCap = baseForDonation*0.10;
  const doubleDonationInput = num('donationDouble');
  const doubleDonationDed = Math.min(doubleDonationInput*2, donationCap);
  const remainCap = Math.max(donationCap - doubleDonationDed, 0);
  const generalDonationDed = Math.min(num('donationGeneral'), remainCap);

  const totalDeductions = preDonationDeductions + doubleDonationDed + generalDonationDed;

  const netIncome = Math.max(totalIncome - totalExpense - totalDeductions, 0);
  const {tax, rows} = runBrackets(netIncome, pitBrackets());
  const effRate = totalIncome>0 ? (tax/totalIncome*100) : 0;

  const prevTax = animState['pitTaxAmount'];
  animateNumber(document.getElementById('pitTaxAmount'), tax, '<small>บาท/ปี</small>');
  document.getElementById('pitStatus').textContent = tax>0 ? 'ประมาณการภาษีที่ต้องชำระทั้งปี' : 'ไม่มีภาษีที่ต้องชำระโดยประมาณ';
  animateNumber(document.getElementById('sumIncome'), totalIncome);
  animateNumber(document.getElementById('sumExpense'), totalExpense);
  animateNumber(document.getElementById('sumDeduction'), totalDeductions);
  animateNumber(document.getElementById('sumNet'), netIncome);
  document.getElementById('sumEffRate').textContent = effRate.toFixed(2)+'%';
  animateNumber(document.getElementById('sumMonthly'), tax/12);
  renderBreakdown(document.querySelector('#pitBreakdown tbody'), rows);
  renderLadder('pitLadder', rows);
  renderGauge('pitGaugeMarker', 'pitGaugeMood', effRate);
  thumpSeal('pitSeal');
  if(prevTax !== undefined && prevTax > 0 && tax === 0 && totalIncome > 0){ burstConfetti(); }
}
document.querySelectorAll('#panel-pit input, #panel-pit select').forEach(el=>{
  el.addEventListener('input', calcPIT);
  el.addEventListener('change', calcPIT);
});

/* ---------------- VAT ---------------- */
let vatRate = 0.07;
document.querySelectorAll('[data-vatrate]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-vatrate]').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    vatRate = parseFloat(btn.dataset.vatrate)/100;
    calcVAT();
  });
});
function calcVAT(){
  const salesInput = num('vatSales');
  const purchaseInput = num('vatPurchase');
  const salesMode = document.getElementById('vatMode').value;
  const purchaseMode = document.getElementById('vatPurchaseMode').value;

  const salesBase = salesMode==='inclusive' ? salesInput/(1+vatRate) : salesInput;
  const outputVat = salesBase*vatRate;
  const purchaseBase = purchaseMode==='inclusive' ? purchaseInput/(1+vatRate) : purchaseInput;
  const inputVat = purchaseBase*vatRate;

  const net = outputVat - inputVat;

  const prevSign = animState['vatSign'];
  animState['vatSign'] = net<0 ? -1 : 1;
  animateNumber(document.getElementById('vatNetAmount'), Math.abs(net), '<small>บาท</small>');
  document.getElementById('vatStatus').textContent = net>=0 ? 'ภาษีมูลค่าเพิ่มที่ต้องชำระ' : 'ภาษีที่ขอคืนได้/ยกยอดได้ 🎉';
  animateNumber(document.getElementById('vatBase'), salesBase);
  animateNumber(document.getElementById('vatOutput'), outputVat);
  animateNumber(document.getElementById('vatPurchaseBase'), purchaseBase);
  animateNumber(document.getElementById('vatInput'), inputVat);
  thumpSeal('vatSeal');
  if(prevSign === 1 && net < 0){ burstConfetti(); }
}
document.querySelectorAll('#panel-vat input, #panel-vat select').forEach(el=>{
  el.addEventListener('input', calcVAT);
  el.addEventListener('change', calcVAT);
});

/* ---------------- Corporate ---------------- */
let corpIsSme = true;
document.querySelectorAll('[data-corptype]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-corptype]').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    corpIsSme = btn.dataset.corptype==='sme';
    calcCorp();
  });
});
function calcCorp(){
  const profit = num('corpProfit');
  const {tax, rows} = runBrackets(profit, corpBrackets(corpIsSme));
  const effRate = profit>0 ? (tax/profit*100) : 0;

  const prevTax = animState['corpTaxAmount'];
  animateNumber(document.getElementById('corpTaxAmount'), tax, '<small>บาท</small>');
  document.getElementById('corpStatus').textContent = tax>0 ? 'ประมาณการภาษีนิติบุคคลที่ต้องชำระ' : 'ไม่มีภาษีที่ต้องชำระโดยประมาณ';
  animateNumber(document.getElementById('corpProfitOut'), profit);
  document.getElementById('corpEffRate').textContent = effRate.toFixed(2)+'%';
  animateNumber(document.getElementById('corpAfterTax'), profit-tax);
  renderBreakdown(document.querySelector('#corpBreakdown tbody'), rows);
  renderLadder('corpLadder', rows);
  thumpSeal('corpSeal');
  if(prevTax !== undefined && prevTax > 0 && tax === 0 && profit > 0){ burstConfetti(); }
}
document.querySelectorAll('#panel-corp input').forEach(el=>{
  el.addEventListener('input', calcCorp);
});

/* ---------------- Taxpayer profile (saved locally) ---------------- */
const pfNameEl = document.getElementById('pfName');
const pfTaxIdEl = document.getElementById('pfTaxId');
function loadProfile(){
  try{
    const saved = JSON.parse(localStorage.getItem('taxpayerProfile') || '{}');
    pfNameEl.value = saved.name || '';
    pfTaxIdEl.value = saved.taxId || '';
  }catch(e){}
  updatePrintProfile();
}
function saveProfile(){
  localStorage.setItem('taxpayerProfile', JSON.stringify({name:pfNameEl.value, taxId:pfTaxIdEl.value}));
  updatePrintProfile();
}
function updatePrintProfile(){
  document.getElementById('printPfName').textContent = pfNameEl.value || 'ไม่ระบุชื่อผู้เสียภาษี';
  document.getElementById('printPfTaxId').textContent = pfTaxIdEl.value || '—';
}
pfNameEl.addEventListener('input', saveProfile);
pfTaxIdEl.addEventListener('input', saveProfile);
loadProfile();

/* ---------------- Panel input snapshot helpers (for history save/restore) ---------------- */
function snapshotPanel(panelId){
  const data = {};
  document.querySelectorAll('#'+panelId+' input, #'+panelId+' select').forEach(el=>{
    if(!el.id) return;
    data[el.id] = el.type==='checkbox' ? el.checked : el.value;
  });
  if(panelId==='panel-vat') data.__vatRate = vatRate;
  if(panelId==='panel-corp') data.__corpIsSme = corpIsSme;
  return data;
}
function restorePanel(panelId, data){
  Object.keys(data).forEach(id=>{
    if(id.startsWith('__')) return;
    const el = document.getElementById(id);
    if(!el) return;
    if(el.type==='checkbox') el.checked = !!data[id];
    else el.value = data[id];
  });
  if(panelId==='panel-vat' && data.__vatRate !== undefined){
    vatRate = data.__vatRate;
    document.querySelectorAll('[data-vatrate]').forEach(b=>{
      b.classList.toggle('on', parseFloat(b.dataset.vatrate)/100 === vatRate);
    });
  }
  if(panelId==='panel-corp' && data.__corpIsSme !== undefined){
    corpIsSme = data.__corpIsSme;
    document.querySelectorAll('[data-corptype]').forEach(b=>{
      b.classList.toggle('on', (b.dataset.corptype==='sme') === corpIsSme);
    });
  }
  document.getElementById('expenseMode') && document.getElementById('expenseMode').dispatchEvent(new Event('change'));
  calcPIT(); calcVAT(); calcCorp();
}

/* ---------------- History system ---------------- */
const HIST_KEY = 'taxHistoryEntries';
const histTypeMeta = {
  pit:{label:'บุคคลธรรมดา', panel:'panel-pit', amountEl:'pitTaxAmount'},
  vat:{label:'VAT', panel:'panel-vat', amountEl:'vatNetAmount'},
  corp:{label:'นิติบุคคล', panel:'panel-corp', amountEl:'corpTaxAmount'},
};
function loadHistory(){
  try{ return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); }
  catch(e){ return []; }
}
function saveHistoryEntries(list){ localStorage.setItem(HIST_KEY, JSON.stringify(list)); }

function saveToHistory(type){
  const meta = histTypeMeta[type];
  const amount = animState[meta.amountEl] || 0;
  const entry = {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,7),
    type, timestamp: Date.now(), amount,
    taxpayer: pfNameEl.value || '',
    inputs: snapshotPanel(meta.panel),
  };
  const list = loadHistory();
  list.unshift(entry);
  saveHistoryEntries(list);
  renderHistory();
  const flash = document.getElementById(type+'SavedFlash');
  if(flash){ flash.classList.add('show'); setTimeout(()=>flash.classList.remove('show'), 1600); }
}
document.querySelectorAll('[data-savehist]').forEach(btn=>{
  btn.addEventListener('click', ()=>saveToHistory(btn.dataset.savehist));
});

let historyFilter = 'all';
document.querySelectorAll('.history-filter').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.history-filter').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    historyFilter = btn.dataset.histfilter;
    renderHistory();
  });
});
function fmtDateTime(ts){
  const d = new Date(ts);
  return d.toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'numeric'}) + ' · ' +
    d.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'});
}
function renderHistory(){
  const list = loadHistory();
  const badge = document.getElementById('historyCountBadge');
  badge.textContent = list.length ? list.length : '';
  const filtered = historyFilter==='all' ? list : list.filter(e=>e.type===historyFilter);
  const container = document.getElementById('historyList');
  if(!filtered.length){
    container.innerHTML = '<div class="history-empty">ยังไม่มีประวัติการคำนวณ — กด "บันทึกลงประวัติ" ที่หน้าคำนวณเพื่อเก็บผลลัพธ์ไว้เปรียบเทียบภายหลัง</div>';
    return;
  }
  container.innerHTML = filtered.map(e=>{
    const meta = histTypeMeta[e.type];
    const unit = e.type==='vat' ? 'บาท' : 'บาท/ปี';
    return `<div class="history-card">
      <span class="history-badge ${e.type}">${meta.label}</span>
      <div class="history-main">
        <div class="history-amount">${fmt(e.amount)} <small style="font-size:11px;color:var(--ink-soft);font-weight:400;">${unit}</small></div>
        <div class="history-meta">${fmtDateTime(e.timestamp)}${e.taxpayer ? ' · '+e.taxpayer : ''}</div>
      </div>
      <div class="history-actions">
        <button type="button" data-restore="${e.id}">โหลดกลับ</button>
        <button type="button" class="danger" data-delhist="${e.id}">ลบ</button>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-restore]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const entry = loadHistory().find(x=>x.id===btn.dataset.restore);
      if(!entry) return;
      const meta = histTypeMeta[entry.type];
      restorePanel(meta.panel, entry.inputs);
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tax-panel').forEach(p=>p.classList.remove('active'));
      document.querySelector('.tab-btn[data-tab="'+entry.type+'"]').classList.add('active');
      document.getElementById(meta.panel).classList.add('active');
    });
  });
  container.querySelectorAll('[data-delhist]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      saveHistoryEntries(loadHistory().filter(x=>x.id!==btn.dataset.delhist));
      renderHistory();
    });
  });
}
document.getElementById('clearHistBtn').addEventListener('click', ()=>{
  if(confirm('ลบประวัติการคำนวณทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')){
    saveHistoryEntries([]);
    renderHistory();
  }
});
document.getElementById('exportCsvBtn').addEventListener('click', ()=>{
  const list = loadHistory();
  if(!list.length){ alert('ยังไม่มีประวัติให้ส่งออก'); return; }
  const header = 'วันที่,ประเภทภาษี,ยอดภาษี (บาท),ผู้เสียภาษี\n';
  const rows = list.map(e=>{
    const meta = histTypeMeta[e.type];
    return `"${fmtDateTime(e.timestamp)}","${meta.label}","${Math.round(e.amount)}","${(e.taxpayer||'').replace(/"/g,'""')}"`;
  }).join('\n');
  const blob = new Blob(['\uFEFF'+header+rows], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ประวัติภาษี.csv'; a.click();
  URL.revokeObjectURL(url);
});

/* ---------------- Tax calendar ---------------- */
function nextOccurrence(month, day, addYearsIfPastMonths){
  // month is 1-12; returns next Date at or after today (compares by date only)
  const today = new Date(); today.setHours(0,0,0,0);
  let year = today.getFullYear();
  let d = new Date(year, month-1, day);
  if(d < today) d = new Date(year+1, month-1, day);
  return d;
}
function nextMonthlyOccurrence(day){
  const today = new Date(); today.setHours(0,0,0,0);
  let d = new Date(today.getFullYear(), today.getMonth(), day);
  if(d < today) d = new Date(today.getFullYear(), today.getMonth()+1, day);
  return d;
}
function daysBetween(d){
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((d-today)/86400000);
}
function thaiDateStr(d){
  return d.toLocaleDateString('th-TH', {day:'numeric', month:'long', year:'numeric'});
}
function buildDeadlines(){
  return [
    {
      title:'ภ.พ.30 — ยื่นแบบภาษีมูลค่าเพิ่มรายเดือน', recurring:'ทุกเดือน',
      desc:'ยื่นและชำระภาษีมูลค่าเพิ่มของเดือนก่อนหน้า ภายในวันที่ 15 ของทุกเดือน (e-Filing ขยายได้ถึงประมาณวันที่ 23)',
      date: nextMonthlyOccurrence(15),
    },
    {
      title:'ภ.ง.ด.1 / 3 / 53 — นำส่งภาษีหัก ณ ที่จ่าย', recurring:'ทุกเดือน',
      desc:'นำส่งภาษีเงินได้หัก ณ ที่จ่ายของเดือนก่อนหน้า ภายในวันที่ 7 ของทุกเดือน (e-Filing ประมาณวันที่ 15)',
      date: nextMonthlyOccurrence(7),
    },
    {
      title:'ภ.ง.ด.94 — ภาษีเงินได้บุคคลธรรมดาครึ่งปี', recurring:'ปีละครั้ง',
      desc:'ยื่นแบบและชำระภาษีสำหรับผู้มีเงินได้ประเภทที่ต้องยื่นครึ่งปี ภายในวันที่ 30 กันยายน',
      date: nextOccurrence(9,30),
    },
    {
      title:'ภ.ง.ด.51 — ภาษีนิติบุคคลกลางปี (ประมาณการ)', recurring:'ปีละครั้ง',
      desc:'ยื่นประมาณการกำไรสุทธิและชำระภาษีนิติบุคคลครึ่งรอบบัญชี (กรณีรอบปีปฏิทิน กำหนดประมาณสิ้นเดือนสิงหาคม)',
      date: nextOccurrence(8,31),
    },
    {
      title:'ภ.ง.ด.90 / 91 — ภาษีเงินได้บุคคลธรรมดาประจำปี', recurring:'ปีละครั้ง',
      desc:'ยื่นแบบแสดงรายการภาษีเงินได้บุคคลธรรมดาประจำปีภาษี ภายในวันที่ 31 มีนาคม (e-Filing ขยายได้ถึงประมาณ 8 เมษายน)',
      date: nextOccurrence(3,31),
    },
    {
      title:'ภ.ง.ด.50 — ภาษีนิติบุคคลประจำปี', recurring:'ปีละครั้ง',
      desc:'ยื่นแบบแสดงรายการและชำระภาษีนิติบุคคลประจำปี ภายใน 150 วันนับจากวันสิ้นรอบบัญชี (กรณีรอบปีปฏิทิน กำหนดประมาณสิ้นเดือนพฤษภาคม)',
      date: nextOccurrence(5,31),
    },
  ].map(x=>{
    const days = daysBetween(x.date);
    let cls = 'later';
    if(days<=7) cls='urgent'; else if(days<=30) cls='soon';
    return {...x, days, cls};
  }).sort((a,b)=>a.days-b.days);
}
function renderCalendar(){
  const deadlines = buildDeadlines();
  const container = document.getElementById('deadlineList');
  container.innerHTML = deadlines.map(d=>`
    <div class="deadline-card ${d.cls}">
      <div class="deadline-days">${d.days}<small>วัน</small></div>
      <div class="deadline-info">
        <div class="deadline-title">${d.title}<span class="deadline-recurring">${d.recurring}</span></div>
        <div class="deadline-desc">${d.desc}</div>
      </div>
      <div class="deadline-date">${thaiDateStr(d.date)}</div>
    </div>
  `).join('');
  return deadlines;
}

/* Browser notifications for near-due deadlines */
const notifyToggleEl = document.getElementById('notifyToggle');
notifyToggleEl.checked = localStorage.getItem('taxNotifyEnabled')==='1';
notifyToggleEl.addEventListener('change', ()=>{
  if(notifyToggleEl.checked && 'Notification' in window){
    Notification.requestPermission().then(perm=>{
      if(perm!=='granted'){ notifyToggleEl.checked=false; }
      localStorage.setItem('taxNotifyEnabled', notifyToggleEl.checked ? '1':'0');
    });
  } else {
    localStorage.setItem('taxNotifyEnabled', notifyToggleEl.checked ? '1':'0');
  }
});
function checkNotifications(deadlines){
  if(localStorage.getItem('taxNotifyEnabled')!=='1') return;
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  const todayKey = new Date().toISOString().slice(0,10);
  const notifiedKey = 'taxNotifiedLog';
  let log;
  try{ log = JSON.parse(localStorage.getItem(notifiedKey)||'{}'); }catch(e){ log={}; }
  deadlines.filter(d=>d.days<=7 && d.days>=0).forEach(d=>{
    const key = d.title+'|'+todayKey;
    if(!log[key]){
      new Notification('ใกล้ครบกำหนดยื่นภาษี', {body:`${d.title} — เหลืออีก ${d.days} วัน (${thaiDateStr(d.date)})`});
      log[key]=true;
    }
  });
  localStorage.setItem(notifiedKey, JSON.stringify(log));
}

/* ICS export */
function toIcsDate(d){
  return d.getFullYear().toString()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
}
document.getElementById('icsExportBtn').addEventListener('click', ()=>{
  const deadlines = buildDeadlines();
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SmoodBanchee Tax//TH//\r\nCALSCALE:GREGORIAN\r\n';
  deadlines.forEach(d=>{
    const dt = toIcsDate(d.date);
    ics += 'BEGIN:VEVENT\r\n';
    ics += `UID:${dt}-${Math.random().toString(36).slice(2,9)}@taxledger\r\n`;
    ics += `DTSTAMP:${toIcsDate(new Date())}T000000Z\r\n`;
    ics += `DTSTART;VALUE=DATE:${dt}\r\n`;
    ics += `SUMMARY:${d.title}\r\n`;
    ics += `DESCRIPTION:${d.desc.replace(/,/g,'\\,')}\r\n`;
    ics += 'BEGIN:VALARM\r\nTRIGGER:-P3D\r\nACTION:DISPLAY\r\nDESCRIPTION:กำหนดยื่นภาษีใกล้ถึงแล้ว\r\nEND:VALARM\r\n';
    ics += 'END:VEVENT\r\n';
  });
  ics += 'END:VCALENDAR\r\n';
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ปฏิทินภาษี.ics'; a.click();
  URL.revokeObjectURL(url);
});

/* ---------------- init ---------------- */
calcPIT(); calcVAT(); calcCorp();
renderHistory();
const initialDeadlines = renderCalendar();
checkNotifications(initialDeadlines);
setInterval(()=>{ const dl = renderCalendar(); checkNotifications(dl); }, 60*60*1000);
