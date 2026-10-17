/* ═════════ Setup guide ═════════
   A few steps for a new notebook: the teaware you brew with, units and which home page you want, then your first tea.
   It opens by itself on a first visit (never set up, no teas, no sessions) and again from Settings → Setup guide.
   Nothing is saved until Finish; Skip setup only remembers that you've seen it. */
let SU=null;
const SU_STEPS=[['welcome','Welcome'],['ware','Teaware'],['prefs','Units & home'],['tea','First tea']];
function openSetup({first}={}){const s=store.settings;
  SU={i:0,first:!!first,vessels:first?[]:s.vessels.map(v=>({...v})),unit:s.unit==='F'?'F':'C',home:s.homeLayout==='brew'?'brew':'shelf'};
  openSheet('setup',setupHTML())}
function maybeSetup(){if(maybeSetup.done||store.mode==='pending')return;maybeSetup.done=true;
  if(!store.settings.setupDone&&!store.teas.length&&!store.brews.length&&$('#scrim').hidden)openSetup({first:true})}
const suRender = ()=>{$('#sheet').innerHTML=setupHTML();$('#scrim').scrollTop=0};

function setupHTML(){const [id]=SU_STEPS[SU.i],last=SU.i===SU_STEPS.length-1;const need=id==='ware'&&!SU.vessels.length;
  return `<div class="sheet-head"><h2 id="sheetTitle">${SU.first?'Set up your notebook':'Setup guide'} <span class="sh-sub">Step ${SU.i+1} of ${SU_STEPS.length}</span></h2><button type="button" class="btn ghost sm" data-a="suSkip">${SU.first?'Skip setup':'Close'}</button></div>
  <ol class="su-prog" aria-label="Steps">${SU_STEPS.map(([,lab],i)=>`<li class="${i<SU.i?'done':i===SU.i?'cur':''}" ${i===SU.i?'aria-current="step"':''}><span>${i<SU.i?'✓':i+1}</span>${lab}</li>`).join('')}</ol>
  <div class="sheet-body su-body">${({welcome:suWelcome,ware:suWare,prefs:suPrefs,tea:suTea})[id]()}</div>
  <div class="sheet-foot"><span class="hint su-hint">${need?'Pick at least one piece of teaware to carry on.':''}</span>${SU.i?'<button type="button" class="btn ghost" data-a="suBack">Back</button>':''}
   ${last?'<button type="button" class="btn primary" data-a="suFinish">Finish</button>':`<button type="button" class="btn primary" data-a="suNext" ${need?'disabled':''}>${SU.i?'Next':'Let’s start'}</button>`}</div>`}
function suWelcome(){
  return `<div class="su-hero">${['gaiwan','kyusu','porcelain','chawan'].map(vesselSVG).join('')}</div>
   <h3 class="su-h">Welcome to Loose Leaf Notes</h3>
   <p class="su-p">A notebook for the teas you own: a brewing guide for each one, a timer for every steep, and tasting notes you can look back on.</p>
   <ol class="su-list"><li><b>Your teaware.</b> Only what you own shows up when you brew.</li><li><b>Units and your home page.</b> Celsius or Fahrenheit, and what you see first.</li><li><b>Your first tea.</b> Add one from your cupboard, or do it later.</li></ol>
   <p class="su-p muted">It takes about a minute. You can change all of it later in Settings.</p>`}
function suWare(){const has=new Set(SU.vessels.map(v=>v.type));
  return `<h3 class="su-h">What do you brew with?</h3>
   <p class="su-p">Pick everything you own. Only these appear when you log a brew, and each one’s size fills in the water amount.</p>
   <div class="vpick su-pick" role="group" aria-label="Teaware">${VTYPES.map(v=>`<button type="button" class="vtile" data-a="suWare" data-v="${v.id}" aria-pressed="${has.has(v.id)}">${has.has(v.id)?'<span class="rec">✓</span>':''}${vesselSVG(v.id)}<span class="vn">${v.name}</span><span class="vm">~${v.ml} ml</span></button>`).join('')}</div>
   ${SU.vessels.length?`<div class="su-sub"><span class="lbl">Your teaware · ${SU.vessels.length}</span><span class="muted">Rename them or set their real size.</span></div>
    <div class="ware">${SU.vessels.map(v=>`<div class="ware-item">${vesselSVG(v.type)}<div class="wf"><input data-su="name" data-id="${esc(v.id)}" value="${esc(v.name)}" aria-label="Name"><div class="mlrow"><input data-su="ml" data-id="${esc(v.id)}" inputmode="numeric" value="${v.ml}" aria-label="Capacity in ml"> ml · ${VT[v.type]?.name||''}</div></div><button type="button" class="rm" data-a="suRm" data-v="${esc(v.id)}" aria-label="Remove ${esc(v.name)}">×</button></div>`).join('')}</div>
    <p class="su-p muted">Own two of a kind? Add another in Settings → My teaware.</p>`:''}`}
