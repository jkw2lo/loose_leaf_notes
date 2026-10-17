/* ═════════ Brew today: the alternative home page (Settings → Home page) ═════════
   Pick a tea, teaware and leaf along the top, then Start brewing. Each infusion gets its own card in a row
   (volume, temperature, time, then flavour, colour and notes); Start timer on a card runs the shared timer up top.
   It uses the brew page's session state (S, with S.home set), timer (T) and save. */
const H={teaId:null,vesselId:null,g:null,gTouched:false,style:null};
const HB_SIZED=['gongfu','kyusu','glass'];
const homeOn = ()=>store.settings.homeLayout==='brew';
const hbShelf = ()=>allTeas().filter(t=>!t.finished).sort((a,b)=>lastBrewAt(b)-lastBrewAt(a)||a.name.localeCompare(b.name));
const hbTea = ()=>S?.home?sTea():teaById(H.teaId)||hbShelf()[0]||null;
function hbVessel(t,style){const own=store.settings.vessels;
  if(S?.home)return own.find(w=>w.id===S.vesselId)||null;
  const picked=own.find(w=>w.id===H.vesselId);if(picked)return picked;
  const r=t&&style?recFor(t,style):null;return own.find(w=>r?.vessels.includes(w.type))||own[0]||null}
/* the method follows the teaware: a teapot brews western, a gaiwan gong fu, when the tea allows both */
function hbStyle(t){if(S?.home)return S.style;if(!t)return null;const ms=methodsFor(t);
  if(H.style&&ms.some(m=>m.style===H.style))return H.style;
  const w=store.settings.vessels.find(x=>x.id===H.vesselId);const fit=w&&ms.find(m=>(STYLE_VESSELS[m.style]||[]).includes(w.type));
  return fit?.style||defaultStyle(t)}
function hbDefaultG(t,style,w){const r=prodFor(t,style)||recFor(t,style);
  return Math.max(1,Math.round(w?.ml&&HB_SIZED.includes(style)?avg(r.per)*w.ml/100:r.gT))}
const hbG = (t,style,w)=>S?.home?S.g:H.gTouched&&H.g!=null?H.g:t?hbDefaultG(t,style,w):2;

function renderHome(){
  const el=$('#view-home');
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const t=hbTea(),style=hbStyle(t),w=hbVessel(t,style),g=hbG(t,style,w),on=!!S?.home;
  const shelf=hbShelf(),lib=allTeas().filter(x=>x.finished),own=store.settings.vessels;
  el.innerHTML=`<h1 class="sr">Brew today</h1>
   <div class="hb-top" data-arr-item="setup" data-arr-label="Tea, teaware and leaf">
    ${hbTeaMenu(t,shelf,lib)}
    ${hbWareSeg(w)}
    <div class="hb-step" role="group" aria-label="Leaf" data-mock="in.number" data-mock-label="${g}g"><button type="button" data-a="hbG" data-v="-1" aria-label="One gram less">−</button><span class="hb-step-v"><input id="hb-g" inputmode="decimal" value="${g}" style="width:${hbGW(g)}" aria-label="Leaf in grams"><b>g</b></span><button type="button" data-a="hbG" data-v="1" aria-label="One gram more">+</button></div>
    ${on?`<button type="button" class="btn primary hb-go" data-a="saveSession" data-mock="act.button"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Add to log</button>`
     :`<button type="button" class="btn primary hb-go" data-a="hbStart" data-mock="act.button" ${t?'':'disabled'}>Start brewing</button>`}
   </div>
   <div class="hb-bar" data-arr-item="timer" data-arr-label="Guide and timer">
    <p class="hb-hint muted" id="hb-hint">${t?hbHint(t,style):'Pick a tea to see its brewing guide.'}</p>
    <div class="bw-timer${on?'':' idle'}" id="bw-timer" data-mock="ctl.timer" data-mock-label="Timer">${on?'':hbIdleTimer()}</div>
   </div>
   <section class="hb-region" aria-label="Brews" data-arr-item="brews" data-arr-label="Brew section" data-mock="note.region" data-mock-label="Brew Section">${on?hbRow():hbEmpty(t)}</section>
   ${on?`<div class="hb-overall" id="hb-overall" data-arr-item="overall" data-arr-label="Overall rating">${hbOverall()}</div>`:''}`;
  if(on)rTimer();
}
/* teaware, three at a time, most used first; the arrows page through the rest */
const HB_WARE_PER=3;
function hbWareOrder(){const own=store.settings.vessels,n={};
  // sessions logged with teaware you no longer list count toward the first piece of the same kind
  store.brews.forEach(b=>{const w=own.find(x=>x.id===b.vesselId)||own.find(x=>x.type===b.vesselType);if(w)n[w.id]=(n[w.id]||0)+1});
  return own.map((w,i)=>({w,i,n:n[w.id]||0})).sort((a,b)=>b.n-a.n||a.i-b.i).map(x=>x.w)}
