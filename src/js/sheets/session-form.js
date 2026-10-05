/* ═════════ Session form ═════════ */
let S=null;
function blankAxes(){return{aroma:0,sweet:0,body:0,bite:0,finish:0,qi:0}}
function openSessionForm({teaId,brew,mode}){
  const t=teaById(teaId||brew?.teaId);if(!t){openPicker();return}
  if(mode==='edit'){S={...JSON.parse(JSON.stringify(brew)),editing:true,touched:new Set(['g','ml','temp']),open:-1,showAll:{},prev:null}}
  else{
    const style=brew?.style&&methodsFor(t).some(m=>m.style===brew.style)?brew.style:defaultStyle(t);const rec=prodFor(t,style)||recFor(t,style);
    S={id:uid('b'),teaId:t.id,at:new Date().toISOString(),style,g:rec.gT,ml:rec.ml,temp:rec.target,rinse:style==='gongfu'&&rec.rinse>0,steeps:[],rating:0,axes:blankAxes(),notes:'',liq:'',water:brew?.water||'',touched:new Set(),open:-1,showAll:{},prev:brew||brewsOf(t.id).sort((a,b)=>dt(b.at)-dt(a.at))[0]||null};
    if(brew){Object.assign(S,{g:brew.g,ml:brew.ml,temp:brew.temp,rinse:!!brew.rinse,vesselId:brew.vesselId,vesselType:brew.vesselType,vesselName:brew.vesselName});['g','ml','temp'].forEach(k=>S.touched.add(k))}
    else pickDefaultVessel();
  }
  S.target=nextTarget();
  openSheet('form',sessionFormHTML());renderSF();
}
function sTea(){return teaById(S.teaId)}
function sRec(){return recFor(sTea(),S.style)}
function sProd(){return prodFor(sTea(),S.style)}
function pickDefaultVessel(){const rec=sRec();const own=store.settings.vessels;const v=own.find(x=>rec.vessels.includes(x.type))||own[0];if(!v)return;S.vesselId=v.id;S.vesselType=v.type;S.vesselName=v.name}
function nextTarget(){const rec=sProd()||sRec(),n=S.steeps.length;if(rec.sched[n]!=null){const last=S.steeps[n-1];if(last&&rec.sched[n-1]){const k=clamp(last.s/rec.sched[n-1],.6,1.6);return Math.round(rec.sched[n]*(k>1.15||k<.85?k:1))}return rec.sched[n]}const last=S.steeps[n-1]?.s||rec.sched[rec.sched.length-1]||30;return Math.round(last*1.35)}
const tStep = s=>s<20?1:s<60?5:s<600?15:s<3600?60:1800;
function sessionFormHTML(){
  const t=sTea();const T=typeOf(t);
  return `<div class="sheet-head"><div style="min-width:0"><h2 id="sheetTitle">${esc(t.name)}</h2><span class="sh-sub">${S.editing?'Editing session':'New session'} · ${famOf(t.fam).name}${T&&norm(T.name)!==norm(t.name)?' · '+esc(T.name):''}</span></div><button class="x" data-a="close" aria-label="Close">×</button></div>
  <form class="sheet-body sform" id="sForm" autocomplete="off" novalidate>
   <section class="scard">
    <div class="scard-head"><h3><span class="snum">1</span>Setup</h3><div class="seg sm" role="group" aria-label="Method" id="sf-style"></div></div>
    <div id="sf-visual" class="strip-click" data-a="openAdjust" title="Adjust setup"></div>
    <div class="plan" id="sf-plan"></div>
    <div class="adjust" id="sf-adjust" ${S.adjust?'':'hidden'}>
     <div class="field"><div class="sec-title"><span class="lbl">Teaware</span><button type="button" class="linkbtn" data-a="manageWare" style="font-size:12.5px">Manage teaware</button></div><div class="vpick" id="sf-vessels"></div><div class="vnote" id="sf-vnote"></div></div>
     <div class="dials" id="sf-dials"></div>
     <div id="sf-temp"></div>
    </div>
   </section>
   <section class="scard">
    <div class="scard-head"><h3><span class="snum">2</span>Steep</h3><label class="toggle"><input type="checkbox" id="sf-rinse" ${S.rinse?'checked':''}> Rinsed first</label></div>
    <div class="srows" id="sf-steeps"></div>
    <div id="sf-now"></div>
    <div class="guide-line muted" id="sf-guide"></div>
   </section>
   <section class="scard">
    <div class="scard-head"><h3><span class="snum">3</span>How was it?</h3><span class="aside">optional</span></div>
    <div class="rating" id="sf-rating"></div><div class="rating-scale"><span>Not for me</span><span>Solid</span><span>Exceptional</span></div>
    <textarea class="textarea" id="sf-notes" rows="3" placeholder="Notes on the whole session: how it opened up, the water you used, what to change next time" aria-label="Session notes">${esc(S.notes||'')}</textarea>
    <details class="mini"><summary>Palate profile</summary>
     <div class="palate"><div class="axes">${AXES.map(([k,lab,sub])=>`<label class="axis" for="ax-${k}"><span>${lab}${sub?`<small>${sub}</small>`:''}</span><input type="range" id="ax-${k}" data-axis="${k}" min="0" max="5" step="1" value="${S.axes[k]||0}"><output id="axo-${k}">${S.axes[k]||'–'}</output></label>`).join('')}</div><div class="radar-wrap" id="sf-radar">${radarSVG([{v:S.axes}],{size:190})}</div></div></details>
    <details class="mini"><summary>Date &amp; time</summary>
     <div class="field" style="max-width:280px"><label class="lbl" for="sf-at">Brewed at</label><input class="input" type="datetime-local" id="sf-at" value="${toLocalInput(S.at)}"></div></details>
   </section>
  </form>
  <div class="sheet-foot"><span class="hint" id="sfHint"></span><button class="btn ghost" data-a="close">Cancel</button><button class="btn primary" data-a="saveSession">${S.editing?'Save changes':'Save session'}</button></div>`;
}
function renderSF(){rStyle();rVisual();rPlan();rVessels();rDials();rTemp();rGuide();rSteeps();rNow();rRating()}
function rStyle(){const ms=methodsFor(sTea()).map(m=>m.style);if(!ms.includes(S.style))ms.push(S.style);$('#sf-style').innerHTML=ms.length>1?ms.map(k=>`<button type="button" data-a="sStyle" data-v="${k}" aria-pressed="${S.style===k}" title="${STYLE_DESC[k]||''}">${STYLE[k]||k}</button>`).join(''):`<span class="chip">${STYLE[S.style]}</span>`}
function rVessels(){const rec=sRec();const own=store.settings.vessels;
  $('#sf-vessels').innerHTML=own.map(v=>`<button type="button" class="vtile" data-a="sVessel" data-v="${esc(v.id)}" aria-pressed="${S.vesselId===v.id}">${rec.vessels.includes(v.type)?'<span class="rec">Rec.</span>':''}${vesselSVG(v.type)}<span class="vn">${esc(v.name)}</span><span class="vm">${v.ml} ml</span></button>`).join('')+`<button type="button" class="vtile add" data-a="manageWare">＋ Add teaware</button>`;
  const has=own.some(v=>rec.vessels.includes(v.type));
  $('#sf-vnote').innerHTML=has?'':`Recommended: ${rec.vessels.map(v=>VT[v].name).join(', ')}. None are in your teaware, so pick the closest you have.`}
