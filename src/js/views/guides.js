/* ═════════ Brewing guides (browse & edit the baseline) ═════════ */
const gKey = tea=>tea?.lib||('fam:'+tea?.fam);
const ovGet = (key,style)=>(store.settings.guideOverrides||{})[key+'|'+style];
const isEdited = key=>Object.keys(store.settings.guideOverrides||{}).some(k=>k.startsWith(key+'|'));
function guideTea(key){if(key.startsWith('fam:'))return{fam:key.slice(4),lib:''};if(key.startsWith('c:')){const c=customType(key.slice(2));return{fam:c?.fam||'other',lib:key}}const L=libByName(key);return{fam:L?.fam||'other',lib:key}}
function gLabel(key){if(key.startsWith('fam:'))return 'Any other '+famOf(key.slice(4)).name.toLowerCase();if(key.startsWith('c:'))return customType(key.slice(2))?.name||'Your type';return key}
function guideListHTML(){
  const q=norm(state.gq);const key=state.gSel;const cts=store.settings.customTypes||[];
  const html=FAMS.map(f=>{const items=[...LIB.filter(t=>t.fam===f.id).map(t=>({k:t.name,n:t.name,a:t.aka})),...cts.filter(c=>c.fam===f.id).map(c=>({k:'c:'+c.id,n:c.name,a:'your type'})),{k:'fam:'+f.id,n:'Any other '+f.name.toLowerCase(),a:''}].filter(i=>!q||norm(i.n+' '+i.a+' '+f.name).includes(q));
    return items.length?`<div class="picker-cat">${f.name}</div>${items.map(i=>`<button class="gl-item" data-a="gSel" data-v="${esc(i.k)}" aria-pressed="${i.k===key}"><span class="gl-n">${esc(i.n)}${i.a?` <span class="muted">${esc(i.a)}</span>`:''}</span>${isEdited(i.k)?'<span class="gl-ed">edited</span>':''}</button>`).join('')}`:''}).join('');
  return html||'<p class="sub" style="padding:10px">No guides match.</p>';
}
function renderGuide(){
  const el=$('#view-guide');if(!state.gSel)state.gSel=LIB[0].name;
  const key=state.gSel;const tea=guideTea(key);const ms=methodsFor(tea);if(!ms.length){state.gSel=LIB[0].name;return renderGuide()}
  const style=ms.some(m=>m.style===state.gStyle)?state.gStyle:ms[0].style;state.gStyle=style;
  const r=recFor(tea,style);const d=methodsFor(tea,{raw:true}).find(m=>m.style===style);const T=typeOf(tea),F=famOf(tea.fam);
  const ed=ovGet(key,style);const shelf=allTeas().filter(t=>gKey(t)===key);
  const hint=(cur,def,txt)=>cur!==def?`<span class="gdef">default ${txt}</span>`:'';
  const focused=document.activeElement?.id==='gq';const caret=focused?document.activeElement.selectionStart:0;
  el.innerHTML=`<div class="page-head"><div><h1>Brewing guides</h1><p>The baseline every session is compared against. Edit any guide to match how you like to brew. Your version is used for suggestions, benchmarks and charts.</p></div></div>
  <div class="gbrowser" data-arr="guides" data-arr-auto>
   <aside class="glist"><label class="search">${searchIcon}<input id="gq" type="search" placeholder="Find a tea type" value="${esc(state.gq)}" aria-label="Find a tea type"></label><div class="gl-scroll" id="glItems">${guideListHTML()}</div></aside>
   <div class="panel gdetail">
    <div class="gd-head"><span class="cup lg" style="--liq:${liqHex(midLiq(r.liqs))}"></span><div style="min-width:0"><div class="eyebrow">${F.name} · ${F.native}</div><h2>${esc(gLabel(key))}</h2><p class="sub">${[T?.aka&&!T.custom?T.aka:null,T?.x.char].filter(Boolean).map(esc).join(' · ')||esc(F.proc)}</p></div></div>
    <div class="tool-row">${ms.length>1?`<div class="seg sm" role="group" aria-label="Method">${ms.map(m=>`<button data-a="gStyle" data-v="${m.style}" aria-pressed="${style===m.style}">${STYLE[m.style]}${ovGet(key,m.style)?' •':''}</button>`).join('')}</div>`:`<span class="chip">${STYLE[style]}</span>`}
     ${ed?'<span class="tg ex">Your version</span><button class="btn sm" data-a="gReset">Reset to default</button>':''}</div>
    <div class="gedit">
     ${noTemp(style)?'':`<label class="lbl" for="ge-t0">Water temperature</label><div class="gin"><input class="input mono" id="ge-t0" data-ge inputmode="numeric" value="${toU(r.t[0])}" aria-label="From">–<input class="input mono" id="ge-t1" data-ge inputmode="numeric" value="${toU(r.t[1])}" aria-label="To"><span>${deg()}</span>${hint(r.t.join(),d.t.join(),fmtTR(d.t))}</div>`}
     <label class="lbl" for="ge-g0">Leaf</label><div class="gin"><input class="input mono" id="ge-g0" data-ge inputmode="decimal" value="${r.g[0]}" aria-label="From">–<input class="input mono" id="ge-g1" data-ge inputmode="decimal" value="${r.g[1]}" aria-label="To"><span>g</span>${hint(r.g.join(),d.g.join(),fmtGR(d.g))}</div>
     <label class="lbl" for="ge-ml">${style==='ice'?'Ice':'Water'}</label><div class="gin"><input class="input mono" id="ge-ml" data-ge inputmode="numeric" value="${r.ml}"><span>${style==='ice'?'g':'ml'}</span>${hint(r.ml,d.ml,d.ml+(style==='ice'?' g':' ml'))}</div>
     <label class="lbl" for="ge-sched">Steep times</label><div class="gin wide"><input class="input mono" id="ge-sched" data-ge value="${esc(r.sched.map(fmtS).join(', '))}" aria-describedby="ge-sched-h">${hint(r.sched.join(),d.sched.join(),d.sched.map(fmtS).join(', '))}</div>
     <label class="lbl" for="ge-i0">Infusions</label><div class="gin"><input class="input mono" id="ge-i0" data-ge inputmode="numeric" value="${r.inf[0]}" aria-label="From">–<input class="input mono" id="ge-i1" data-ge inputmode="numeric" value="${r.inf[1]}" aria-label="To">${hint(r.inf.join(),d.inf.join(),d.inf.join('–'))}</div>
    </div>
    <p class="vnote" id="ge-sched-h">Times like 60s, 1:30 or 8h, separated by commas. Changes save when you leave a field.</p>
    ${guideCards(tea,r,null,'typical')}
    <div class="howto"><h3>How to brew</h3><ol class="steps">${stepsFor(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
    <dl class="kv"><dt>Leaf</dt><dd>${esc(T?.x.leaf||F.leaf)}</dd><dt>Oxidation</dt><dd>${esc(F.ox)}</dd><dt>Processing</dt><dd>${esc(F.proc)}</dd>${T?.origin?`<dt>Origin</dt><dd>${esc(T.origin)}</dd>`:''}</dl>
    <div class="tool-row">${shelf.length?`<span class="sub">On your shelf:</span>${shelf.map(t=>`<button class="chip" data-a="openTea" data-v="${esc(t.id)}">${esc(t.name)}</button>`).join('')}`:''}${libByName(key)?`<button class="btn sm" data-a="libTea" data-v="${esc(key)}">＋ Add ${esc(key)} to my shelf</button>`:''}</div>
   </div>
  </div>`;
  if(focused){const i=$('#gq');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function commitGuide(){
  const key=state.gSel,st=state.gStyle,tea=guideTea(key);const d=methodsFor(tea,{raw:true}).find(m=>m.style===st);if(!d)return;
  const num=id=>{const v=parseFloat($('#'+id)?.value);return isNaN(v)?null:v};const o={};
  if(!noTemp(st)){let a=num('ge-t0'),b=num('ge-t1');if(a!=null&&b!=null){a=clamp(fromU(a),0,100);b=clamp(fromU(b),0,100);const t=[Math.min(a,b),Math.max(a,b)].map(x=>Math.round(x));if(t.join()!==d.t.join())o.t=t}}
  let g0=num('ge-g0'),g1=num('ge-g1');if(g0!=null&&g1!=null&&g0>0){const g=[Math.min(g0,g1),Math.max(g0,g1)];if(g.join()!==d.g.join())o.g=g}
  const ml=num('ge-ml');if(ml>0&&ml!==d.ml)o.ml=Math.round(ml);
  const sc=parseSched($('#ge-sched').value);if(sc.length&&sc.join()!==d.sched.join())o.sched=sc;
  const i0=num('ge-i0'),i1=num('ge-i1');if(i0>0&&i1>0){const inf=[Math.min(i0,i1),Math.max(i0,i1)].map(Math.round);if(inf.join()!==d.inf.join())o.inf=inf}
  const all={...(store.settings.guideOverrides||{})};if(Object.keys(o).length)all[key+'|'+st]=o;else delete all[key+'|'+st];
  store.setSettings({guideOverrides:all});renderGuide();toast(Object.keys(o).length?'Guide updated':'Guide matches the default');
}