function hbWareSeg(w){const own=hbWareOrder();
  if(!own.length)return `<button type="button" class="linkbtn hb-ware" data-a="manageWare">Add your teaware</button>`;
  const pages=Math.ceil(own.length/HB_WARE_PER);
  if(H.warePage==null){const i=own.findIndex(x=>x.id===w?.id);H.warePage=i>=0?Math.floor(i/HB_WARE_PER):0}
  const p=H.warePage=clamp(H.warePage,0,pages-1);const shown=own.slice(p*HB_WARE_PER,(p+1)*HB_WARE_PER);
  const arrow=(d,lab)=>`<button type="button" class="hb-ware-pg" data-a="hbWarePg" data-v="${d}" aria-label="${lab}" ${p+d<0||p+d>=pages?'disabled':''}>${d<0?'‹':'›'}</button>`;
  // fixed slots so every piece is the same width, even on a last page with fewer
  const slots=Math.min(HB_WARE_PER,own.length),cols=`${pages>1?'26px ':''}repeat(${slots},minmax(0,1fr))${pages>1?' 26px':''}`;
  return `<div class="seg hb-ware" role="group" style="--cols:${cols}" aria-label="Teaware${pages>1?`, page ${p+1} of ${pages}`:''}" data-mock="sel.segmented" data-mock-label="${esc(shown.map(x=>x.name).join(', '))}">${pages>1?arrow(-1,'Previous teaware'):''}${shown.map(x=>`<button type="button" data-a="hbWare" data-v="${esc(x.id)}" aria-pressed="${w?.id===x.id}" title="${esc(x.name)}">${esc(x.name)}</button>`).join('')}${'<span aria-hidden="true"></span>'.repeat(slots-shown.length)}${pages>1?arrow(1,'More teaware'):''}</div>`}
