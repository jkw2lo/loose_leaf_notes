/* ═════════ Brew page (session form) ═════════
   A full page: today's parameters and one tab per brew on the left; the guide, the tea's details and a timer on the right;
   a comparison with earlier sessions underneath. Each brew keeps its own time, temperature, volume, palate and notes. */
let S=null;
function blankAxes(){return{aroma:0,sweet:0,body:0,bite:0,finish:0,qi:0}}
function openSessionForm({teaId,brew,mode}){
  const t=teaById(teaId||brew?.teaId);if(!t){openPicker();return}
  if(state.view==='brew'&&S?.id!==brew?.id&&!leaveOK())return;
  const from=state.view==='brew'?S?.from:{view:state.view,teaId:state.teaId};
  closeSheet();
  if(mode==='edit'){const b=JSON.parse(JSON.stringify(brew));
    S={...b,editing:true,touched:new Set(['g','ml']),steeps:b.steeps.map(s=>({...s,temp:s.temp??b.temp,ml:s.ml??b.ml,axes:{...blankAxes(),...(s.axes||{})},tags:s.tags||[]}))};
    if(hasAxes(b)&&!S.steeps.some(s=>hasAxes(s))&&S.steeps[0])S.steeps[0].axes={...blankAxes(),...b.axes}}
  else{
    const style=brew?.style&&methodsFor(t).some(m=>m.style===brew.style)?brew.style:defaultStyle(t);const rec=prodFor(t,style)||recFor(t,style);
    S={id:uid('b'),teaId:t.id,at:new Date().toISOString(),style,g:rec.gT,rinse:style==='gongfu'&&rec.rinse>0,steeps:[],rating:0,axes:blankAxes(),notes:'',water:brew?.water||'',touched:new Set()};
    if(brew){Object.assign(S,{g:brew.g,rinse:!!brew.rinse,vesselId:brew.vesselId,vesselType:brew.vesselType,vesselName:brew.vesselName});S.touched.add('g');S.touched.add('ml')}
    else pickDefaultVessel();
    S.steeps.push(newBrew(brew?{temp:brew.temp,ml:brew.ml}:null));
  }
  if(!S.steeps.length)S.steeps.push(newBrew());
  Object.assign(S,{cur:0,side:'guide',gsrc:'typical',cpage:0,showTags:false,from});
  S.snap=brewSnap();tReset(0);
  setView('brew');
}
const brewSnap = ()=>JSON.stringify([S.style,S.g,S.vesselId,S.rinse,S.rating,S.at,S.steeps]);
const brewDirty = ()=>!!S&&(S.snap!==brewSnap()||T.acc>0||T.run);
let leaveWarned=0;
function leaveOK(){if(state.view!=='brew'||!brewDirty())return true;if(Date.now()-leaveWarned<4000)return true;leaveWarned=Date.now();toast('This brew is not saved. Click again to leave without saving.');return false}
function sTea(){return teaById(S.teaId)}
function sRec(){return recFor(sTea(),S.style)}
function sProd(){return prodFor(sTea(),S.style)}
function pickDefaultVessel(){const rec=sRec();const own=store.settings.vessels;const v=own.find(x=>rec.vessels.includes(x.type))||own[0];if(!v)return;S.vesselId=v.id;S.vesselType=v.type;S.vesselName=v.name}
function nextTarget(n=S.steeps.length){const rec=sProd()||sRec();if(rec.sched[n]!=null){const last=S.steeps[n-1];if(last&&rec.sched[n-1]){const k=clamp(last.s/rec.sched[n-1],.6,1.6);return Math.round(rec.sched[n]*(k>1.15||k<.85?k:1))}return rec.sched[n]}const last=S.steeps[n-1]?.s||rec.sched[rec.sched.length-1]||30;return Math.round(last*1.35)}
function newBrew(base){const rec=sProd()||sRec();const prev=S.steeps[S.steeps.length-1];const src=base||prev;
  return {s:nextTarget(),temp:noTemp(S.style)?null:(src?.temp??rec.target),ml:src?.ml??rec.ml,liq:'',score:0,tags:[],note:'',axes:blankAxes()}}
const curBrew = ()=>S.steeps[S.cur];
const tStep = s=>s<20?1:s<60?5:s<600?15:s<3600?60:1800;

/* slider scales */
function timeVals(){const rec=sProd()||sRec();const max=Math.max(600,2*Math.max(...rec.sched),...S.steeps.map(b=>b.s));const out=[];
  for(let s=5;s<=max;s+=s<60?5:s<300?15:s<1200?30:s<3600?60:s<14400?900:1800)out.push(s);return out}
const nearIdx = (arr,v)=>arr.reduce((bi,x,i)=>Math.abs(x-v)<Math.abs(arr[bi]-v)?i:bi,0);
function volMax(){const rec=sRec();const v=vesselOf(S).ml||0;return Math.ceil(Math.max(300,rec.ml*2,v*1.5,...S.steeps.map(b=>b.ml||0))/50)*50}
const volStep = ()=>volMax()<=500?5:10;
const volU = ()=>S.style==='ice'?'g':'ml';