function rDials(){const rec=sRec();
  $('#sf-dials').innerHTML=`<div class="dial"><label class="lbl" for="sf-g">Leaf</label><div class="dial-row"><button type="button" class="step" data-a="sStep" data-v="g:-0.5" aria-label="Less leaf">−</button><input id="sf-g" inputmode="decimal" value="${S.g}"><span class="u">g</span><button type="button" class="step" data-a="sStep" data-v="g:0.5" aria-label="More leaf">+</button></div><div class="rng">guide ${r1(rec.per[0]*S.ml/100)}–${r1(rec.per[1]*S.ml/100)} g for ${S.ml} ml</div></div>
  <div class="dial"><label class="lbl" for="sf-ml">${S.style==='ice'?'Ice':'Water'}</label><div class="dial-row"><button type="button" class="step" data-a="sStep" data-v="ml:-10" aria-label="Less water">−</button><input id="sf-ml" inputmode="numeric" value="${S.ml}"><span class="u">${S.style==='ice'?'g':'ml'}</span><button type="button" class="step" data-a="sStep" data-v="ml:10" aria-label="More water">+</button></div><div class="rng">guide ${rec.ml} ${S.style==='ice'?'g':'ml'}${vesselOf(S).ml?` · vessel holds ${vesselOf(S).ml} ml`:''}</div></div>`}
