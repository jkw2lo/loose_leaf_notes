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
    <textarea class="textarea" id="sf-notes" rows="3" placeholder="Notes on the whole session" aria-label="Session notes">${esc(S.notes||'')}</textarea>
    <details class="mini"><summary>Palate profile</summary>
     <div class="palate"><div class="axes">${AXES.map(([k,lab,sub])=>`<label class="axis" for="ax-${k}"><span>${lab}${sub?`<small>${sub}</small>`:''}</span><input type="range" id="ax-${k}" data-axis="${k}" min="0" max="5" step="1" value="${S.axes[k]||0}"><output id="axo-${k}">${S.axes[k]||'–'}</output></label>`).join('')}</div><div class="radar-wrap" id="sf-radar">${radarSVG([{v:S.axes}],{size:190})}</div></div></details>
    <details class="mini"><summary>Water &amp; time</summary>
     <div class="grid2"><div class="field"><label class="lbl" for="sf-water">Water</label><input class="input" id="sf-water" list="waters" value="${esc(S.water||'')}" placeholder="Spring, filtered, low-TDS…"></div>
      <div class="field"><label class="lbl" for="sf-at">Brewed at</label><input class="input" type="datetime-local" id="sf-at" value="${toLocalInput(S.at)}"></div></div>
     <datalist id="waters">${['Filtered','Spring','Low-TDS bottled','Remineralized','Tap'].map(v=>`<option value="${v}">`).join('')}</datalist></details>
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