/* page */
function renderBrew(){
  const el=$('#view-brew');if(!S){el.innerHTML='';return}
  const t=sTea();if(!t){el.innerHTML=`<button class="back" data-a="view" data-v="shelf">← Tea shelf</button><div class="empty"><h2>This tea is no longer on your shelf</h2></div>`;return}
  const Ty=typeOf(t);
  el.innerHTML=`<div class="bw" data-arr-split="brew" data-arr-fixed="2" data-arr-min="260" data-arr-max="560">
   <div class="bw-main" data-arr="brew-main" data-arr-auto>
    <div class="bw-headrow" data-arr="brew-head" data-arr-auto><div class="bw-head" data-arr-item="title" data-arr-label="Tea name"><button class="back" data-a="brewBack" data-mock="nav.back">← Back to ${S.from?.view==='tea'?esc(t.name):({shelf:'tea shelf',library:'library',journal:'journal',insights:'insights',guide:'guides',settings:'settings'}[S.from?.view]||'tea shelf')}</button>
     <h1>${esc(t.name)}${t.brand?`<span class="bw-brand"> – ${esc(t.brand)}</span>`:''}</h1>
     <div class="bw-sub"><span class="eyebrow" data-mock="txt.eyebrow">${esc(famOf(t.fam).name)}${Ty&&norm(Ty.name)!==norm(t.name)?' | '+esc(Ty.name):''}${S.editing?' · editing session':''}</span>${S.from?.view==='tea'?'':`<button type="button" class="linkbtn" data-a="openTea" data-v="${esc(t.id)}">Tea page &amp; all sessions</button>`}</div></div>
     <div class="bw-timer" id="bw-timer" data-mock="ctl.timer" data-arr-item="timer" data-arr-label="Timer"></div></div>
    <section class="bw-params" aria-label="Today's brew parameters" data-arr="brew-params" data-mock="note.region" data-mock-label="Brew parameters">
     <div class="bw-top" id="bw-top" data-arr="brew-top" data-arr-item="top" data-arr-label="Settings row"></div>
     <div class="bw-brews" id="bw-brews" data-arr-item="brews" data-arr-label="Brews"></div>
     <div class="bw-overall" id="bw-overall" data-arr-item="overall" data-arr-label="Rating and log"></div>
    </section>
   </div>
   <aside class="bw-side" data-arr="brew-side">
    <div class="bw-guide" id="bw-guide" data-arr-item="guide" data-arr-label="Guide and tea info" data-mock="nav.sidetabs" data-mock-label="Brew guide, About this tea"></div>
    <section class="bw-compare" id="bw-compare" aria-label="Compared with earlier sessions" data-arr-item="compare" data-arr-label="Earlier sessions" data-mock="data.compare" data-mock-label="Compared with earlier sessions"></section>
   </aside></div>`;
  rTop();rBrews();rOverall();rCompare();rSide();rTimer();
}
function cycler(key,label,val,sub,{input}={}){
  return `<div class="cyc" data-arr-item="${key}" data-arr-label="${label}" data-mock="sel.cyclerrow" data-mock-label="${label}"><span class="lbl" id="cyl-${key}">${label}</span><div class="cyc-row" role="group" aria-labelledby="cyl-${key}">
   <button type="button" class="cyc-btn" data-a="cyc" data-v="${key}:-1" aria-label="Previous ${label.toLowerCase()}">‹</button>
   <span class="cyc-val">${input||`<b>${val}</b>`}${sub?`<small>${sub}</small>`:''}</span>
   <button type="button" class="cyc-btn" data-a="cyc" data-v="${key}:1" aria-label="Next ${label.toLowerCase()}">›</button></div></div>`}