const SU_SHOTS={
  shelf:`<svg viewBox="0 0 160 90" aria-hidden="true"><rect x="6" y="8" width="56" height="10" rx="3" class="s1"/><rect x="6" y="22" width="56" height="10" rx="3"/><rect x="6" y="36" width="56" height="10" rx="3"/><rect x="6" y="50" width="56" height="10" rx="3"/><rect x="6" y="64" width="56" height="10" rx="3"/><rect x="70" y="8" width="84" height="74" rx="5"/><circle cx="92" cy="40" r="14" class="s2"/><rect x="114" y="26" width="32" height="6" rx="2" class="s1"/><rect x="114" y="38" width="26" height="6" rx="2" class="s1"/><rect x="80" y="62" width="64" height="12" rx="3" class="s1"/></svg>`,
  brew:`<svg viewBox="0 0 160 90" aria-hidden="true"><rect x="6" y="8" width="44" height="10" rx="3" class="s1"/><rect x="56" y="8" width="50" height="10" rx="3"/><rect x="112" y="8" width="42" height="10" rx="3" class="s2"/><rect x="6" y="26" width="46" height="56" rx="5"/><rect x="57" y="26" width="46" height="56" rx="5"/><rect x="108" y="26" width="46" height="56" rx="5" class="dash"/><rect x="12" y="34" width="34" height="4" rx="2" class="s1"/><rect x="12" y="44" width="34" height="4" rx="2" class="s1"/><rect x="12" y="54" width="34" height="4" rx="2" class="s1"/><rect x="63" y="34" width="34" height="4" rx="2" class="s1"/><rect x="63" y="44" width="34" height="4" rx="2" class="s1"/><rect x="63" y="54" width="34" height="4" rx="2" class="s1"/><path d="M131 48v12M125 54h12" class="plus"/></svg>`};
function suPrefs(){
  return `<h3 class="su-h">Units</h3>
   <div class="seg" role="group" aria-label="Temperature units"><button type="button" data-a="suUnit" data-v="C" aria-pressed="${SU.unit==='C'}">Celsius (°C)</button><button type="button" data-a="suUnit" data-v="F" aria-pressed="${SU.unit==='F'}">Fahrenheit (°F)</button></div>
   <h3 class="su-h">Your home page</h3>
   <p class="su-p">What you see when you open the app. The other one is always a click away.</p>
   <div class="su-homes" role="group" aria-label="Home page">
    <button type="button" class="mode su-home" data-a="suHome" data-v="shelf" aria-pressed="${SU.home==='shelf'}">${SU_SHOTS.shelf}<b>Tea shelf</b><span>Your teas in rotation, with stats, flavour and the brew guide beside them. Good if you like to browse first.</span></button>
    <button type="button" class="mode su-home" data-a="suHome" data-v="brew" aria-pressed="${SU.home==='brew'}">${SU_SHOTS.brew}<b>Brew today</b><span>Pick a tea, teaware and leaf, then log each infusion as a card with its own timer. Good if you open the app to brew.</span></button>
   </div>`}
function suTea(){const n=allTeas().filter(t=>!t.finished).length;
  return n?`<h3 class="su-h">You’re all set</h3><p class="su-p">You have ${n} tea${n===1?'':'s'} on your shelf already. Press Finish to save your setup.</p>`
   :`<div class="su-hero">${vesselSVG('gaiwan')}</div><h3 class="su-h">Add your first tea</h3>
   <p class="su-p">Start with one from your cupboard: pick its type (say, a Wuyi rock oolong or a sencha) and the brewing guide comes with it. Brand, harvest and how much you have are optional.</p>
   <div class="su-cta"><button type="button" class="btn primary" data-a="suFinish" data-v="tea">Finish and add a tea</button><span class="muted">or press Finish to add one later.</span></div>`}

function setupAction(a,v){
  switch(a){
   case 'setup':openSetup();return true;
   case 'suNext':if(SU_STEPS[SU.i][0]==='ware'&&!SU.vessels.length)return true;SU.i++;suRender();return true;
   case 'suBack':SU.i=Math.max(0,SU.i-1);suRender();return true;
   case 'suWare':{const vt=VT[v];if(!vt)return true;
     if(SU.vessels.some(x=>x.type===v))SU.vessels=SU.vessels.filter(x=>x.type!==v);else SU.vessels.push({id:uid('w'),type:v,name:vt.name,ml:vt.ml});
     const y=$('#scrim').scrollTop;suRender();$('#scrim').scrollTop=y;$(`.su-pick [data-v="${v}"]`)?.focus();return true}
   case 'suRm':{SU.vessels=SU.vessels.filter(x=>x.id!==v);const y=$('#scrim').scrollTop;suRender();$('#scrim').scrollTop=y;return true}
   case 'suUnit':SU.unit=v;suRender();return true;
   case 'suHome':SU.home=v;suRender();return true;
   case 'suSkip':if(SU.first)store.setSettings({setupDone:true});SU=null;closeSheet();if(store.settings.setupDone)toast('You can run the setup guide any time from Settings.');return true;
   case 'suFinish':suFinish(v==='tea');return true;
  }
  return false}
function suFinish(addTea){const vs=SU.vessels.filter(x=>x.name.trim()).map(x=>({...x,name:x.name.trim(),ml:+x.ml||VT[x.type]?.ml||100}));
  store.setSettings({vessels:vs.length?vs:store.settings.vessels,unit:SU.unit,homeLayout:SU.home,setupDone:true});
  SU=null;closeSheet();setView('home');
  if(addTea)openTeaForm({then:homeOn()?'home':null});else toast('All set. Happy brewing.')}
function setupInput(t){if(!SU||!t.dataset.su)return false;const x=SU.vessels.find(v=>v.id===t.dataset.id);if(!x)return true;
  if(t.dataset.su==='ml')x.ml=parseInt(t.value)||0;else x.name=t.value;return true}
