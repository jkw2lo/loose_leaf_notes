/* ═════════ Sheets ═════════ */
let openId=null;
function openSheet(kind,html){const s=$('#scrim');s.dataset.kind=kind;$('#sheet').innerHTML=html;s.hidden=false;document.body.style.overflow='hidden';s.scrollTop=0}
function closeSheet(){FIN=null;if(T.run)tStop(false);$('#scrim').hidden=true;document.body.style.overflow='';openId=null;S=null;TF=null}

/* session detail */
function sessionDetailHTML(b){
  const t=teaById(b.teaId)||{name:b.tea,fam:'other'};const rec=recFor(t,b.style);const r=steepRatio(b,rec);
  return `<div class="sheet-head"><h2 id="sheetTitle"><span class="sh-sub">${fmtLong(b.at)}</span></h2><button class="x" data-a="close" aria-label="Close">×</button></div>
  <div class="sheet-body">
   <div class="d-hero"><span class="cup lg" style="--liq:${liqHex(b.liq||b.steeps[0]?.liq||teaLiq(t))}"></span>
    <div class="d-title"><div class="eyebrow">${famOf(t.fam).name} · ${STYLE[b.style]||''}</div><h2>${esc(t.name)}</h2><div class="sub">${[t.brand,t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}${b.example?' <span class="tg ex">Example</span>':''}</div></div>
    <div class="d-score">${b.rating?`<div class="score">${b.rating}<small>/10</small></div>`:'<div class="score none">Unrated</div>'}</div></div>
   <div class="sec">${setupStrip(b,rec)}
    <div class="guide-line"><span class="lbl">Against the guide</span>${benchHTML('temp',b,rec)}${benchHTML('leaf',b,rec)}${benchHTML('inf',b,rec)}${benchHTML('time',b,rec)}<span class="muted">Typical: ${fmtTR(rec.t,b.style)} · ${fmtGR(rec.g)} in ${rec.ml} ml · ${rec.inf[0]}–${rec.inf[1]} infusions</span></div></div>
   <div class="sec"><div class="sec-title"><h3>Infusion by infusion</h3><span class="aside">${b.steeps.length?'Total '+fmtS(totalSteep(b))+(r!=null?' · bar shows actual, tick shows guide':''):''}</span></div>
    ${b.steeps.length?`${liqStrip(b)}<div class="tline">${b.steeps.map((s,i)=>{const g=rec.sched[i];const mx=Math.max(...b.steeps.map(x=>x.s),...rec.sched.slice(0,b.steeps.length));
     return `<div class="tl-row"><span class="n">${i+1}</span><span class="ldot" style="--liq:${s.liq?liqHex(s.liq):'var(--surface-2)'}" title="${s.liq?LIQM[s.liq]?.n:''}"></span><span class="t">${fmtS(s.s)}</span><span class="gbar"><i style="width:${Math.sqrt(s.s/mx)*100}%"></i>${g?`<b style="left:${Math.min(99,Math.sqrt(g/mx)*100)}%" title="Guide ${fmtS(g)}"></b>`:''}</span><span class="tx">${s.score?pips(s.score):''}${(s.tags||[]).map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</span>${s.note?`<span class="tl-note">${esc(s.note)}</span>`:''}</div>`}).join('')}</div>`:'<p class="sub">No infusions logged.</p>'}</div>
   <div class="sec"><div class="d-cols"><div style="display:grid;gap:10px;min-width:0"><h3>Overall</h3>${sessionTags(b).length?`<div class="tags">${sessionTags(b).map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</div>`:''}${b.notes?`<p class="notes-text">${esc(b.notes)}</p>`:'<p class="sub">No overall notes.</p>'}${b.water?`<dl class="kv"><dt>Water</dt><dd>${esc(b.water)}</dd></dl>`:''}</div><div>${hasAxes(b)?radarSVG([{v:b.axes}],{size:220}):''}</div></div></div>
  </div>
  <div class="sheet-foot"><button class="btn danger" data-a="delSession" data-v="${esc(b.id)}">Delete</button><span style="margin-right:auto"></span>${state.view!=='tea'||state.teaId!==b.teaId?`<button class="btn" data-a="openTea" data-v="${esc(b.teaId)}">Open tea</button>`:''}<button class="btn" data-a="editSession" data-v="${esc(b.id)}">Edit</button><button class="btn primary" data-a="again" data-v="${esc(b.id)}">Brew again</button></div>`;
}
function openSessionDetail(id){const b=store.brews.find(x=>x.id===id);if(!b)return;openId=id;openSheet('session',sessionDetailHTML(b))}

/* tea picker */
function openPicker(){openSheet('picker',`<div class="sheet-head"><h2 id="sheetTitle">Which tea are you brewing?</h2><button class="x" data-a="close" aria-label="Close">×</button></div>
 <div class="sheet-body"><div class="sec" style="border:0;padding-bottom:0"><label class="search">${searchIcon}<input id="pickQ" type="search" placeholder="Search your teas" aria-label="Search your teas"></label>
 <button class="btn" data-a="newTea" data-v="session" style="justify-self:start">＋ A tea not on my shelf</button></div><div id="pickList" class="picker-list"></div></div>`);renderPickList();setTimeout(()=>$('#pickQ')?.focus(),40)}
function renderPickList(){const q=norm($('#pickQ')?.value);const ts=allTeas().filter(t=>!t.finished).filter(t=>!q||norm([t.name,t.brand,t.origin,t.lib].join(' ')).includes(q));
  $('#pickList').innerHTML=FAMS.filter(c=>ts.some(t=>t.fam===c.id)).map(c=>`<div class="picker-cat">${c.name}</div>${ts.filter(t=>t.fam===c.id).map(t=>{const n=brewsOf(t.id).length;return `<button data-a="pickTea" data-v="${esc(t.id)}"><span class="cup sm" style="--liq:${liqHex(teaLiq(t))}"></span><span><span class="pl-name">${esc(t.name)}</span><br><span class="pl-sub">${[t.brand,t.harvest,n?n+' session'+(n>1?'s':''):'no sessions yet'].filter(Boolean).map(esc).join(' · ')}</span></span></button>`}).join('')}`).join('')||'<p class="sub" style="padding:12px">No teas match. Add it as a new tea.</p>'}