function rTop(){
  const v=vesselOf(S),ms=methodsFor(sTea()).map(m=>m.style);
  $('#bw-top').innerHTML=
   (ms.length>1||!ms.includes(S.style)?cycler('style','Method',esc(STYLE[S.style]||S.style),'',{}):'')+
   cycler('vessel','Vessel',esc(v.name),v.ml?v.ml+' ml':'')+
   cycler('leaf','Leaf','','',{input:`<span class="cyc-in"><input id="bw-g" inputmode="decimal" value="${S.g}" style="width:${gW()}" aria-label="Leaf in grams"><b>g</b></span>`})+
   `<label class="bw-at" data-arr-item="date" data-arr-label="Brewed date"><span class="lbl">Brewed</span><input class="input" type="date" id="bw-at" value="${toLocalInput(S.at).slice(0,10)}"></label>`;
}
const gW = ()=>Math.max(1.5,String(S.g).length+.3)+'ch';
function rBrews(){
  const b=curBrew(),rec=sProd()||sRec(),i=S.cur;
  const tabs=S.steeps.map((x,k)=>`<button type="button" role="tab" id="bt-${k}" aria-selected="${k===i}" aria-controls="bw-panel" data-a="bwTab" data-v="${k}"><span class="ldot" style="--liq:${x.liq?liqHex(x.liq):'var(--surface-2)'}"></span>Brew ${k+1}<small id="btt-${k}">${fmtS(x.s)}</small></button>`).join('');
  const tv=timeVals();
  const temp=noTemp(S.style)?`<p class="muted sl-note">${S.style==='ice'?'Ice brew: melting ice, no heat.':'Cold brew: steeps in the fridge, about 4°C.'}</p>`
   :slider('temp','Temp',40,100,1,Math.round(b.temp??rec.target),fmtT(b.temp,S.style));
  const C=famOf(sTea().fam);const quick=[...new Set([...S.steeps.flatMap(x=>x.tags||[]),...C.common])];
  $('#bw-brews').innerHTML=`<div class="vt" role="tablist" aria-orientation="vertical" aria-label="Brews" data-mock="nav.vtabs" data-mock-label="${S.steeps.map((_,k)=>'Brew '+(k+1)).join(', ')}, +">${tabs}<button type="button" class="vt-add" data-a="brewAdd" aria-label="Add a brew" title="Add a brew">＋</button></div>
   <div class="bp" id="bw-panel" role="tabpanel" aria-labelledby="bt-${i}" data-arr="brew-panel" data-arr-split="brew-panel" data-arr-fixed="1" data-arr-min="200" data-arr-max="560">
    <div class="bp-left" data-arr-item="controls" data-arr-label="Sliders, colour and comments" data-arr="brew-controls" data-arr-auto>
     ${temp}
     ${slider('s','Time',0,tv.length-1,1,nearIdx(tv,b.s),fmtS(b.s))}
     ${slider('ml','Vol',20,volMax(),volStep(),b.ml,b.ml+' '+volU())}
     <div class="sl-guide muted" id="bw-sl-guide" data-arr-item="ranges" data-arr-label="Recommended ranges"></div>
     ${liqGrad()}
     <textarea class="textarea" id="bs-note" data-bs="note" rows="3" placeholder="Brew comments: what changed in this cup?" aria-label="Brew ${i+1} comments">${esc(b.note||'')}</textarea>
     ${S.steeps.length>1?`<button type="button" class="linkbtn danger-link bp-rm" data-a="brewRm">Remove brew ${i+1}</button>`:''}
    </div>
    <div class="bp-pal" data-arr="brew-palate" data-arr-auto data-arr-item="palate" data-arr-label="Palate profile" data-mock="note.box" data-mock-label="Palate profile rating and spider graph">
     <div class="bp-pal-head"><h3>Palate profile</h3><div class="cupscore" aria-label="Score for this cup">${[1,2,3,4,5].map(n=>`<button type="button" data-a="stScore" data-v="${i}:${n}" class="${b.score===n?'sel':b.score>n?'on':''}" aria-label="${n} of 5" aria-pressed="${b.score===n}">${n}</button>`).join('')}</div></div>
     <div class="bp-pal-grid"><div class="axes">${AXES.map(([k,lab])=>`<label class="axis" for="ax-${k}"><span>${lab}</span><input type="range" id="ax-${k}" data-axis="${k}" min="0" max="5" step="1" value="${b.axes?.[k]||0}"><output id="axo-${k}">${b.axes?.[k]||'–'}</output></label>`).join('')}</div><div class="radar-wrap" id="bw-radar">${radarSVG([{v:b.axes||{}}],{size:190})}</div></div>
     <div class="field"><span class="lbl">Flavours &amp; aromas</span><div class="chips">${quick.map(tg=>`<button type="button" class="chip tag" data-a="stTag" data-v="${i}" data-tag="${esc(tg)}" aria-pressed="${(b.tags||[]).includes(tg)}">${esc(tg)}</button>`).join('')}</div>
      <div class="row"><input class="input" id="st-ctag-${i}" data-st="ctag" data-i="${i}" placeholder="Add your own flavour" style="max-width:220px;padding:6px 10px"><button type="button" class="btn sm" data-a="stAddTag" data-v="${i}">Add</button></div></div>
    </div>
   </div>`;
  rBands();
}
function slider(k,label,min,max,step,val,out){
  return `<div class="sl" data-arr-item="sl-${k}" data-arr-label="${label} slider"><label for="bs-${k}">${label}</label><div class="sl-track"><span class="sl-band" id="band-${k}" hidden></span><input type="range" id="bs-${k}" data-bs="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></div><output id="bo-${k}">${out}</output>
   <span class="sl-step"><button type="button" data-a="slStep" data-v="${k}:1" aria-label="${label} up">▲</button><button type="button" data-a="slStep" data-v="${k}:-1" aria-label="${label} down">▼</button></span></div>`}
/* fine steps for the ▲▼ buttons, finer than the slider */
const fineStep = (k,v,dir)=>k==='temp'?1:k==='ml'?5:(dir>0?v:v-1)<60?1:(dir>0?v:v-1)<300?5:(dir>0?v:v-1)<1200?15:60;
function setBrewVal(k,val,fromSlider){const b=curBrew();
  if(k==='s'){b.s=Math.max(1,Math.round(val));$('#bo-s').textContent=fmtS(b.s);rTabTime(S.cur);if(!fromSlider)$('#bs-s').value=nearIdx(timeVals(),b.s);if(!T.run){tReset(S.cur);rTimer()}}
  if(k==='temp'){b.temp=clamp(Math.round(val),40,100);$('#bo-temp').textContent=fmtT(b.temp,S.style);if(!fromSlider)$('#bs-temp').value=b.temp}
  if(k==='ml'){b.ml=clamp(Math.round(val),20,5000);S.touched.add('ml');$('#bo-ml').textContent=b.ml+' '+volU();if(!fromSlider){if(b.ml>volMax())rBrews();else $('#bs-ml').value=b.ml}}
  rBands();rCompare()}

/* liquor: a continuous gradient over the colours this kind of tea can take; other brews are marked on it */
const LIQ_GREEN=['#F3F4DF','#E4E7BC','#D4DD93','#C0CB66','#A7B542','#8FAA3C','#7FA03A','#5F8A31','#476F2A'];
const LIQ_WARM=['ivory','pale','straw','lemon','gold','honey','amber','orange','copper','brick','ruby','garnet','chestnut','mahogany','espresso','ebony'];
function liqStops(){const ls=sRec().liqs;const green=['celadon','spring','jade','emerald','matcha'];
  if(ls.filter(x=>green.includes(x)).length*2>=ls.length)return LIQ_GREEN;
  const idx=ls.map(x=>LIQ_WARM.indexOf(x)).filter(x=>x>=0);if(!idx.length)return LIQ.map(x=>x[2]);
  return LIQ_WARM.slice(Math.max(0,Math.min(...idx)-2),Math.min(LIQ_WARM.length,Math.max(...idx)+3)).map(liqHex)}