function rPlan(){
  const rec=sRec(),pr=sProd(),t=sTea();const p=per100(S);
  const same=r=>r&&Math.abs(r.gT-S.g)<.01&&r.ml===S.ml&&(noTemp(S.style)||Math.round(r.target)===Math.round(S.temp));
  const prev=S.prev&&S.prev.style===S.style&&!S.editing?S.prev:null;
  const sameP=prev&&prev.g===S.g&&prev.ml===S.ml&&(noTemp(S.style)||prev.temp===S.temp);
  const gl=rec.edited?'your guide':'the typical guide';const brand=esc(t.brand||'the producer');
  const status=same(pr)?`✓ Following ${brand}’s recipe`:same(rec)?`✓ Following ${gl}`:sameP?'✓ Same as last time':'Your own setup';
  const opt=(a,label,r)=>`<button type="button" class="chip opt" data-a="${a}"><b>${label}</b> ${r.g} g · ${r.ml} ml · ${fmtT(r.temp,S.style)}</button>`;
  const opts=[!same(rec)?opt('useSugg',rec.edited?'Your guide':'Typical',{g:rec.gT,ml:rec.ml,temp:rec.target}):'',pr&&!same(pr)?opt('useProd',brand+'’s',{g:pr.gT,ml:pr.ml,temp:pr.target}):'',prev&&!sameP?opt('useLast','Last time'+(prev.rating?' ('+prev.rating+')':''),prev):''].join('');
  $('#sf-plan').innerHTML=`<div class="plan-row"><span class="plan-status ${status.startsWith('✓')?'ok':''}">${status}</span><span class="mono muted plan-ratio">${ratioStr(S)} · ${p??'—'} g/100 ml</span><button type="button" class="btn sm ${S.adjust?'':'primary-soft'}" data-a="toggleAdjust" aria-expanded="${!!S.adjust}">${S.adjust?'Done':'Adjust'}</button></div>${opts?`<div class="plan-opts"><span class="muted">Switch to</span>${opts}</div>`:''}`;
}
const rRatio = ()=>rPlan();
function rVisual(){$('#sf-visual').innerHTML=setupStrip({...S},sRec())}
function rGuide(){const rec=sRec(),pr=sProd();$('#sf-guide').innerHTML=`<span>${rec.edited?'Your guide':'Guide'}: ${rec.inf[0]===rec.inf[1]?rec.inf[0]+' infusion'+(rec.inf[0]>1?'s':''):rec.inf[0]+'–'+rec.inf[1]+' infusions'}</span><span class="sched">${rec.sched.map((s,i)=>`<span><i>${i+1}</i>${fmtS(s)}</span>`).join('')}</span>${pr&&pr.sched.join()!==rec.sched.join()?`<span>Producer:</span><span class="sched prod">${pr.sched.map((s,i)=>`<span><i>${i+1}</i>${fmtS(s)}</span>`).join('')}</span>`:''}`}
function rRating(){const r=S.rating;$('#sf-rating').innerHTML=Array.from({length:10},(_,i)=>`<button type="button" data-a="sRate" data-v="${i+1}" class="${r===i+1?'sel':r>i+1?'on':''}" aria-pressed="${r===i+1}">${i+1}</button>`).join('')}