const hbWareRedraw = ()=>{const el=$('.hb-ware');const t=hbTea();if(el)el.outerHTML=hbWareSeg(hbVessel(t,hbStyle(t)))};
/* the tea picker: a button that opens a list below it (a native select pops up over itself on macOS) */
function hbTeaMenu(t,shelf,lib){
  const opt=x=>`<button type="button" class="hb-opt" role="option" data-a="hbTeaPick" data-v="${esc(x.id)}" aria-selected="${t?.id===x.id}" tabindex="-1"><span class="cup sm" style="--liq:${liqHex(teaLiq(x))}"></span><span class="hb-opt-t"><b>${esc(x.name)}</b>${x.brand?`<small>${esc(x.brand)}</small>`:''}</span></button>`;
  const grp=(id,lab,xs)=>xs.length?`<div role="group" aria-labelledby="hbg-${id}"><span class="hb-grp" id="hbg-${id}">${lab}</span>${xs.map(opt).join('')}</div>`:'';
  return `<div class="hb-sel" id="hb-sel" data-mock="sel.select" data-mock-label="What's brewing today?">
   <button type="button" class="input hb-sel-btn" id="hb-tea" data-a="hbTeaOpen" aria-haspopup="listbox" aria-expanded="false" aria-controls="hb-tea-list" aria-label="Tea${t?': '+esc(t.name):''}">${t?`<span class="cup sm" style="--liq:${liqHex(teaLiq(t))}"></span><span class="hb-sel-t">${esc(t.name)}${t.brand?`<small> – ${esc(t.brand)}</small>`:''}</span>`:`<span class="hb-sel-t muted">What's brewing today?</span>`}</button>
   <div class="hb-menu" id="hb-tea-list" role="listbox" aria-label="Teas" hidden>${grp('shelf','On your shelf',shelf)}${grp('lib','Finished, in your library',lib)}
    <button type="button" class="hb-opt hb-new" role="option" data-a="hbTeaPick" data-v="__new" aria-selected="false" tabindex="-1">＋ Add new tea</button></div></div>`}
const hbMenuOpts = ()=>$$('#hb-tea-list .hb-opt');
function hbMenu(open,focus){const m=$('#hb-tea-list'),b=$('#hb-tea');if(!m||!b)return;m.hidden=!open;b.setAttribute('aria-expanded',open);
  if(open){const os=hbMenuOpts();const cur=os.find(o=>o.getAttribute('aria-selected')==='true')||os[0];cur?.focus({preventScroll:true});cur?.scrollIntoView({block:'nearest'})}else if(focus)b.focus()}
function hbTeaPick(v){hbMenu(false,true);
  if(v===(S?.home?S.teaId:hbTea()?.id))return;
  if(S?.home&&brewDirty()){toast(HB_BUSY);return}
  if(v==='__new'){openTeaForm({then:'home'});return}
  hbPickTea(v);$('#hb-tea')?.focus()}
document.addEventListener('click',e=>{if(!e.target.closest('#hb-sel'))hbMenu(false)});
document.addEventListener('keydown',e=>{const t=e.target;if(!t.closest?.('#hb-sel'))return;const m=$('#hb-tea-list');const open=m&&!m.hidden;
  if(t.id==='hb-tea'&&!open&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();hbMenu(true);return}
  if(!open)return;const os=hbMenuOpts(),i=os.indexOf(document.activeElement);
  const go=n=>{e.preventDefault();os[clamp(n,0,os.length-1)]?.focus()};
  if(e.key==='ArrowDown')return go(i+1);if(e.key==='ArrowUp')return go(i-1);if(e.key==='Home')return go(0);if(e.key==='End')return go(os.length-1);
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hbMenu(false,true);return}
  if(e.key==='Tab'){hbMenu(false);return}
  // type a letter to jump to the next tea starting with it
  if(e.key.length===1&&/\S/.test(e.key)){const k=norm(e.key);const n=os.findIndex((o,j)=>j>i&&norm(o.textContent).startsWith(k));const f=n>=0?n:os.findIndex(o=>norm(o.textContent).startsWith(k));if(f>=0)go(f)}});
const hbGW = g=>Math.max(1,String(g).length)+.5+'ch';
function hbIdleTimer(){return `<div class="tm-read" role="timer" aria-label="Steep timer"><span class="tm-time">0:00</span><span class="tm-sub">start brewing to time each steep</span></div><span class="tm-bar" aria-hidden="true"><i style="width:0"></i></span>`}
function hbHint(t,style){const r=prodFor(t,style)||recFor(t,style);const ms=methodsFor(t);const u=style==='ice'?'g':'ml';
  const meth=ms.length>1&&!S?.home?`<span class="seg sm" role="group" aria-label="Method">${ms.map(m=>`<button type="button" data-a="hbStyle" data-v="${m.style}" aria-pressed="${m.style===style}">${STYLE[m.style]}</button>`).join('')}</span>`:`<b>${esc(STYLE[style]||style)}</b>`;
  return `${meth}<span>${r.producer?esc(t.brand||'Producer')+'’s recipe':'Typical'}: ${fmtGR(r.g)} · ${r.ml} ${u} · ${fmtTR(r.t,style)} · ${r.sched.slice(0,4).map(fmtS).join(', ')}${r.sched.length>4?'…':''}</span>`}
function hbEmpty(t){const n=brewsOf(t?.id).length;
  return `<div class="hb-empty"><h2>${t?esc(t.name):'Start a brew'}</h2><p>${t?`Choose your teaware and how much leaf, then Start brewing. Each infusion gets its own card here, with its own volume, temperature, time and tasting notes.${n?` You've brewed this tea ${n} time${n===1?'':'s'} before.`:''}`:'Pick a tea you own from the list, or add a new one.'}</p>
   ${t?`<button type="button" class="linkbtn" data-a="openTea" data-v="${esc(t.id)}">Tea page &amp; sessions</button>`:`<button type="button" class="btn" data-a="newTea" data-v="home">＋ Add a tea</button>`}</div>`}

/* the row of brews: one card per infusion, then a card to add the next */
function hbRow(){return `<div class="hb-row" id="hb-row">${S.steeps.map((_,k)=>hbCard(k)).join('')}
  <div class="hb-card hb-add"><h3 class="hb-h">Brew #${S.steeps.length+1}</h3><button type="button" class="hb-plus" data-a="hbAdd" data-mock="act.icon" data-mock-label="plus" aria-label="Add brew ${S.steeps.length+1}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><span class="muted">Add the next infusion</span></div></div>`}
function hbRanges(k){const keep=S.cur;S.cur=k;const r=brewRanges();S.cur=keep;return r}
const hbBand = (lo,hi,min,max)=>lo==null?' hidden':` style="--a:${clamp((lo-min)/(max-min),0,1)};--b:${clamp((hi-min)/(max-min),0,1)}"`;
const ICON={ml:'<path d="M10 3c3 4 5 6.6 5 9a5 5 0 0 1-10 0c0-2.4 2-5 5-9z"/>',temp:'<path d="M8 4a2 2 0 0 1 4 0v7.3a3.5 3.5 0 1 1-4 0z"/><path d="M10 9v4.5"/>'};
function hbCyc(k,key,label,val){
  return `<div class="hb-cyc" role="group" aria-label="${label}" data-mock="sel.cyclericon" data-mock-label="${esc(val)}"><button type="button" data-a="hbStep" data-v="${k}:${key}:-1" aria-label="${label} down">‹</button>
   <span class="hb-cyc-v"><svg viewBox="0 0 20 20" aria-hidden="true">${ICON[key]}</svg><b id="hbo-${key}-${k}">${val}</b></span><button type="button" data-a="hbStep" data-v="${k}:${key}:1" aria-label="${label} up">›</button></div>`}
function hbSlider(k,key,label,min,max,step,val,band,out){
  return `<div class="hb-sl" data-mock="sel.slider" data-mock-label="${label}"><label for="hbs-${key}-${k}">${label}${out!=null?` <output id="hbo-${key}-${k}">${out}</output>`:''}</label><div class="sl-track"><span class="sl-band" id="hbb-${key}-${k}"${band}></span><input type="range" id="hbs-${key}-${k}" data-hk="${key}" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></div></div>`}
function hbCard(k){const b=S.steeps[k],r=hbRanges(k),tv=timeVals(),vm=volMax(),cold=noTemp(S.style);
  const C=famOf(sTea().fam);const quick=[...new Set([...S.steeps.flatMap(x=>x.tags||[]),...C.common])];
  return `<article class="hb-card" id="hbc-${k}" aria-labelledby="hbh-${k}">
   <div class="hb-card-head"><span class="ldot" id="hbd-${k}" style="--liq:${b.liq?liqHex(b.liq):'var(--surface-2)'}"></span><h3 class="hb-h" id="hbh-${k}">Brew #${k+1}</h3>${S.steeps.length>1?`<button type="button" class="hb-rm" data-a="hbRm" data-v="${k}" aria-label="Remove brew ${k+1}" title="Remove brew ${k+1}">×</button>`:''}</div>
   <div class="hb-ctl">
    ${hbSlider(k,'ml','Volume',20,vm,volStep(),b.ml,hbBand(r.ml?.[0],r.ml?.[1],20,vm))}${hbCyc(k,'ml','Volume',b.ml+' '+volU())}
    ${cold?`<p class="muted hb-cold">${S.style==='ice'?'Ice brew: melting ice, no heat.':'Cold brew: steeps in the fridge, about 4°C.'}</p>`
     :hbSlider(k,'temp','Temperature',40,100,1,Math.round(b.temp),hbBand(r.temp?.[0],r.temp?.[1],40,100))+hbCyc(k,'temp','Temperature',fmtT(b.temp,S.style))}
    ${hbSlider(k,'s','Time',0,tv.length-1,1,nearIdx(tv,b.s),hbBand(nearIdx(tv,r.s[0]),nearIdx(tv,r.s[1]),0,tv.length-1),fmtS(b.s))}
    <span class="hb-tbtn" id="hbt-${k}">${hbTimeBtn(k)}</span>
   </div>
   <div class="hb-notes" data-mock="note.box" data-mock-label="Flavor Profile, Comments, Etc">
    <div class="hb-notes-head"><span class="lbl">This cup</span><div class="cupscore" aria-label="Score for brew ${k+1}">${[1,2,3,4,5].map(n=>`<button type="button" data-a="hbScore" data-v="${k}:${n}" class="${b.score===n?'sel':b.score>n?'on':''}" aria-label="${n} of 5" aria-pressed="${b.score===n}">${n}</button>`).join('')}</div></div>
    ${hbLiq(k)}
    <div class="chips">${quick.map(tg=>`<button type="button" class="chip tag" data-a="hbTag" data-v="${k}" data-tag="${esc(tg)}" aria-pressed="${(b.tags||[]).includes(tg)}">${esc(tg)}</button>`).join('')}</div>
    <div class="hb-addtag"><input class="input" id="hb-ctag-${k}" data-hk="ctag" data-k="${k}" placeholder="Add your own flavour" aria-label="Add a flavour to brew ${k+1}"><button type="button" class="btn sm" data-a="hbAddTag" data-v="${k}">Add</button></div>
    <textarea class="textarea" data-hk="note" data-k="${k}" rows="2" placeholder="Comments: what changed in this cup?" aria-label="Brew ${k+1} comments">${esc(b.note||'')}</textarea>
    <details class="hb-pal" data-k="${k}" ${S.palOpen?.has(k)?'open':''}><summary>Palate profile${hasAxes(b)?' <span class="muted">· rated</span>':''}</summary>
     <div class="bp-pal-grid"><div class="axes">${AXES.map(([x,lab])=>`<label class="axis" for="hba-${x}-${k}"><span>${lab}</span><input type="range" id="hba-${x}-${k}" data-hk="axis" data-axis="${x}" data-k="${k}" min="0" max="5" step="1" value="${b.axes?.[x]||0}"><output id="hbao-${x}-${k}">${b.axes?.[x]||'–'}</output></label>`).join('')}</div><div class="radar-wrap" id="hbr-${k}">${radarSVG([{v:b.axes||{}}],{size:150})}</div></div></details>
   </div></article>`}
function hbTimeBtn(k){
  if(T.run&&T.brew===k)return `<button type="button" class="btn sm primary" data-a="tStop" title="End this steep and log the time">■ Stop</button>`;
  return `<button type="button" class="btn sm" data-a="hbTime" data-v="${k}" data-mock="act.button" data-mock-label="Start Timer">${T.done&&T.brew===k?'↺ Again':'▶ Start timer'}</button>`}
function hbTimeBtns(){if(!S?.home)return;S.steeps.forEach((_,k)=>{const e=$('#hbt-'+k);if(e)e.innerHTML=hbTimeBtn(k)})}
function hbLiq(k){const b=S.steeps[k],st=liqStops();
  const marks=S.steeps.map((x,j)=>j!==k&&x.liq?`<span class="lg-mark" style="left:${gradPos(st,liqHex(x.liq))*100}%;--c:${liqHex(x.liq)}" title="Brew ${j+1}: ${liqName(x.liq)}">${j+1}</span>`:'').join('');
  return `<div class="field"><div class="lg-head"><label class="lbl" for="hbs-liq-${k}">Liquor colour</label><span class="liq-name" id="hbl-${k}">${b.liq?liqName(b.liq):'Not set'}</span><button type="button" class="linkbtn lg-clear" id="hblc-${k}" data-a="hbLiqClear" data-v="${k}" ${b.liq?'':'hidden'}>Clear</button></div>
   <div class="lg ${b.liq?'':'unset'}" style="--grad:linear-gradient(90deg,${st.join(',')});--c:${b.liq?liqHex(b.liq):'transparent'}"><div class="lg-marks" aria-hidden="true">${marks}</div>
    <input type="range" id="hbs-liq-${k}" data-hk="liq" data-k="${k}" min="0" max="1000" value="${b.liq?Math.round(gradPos(st,liqHex(b.liq))*1000):500}" aria-label="Liquor colour" aria-valuetext="${b.liq?liqName(b.liq):'not set'}"></div></div>`}
function hbOverall(){const r=S.rating;
  return `<span class="lbl">Overall</span><div class="rating" role="group" aria-label="Overall rating" data-mock="sel.rating" data-mock-label="Overall 1–10">${Array.from({length:10},(_,i)=>`<button type="button" data-a="hbRate" data-v="${i+1}" class="${r===i+1?'sel':r>i+1?'on':''}" aria-pressed="${r===i+1}">${i+1}</button>`).join('')}</div>
   ${S.style==='gongfu'||S.rinse?`<label class="toggle"><input type="checkbox" id="bw-rinse" ${S.rinse?'checked':''}> Rinsed first</label>`:''}
   <button type="button" class="btn ghost hb-discard" data-a="hbDiscard">Discard this brew</button>`}

/* re-render one card in place, keeping the row's scroll position */
function hbRerender(k){const c=$('#hbc-'+k);if(!c)return;c.outerHTML=hbCard(k)}
function hbRerow(){const row=$('#hb-row');const x=row?.scrollLeft||0;$('.hb-region').innerHTML=hbRow();const n=$('#hb-row');if(n)n.scrollLeft=x}
function hbBands(k){const r=hbRanges(k),b=S.steeps[k],tv=timeVals();
  const put=(key,lo,hi,min,max,v)=>{const el=$(`#hbb-${key}-${k}`);if(!el)return;if(lo==null){el.hidden=true;return}el.hidden=false;
    el.style.setProperty('--a',clamp((lo-min)/(max-min),0,1));el.style.setProperty('--b',clamp((hi-min)/(max-min),0,1));$(`#hbo-${key}-${k}`)?.classList.toggle('off',v<lo-.01||v>hi+.01)};
  put('ml',r.ml?.[0],r.ml?.[1],20,volMax(),b.ml);if(r.temp)put('temp',r.temp[0],r.temp[1],40,100,b.temp);
  put('s',nearIdx(tv,r.s[0]),nearIdx(tv,r.s[1]),0,tv.length-1,nearIdx(tv,b.s));$('#hbo-s-'+k)?.classList.toggle('off',b.s<r.s[0]||b.s>r.s[1])}
const hbAllBands = ()=>S.steeps.forEach((_,k)=>hbBands(k));
function hbSet(k,key,val,fromSlider){const b=S.steeps[k];
  if(key==='s'){b.s=Math.max(1,Math.round(val));$('#hbo-s-'+k).textContent=fmtS(b.s);if(!fromSlider)$('#hbs-s-'+k).value=nearIdx(timeVals(),b.s);if(!T.run){tReset(k);rTimer()}}
  if(key==='temp'){b.temp=clamp(Math.round(val),40,100);$('#hbo-temp-'+k).textContent=fmtT(b.temp,S.style);if(!fromSlider)$('#hbs-temp-'+k).value=b.temp}
  if(key==='ml'){b.ml=clamp(Math.round(val),20,5000);S.touched.add('ml');$('#hbo-ml-'+k).textContent=b.ml+' '+volU();if(!fromSlider){if(b.ml>volMax()){hbRerow();return}$('#hbs-ml-'+k).value=b.ml}}
  hbBands(k)}

/* starting, switching and leaving */
function hbStart(){const t=hbTea();if(!t)return;const style=hbStyle(t),w=hbVessel(t,style),rec=prodFor(t,style)||recFor(t,style);
  S={id:uid('b'),teaId:t.id,at:new Date().toISOString(),style,g:hbG(t,style,w),rinse:style==='gongfu'&&rec.rinse>0,steeps:[],rating:0,axes:blankAxes(),notes:'',water:'',
    touched:new Set(['g']),home:true,cur:0,from:{view:'home'},palOpen:new Set(),vesselId:w?.id,vesselType:w?.type,vesselName:w?.name};
  const first=newBrew();if(w?.ml&&HB_SIZED.includes(style))first.ml=w.ml;S.steeps.push(first);
  S.snap=brewSnap();tReset(0);renderHome();$('#hbc-0')?.scrollIntoView({block:'nearest',behavior:'smooth'})}
function hbAdd(){S.steeps.push(newBrew());const k=S.steeps.length-1;if(!T.run){tReset(k);rTimer()}hbRerow();
  const row=$('#hb-row'),c=$('#hbc-'+k);if(row&&c)row.scrollTo({left:c.offsetLeft-row.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function hbEnd(){if(S?.home){tReset();S=null}}
function hbPickTea(id){H.teaId=id;H.style=null;H.gTouched=false;hbEnd();renderHome()}
const HB_BUSY='Add this brew to your log, or discard it, before switching teas.';

function homeAction(a,v,el){
  switch(a){
   case 'hbStart':hbStart();return true;
   case 'hbTeaOpen':hbMenu($('#hb-tea-list')?.hidden);return true;
   case 'hbTeaPick':hbTeaPick(v);return true;
   case 'hbWare':{const w=store.settings.vessels.find(x=>x.id===v);if(!w)return true;H.vesselId=v;H.style=null;
     if(S?.home){S.vesselId=w.id;S.vesselType=w.type;S.vesselName=w.name;if(!S.touched.has('ml')&&w.ml&&HB_SIZED.includes(S.style))S.steeps.forEach(b=>b.ml=w.ml);hbWareRedraw();hbRerow()}
     else{if(!H.gTouched)H.g=null;renderHome()}return true}
   case 'hbWarePg':H.warePage=(H.warePage||0)+(+v);hbWareRedraw();$(`.hb-ware [data-v="${v}"]`)?.focus();return true;
   case 'hbStyle':H.style=v;if(!H.gTouched)H.g=null;renderHome();return true;
   case 'hbG':{const i=$('#hb-g');const n=Math.max(1,Math.round((parseFloat(i.value)||0)+(+v)));i.value=n;i.style.width=hbGW(n);hbSetG(n);return true}
   case 'hbStep':{const[k,key,d]=v.split(':');const b=S.steeps[+k];const cur=b[key]??sRec().target;hbSet(+k,key,cur+(+d)*fineStep(key,cur,+d));return true}
   case 'hbTime':{const k=+v;S.cur=k;tReset(k);tStart();hbTimeBtns();if(innerWidth>720)$('#bw-timer')?.scrollIntoView({block:'nearest',behavior:'smooth'});return true}
   case 'brewNext':if(T.brew+1<S.steeps.length){tReset(T.brew+1);rTimer()}else hbAdd();return true;
   case 'hbAdd':hbAdd();return true;
   case 'hbRm':{const k=+v;S.steeps.splice(k,1);if(T.brew===k){tReset(Math.min(k,S.steeps.length-1))}else if(T.brew>k)T.brew--;S.palOpen=new Set();hbRerow();rTimer();return true}
   case 'hbScore':{const[k,n]=v.split(':').map(Number);const b=S.steeps[k];b.score=b.score===n?0:n;$$(`#hbc-${k} .cupscore button`).forEach((x,i)=>{x.className=b.score===i+1?'sel':b.score>i+1?'on':'';x.setAttribute('aria-pressed',b.score===i+1)});return true}
   case 'hbTag':{const b=S.steeps[+v];const tg=el.dataset.tag;b.tags=b.tags||[];const i=b.tags.indexOf(tg);i>=0?b.tags.splice(i,1):b.tags.push(tg);el.setAttribute('aria-pressed',i<0);return true}
   case 'hbAddTag':hbAddTag(+v);return true;
   case 'hbLiqClear':S.steeps[+v].liq='';hbRerender(+v);return true;
   case 'hbRate':S.rating=S.rating===+v?0:+v;$('#hb-overall').innerHTML=hbOverall();return true;
   case 'hbDiscard':if(!arm(el,'Tap again to discard'))return true;hbEnd();renderHome();toast('Brew discarded');return true;
  }
  return false}
function hbSetG(n){if(S?.home){S.g=Math.max(0,n);S.touched.add('g');hbAllBands()}else{H.g=n;H.gTouched=true}}
function hbAddTag(k){const inp=$('#hb-ctag-'+k);const val=inp.value.trim().toLowerCase();if(!val)return;const b=S.steeps[k];b.tags=b.tags||[];if(!b.tags.includes(val))b.tags.push(val);hbRerender(k);setTimeout(()=>$('#hb-ctag-'+k)?.focus(),0)}
function homeInput(t){
  if(t.id==='hb-g'){t.style.width=hbGW(t.value);const n=parseFloat(t.value);if(!isNaN(n))hbSetG(n);return true}
  const key=t.dataset.hk;if(!key||!S?.home)return false;const k=+t.dataset.k,b=S.steeps[k];
  if(key==='note'){b.note=t.value;return true}
  if(key==='ctag')return true;
  if(key==='liq'){b.liq=gradAt(liqStops(),t.value/1000);const lg=t.closest('.lg');lg.classList.remove('unset');lg.style.setProperty('--c',b.liq);$('#hbl-'+k).textContent=liqName(b.liq);$('#hblc-'+k).hidden=false;t.setAttribute('aria-valuetext',liqName(b.liq));$('#hbd-'+k)?.style.setProperty('--liq',b.liq);return true}
  if(key==='axis'){const x=t.dataset.axis;b.axes={...blankAxes(),...b.axes,[x]:+t.value};$(`#hbao-${x}-${k}`).textContent=t.value==='0'?'–':t.value;$('#hbr-'+k).innerHTML=radarSVG([{v:b.axes}],{size:150});return true}
  hbSet(k,key,key==='s'?timeVals()[+t.value]:+t.value,true);return true}
function homeChange(t){
  if(t.id==='hb-g'){t.value=S?.home?S.g:H.g??t.value;t.style.width=hbGW(t.value);return true}
  return false}
document.addEventListener('toggle',e=>{const d=e.target;if(d.classList?.contains('hb-pal')&&S?.home){const k=+d.dataset.k;d.open?S.palOpen.add(k):S.palOpen.delete(k)}},true);