const hexRgb = h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rgbHex = c=>'#'+c.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('').toUpperCase();
function gradAt(stops,p){const x=clamp(p,0,1)*(stops.length-1),i=Math.min(stops.length-2,Math.floor(x)),f=x-i;const a=hexRgb(stops[i]),b=hexRgb(stops[i+1]);return rgbHex(a.map((v,j)=>v+(b[j]-v)*f))}
function gradPos(stops,hex){const c=hexRgb(hex);let best=0,bd=1e9;for(let k=0;k<=200;k++){const d=hexRgb(gradAt(stops,k/200)).reduce((s,v,j)=>s+(v-c[j])**2,0);if(d<bd){bd=d;best=k/200}}return best}
function liqGrad(){const b=curBrew(),st=liqStops();
  const marks=S.steeps.map((x,k)=>k!==S.cur&&x.liq?`<span class="lg-mark" style="left:${gradPos(st,liqHex(x.liq))*100}%;--c:${liqHex(x.liq)}" title="Brew ${k+1}: ${liqName(x.liq)}">${k+1}</span>`:'').join('');
  return `<div class="field" data-mock="sel.swatch" data-mock-label="Liquor colour"><div class="lg-head"><label class="lbl" for="bs-liq">Liquor colour</label><span class="liq-name" id="lg-name">${b.liq?liqName(b.liq):'Not set'}</span><button type="button" class="linkbtn lg-clear" id="lg-clear" data-a="liqClear" ${b.liq?'':'hidden'}>Clear</button></div>
   <div class="lg ${b.liq?'':'unset'}" style="--grad:linear-gradient(90deg,${st.join(',')});--c:${b.liq?liqHex(b.liq):'transparent'}"><div class="lg-marks" aria-hidden="true">${marks}</div>
    <input type="range" id="bs-liq" data-bs="liq" min="0" max="1000" value="${b.liq?Math.round(gradPos(st,liqHex(b.liq))*1000):500}" aria-label="Liquor colour" aria-valuetext="${b.liq?liqName(b.liq):'not set'}"></div></div>`}
/* recommended ranges for the current brew. Water follows the leaf you chose (the guide's g per 100 ml);
   time follows how strong that makes the brew: more leaf per ml, shorter steeps. */
function brewRanges(){const rec=sProd()||sRec(),b=curBrew(),i=S.cur;const g=+S.g||0;
  const ml=g>0?[Math.round(g*100/rec.per[1]),Math.round(g*100/rec.per[0])]:null;
  const base=rec.sched[i]??Math.round((rec.sched[rec.sched.length-1]||30)*Math.pow(1.35,i-rec.sched.length+1));
  const k=g>0&&b.ml>0?(g/b.ml)/(rec.gT/rec.ml):1;const c=base*clamp(1/k,.5,2);
  return {temp:noTemp(S.style)?null:rec.t,ml,s:[Math.round(c*.8),Math.round(c*1.25)]}}
function rBands(){if(!$('#bw-panel'))return;const r=brewRanges(),b=curBrew(),tv=timeVals();
  const put=(k,lo,hi,min,max,v)=>{const el=$('#band-'+k);if(!el)return;if(lo==null){el.hidden=true;return}
    const a=clamp((lo-min)/(max-min),0,1),z=clamp((hi-min)/(max-min),0,1);el.hidden=false;el.style.setProperty('--a',a);el.style.setProperty('--b',z);
    $('#bo-'+k)?.classList.toggle('off',v<lo-.01||v>hi+.01)};
  if(r.temp)put('temp',r.temp[0],r.temp[1],40,100,b.temp);
  put('ml',r.ml?.[0],r.ml?.[1],20,volMax(),b.ml);
  put('s',nearIdx(tv,r.s[0]),nearIdx(tv,r.s[1]),0,tv.length-1,nearIdx(tv,b.s));$('#bo-s')?.classList.toggle('off',b.s<r.s[0]||b.s>r.s[1]);
  $('#bw-sl-guide').innerHTML=`Shaded: recommended for ${S.g} g of leaf · ${r.temp?fmtTR(r.temp,S.style)+' · ':''}${r.ml?r.ml[0]+'–'+r.ml[1]+' '+volU()+' · ':''}${fmtS(r.s[0])}–${fmtS(r.s[1])}`}
function rOverall(){const r=S.rating;
  $('#bw-overall').innerHTML=`<span class="lbl">Overall</span><div class="rating" role="group" aria-label="Overall rating" data-mock="sel.rating" data-mock-label="Overall 1–10">${Array.from({length:10},(_,i)=>`<button type="button" data-a="sRate" data-v="${i+1}" class="${r===i+1?'sel':r>i+1?'on':''}" aria-pressed="${r===i+1}">${i+1}</button>`).join('')}</div>
   ${S.style==='gongfu'||S.rinse?`<label class="toggle"><input type="checkbox" id="bw-rinse" ${S.rinse?'checked':''}> Rinsed first</label>`:''}
   <button type="button" class="btn primary fabext" data-a="saveSession" data-mock="act.fabext" data-mock-label="${S.editing?'Save changes':'Add to log'}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>${S.editing?'Save changes':'Add to log'}</button>`}
function rTabTime(k){const e=$('#btt-'+k);if(e)e.textContent=fmtS(S.steeps[k].s)}