/* temperature control */
function rTemp(){
  const el=$('#sf-temp');const rec=sRec();const mode=store.settings.tempMode;
  if(noTemp(S.style)){el.innerHTML=`<div class="temp-box"><div class="cold-note"><div style="width:40px;height:56px">${thermoSVG(3,null,S.style)}</div>${S.style==='ice'?'Ice brew uses melting ice, no heat. Set the amount of ice above.':'Cold brew steeps in the fridge, around 4°C (39°F). No temperature to set.'}</div></div>`;return}
  const head=`<div class="temp-head"><span class="lbl">Water temperature</span><div class="seg sm" role="group" aria-label="Input style">${TEMP_MODES.map(([id,n])=>`<button type="button" data-a="tMode" data-v="${id}" aria-pressed="${mode===id}">${n}</button>`).join('')}</div></div>`;
  let body='';
  if(mode==='dial')body=`<svg class="dial-svg" id="tdial" viewBox="0 0 240 230" role="slider" tabindex="0" aria-label="Water temperature" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(S.temp)}">${dialInner()}</svg>`;
  else if(mode==='steps')body=`<div class="temp-steps"><button type="button" class="step" data-a="tAdj" data-v="-5">−5</button><button type="button" class="step" data-a="tAdj" data-v="-1">−1</button><span class="temp-read" id="tRead">${toU(S.temp)}<small>${deg()}</small></span><button type="button" class="step" data-a="tAdj" data-v="1">+1</button><button type="button" class="step" data-a="tAdj" data-v="5">+5</button></div><div class="temp-rng" style="text-align:center">Typical ${fmtTR(rec.t)} · <button type="button" class="linkbtn" data-a="tSet" data-v="${rec.target}">reset to ${toU(rec.target)}°</button></div>`;
  else if(mode==='scale'){const vals=unitF()?[32,...Array.from({length:18},(_,i)=>40+i*10),212]:Array.from({length:21},(_,i)=>i*5);const cur=toU(S.temp);
    body=`<div class="temp-scale">${vals.map(v=>{const c=fromU(v);const inr=c>=rec.t[0]-.01&&c<=rec.t[1]+.01;return `<button type="button" data-a="tSet" data-v="${c}" class="${inr?'inrec':''}" aria-pressed="${cur===v}">${v}°</button>`}).join('')}</div><div class="temp-rng">Highlighted: typical range ${fmtTR(rec.t)}. Current <b class="mono">${toU(S.temp)}${deg()}</b></div>`}
  else body=`<div class="temp-type"><input id="tType" inputmode="numeric" value="${toU(S.temp)}" aria-label="Water temperature"><span class="temp-read"><small>${deg()}</small></span></div><div class="temp-rng" style="text-align:center">Typical ${fmtTR(rec.t)}, suggested ${toU(rec.target)}${deg()}</div>`;
  el.innerHTML=`<div class="temp-box">${head}${body}</div>`;
}
const D={cx:120,cy:118,R:90,a0:135,sw:270};
function dPt(v,r=D.R){const a=(D.a0+clamp(v,0,100)/100*D.sw)*Math.PI/180;return[D.cx+Math.cos(a)*r,D.cy+Math.sin(a)*r]}
function dArc(v0,v1,r=D.R){const[x0,y0]=dPt(v0,r),[x1,y1]=dPt(v1,r);const large=(v1-v0)/100*D.sw>180?1:0;return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
function dialInner(){const rec=sRec();const v=clamp(S.temp,0,100);let tk='';
  for(let i=0;i<=100;i+=5){const[x0,y0]=dPt(i,D.R-14),[x1,y1]=dPt(i,D.R-(i%25?19:23));tk+=`<line class="tk" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`}
  [0,25,50,75,100].forEach(i=>{const[x,y]=dPt(i,D.R-33);tk+=`<text x="${x}" y="${y+4}" text-anchor="middle">${toU(i)}</text>`});
  const[tx,ty]=dPt(v);const band=rec.t[0]===rec.t[1]?[rec.t[0]-1,rec.t[1]+1]:rec.t;
  return `<path class="trk" d="${dArc(0,100)}"/><path class="rband" d="${dArc(band[0],band[1])}"/><path class="rband-edge" d="${dArc(band[0],band[1],D.R+9)}"/>${tk}
   ${v>0.5?`<path class="val" d="${dArc(0,v)}"/>`:''}<circle class="thumb" cx="${tx}" cy="${ty}" r="11"/>
   <text class="big" x="${D.cx}" y="${D.cy+8}" text-anchor="middle">${toU(v)}<tspan class="u">${deg()}</tspan></text>
   <text class="rtxt" x="${D.cx}" y="${D.cy+30}" text-anchor="middle">typical ${fmtTR(rec.t)}</text>
   <text class="rtxt" x="${D.cx}" y="${D.cy+46}" text-anchor="middle" style="fill:var(--ink-3);font-weight:500">${stage(v)}</text>`}
function setTemp(c){S.temp=clamp(r1(c),0,100);S.touched.add('temp');
  const d=$('#tdial');if(d){d.innerHTML=dialInner();d.setAttribute('aria-valuenow',Math.round(S.temp))}
  if($('#tRead'))$('#tRead').innerHTML=`${toU(S.temp)}<small>${deg()}</small>`;
  if(store.settings.tempMode==='scale')rTemp();
  rRatio();rVisual()}
function dialFromEvent(e){const svg=$('#tdial');const r=svg.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*240,y=(e.clientY-r.top)/r.height*230;
  const a=Math.atan2(y-D.cy,x-D.cx)*180/Math.PI;let d=(a-D.a0+720)%360;if(d>D.sw)d=d>D.sw+45?0:D.sw;const c=d/D.sw*100;
  setTemp(unitF()?fromU(Math.round(toU(c))):Math.round(c))}

/* infusions */
function rSteeps(){const rec=sRec();const mx=Math.max(...S.steeps.map(s=>s.s),...rec.sched.slice(0,Math.max(1,S.steeps.length)),1);
  $('#sf-steeps').innerHTML=S.steeps.map((s,i)=>{const g=rec.sched[i];const open=S.open===i;
   return `<div class="srow ${open?'open':''}"><button type="button" class="srow-sum" data-a="sOpen" data-v="${i}" aria-expanded="${open}"><span class="sn">${i+1}</span><span class="ldot" style="--liq:${s.liq?liqHex(s.liq):'var(--surface-2)'}"></span><span class="st">${fmtS(s.s)}</span><span class="gbar"><i style="width:${Math.sqrt(s.s/mx)*100}%"></i>${g?`<b style="left:${Math.min(99,Math.sqrt(g/mx)*100)}%" title="Typical ${fmtS(g)}"></b>`:''}</span><span class="sx">${s.score?pips(s.score):''}${(s.tags||[]).slice(0,2).map(t=>`<span class="tg">${esc(t)}</span>`).join('')}${s.note?'<span>✎</span>':''}<span>${open?'▴':'▾'}</span></span></button>${open?steepPanel(i):''}</div>`}).join('')}
function steepPanel(i){const s=S.steeps[i];const rec=sRec();const t=sTea();const c=famOf(t.fam);
  const sessTags=[...new Set(S.steeps.flatMap(x=>x.tags||[]))];const quick=[...new Set([...sessTags,...c.common])];
  return `<div class="srow-panel">
   <div class="row"><span class="lbl">Time</span><button type="button" class="step" data-a="stTime" data-v="${i}:-1">−</button><input class="input mono" id="st-time-${i}" data-st="time" data-i="${i}" value="${fmtS(s.s)}" style="width:96px;text-align:center"><button type="button" class="step" data-a="stTime" data-v="${i}:1">+</button>${rec.sched[i]?`<span class="muted" style="font-size:12.5px">typical ${fmtS(rec.sched[i])}</span>`:''}<button type="button" class="linkbtn danger-link" data-a="stRemove" data-v="${i}" style="margin-left:auto">Remove</button></div>
   <div class="field"><span class="lbl">Colour</span>${liqPicker(s.liq,rec.liqs,'stLiq',i,S.showAll['l'+i],typeOf(t)?.name||c.name)}</div>
   <div class="row"><span class="lbl">This cup</span><div class="cupscore">${[1,2,3,4,5].map(n=>`<button type="button" data-a="stScore" data-v="${i}:${n}" class="${s.score===n?'sel':s.score>n?'on':''}" aria-label="${n} of 5">${n}</button>`).join('')}</div><span class="muted" style="font-size:12.5px">${['','thin','fine','good','lovely','peak'][s.score||0]}</span></div>
   <div class="field"><span class="lbl">Flavours & aromas</span>
    <div class="chips">${quick.map(tg=>`<button type="button" class="chip tag" data-a="stTag" data-v="${i}" data-tag="${esc(tg)}" aria-pressed="${(s.tags||[]).includes(tg)}">${esc(tg)}</button>`).join('')}<button type="button" class="chip" data-a="stAllTags" data-v="${i}">${S.showAll['t'+i]?'Fewer':'All flavours…'}</button></div>
    ${S.showAll['t'+i]?`<div class="tag-groups" style="margin-top:6px">${FLAVORS.map(([g,ts])=>`<div class="tag-group"><span>${g}</span><div class="chips">${ts.map(tg=>`<button type="button" class="chip tag" data-a="stTag" data-v="${i}" data-tag="${esc(tg)}" aria-pressed="${(s.tags||[]).includes(tg)}">${tg}</button>`).join('')}</div></div>`).join('')}</div>`:''}
    <div class="row"><input class="input" id="st-ctag-${i}" data-st="ctag" data-i="${i}" placeholder="Add your own flavour" style="max-width:220px;padding:6px 10px"><button type="button" class="btn sm" data-a="stAddTag" data-v="${i}">Add</button>${(s.tags||[]).filter(x=>!quick.includes(x)&&!FLAVORS.some(f=>f[1].includes(x))).map(x=>`<button type="button" class="chip tag" data-a="stTag" data-v="${i}" data-tag="${esc(x)}" aria-pressed="true">${esc(x)}</button>`).join('')}</div>
   </div>
   <div class="field"><label class="lbl" for="st-note-${i}">Note</label><input class="input" id="st-note-${i}" data-st="note" data-i="${i}" value="${esc(s.note||'')}" placeholder="What changed in this cup?"></div>
  </div>`}
function liqPicker(sel,typical,act,i,all,teaNm){
  return `<div class="liq-pick"><div class="liq-typ">${typical.map(id=>`<button type="button" class="sw" style="--c:${liqHex(id)}" data-a="${act}" data-v="${i}" data-liq="${id}" aria-pressed="${sel===id}" title="${LIQM[id].n}" aria-label="${LIQM[id].n}"></button>`).join('')}<span class="liq-name">${sel?`<b>${LIQM[sel].n}</b>${typical.includes(sel)?'':' · outside the typical range'}`:'Typical for '+esc(teaNm)}</span><button type="button" class="linkbtn" data-a="liqAll" data-v="${i}" style="font-size:12.5px;margin-left:auto">${all?'Hide spectrum':'Full spectrum'}</button></div>
  ${all?`<div class="spectrum">${LIQ.map(([id,n,h])=>`<span class="cellw ${typical.includes(id)?'typ':''}"><button type="button" class="sw s" style="--c:${h}" data-a="${act}" data-v="${i}" data-liq="${id}" aria-pressed="${sel===id}" title="${n}" aria-label="${n}"></button><i></i></span>`).join('')}</div><span class="vnote">Underlined: typical range for this tea.</span>`:''}</div>`}
function rNow(){
  const el=$('#sf-now');const n=S.steeps.length+1;const rec=sRec();const run=T.run;const C=2*Math.PI*62;
  el.innerHTML=`<div class="now ${run?'running':''}" id="nowBox">
   <svg class="ring" viewBox="0 0 150 150" aria-hidden="true"><circle class="rt" cx="75" cy="75" r="62"/><circle class="rp" id="ringP" cx="75" cy="75" r="62" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 75 75)"/>
    <text class="rbig" id="ringT" x="75" y="80" text-anchor="middle">${fmtClock(S.target)}</text><text class="rsub" id="ringS" x="75" y="102" text-anchor="middle">${run?'steeping':'target'}</text></svg>
   <div class="now-ctrl"><h4>Infusion ${n}${n===1&&S.rinse?' <span class="muted" style="font-size:13px;font-family:var(--f-body);font-weight:500">after rinse</span>':''}</h4>
    ${run?`<p class="sub">Pour off when the ring completes. Stopping logs the actual time.</p><div class="tool-row"><button type="button" class="btn primary lg" data-a="tStop">Stop & log</button><button type="button" class="btn ghost" data-a="tCancel">Cancel</button></div>`
    :`<div class="tgt"><span class="lbl">Target</span><button type="button" class="step" data-a="tgtAdj" data-v="-1">−</button><input id="tgtIn" value="${fmtS(S.target)}" aria-label="Target steep time"><button type="button" class="step" data-a="tgtAdj" data-v="1">+</button><span class="muted" style="font-size:12.5px">${rec.sched[n-1]?'typical '+fmtS(rec.sched[n-1]):'past the typical schedule'}</span></div>
     <div class="tool-row"><button type="button" class="btn primary lg" data-a="tStart">▶ Start</button><button type="button" class="linkbtn" data-a="logNoTimer">or log ${fmtS(S.target)} without timing</button></div>`}
   </div></div>`;
  if(run)tTick();
}

/* timer */
const T={run:false,t0:0,target:0,iv:null,chimed:false,ctx:null,lock:null};
function tStart(){T.run=true;T.t0=performance.now();T.target=S.target;T.chimed=false;
  try{T.ctx=T.ctx||new (window.AudioContext||window.webkitAudioContext)();T.ctx.resume?.()}catch{}
  try{navigator.wakeLock?.request('screen').then(l=>T.lock=l).catch(()=>{})}catch{}
  T.iv=setInterval(tTick,100);rNow()}
const tElapsed=()=>(performance.now()-T.t0)/1000;
function tTick(){if(!T.run)return;const e=tElapsed();const C=2*Math.PI*62;const p=$('#ringP'),tt=$('#ringT'),ss=$('#ringS'),box=$('#nowBox');if(!p)return;
  const rem=T.target-e;p.setAttribute('stroke-dashoffset',C*(1-clamp(e/T.target,0,1)));
  if(rem>0){tt.textContent=fmtClock(Math.ceil(rem));ss.textContent='steeping · '+fmtS(Math.floor(e))}else{tt.textContent='+'+fmtClock(-rem);ss.textContent='pour now · '+fmtS(Math.floor(e));box.classList.add('over')}
  if(!T.chimed&&e>=T.target){T.chimed=true;chime()}}
function tStop(log){clearInterval(T.iv);const e=Math.max(1,Math.round(tElapsed()));T.run=false;try{T.lock?.release()}catch{}T.lock=null;if(log)logSteep(e);else if(S)rNow()}
function chime(){try{const c=T.ctx;if(!c)return;[0,.22,.44].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=i===2?1046:784;o.connect(g);g.connect(c.destination);const t=c.currentTime+d;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.start(t);o.stop(t+.45)})}catch{}try{navigator.vibrate?.([120,80,120])}catch{}}
function logSteep(sec){const rec=sRec();const prev=S.steeps[S.steeps.length-1];
  S.steeps.push({s:sec,liq:prev?.liq||midLiq(rec.liqs),score:0,tags:[],note:''});S.open=S.steeps.length-1;S.target=nextTarget();
  rSteeps();rNow();rVisual();toast(`Infusion ${S.steeps.length} logged: ${fmtS(sec)}`);
  setTimeout(()=>{if(S)$$('.srow')[S.open]?.scrollIntoView({block:'nearest',behavior:'smooth'})},30)}