/* comparison with earlier sessions: one block per session, brews as aligned temp · water · time items */
const CMP_PER=3;
function cmpSess(b,now){const st=b.steeps||[];const u=b.style==='ice'?'g':'ml';
  const brews=st.length?`<div class="cmp-brews">${st.map((s,i)=>`<span class="cb" title="Brew ${i+1}"><span>${noTemp(b.style)?(b.style==='ice'?'ice':'cold'):toU(s.temp??b.temp)+'°'}</span><span>${s.ml??b.ml}${u}</span><span>${fmtS(s.s)}</span></span>`).join('')}</div>`:'<span class="muted">No brews</span>';
  return `<div class="cs ${now?'cur':''}"><div class="cs-head"><b>${now?(S.editing?fmtDate(b.at):'Today'):fmtDate(b.at)}</b>${b.rating?`<span class="cs-rate">${b.rating}<small>/10</small></span>`:''}${now?'':`<button type="button" class="linkbtn" data-a="useBrew" data-v="${esc(b.id)}" title="Use this session's leaf, water, temperature and vessel">Use</button>`}</div>
   <div class="cs-meta">${[STYLE[b.style],esc(vesselOf(b).name),b.g?b.g+' g':''].filter(Boolean).join(' · ')}</div>${brews}</div>`}
function rCompare(){const el=$('#bw-compare');if(!el||!S)return;
  const past=brewsOf(S.teaId).filter(b=>b.id!==S.id).sort((a,b)=>dt(b.at)-dt(a.at));
  const pages=Math.max(1,Math.ceil(past.length/CMP_PER));S.cpage=clamp(S.cpage,0,pages-1);
  el.innerHTML=`<div class="panel-head"><h2>Compared with earlier sessions</h2><span class="aside muted">${past.length?past.length+' earlier':'First session'}</span></div>
   <div class="cs-key muted"><span>temp</span><span>water</span><span>time</span></div>
   ${cmpSess(S,true)}${past.slice(S.cpage*CMP_PER,(S.cpage+1)*CMP_PER).map(b=>cmpSess(b,false)).join('')}
   ${pages>1?`<div class="dots" role="group" aria-label="Pages of earlier sessions">${Array.from({length:pages},(_,p)=>`<button type="button" data-a="cPage" data-v="${p}" aria-label="Page ${p+1}" aria-current="${p===S.cpage}"></button>`).join('')}</div>`:''}`}

/* side: guide and the tea */
function rSide(){const el=$('#bw-guide');const t=sTea();const typ=sRec(),pr=sProd();const src=pr&&S.gsrc==='producer'?'producer':'typical';const r=src==='producer'?pr:typ;
  const tabs=`<div class="seg sidetabs" role="tablist" data-mock-skip aria-label="Tea information"><button type="button" role="tab" data-a="sideTab" data-v="guide" aria-pressed="${S.side==='guide'}" aria-selected="${S.side==='guide'}">Brew guide</button><button type="button" role="tab" data-a="sideTab" data-v="about" aria-pressed="${S.side==='about'}" aria-selected="${S.side==='about'}">About this tea</button></div>`;
  if(S.side==='about'){el.innerHTML=tabs+teaDetailsHTML(t);return}
  const tips=[...(src==='producer'&&pr.pnotes?[pr.pnotes]:[]),...(typ.tips||[])];
  const pg=S.gpage||0;
  el.innerHTML=`${tabs}
   <div class="bw-guide-head"><span class="eyebrow">${esc(STYLE[S.style]||S.style)} · ${src==='producer'?esc(t.brand||'Producer')+'’s recipe':typ.edited?'your guide':'typical guide'}</span>${pr?`<div class="seg sm" role="group" aria-label="Guide source"><button type="button" data-a="gSrc" data-v="typical" aria-pressed="${src==='typical'}">Typical</button><button type="button" data-a="gSrc" data-v="producer" aria-pressed="${src==='producer'}">Producer</button></div>`:''}</div>
   <div class="gp" id="gp">
    <section class="gp-page" aria-label="Instructions"><ol class="bw-steps" data-mock="txt.numbered">${stepsFor(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
    <section class="gp-page" aria-label="Details">${guideList(r)}${tips.length?`<div class="bw-tips">${tips.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}<button type="button" class="btn sm" data-a="${src==='producer'?'useProd':'useSugg'}">Use these settings</button></section>
   </div>
   <div class="gp-nav" role="group" aria-label="Guide pages"><button type="button" data-a="gPage" data-v="0" aria-pressed="${pg===0}">Instructions</button><span class="gp-dots" aria-hidden="true"><i class="${pg===0?'on':''}"></i><i class="${pg===1?'on':''}"></i></span><button type="button" data-a="gPage" data-v="1" aria-pressed="${pg===1}">Details ›</button></div>`;
  const gp=$('#gp');gp.scrollLeft=pg*gp.clientWidth;gpFit();
  gp.addEventListener('scroll',()=>{clearTimeout(gp._t);gp._t=setTimeout(()=>{S.gpage=Math.round(gp.scrollLeft/gp.clientWidth);gpNav()},120)},{passive:true})}
function gpFit(){const gp=$('#gp');const pg=gp?.children[S.gpage||0];if(pg)gp.style.height=pg.offsetHeight+'px'}
function gpNav(fit=true){const p=S.gpage||0;if(fit)gpFit();$$('.gp-nav button').forEach((b,i)=>b.setAttribute('aria-pressed',i===p));$$('.gp-dots i').forEach((d,i)=>d.classList.toggle('on',i===p))}

function guideList(r){const own=new Set(store.settings.vessels.map(v=>v.type));const u=r.style==='ice'?'g':'ml';
  const rows=[['Teaware',r.vessels.map(v=>VT[v].name+(own.has(v)?' ✓':'')).join(', ')],
   ['Leaf',`${fmtGR(r.g)} <span class="muted">(${r.per[0]===r.per[1]?r.per[0]:r.per[0]+'–'+r.per[1]} g / 100 ml)</span>`],
   [r.style==='ice'?'Ice':'Water',`${r.ml} ${u} <span class="muted">· 1:${Math.round(r.ml/r.gT)}</span>`],
   ['Temp',fmtTR(r.t,r.style)],
   ['Infusions',`${r.inf[0]===r.inf[1]?r.inf[0]:r.inf[0]+'–'+r.inf[1]}${r.rinse?' + '+(r.rinse>1?'2 rinses':'rinse'):''}<div class="sched">${r.sched.map((s,i)=>`<span><i>${i+1}</i>${fmtS(s)}</span>`).join('')}</div>`],
   ['Liquor',`${LIQM[r.liqs[0]].n} to ${LIQM[r.liqs[r.liqs.length-1]].n.toLowerCase()}`]];
  return `<dl class="bw-gl">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`}

/* timer: Start runs it; Stop ends the steep and logs the actual time to that brew. */
const T={run:false,t0:0,acc:0,target:0,brew:0,done:false,iv:null,chimed:false,ctx:null,lock:null};
const tElapsed=()=>T.acc+(T.run?(performance.now()-T.t0)/1000:0);
function tReset(brew){if(T.run)tPause();T.acc=0;T.chimed=false;T.done=false;if(brew!=null&&S){T.brew=brew;T.target=S.steeps[brew]?.s||30}}
function tStart(){if(T.run)return;T.run=true;T.t0=performance.now();
  try{T.ctx=T.ctx||new (window.AudioContext||window.webkitAudioContext)();T.ctx.resume?.()}catch{}
  try{navigator.wakeLock?.request('screen').then(l=>T.lock=l).catch(()=>{})}catch{}
  clearInterval(T.iv);T.iv=setInterval(tTick,100);rTimer()}
function tPause(){if(!T.run)return;T.acc=tElapsed();T.run=false;clearInterval(T.iv);try{T.lock?.release()}catch{}T.lock=null}
function tStopLog(){if(!T.run)return;tPause();const s=Math.max(1,Math.round(T.acc));T.acc=s;T.done=true;const b=S.steeps[T.brew];
  if(b){b.s=s;if(S.cur===T.brew)rBrews();else rTabTime(T.brew)}rCompare();rTimer();toast(`Brew ${T.brew+1}: ${fmtS(s)} logged`)}
function rTimer(){const el=$('#bw-timer');if(!el||!S)return;const e=tElapsed();const over=T.run&&e>=T.target;
  el.className='bw-timer'+(T.run?' running':'')+(over?' over':'')+(T.done?' done':'');
  el.innerHTML=`<div class="tm-read" role="timer" aria-label="Steep timer"><span class="tm-time" id="ringT">${T.done?fmtClock(e):over?'+'+fmtClock(e-T.target):fmtClock(Math.ceil(T.target-e))}</span><span class="tm-sub" id="ringS">${T.done?'brew '+(T.brew+1)+' logged':T.run?(over?'pour now':'steeping'):'brew '+(T.brew+1)}</span></div>
   <span class="tm-bar" aria-hidden="true"><i id="ringP" style="width:${clamp(e/(T.target||1),0,1)*100}%"></i></span>
   <div class="tm-ctrl">${T.run?`<button type="button" class="btn primary" data-a="tStop" title="End this steep and log the time">■ Stop</button><button type="button" class="btn ghost" data-a="tReset" title="Stop without logging">Cancel</button>`
    :T.done?`<button type="button" class="btn primary" data-a="brewNext">＋ Next brew</button><button type="button" class="btn ghost" data-a="tReset">Redo</button>`
    :`<button type="button" class="btn primary" data-a="tStart">▶ Start</button>`}</div>`}
function tTick(){if(!T.run)return;const e=tElapsed();const p=$('#ringP'),tt=$('#ringT'),ss=$('#ringS');if(!p){return}
  const rem=T.target-e;p.style.width=clamp(e/T.target,0,1)*100+'%';
  if(rem>0){tt.textContent=fmtClock(Math.ceil(rem));ss.textContent='steeping'}else{tt.textContent='+'+fmtClock(-rem);ss.textContent='pour now'}
  if(!T.chimed&&e>=T.target){T.chimed=true;chime();rTimer()}}
function chime(){try{const c=T.ctx;if(!c)return;[0,.22,.44].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=i===2?1046:784;o.connect(g);g.connect(c.destination);const t=c.currentTime+d;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.start(t);o.stop(t+.45)})}catch{}try{navigator.vibrate?.([120,80,120])}catch{}}

/* edits */
function addBrew(){S.steeps.push(newBrew());S.cur=S.steeps.length-1;rBrews();rCompare()}
function setStyle(style){S.style=style;const r=sProd()||sRec();S.touched.clear();S.g=r.gT;S.rinse=style==='gongfu'&&r.rinse>0;pickDefaultVessel();
  S.steeps.forEach((b,i)=>{b.s=r.sched[i]??nextTarget(i);b.temp=noTemp(style)?null:r.target;b.ml=r.ml});if(!T.run)tReset(S.cur);renderBrew()}
function setVessel(w){S.vesselId=w.id;S.vesselType=w.type;S.vesselName=w.name;
  if(!S.touched.has('ml')&&w.ml&&['gongfu','kyusu','glass'].includes(S.style)){S.steeps.forEach(b=>b.ml=w.ml);if(!S.touched.has('g'))S.g=half(avg(sRec().per)*w.ml/100)}
  rTop();rBrews();rCompare()}
function applyRecipe(r){S.g=r.gT;S.steeps.forEach((b,i)=>{b.ml=r.ml;b.temp=noTemp(S.style)?null:r.target;if(r.sched[i]!=null)b.s=r.sched[i]});if(!T.run)tReset(S.cur);rTop();rBrews();rCompare();rTimer();toast('Guide settings applied')}
function useBrew(id){const p=store.brews.find(x=>x.id===id);if(!p)return;S.g=p.g;
  if(p.vesselId&&store.settings.vessels.some(w=>w.id===p.vesselId)){S.vesselId=p.vesselId;S.vesselType=p.vesselType;S.vesselName=p.vesselName}
  if(p.style!==S.style&&methodsFor(sTea()).some(m=>m.style===p.style))S.style=p.style;
  S.steeps.forEach((b,i)=>{const q=p.steeps?.[i];b.ml=q?.ml??p.ml;b.temp=noTemp(S.style)?null:(q?.temp??p.temp);if(q)b.s=q.s});
  ['g','ml'].forEach(k=>S.touched.add(k));if(!T.run)tReset(S.cur);renderBrew();toast('Settings from '+fmtDate(p.at)+' applied')}
function addStepTag(i){const inp=$('#st-ctag-'+i);const val=inp.value.trim().toLowerCase();if(!val)return;const s=S.steeps[i];s.tags=s.tags||[];if(!s.tags.includes(val))s.tags.push(val);rBrews();setTimeout(()=>$('#st-ctag-'+i)?.focus(),0)}
function brewInput(t){
  if(t.id==='bw-g'){t.style.width=Math.max(1.5,t.value.length+.3)+'ch';const n=parseFloat(t.value);if(!isNaN(n)){S.g=Math.max(0,n);S.touched.add('g');rBands();rCompare()}return true}
  if(t.dataset.bs){const b=curBrew(),k=t.dataset.bs;
    if(k==='note'){b.note=t.value;return true}
    if(k==='liq'){b.liq=gradAt(liqStops(),t.value/1000);const lg=t.closest('.lg');lg.classList.remove('unset');lg.style.setProperty('--c',b.liq);$('#lg-name').textContent=liqName(b.liq);$('#lg-clear').hidden=false;t.setAttribute('aria-valuetext',liqName(b.liq));
      const d=$('#bt-'+S.cur+' .ldot');if(d)d.style.setProperty('--liq',b.liq);return true}
    setBrewVal(k,k==='s'?timeVals()[+t.value]:+t.value,true);return true}
  if(t.dataset.axis){const k=t.dataset.axis,b=curBrew();b.axes={...blankAxes(),...b.axes,[k]:+t.value};$('#axo-'+k).textContent=t.value==='0'?'–':t.value;$('#bw-radar').innerHTML=radarSVG([{v:b.axes}],{size:190});return true}
  return false}
function brewChange(t){
  if(t.id==='bw-g'){t.value=S.g;rTop();return true}
  if(t.id==='bw-rinse'){S.rinse=t.checked;return true}
  if(t.id==='bw-at'){const[y,m,d]=t.value.split('-').map(Number);if(y){const o=dt(S.at);o.setFullYear(y,m-1,d);S.at=o.toISOString()}return true}
  return false}
function brewAction(a,v,el){
  switch(a){
   case 'cyc':{const[k,d]=v.split(':');const dir=+d;
     if(k==='leaf'){S.g=Math.max(0,r1((+S.g||0)+dir*.5));S.touched.add('g');rTop();rBands();rCompare();return true}
     if(k==='style'){const ms=methodsFor(sTea()).map(m=>m.style);const i=ms.indexOf(S.style);setStyle(ms[(i+dir+ms.length)%ms.length]);return true}
     if(k==='vessel'){const own=store.settings.vessels;if(!own.length){toast('Add your teaware in Settings to choose a vessel');return true}const i=own.findIndex(w=>w.id===S.vesselId);setVessel(own[(i+dir+own.length)%own.length]);return true}
     return true}
   case 'bwTab':S.cur=+v;rBrews();if(!T.run){tReset(S.cur);rTimer()}$('#bt-'+v)?.focus();return true;
   case 'brewAdd':addBrew();if(!T.run){tReset(S.cur);rTimer()}return true;
   case 'brewRm':S.steeps.splice(S.cur,1);S.cur=Math.max(0,S.cur-1);if(T.brew>=S.steeps.length)T.brew=S.steeps.length-1;rBrews();rCompare();rTimer();return true;
   case 'brewNext':addBrew();tReset(S.cur);rTimer();return true;
   case 'slStep':{const[k,d]=v.split(':');const dir=+d;const cur=curBrew()[k]??sRec().target;setBrewVal(k,cur+dir*fineStep(k,cur,dir));return true}
   case 'liqClear':curBrew().liq='';rBrews();return true;
   case 'tStart':tStart();return true;
   case 'tStop':tStopLog();return true;
   case 'tReset':tReset(T.brew);rTimer();return true;
   case 'stScore':{const[i,n]=v.split(':').map(Number);S.steeps[i].score=S.steeps[i].score===n?0:n;rBrews();return true}
   case 'stTag':{const s=S.steeps[+v];const tg=el.dataset.tag;s.tags=s.tags||[];const k=s.tags.indexOf(tg);k>=0?s.tags.splice(k,1):s.tags.push(tg);el.setAttribute('aria-pressed',k<0);return true}
   case 'stAddTag':addStepTag(+v);return true;
   case 'sRate':S.rating=S.rating===+v?0:+v;rOverall();rCompare();return true;
   case 'sideTab':S.side=v;rSide();return true;
   case 'gSrc':S.gsrc=v;rSide();return true;
   case 'gPage':{S.gpage=+v;const gp=$('#gp');if(!gp)return true;const x=S.gpage*gp.clientWidth;gp.scrollTo({left:x,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});gpNav(false);
     setTimeout(()=>{if(Math.abs(gp.scrollLeft-x)>2)gp.scrollLeft=x;gpFit()},450);return true}
   case 'useSugg':applyRecipe(sRec());return true;
   case 'useProd':applyRecipe(sProd());return true;
   case 'useBrew':useBrew(v);return true;
   case 'cPage':S.cpage=+v;rCompare();return true;
   case 'brewBack':if(!leaveOK())return true;{const f=S.from||{view:'tea',teaId:S.teaId};setView(f.view==='brew'?'tea':f.view,{teaId:f.teaId||S.teaId})}return true;
   case 'saveSession':saveSession();return true;
  }
  return false}

/* save */
function avgAxes(bs){const rated=bs.filter(b=>hasAxes(b));if(!rated.length)return {};const o={};AXES.forEach(([k])=>o[k]=r1(avg(rated.map(b=>b.axes[k]||0))));return o}
async function saveSession(){
  if(T.run)tPause();
  const t=sTea();const v=vesselOf(S);const cold=noTemp(S.style);
  const steeps=S.steeps.map(s=>({s:s.s,temp:cold?null:+s.temp,ml:+s.ml||0,liq:s.liq||'',score:s.score||0,tags:s.tags||[],note:s.note||'',...(hasAxes(s)?{axes:s.axes}:{})}));
  const b={teaId:t.id,tea:t.name,cat:t.fam,at:S.at,style:S.style,vesselId:S.vesselId||'',vesselType:v.type,vesselName:v.name,g:+S.g||0,ml:steeps[0]?.ml||0,temp:cold?null:steeps[0]?.temp??null,rinse:!!S.rinse,
    steeps,rating:S.rating||0,axes:avgAxes(steeps),notes:S.notes||'',water:S.water||'',liq:steeps[0]?.liq||'',tags:[...new Set(steeps.flatMap(s=>s.tags))],id:S.id};
  if(S.editing&&S.example)b.example=true;
  const btn=$('[data-a="saveSession"]');btn.disabled=true;const label=btn.innerHTML;btn.textContent='Saving…';
  const ov=pourOverlay(t,b);const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{await Promise.all([store.saveBrew(b),new Promise(r=>setTimeout(r,still?600:2600))]);
    S.snap=brewSnap();tReset();ov.classList.add('done');ov.querySelector('.po-sub').textContent=ov.dataset.done;
    await new Promise(r=>{const go=()=>{clearTimeout(k);r()};const k=setTimeout(go,still?1200:1500);ov.addEventListener('click',go,{once:true})});
    ov.remove();const f=S.from||{};f.view&&f.view!=='brew'?setView(f.view,{teaId:f.teaId||t.id}):setView('tea',{teaId:t.id})}
  catch(e){ov.remove();btn.disabled=false;btn.innerHTML=label;toast(e?.code==='quota_exceeded'?'Storage is full. Delete some old sessions to make room.':'Could not save. Check your connection and try again.')}
}
const POUR_LINES=['Steeped, sipped and saved.','Another cup for the notebook.','The leaves thank you.','Noted, down to the last drop.','A fine session, well kept.'];
function pourOverlay(t,b){const n=b.steeps.length;const liq=liqHex(b.steeps.find(s=>s.liq)?.liq||midLiq(liqsOf(t)));
  const ov=document.createElement('div');ov.className='pour';ov.setAttribute('role','status');ov.setAttribute('aria-live','polite');ov.style.setProperty('--liq',liq);
  ov.dataset.done=`${n} brew${n===1?'':'s'} of ${t.name}${b.rating?`, rated ${b.rating}/10`:''}.`;
  ov.innerHTML=`<div class="po-card">
   <svg class="po-art" viewBox="0 0 240 170" aria-hidden="true">
    <ellipse class="po-saucer" cx="152" cy="155" rx="36" ry="4.5"/>
    <path class="po-stream" d="M128 88 Q140 96 147 132" pathLength="100"/>
    <path class="po-cup-bg" d="M128 110 L132 146 Q134 152 140 152 L164 152 Q170 152 172 146 L176 110 Z"/>
    <clipPath id="poCup"><path d="M128 110 L132 146 Q134 152 140 152 L164 152 Q170 152 172 146 L176 110 Z"/></clipPath>
    <g clip-path="url(#poCup)"><rect class="po-fill" x="126" y="110" width="52" height="44"/></g>
    <path class="po-cup" d="M128 110 L132 146 Q134 152 140 152 L164 152 Q170 152 172 146 L176 110 Z"/>
    <path class="po-cup-h" d="M175 118 C190 118 190 138 172 138"/>
    <path class="po-steam s1" d="M146 104 q-5 -8 0 -16 q5 -8 0 -16"/><path class="po-steam s2" d="M158 104 q-5 -8 0 -16 q5 -8 0 -16"/>
    <g class="po-pot">
     <path class="po-pot-h" d="M38 58 C16 58 16 88 42 86"/>
     <path class="po-pot-b" d="M100 70 L124 50 L128 52 L106 82 Z"/>
     <ellipse class="po-pot-b" cx="70" cy="70" rx="34" ry="26"/>
     <path class="po-pot-l" d="M48 48 Q70 34 92 48 Z"/><circle class="po-pot-l" cx="70" cy="38" r="4"/>
    </g>
   </svg>
   <h2 class="po-title"><span class="po-t1">Logging away this tea session…</span><span class="po-t2">${esc(POUR_LINES[Math.floor(Math.random()*POUR_LINES.length)])}</span></h2>
   <p class="po-sub">${esc(t.name)} · ${n} brew${n===1?'':'s'}</p></div>`;
  document.body.appendChild(ov);return ov}