function readSF(){const v=id=>$('#'+id)?.value.trim()??'';S.notes=$('#sf-notes').value;S.rinse=$('#sf-rinse').checked;const at=v('sf-at');if(at){const d=new Date(at);if(!isNaN(d))S.at=d.toISOString()}}
async function saveSession(){
  readSF();if(T.run)tStop(true);
  const t=sTea();const v=vesselOf(S);
  const b={teaId:t.id,tea:t.name,cat:t.fam,at:S.at,style:S.style,vesselId:S.vesselId||'',vesselType:v.type,vesselName:v.name,g:+S.g||0,ml:+S.ml||0,temp:noTemp(S.style)?null:+S.temp,rinse:!!S.rinse,
    steeps:S.steeps.map(s=>({s:s.s,liq:s.liq||'',score:s.score||0,tags:s.tags||[],note:s.note||''})),rating:S.rating||0,axes:S.axes,notes:S.notes||'',water:S.water||'',liq:S.steeps[0]?.liq||'',tags:[...new Set(S.steeps.flatMap(s=>s.tags||[]))],id:S.id};
  if(S.editing&&S.example)b.example=true;
  const btn=$('[data-a="saveSession"]');btn.disabled=true;btn.textContent='Saving…';
  try{await store.saveBrew(b);const wasEdit=S.editing;closeSheet();toast(wasEdit?'Changes saved':'Session saved');if(state.view!=='tea'||state.teaId!==t.id)setView('tea',{teaId:t.id});else renderTea()}
  catch(e){btn.disabled=false;btn.textContent=S.editing?'Save changes':'Save session';$('#sfHint').textContent=e?.code==='quota_exceeded'?'Storage is full. Delete some old sessions to make room.':'Could not save. Check your connection and try again.'}
}
