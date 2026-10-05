/* ═════════ Utilities ═════════ */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const LS = {get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const r1 = n=>Math.round(n*10)/10;
const half = n=>Math.round(n*2)/2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const uid = p=>(p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const avg = a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const dt = iso=>new Date(iso);
const fmtDate = iso=>dt(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const fmtLong = iso=>dt(iso).toLocaleString(undefined,{weekday:'short',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
function fmtS(s){s=Math.round(s||0);if(s<60)return s+'s';if(s<3600){const m=Math.floor(s/60),x=s%60;return m+':'+String(x).padStart(2,'0')}const h=Math.floor(s/3600),m=Math.round((s%3600)/60);return h+'h'+(m?m+'m':'')}
function fmtLongS(s){s=Math.round(s||0);if(s<60)return s+' seconds';if(s<3600){const m=s/60;return (m%1?fmtS(s):m)+(m===1?' minute':' minutes')}const h=s/3600;return (h%1?r1(h):h)+(h===1?' hour':' hours')}
function fmtClock(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function parseS(str){str=String(str).trim().toLowerCase();if(!str)return null;let m;
  if((m=str.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m?)?$/)))return Math.round(+m[1]*3600+(+m[2]||0)*60);
  if((m=str.match(/^(\d+(?:\.\d+)?)\s*m(?:in)?(?:\s*(\d+)\s*s?)?$/)))return Math.round(+m[1]*60+(+m[2]||0));
  if((m=str.match(/^(\d+):(\d{1,2})$/)))return +m[1]*60+ +m[2];
  if((m=str.match(/^(\d+)\s*s?$/)))return +m[1];return null}
const parseSched = str=>String(str||'').split(/[,;\/]+|\s+(?=\d)/).map(x=>parseS(x)).filter(x=>x>0);
function toLocalInput(iso){const d=dt(iso);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600)}
const unitF = ()=>store.settings.unit==='F';
const toU = c=>unitF()?Math.round(c*9/5+32):Math.round(c);
const fromU = v=>unitF()?r1((v-32)*5/9):v;
const deg = ()=>'°'+(unitF()?'F':'C');
const noTemp = st=>st==='cold'||st==='ice';
const fmtT = (c,style)=>style==='cold'?'Fridge':style==='ice'?'Ice':(c==null||c===''?'—':toU(c)+deg());
const fmtTR = (r,style)=>style==='cold'?'Fridge, 2–8°C':style==='ice'?'Ice, melting':r[0]===r[1]?toU(r[0])+deg():`${toU(r[0])}–${toU(r[1])}${deg()}`;
const fmtGR = g=>g[0]===g[1]?`${g[0]} g`:`${g[0]}–${g[1]} g`;
const per100 = b=>b.g>0&&b.ml>0?r1(b.g/b.ml*100):null;
const ratioStr = b=>b.g>0&&b.ml>0?'1:'+Math.round(b.ml/b.g):'—';
const totalSteep = b=>(b.steeps||[]).reduce((a,s)=>a+(s.s||0),0);
const stage = c=>c>=99?'full boil':c>=90?'rolling':c>=80?'string of pearls':c>=70?'shrimp eyes':c>=50?'crab eyes':c>=20?'warm':'cold';

/* ═════════ Tea types & the brewing guide ═════════ */
const famOf = id=>FAM[id]||FAM.other;
const libByName = n=>n?LIB.find(t=>t.name===n):null;
function libMatch(name){const n=norm(name);if(!n)return null;
  const exact=LIB.find(t=>norm(t.name)===n||(t.aka&&norm(t.aka)===n));if(exact)return exact;
  let best=null;LIB.forEach(t=>{[t.name,t.aka].forEach(x=>{const k=norm(x);if(k.length>=4&&n.includes(k)&&(!best||k.length>best.k))best={t,k:k.length}})});return best?.t||null}
function customType(id){const c=(store.settings.customTypes||[]).find(x=>x.id===id);return c?{name:c.name,aka:'Your type',fam:c.fam,origin:'',x:c.t?{t:c.t}:{},custom:true}:null}
function typeOf(tea){if(!tea)return null;if(tea.lib?.startsWith('c:'))return customType(tea.lib.slice(2));return libByName(tea.lib)||(!tea.lib&&tea.virtual?libMatch(tea.name):null)}
const STY_ORDER = STY.map(s=>s[0]);
function methodsFor(tea,opt={}){
  const F=famOf(tea.fam),T=typeOf(tea),x=T?.x||{};let ms={...F.methods};
  if(x.only)ms=Object.fromEntries(Object.entries(ms).filter(([k])=>x.only.includes(k)));
  if(x.t)for(const k in ms)if(HOT.includes(k))ms[k]={...ms[k],t:x.t};
  if(x.m)for(const[k,v]of Object.entries(x.m)){if(v===false)delete ms[k];else if(ms[k])ms[k]={...ms[k],...v}}
  if(x.add)Object.assign(ms,x.add);
  const key=gKey(tea);return STY_ORDER.filter(k=>ms[k]).map(k=>{const o=opt.raw?null:ovGet(key,k);const s0=ms[k];const n0=s0.sched.length;const inf0=s0.inf||(n0>2?[Math.max(1,n0-2),n0]:[n0,n0]);const s={...s0,inf:inf0,...(o||{})};return{style:k,...s,vessels:s.vessels||STYLE_VESSELS[k],rinse:s.rinse||0,edited:!!o}});
}
const dryOf = tea=>typeOf(tea)?.x.dry||famOf(tea?.fam).dry;
const liqsOf = tea=>typeOf(tea)?.x.liqs||famOf(tea?.fam).liqs;
function recFor(tea,style){
  const ms=methodsFor(tea);const m=ms.find(x=>x.style===style)||ms[0];
  const target=noTemp(m.style)?4:(m.t[0]===m.t[1]?m.t[0]:Math.round((m.t[0]+m.t[1])/2));
  return {...m,target,gT:half(avg(m.g)),per:[r1(m.g[0]/m.ml*100),r1(m.g[1]/m.ml*100)],liqs:liqsOf(tea),dry:dryOf(tea),fam:famOf(tea.fam),type:typeOf(tea),tips:[...famOf(tea.fam).tips]};
}
function prodFor(tea,style){const p=tea?.producer;if(!p||p.style!==style)return null;const typ=recFor(tea,style);const has=x=>x!=null&&x!==''&&!isNaN(x);
  const t=has(p.temp)?[+p.temp,+p.temp]:typ.t,g=has(p.g)?[+p.g,+p.g]:typ.g,ml=has(p.ml)?+p.ml:typ.ml,sched=p.sched?.length?p.sched:typ.sched;
  return {...typ,t,target:noTemp(style)?4:t[0],g,gT:g[0],ml,per:[r1(g[0]/ml*100),r1(g[1]/ml*100)],sched,inf:p.sched?.length?[sched.length,sched.length]:typ.inf,producer:true,pnotes:p.notes||''}}
function stepsFor(r){
  const v=VT[r.vessels[0]]?.name.toLowerCase()||'vessel',T=fmtTR(r.t,r.style),G=fmtGR(r.g),s=r.sched,first=s.slice(0,4).map(fmtS).join(', ');
  switch(r.style){
   case 'gongfu':return [`Warm the ${v} and cups with boiling water, then discard it.`,`Add ${G} of leaf for ${r.ml} ml. Smell the warmed dry leaf.`,r.rinse?`Rinse${r.rinse>1?' twice':''}: cover the leaf with water and pour it off at once.`:null,`Infuse at ${T}: ${first}${s.length>4?'…':''} Lengthen each infusion as the leaf tires.`,'Decant completely every time so the leaf does not keep steeping.'].filter(Boolean);
   case 'kyusu':return [`Boil the water, then pour it into the cups to warm them and cool it to ${T}.`,`Add ${G} of leaf to the ${v} and pour the water from the cups onto it (${r.ml} ml).`,`Leave the pot still for ${fmtLongS(s[0])}.`,'Pour into the cups in rotation, a little at a time, so every cup is even. Shake out the last drops.',s.length>1?`Next infusions: ${s.slice(1).map(fmtS).join(', ')}, with slightly hotter water.`:null].filter(Boolean);
   case 'western':return [`Warm the ${v}.`,`Add ${G} of leaf to ${r.ml} ml of water at ${T}.`,`Steep ${fmtLongS(s[0])}, then strain completely.`,s.length>1?`Re-steep for ${s.slice(1).map(fmtS).join(', then ')}.`:null].filter(Boolean);
   case 'glass':return [`Warm the glass with a splash of hot water.`,`Add ${G} of leaf and just enough water at ${T} to wet it; wait 30 seconds and smell the aroma.`,`Fill to ${r.ml} ml, pouring down the side. Sip after about ${fmtLongS(s[0])}.`,'Top up with hot water when a third remains.'];
   case 'cold':return [`Put ${G} of leaf in a jar with ${r.ml} ml of cold, filtered water.`,`Refrigerate for ${fmtLongS(s[0])}, then strain.`,'Keeps for two days in the fridge.'];
   case 'ice':return [`Put ${G} of leaf in a ${v} and pile about ${r.ml} g of ice on top.`,`Let the ice melt slowly at room temperature, about ${fmtLongS(s[0])}.`,'Pour off the few concentrated, broth-like drops.','Follow with a normal warm infusion.'];
   case 'iced':return [`Brew double strength: ${G} of leaf in ${r.ml} ml at ${T} for ${fmtLongS(s[0])}.`,'Pour straight over a glass packed with ice; the melt dilutes it to drinking strength.'];
   case 'whisked':return [`Sift ${G} of matcha into a warmed chawan.`,`Add ${r.ml} ml of water at ${T}.`,'Whisk briskly in a W motion for 15–20 seconds until a fine, even foam forms.','Lift the whisk from the centre and drink right away.'];
   case 'koicha':return [`Sift ${G} of ceremonial-grade matcha into a warmed chawan.`,`Add ${r.ml} ml of water at ${T}, a little at a time.`,'Knead slowly with the whisk into a glossy, thick paste. No foam.'];
   case 'simmer':return r.type?.name==='Masala chai'?['Simmer crushed cardamom, ginger, cinnamon and clove in 200 ml of water for 3 minutes.',`Add ${G} of tea and simmer 2 minutes.`,'Add 200 ml of milk and sugar to taste; bring just to a rise, then strain.']:[`Add ${G} of leaf to ${r.ml} ml of water in a saucepan.`,`Bring to a gentle simmer for ${fmtLongS(s[0])}.`,'Strain and serve; spent leaf from a gongfu session works well here.'];
  }
  return [];
}
function defaultStyle(tea){const ms=methodsFor(tea).map(m=>m.style);const last=brewsOf(tea.id).sort((a,b)=>dt(b.at)-dt(a.at))[0];if(last&&ms.includes(last.style))return last.style;return tea.producer?.style&&ms.includes(tea.producer.style)?tea.producer.style:ms[0]}
const midLiq = liqs=>liqs[Math.floor((liqs.length-1)/2)];
function vsBand(v,[lo,hi]){if(v==null||isNaN(v))return 'na';return v<lo-.01?'low':v>hi+.01?'high':'ok'}
function benchHTML(kind,b,rec){
  if(!rec)return '';let st,txt;
  if(kind==='temp'){if(noTemp(b.style))return '<span class="bench ok">✓ cold</span>';st=vsBand(b.temp,rec.t);const d=st==='low'?toU(b.temp)-toU(rec.t[0]):toU(b.temp)-toU(rec.t[1]);txt=st==='ok'?'✓ in range':(st==='low'?'↓ ':'↑ +')+d+'°'}
  else if(kind==='leaf'){const p=per100(b);st=vsBand(p,rec.per);txt=st==='ok'?'✓ in range':st==='low'?'↓ light':st==='high'?'↑ heavy':'—'}
  else if(kind==='inf'){const n=(b.steeps||[]).length;st=n?vsBand(n,rec.inf):'na';txt=st==='ok'?'✓ '+n:st==='low'?'↓ fewer':st==='high'?'↑ more':'none'}
  else if(kind==='time'){const r=steepRatio(b,rec);if(r==null){st='na';txt='—'}else{st=r<.8?'low':r>1.25?'high':'ok';txt=st==='ok'?'✓ on guide':st==='low'?'↓ '+Math.round((1-r)*100)+'% shorter':'↑ '+Math.round((r-1)*100)+'% longer'}}
  return `<span class="bench ${st==='ok'?'ok':st==='na'?'na':'off'}">${txt}</span>`;
}
function steepRatio(b,rec){const st=b.steeps||[];const n=Math.min(st.length,rec.sched.length);if(!n)return null;let a=0;for(let i=0;i<n;i++)a+=(st[i].s||0)/rec.sched[i];return a/n}

/* ═════════ State & storage ═════════ */
const state = {libQ:'',libFam:'',libRebuy:'',libSort:'recent',showFinished:false,gq:'',gSel:null,gStyle:null,view:'shelf',teaId:null,teaStyle:null,teaSrc:'typical',q:'',jq:'',jcats:new Set(),jmin:0,shelfFam:'',xAxis:'temp'};
function normBrew(raw){const b={...raw};b.teaId=b.teaId||('v_'+(norm(b.tea)||'untitled'));b.steeps=(b.steeps||[]).map(s=>typeof s==='number'?{s}:{...s,tags:s.tags||[]});b.axes=b.axes||{};b.tags=b.tags||[];return b}
const normTea = t=>({...t,fam:FAM[t.fam]?t.fam:(t.cat==='cat'||!t.cat?'other':FAM[t.cat]?t.cat:'other')});
const store = {
  mode:'pending',teas:[],brews:[],settings:{...DEFAULT_SETTINGS,...LS.get('lln-settings',{})},db:null,downloads:null,sample:null,sampleImages:false,_setT:null,
  async init(){
    const use=n=>window.claude?.use?window.claude.use(n).catch(()=>null):Promise.resolve(null);
    const db=await use('db');
    if(db){
      this.db=db;this.mode='db';let ready=0;const go=()=>{ready++;if(ready>=2)renderAll()};
      const err=()=>toast('Lost the connection to your notes. Reload the page to reconnect.');
      db.collection('teas').onSnapshot(s=>{this.teas=s.docs.map(d=>normTea({...d.data(),id:d.id}));ready>=2?renderAll():go()},err);
      db.collection('brews').onSnapshot(s=>{this.brews=s.docs.map(d=>normBrew({...d.data(),id:d.id}));ready>=2?renderAll():go()},err);
      db.doc('settings/prefs').onSnapshot(s=>{if(s.exists){this.settings={...DEFAULT_SETTINGS,...s.data()};LS.set('lln-settings',{unit:this.settings.unit,tempMode:this.settings.tempMode});if(ready>=2&&!S&&!TF)renderAll()}},()=>{});
    }else{
      this.mode='local';this.teas=LS.get('lln-teas',[]).map(normTea);this.brews=LS.get('lln-brews',[]).map(normBrew);
      this.settings={...DEFAULT_SETTINGS,...LS.get('lln-settings-full',{})};renderAll();
    }
    use('downloads').then(d=>{this.downloads=d;if(d&&state.view==='settings')renderSettings()});
    use('sample').then(async s=>{this.sample=s;if(s){try{const l=await s.limits();this.sampleImages=!!l?.images;this.imageTypes=l?.images?.mediaTypes||[]}catch{}}if(TF)refreshImportUI()});
  },
  async saveTea(t){const body=JSON.parse(JSON.stringify(t));delete body.id;delete body.virtual;delete body.cat;
    if(this.mode==='db')await this.db.collection('teas').doc(t.id).set(body);
    else{const nt=normTea({...body,id:t.id});const i=this.teas.findIndex(x=>x.id===t.id);i>=0?this.teas[i]=nt:this.teas.push(nt);LS.set('lln-teas',this.teas);renderAll()}},
  async saveBrew(b){const body=JSON.parse(JSON.stringify(b));delete body.id;
    if(this.mode==='db')await this.db.collection('brews').doc(b.id).set(body);
    else{const i=this.brews.findIndex(x=>x.id===b.id);const nb=normBrew({...body,id:b.id});i>=0?this.brews[i]=nb:this.brews.push(nb);LS.set('lln-brews',this.brews);renderAll()}},
  async removeBrew(id){if(this.mode==='db')await this.db.collection('brews').doc(id).delete();else{this.brews=this.brews.filter(b=>b.id!==id);LS.set('lln-brews',this.brews);renderAll()}},
  async removeTea(id){for(const b of this.brews.filter(b=>b.teaId===id))await this.removeBrew(b.id);
    if(this.mode==='db')await this.db.collection('teas').doc(id).delete();else{this.teas=this.teas.filter(t=>t.id!==id);LS.set('lln-teas',this.teas);renderAll()}},
  setSettings(patch){this.settings={...this.settings,...patch};LS.set('lln-settings',{unit:this.settings.unit,tempMode:this.settings.tempMode});
    clearTimeout(this._setT);this._setT=setTimeout(async()=>{try{if(this.mode==='db')await this.db.doc('settings/prefs').set(JSON.parse(JSON.stringify(this.settings)));else LS.set('lln-settings-full',this.settings)}catch{toast('Could not save settings. Try again.')}},400)}
};
function allTeas(){
  const real=store.teas.map(t=>({...t}));const ids=new Set(real.map(t=>t.id));const virt={};
  store.brews.forEach(b=>{if(!ids.has(b.teaId)&&!virt[b.teaId]){const L=libMatch(b.tea);virt[b.teaId]={id:b.teaId,name:b.tea||'Untitled tea',fam:L?.fam||(FAM[b.cat]?b.cat:'other'),lib:L?.name||'',brand:b.vendor||'',origin:b.origin||L?.origin||'',harvest:b.year||'',cultivar:b.cultivar||'',virtual:true,example:b.example}}});
  return real.concat(Object.values(virt));
}
const teaById = id=>allTeas().find(t=>t.id===id);
const brewsOf = id=>store.brews.filter(b=>b.teaId===id);
const teaName = b=>teaById(b.teaId)?.name||b.tea||'Untitled tea';
function teaLiq(tea){const last=brewsOf(tea.id).sort((a,b)=>dt(b.at)-dt(a.at))[0];return last?.liq||last?.steeps?.[0]?.liq||midLiq(liqsOf(tea))}
function vesselOf(b){const own=store.settings.vessels.find(v=>v.id===b.vesselId);return own?{...own}:{type:b.vesselType||'gaiwan',name:b.vesselName||VT[b.vesselType]?.name||'Vessel',ml:VT[b.vesselType]?.ml}}

/* ═════════ Illustrations ═════════ */
function vesselSVG(type){
  const v=VT[type]||VT.gaiwan,m='m-'+v.mat;let p='';
  switch(v.icon){
    case 'gaiwan':p=`<ellipse class="${m}" cx="32" cy="42" rx="22" ry="3.5"/><path class="${m}" d="M15 24 C16 35 23 39 32 39 C41 39 48 35 49 24 Z"/><path class="${m}" d="M13 24 C18 14 46 14 51 24 Z"/><ellipse class="${m}" cx="32" cy="13.5" rx="4" ry="2"/>`;break;
    case 'teapot':p=`<path class="${m}" d="M17 30 C10 28 8 22 5 17 L8.5 15.5 C11 20 14 23 18 24.5"/><path class="${m} nofill" d="M46 24 C57 22 58 37 45 37"/><ellipse class="${m}" cx="31" cy="31" rx="16" ry="11"/><path class="${m}" d="M22 21 C25 16.5 37 16.5 40 21 Z"/><circle class="${m}" cx="31" cy="15" r="2.5"/>`;break;
    case 'bigpot':p=`<path class="${m}" d="M14 30 C7 28 5 21 3 15 L6.5 14 C8.5 19 11 23 15 24"/><path class="${m} nofill" d="M49 22 C60 20 61 38 48 39"/><ellipse class="${m}" cx="32" cy="30" rx="19" ry="13"/><path class="${m}" d="M21 18.5 C25 13 39 13 43 18.5 Z"/><circle class="${m}" cx="32" cy="12" r="2.5"/>`;break;
    case 'glass':p=`<path class="${m} nofill" d="M46 18 C56 18 56 34 46 34"/><path class="${m}" d="M18 12 H46 V36 C46 41 42 43 38 43 H26 C22 43 18 41 18 36 Z"/><path class="liquid" d="M19.5 25 H44.5 V36 C44.5 40 41.5 41.5 38 41.5 H26 C22.5 41.5 19.5 40 19.5 36 Z"/><path class="${m}" d="M18 14 L12 11"/><rect class="${m}" x="20" y="8" width="24" height="4" rx="1.5"/>`;break;
    case 'kyusu':p=`<path class="${m}" d="M17 31 C11 30 9 26 7 22 L10 21 C12 24 14 26 18 27"/><rect class="${m}" x="44" y="18" width="17" height="6" rx="3" transform="rotate(-28 44 21)"/><ellipse class="${m}" cx="30" cy="31" rx="15" ry="11"/><path class="${m}" d="M21 22 C24 17.5 36 17.5 39 22 Z"/><circle class="${m}" cx="30" cy="16.5" r="2.2"/>`;break;
    case 'houhin':p=`<path class="${m}" d="M14 28 L7 25 L8 29 Z"/><path class="${m}" d="M13 27 C13 40 51 40 51 27 Z"/><path class="${m}" d="M17 27 C21 19 43 19 47 27 Z"/><ellipse class="${m}" cx="32" cy="19.5" rx="3.5" ry="2"/>`;break;
    case 'shibo':p=`<path class="${m}" d="M10 30 C10 38 54 38 54 30 Z"/><path class="${m}" d="M12 30 C18 24 46 24 52 30 Z"/><ellipse class="${m}" cx="32" cy="24.5" rx="3.5" ry="1.8"/><path class="${m}" d="M10 30 L6 28.5 L7 31 Z"/>`;break;
    case 'mug':p=`<path class="${m} nofill" d="M42 20 C52 20 52 35 42 35"/><rect class="${m}" x="18" y="14" width="24" height="29" rx="3"/><path class="liquid" d="M19.5 20 H40.5 V40 C40.5 41 40 41.5 39 41.5 H21 C20 41.5 19.5 41 19.5 40 Z"/><path class="${m} nofill" d="M34 14 C34 9 38 7 41 6"/><rect class="${m}" x="40" y="3" width="7" height="6" rx="1"/>`;break;
    case 'tumbler':p=`<path class="${m}" d="M19 7 H45 L42 44 H22 Z"/><path class="liquid" d="M20.5 14 H43.5 L41 42.5 H23 Z"/><ellipse fill="#4E6E32" cx="28" cy="34" rx="4" ry="1.6" transform="rotate(-20 28 34)"/><ellipse fill="#4E6E32" cx="35" cy="38" rx="4" ry="1.6" transform="rotate(25 35 38)"/><ellipse fill="#4E6E32" cx="33" cy="18" rx="4" ry="1.6" transform="rotate(10 33 18)"/>`;break;
    case 'chawan':p=`<rect class="${m}" x="25" y="40" width="14" height="4" rx="1.5"/><path class="${m}" d="M11 17 H53 C52 32 45 41 32 41 C19 41 12 32 11 17 Z"/><ellipse class="matcha" cx="32" cy="19.5" rx="19" ry="2.6"/>`;break;
    case 'jar':p=`<rect class="${m}" x="19" y="13" width="26" height="32" rx="6"/><path class="liquid" d="M20.5 22 H43.5 V39 C43.5 42 41.5 43.5 39 43.5 H25 C22.5 43.5 20.5 42 20.5 39 Z"/><rect class="m-ceramic" x="20" y="7" width="24" height="7" rx="2"/>`;break;
    case 'saucepan':p=`<rect class="${m}" x="10" y="18" width="34" height="24" rx="4"/><path class="liquid" d="M11.5 24 H42.5 V38 C42.5 40 41 40.5 40 40.5 H14 C12.5 40.5 11.5 40 11.5 38 Z"/><rect class="${m}" x="44" y="20" width="18" height="5" rx="2.5"/><path class="${m} nofill" d="M20 14 C20 10 24 10 24 6 M30 14 C30 10 34 10 34 6"/>`;break;
  }
  return `<svg class="vsvg" viewBox="0 0 64 48" aria-hidden="true">${p}</svg>`;
}
function rng(seed){let s=seed%2147483647||7;return()=>(s=s*16807%2147483647)/2147483647}
function leafSVG(g,dry){
  const [col,form]=dry||FAM.other.dry;
  if(form==='powder'){const h=6+Math.min(26,(g||0)*4);return `<svg viewBox="0 0 80 58" aria-hidden="true"><ellipse class="plate" cx="40" cy="52" rx="36" ry="5"/><path d="M${40-h*1.2} 51 Q40 ${51-h*2} ${40+h*1.2} 51 Z" fill="${col}"/></svg>`}
  const n=clamp(Math.round((g||0)*1.6),2,30);const R=rng(Math.round((g||1)*97)+col.length*13+form.length);
  const w=30,hMax=6+26*Math.min(1,n/30);const items=[];
  for(let i=0;i<n;i++){const x=(R()*2-1)*w*(.35+.65*Math.min(1,n/10));const cap=hMax*(1-Math.pow(x/w,2));const y=50-R()*Math.max(3,cap);items.push({x:40+x,y,a:Math.round(R()*180),k:R()})}
  items.sort((a,b)=>b.y-a.y);
  const shape=it=>{const f=`fill="${col}" style="filter:brightness(${(.8+it.k*.45).toFixed(2)})"`,X=it.x.toFixed(1),Y=it.y.toFixed(1);
    if(form==='ball')return `<circle cx="${X}" cy="${Y}" r="3.3" ${f}/>`;
    if(form==='chunk')return `<path d="M${(it.x-4).toFixed(1)} ${Y} l3 -3.5 l4.5 1 l1.5 3.5 l-3 3 l-4.5 -.5 z" ${f} transform="rotate(${it.a} ${X} ${Y})"/>`;
    const rx=form==='needle'?7:form==='bud'?5:form==='twist'?7:6,ry=form==='needle'?1.3:form==='bud'?2.1:form==='twist'?1.8:2.7;
    return `<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" ${f} transform="rotate(${it.a} ${X} ${Y})"/>`};
  return `<svg viewBox="0 0 80 58" aria-hidden="true"><ellipse class="plate" cx="40" cy="52" rx="36" ry="5"/><g class="leafs">${items.map(shape).join('')}</g></svg>`;
}
let bkN=0;
function beakerSVG(ml,cap){
  const scales=[50,100,150,200,250,300,400,500,750,1000,1500];const top=scales.find(s=>s>=Math.max(ml||0,cap||0)*1.1)||Math.ceil((ml||100)/500)*500;
  const y0=58,y1=12,h=y0-y1,f=clamp((ml||0)/top,0,1);const wy=y0-h*f;const id='bk'+(++bkN);
  let ticks='';for(let i=1;i<=4;i++){const y=y0-h*i/4;ticks+=`<line class="beaker-tick" x1="14" x2="${i%2?20:23}" y1="${y}" y2="${y}"/>`}
  return `<svg viewBox="0 0 56 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="M12 8 V56 C12 59 14 61 17 61 H39 C42 61 44 59 44 56 V8 Z"/></clipPath></defs>
  <rect class="beaker-water" x="10" y="${wy}" width="36" height="${62-wy}" clip-path="url(#${id})"/>
  <path class="beaker-glass" style="fill-opacity:.35" d="M12 8 V56 C12 59 14 61 17 61 H39 C42 61 44 59 44 56 V8 M9 8 H47"/>${ticks}
  <text x="47" y="${y1+4}" style="font-size:8px;fill:var(--ink-3);font-family:var(--f-mono)">${top}</text></svg>`;
}
function thermoSVG(temp,range,style){
  const cold=noTemp(style);const y0=48,y1=6,h=y0-y1,yv=v=>y0-h*clamp(v,0,100)/100;const tv=cold?3:(temp??0);
  return `<svg viewBox="0 0 44 64" aria-hidden="true"><rect class="thermo-tube" x="16" y="3" width="10" height="48" rx="5"/><circle class="thermo-tube" cx="21" cy="54" r="7.5"/>
  <rect class="${cold?'thermo-cold':'thermo-fill'}" x="18.5" y="${yv(tv)}" width="5" height="${54-yv(tv)}" rx="2.5"/><circle class="${cold?'thermo-cold':'thermo-fill'}" cx="21" cy="54" r="5"/>
  ${range&&!cold?`<line class="thermo-band" x1="31" x2="31" y1="${yv(range[1])}" y2="${yv(range[0])}"/>`:''}
  ${[0,50,100].map(v=>`<line class="beaker-tick" x1="11" x2="15" y1="${yv(v)}" y2="${yv(v)}"/>`).join('')}</svg>`;
}
function steepsSVG(steeps,rec,W=70,H=50){
  const st=(steeps||[]).map(s=>s.s);const n=Math.max(st.length,rec?.sched.length||0,1);const max=Math.max(...st,...(rec?rec.sched.slice(0,n):[]),1);const bw=Math.max(2,Math.min(8,(W-4)/n-2));
  const y=v=>H-4-Math.sqrt(v/max)*(H-10);let g=`<line class="beaker-tick" x1="0" x2="${W}" y1="${H-4}" y2="${H-4}"/>`;
  st.forEach((s,i)=>{const x=2+i*(W-4)/n;g+=`<rect x="${x}" y="${y(s)}" width="${bw}" height="${H-4-y(s)}" rx="1.5" style="fill:${steeps[i].liq?liqHex(steeps[i].liq):'var(--accent)'}"/>`});
  if(rec&&rec.sched.length>1)g+=`<polyline class="guide" points="${rec.sched.slice(0,n).map((s,i)=>`${(2+i*(W-4)/n+bw/2).toFixed(1)},${y(s).toFixed(1)}`).join(' ')}"/>`;
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`;
}
function setupStrip(b,rec,mini){
  const v=vesselOf(b);const n=(b.steeps||[]).length;const tea=teaById(b.teaId);const dry=b.dry||dryOf(tea||{fam:'other'});
  return `<div class="setup${mini?' mini':''}">
   <div class="tile wide"><div class="art">${vesselSVG(v.type)}</div>${mini?'':`<span class="cap">Vessel</span>`}<span class="nm">${esc(v.name)}</span></div>
   <div class="tile"><div class="art">${leafSVG(b.g,dry)}</div>${mini?'':`<span class="cap">Leaf</span>`}<b>${b.g||'—'} g</b>${!mini&&rec?benchHTML('leaf',b,rec):''}</div>
   <div class="tile"><div class="art">${beakerSVG(b.ml,v.ml)}</div>${mini?'':`<span class="cap">Water</span>`}<b>${b.ml||'—'} ml</b>${mini?'':`<span class="nm muted mono">${ratioStr(b)}</span>`}</div>
   <div class="tile"><div class="art">${thermoSVG(b.temp,rec?.t,b.style)}</div>${mini?'':`<span class="cap">Temp</span>`}<b>${fmtT(b.temp,b.style)}</b>${!mini&&rec?benchHTML('temp',b,rec):''}</div>
   <div class="tile"><div class="art">${steepsSVG(b.steeps,rec)}</div>${mini?'':`<span class="cap">Infusions</span>`}<b>${n}${b.rinse&&!mini?'<small class="muted" style="font-size:11px"> +rinse</small>':''}</b>${!mini&&rec?benchHTML('inf',b,rec):''}</div>
  </div>`;
}
function niceTicks(lo,hi,n){if(hi<=lo)hi=lo+1;const span=hi-lo,step0=span/n,mag=Math.pow(10,Math.floor(Math.log10(step0)));const step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=step0);const out=[];for(let v=Math.floor(lo/step)*step;v<=hi+step*.999;v+=step)out.push(r1(v));return out}
function radarSVG(series,{size=200,labels=true}={}){
  const n=AXES.length,cx=size/2,cy=size/2,R=size/2-(labels?34:8);
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*R*v/5,cy+Math.sin(a)*R*v/5]};
  let g='';for(let l=1;l<=5;l++)g+=`<polygon class="grid" points="${AXES.map((_,i)=>pt(i,l).join(',')).join(' ')}" ${l===5?'':'stroke-dasharray="2 3"'}/>`;
  AXES.forEach((_,i)=>{const[x,y]=pt(i,5);g+=`<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`});
  series.forEach(s=>{g+=`<polygon class="${s.cls||'area'}" points="${AXES.map(([k],i)=>pt(i,Math.max(0,s.v[k]||0)).join(',')).join(' ')}"/>`;if(!s.cls)AXES.forEach(([k],i)=>{const[x,y]=pt(i,s.v[k]||0);g+=`<circle class="vtx" cx="${x}" cy="${y}" r="2.5"/>`})});
  if(labels)AXES.forEach(([,lab],i)=>{const[x,y]=pt(i,6.15);const an=Math.abs(x-cx)<4?'middle':x>cx?'start':'end';g+=`<text x="${x}" y="${y+4}" text-anchor="${an}" class="lbl-strong">${lab}</text>`});
  return `<svg class="chart-svg" viewBox="-14 0 ${size+28} ${size}" role="img" aria-label="Palate profile">${g}</svg>`;
}
const hasAxes = b=>b.axes&&Object.values(b.axes).some(v=>v>0);
function compareChart(sessions,rec,prod){
  const W=720,H=260,pl=46,pr=16,pt=14,pb=34;
  const n=Math.max(rec.sched.length,prod?.sched.length||0,...sessions.map(s=>s.steeps.length),2);
  const all=[...rec.sched.map(s=>s*1.35),...(prod?prod.sched:[]),...sessions.flatMap(s=>s.steeps.map(x=>x.s))];const max=Math.max(...all,10);
  const sx=i=>pl+i/(n-1)*(W-pl-pr),sy=v=>H-pb-Math.sqrt(Math.max(0,v)/max)*(H-pb-pt);
  const cand=[5,10,20,30,45,60,90,120,180,300,600,1800,3600,7200,14400,28800];const ticks=cand.filter(t=>t<=max);const tk=ticks.length>6?ticks.filter((_,i)=>i%2===ticks.length%2):ticks;
  let g=tk.map(t=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${sy(t)}" y2="${sy(t)}"/><text x="${pl-8}" y="${sy(t)+4}" text-anchor="end">${fmtS(t)}</text>`).join('');
  for(let i=0;i<n;i++)g+=`<text x="${sx(i)}" y="${H-pb+16}" text-anchor="middle">${i+1}</text>`;
  g+=`<text x="${(pl+W-pr)/2}" y="${H-2}" text-anchor="middle" class="lbl-strong">Infusion</text>`;
  const sc=rec.sched;if(sc.length>1){const up=sc.map((s,i)=>`${sx(i)},${sy(s*1.35)}`),dn=sc.map((s,i)=>`${sx(i)},${sy(s*.75)}`).reverse();g+=`<polygon class="band" points="${up.concat(dn).join(' ')}"/><polyline class="guide" points="${sc.map((s,i)=>`${sx(i)},${sy(s)}`).join(' ')}"/>`}
  if(prod&&prod.sched.length>1)g+=`<polyline class="guide prod" points="${prod.sched.map((s,i)=>`${sx(i)},${sy(s)}`).join(' ')}"/>`;
  sessions.forEach((s,k)=>{const c='c'+(k%6+1);const pts=s.steeps.map((x,i)=>`${sx(i)},${sy(x.s)}`);if(pts.length>1)g+=`<polyline class="ln ${c}" points="${pts.join(' ')}"/>`;s.steeps.forEach((x,i)=>g+=`<circle class="${c}" cx="${sx(i)}" cy="${sy(x.s)}" r="3.5"><title>${fmtDate(s.at)} · infusion ${i+1}: ${fmtS(x.s)}</title></circle>`)});
  return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="min-width:520px" role="img" aria-label="Steep times by infusion against the guide">${g}</svg></div>`;
}
function spark(st){if(!st||!st.length)return'';const m=Math.max(...st.map(s=>s.s));return `<span class="spark" aria-hidden="true">${st.slice(0,16).map(s=>`<i style="height:${Math.max(2,Math.round(s.s/m*18))}px;background:${s.liq?liqHex(s.liq):'var(--accent)'};opacity:1"></i>`).join('')}</span>`}
function liqStrip(b){const cols=(b.steeps||[]).map(s=>s.liq).filter(Boolean);if(!cols.length&&b.liq)cols.push(b.liq);return cols.length?`<div class="lstrip" title="Liquor by infusion">${cols.map(c=>`<i style="background:${liqHex(c)}"></i>`).join('')}</div>`:''}
const pips = n=>`<span class="pips" aria-label="${n||0} of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
const searchIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>';

/* ═════════ Shelf (by tea) ═════════ */
function renderShelf(){
  const el=$('#view-shelf');
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const allT=allTeas();const fin=allT.filter(t=>t.finished);const teas=allT.filter(t=>!t.finished);const q=norm(state.q);
  const shown=teas.filter(t=>!q||norm([t.name,t.brand,t.origin,t.harvest,t.cultivar,t.lib,famOf(t.fam).name].join(' ')).includes(q)).filter(t=>!state.shelfFam||t.fam===state.shelfFam);
  const exN=teas.some(t=>t.example)||store.brews.some(b=>b.example);
  const counts={};teas.forEach(t=>counts[t.fam]=(counts[t.fam]||0)+1);
  const focused=document.activeElement?.id==='shelfQ';const caret=focused?document.activeElement.selectionStart:0;
  let body='';
  if(!allT.length)body=`<div class="empty"><h2>Your tea shelf is empty</h2><p>Add a tea you own, like a Kagoshima sencha or a 2019 Yiwu cake. Each tea keeps its brewing guide and every session you log with it.</p><button class="btn primary" data-a="newTea">＋ Add a tea</button></div>`;
  else if(!shown.length)body=`<div class="empty"><h2>${!teas.length?'Every tea is in your library':'No teas match'}</h2><p>Try another search or family.</p><button class="btn" data-a="shelfClear">Clear</button></div>`;
  else body=FAMS.filter(c=>shown.some(t=>t.fam===c.id)).map(c=>{
    const ts=shown.filter(t=>t.fam===c.id).sort((a,b)=>{const la=brewsOf(a.id).reduce((m,x)=>Math.max(m,+dt(x.at)),0),lb=brewsOf(b.id).reduce((m,x)=>Math.max(m,+dt(x.at)),0);return lb-la||a.name.localeCompare(b.name)});
    return `<section class="cat-sec"><div class="cat-sec-head"><span class="ldot" style="--liq:${liqHex(midLiq(c.liqs))}"></span><h2>${c.name}</h2><span class="native">${c.native}</span><span class="count">${ts.length}</span></div>
    <div class="shelf">${ts.map(teaCard).join('')}</div></section>`}).join('');if(shown.length)body=`<div class="shelf-cols">${body}</div>`;
  el.innerHTML=`
   <div class="page-head"><div><h1>Tea shelf</h1><p>${teas.length?`${teas.length} tea${teas.length>1?'s':''} on hand · ${store.brews.length} session${store.brews.length===1?'':'s'} logged`:'Your teas, grouped by family.'}${fin.length?` · <button class="linkbtn" data-a="view" data-v="library">${fin.length} finished in your library</button>`:''}</p></div>
    <div class="tool-row"><button class="btn" data-a="newTea">＋ Add a tea</button></div></div>
   ${exN?`<div class="notice"><span>Teas marked Example show how a shelf fills in. Your own teas appear alongside them.</span><button class="btn sm" data-a="clearEx">Remove examples</button></div>`:''}
   ${store.mode==='local'?'<div class="notice"><span>Notes are being saved in this browser only.</span></div>':''}
   ${allT.length?`<div class="tool-row cat-jump"><label class="search">${searchIcon}<input id="shelfQ" type="search" placeholder="Find a tea, brand, origin or harvest" value="${esc(state.q)}" aria-label="Search teas"></label>
    <div class="chips">${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="shelfFam" data-v="${c.id}" aria-pressed="${state.shelfFam===c.id}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div></div>`:''}
   ${body}`;
  if(focused){const i=$('#shelfQ');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function teaCard(t){
  const bs=brewsOf(t.id).sort((a,b)=>dt(b.at)-dt(a.at));const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating)[0];
  const T=typeOf(t);const sub=[T&&norm(T.name)!==norm(t.name)?T.name:null,t.brand].filter(Boolean).map(esc).join(' · ');
  return `<article class="tea-card" style="--wash:${washOf(liqsOf(t))}">
   <button class="tc-top" data-a="openTea" data-v="${esc(t.id)}">
    <span class="cup" style="--liq:${liqHex(teaLiq(t))}"></span>
    <span class="tc-title"><span class="tc-name">${esc(t.name)}</span><span class="meta">${sub||esc(t.origin||famOf(t.fam).name)}</span>${t.example?'<span class="tg ex">Example</span>':''}</span>
    ${best?`<span class="tc-score" title="Best session">${best.rating}</span>`:''}
   </button>
   <div class="tc-foot"><span class="tc-stats">${bs.length?`${bs.length} session${bs.length===1?'':'s'} · ${fmtDate(bs[0].at)}`:esc(T?.x.char||'No sessions yet')}</span>${stockHTML(t,true)}
   <button class="btn sm tc-add" data-a="logFor" data-v="${esc(t.id)}" aria-label="Log a session with ${esc(t.name)}">＋ Session</button></div>
  </article>`;
}
const washOf = liqs=>`linear-gradient(100deg,${liqs.map(liqHex).join(',')})`;
function paramLine(b){return [b.g?`${b.g} g`:null,b.ml?`${b.ml} ml`:null,fmtT(b.temp,b.style),`${STYLE[b.style]||''}${(b.steeps||[]).length>1?' ×'+b.steeps.length:''}`].filter(Boolean).join(' · ')}

/* ═════════ Tea page ═════════ */
function guideCards(tea,r,other,src){
  const own=new Set(store.settings.vessels.map(v=>v.type));const best=r.vessels.find(v=>own.has(v))||r.vessels[0];const o=other;
  const diff=(cond,label)=>o&&cond?`<span class="pdiff ${src==='producer'?'typ':''}">${src==='producer'?'Typical':'Producer'} ${label}</span>`:'';
  const alts=r.vessels.filter(v=>v!==best);
  const card=(art,cap,val,sub,extra='')=>`<div class="gc"><div class="gc-art">${art}</div><div class="gc-body"><span class="cap">${cap}</span><b>${val}</b>${sub?`<span class="gc-sub">${sub}</span>`:''}${extra}</div></div>`;
  return `<div class="gcards">
   ${card(vesselSVG(best),'Teaware',`<span class="gc-text">${VT[best].name}</span>${own.has(best)?' <span class="own-mark" title="In your teaware">✓</span>':''}`,alts.length?'or '+alts.map(v=>VT[v].name+(own.has(v)?' ✓':'')).join(', '):'',own.has(best)?'':'<span class="gc-sub"><button class="linkbtn" data-a="view" data-v="settings">Not in your teaware</button></span>')}
   ${card(leafSVG(r.gT,r.dry),'Leaf',fmtGR(r.g),`${r.per[0]===r.per[1]?r.per[0]:r.per[0]+'–'+r.per[1]} g per 100 ml`,diff(o&&o.g.join()!==r.g.join(),fmtGR(o?.g||[0,0])))}
   ${card(beakerSVG(r.ml,VT[best].ml),r.style==='ice'?'Ice':'Water',`${r.ml} ${r.style==='ice'?'g':'ml'}`,`ratio 1:${Math.round(r.ml/r.gT)}`,diff(o&&o.ml!==r.ml,(o?.ml||'')+' ml'))}
   ${card(thermoSVG(r.target,r.t,r.style),'Temperature',fmtTR(r.t,r.style),noTemp(r.style)?'no heat':stage(r.t[0])+(stage(r.t[0])!==stage(r.t[1])?' to '+stage(r.t[1]):''),diff(o&&!noTemp(r.style)&&o.t.join()!==r.t.join(),o?fmtTR(o.t,o.style):''))}
   ${card(steepsSVG(r.sched.map(s=>({s,liq:midLiq(r.liqs)})),null,90,50),'Infusions',`${r.inf[0]===r.inf[1]?r.inf[0]:r.inf[0]+'–'+r.inf[1]}${r.rinse?` <small class="muted">+ ${r.rinse>1?'2 rinses':'rinse'}</small>`:''}`,'',`<div class="sched">${r.sched.map((s,i)=>`<span><i>${i+1}</i>${fmtS(s)}</span>`).join('')}</div>${diff(o&&o.sched.join()!==r.sched.join(),o?o.sched.map(fmtS).join(' '):'')}`)}
   ${card(`<span class="cup lg" style="--liq:${liqHex(midLiq(r.liqs))}"></span>`,'Liquor',`<span class="gc-text">${LIQM[r.liqs[0]].n} to ${LIQM[r.liqs[r.liqs.length-1]].n.toLowerCase()}</span>`,'',`<div class="liq-typ">${r.liqs.map(id=>`<span class="sw s" style="--c:${liqHex(id)}" title="${LIQM[id].n}"></span>`).join('')}</div>`)}
  </div>`;
}
function teaDetailsHTML(t){
  const T=typeOf(t),F=famOf(t.fam);
  const rows=[['Type',T?`${T.name}${T.aka&&!T.custom?' · '+T.aka:''}`:'Not in the catalogue'],['Family',`${F.name} · ${F.native}`],['Origin',t.origin],['Brand',t.brand],['Harvest',t.harvest],['Cultivar',t.cultivar],['Leaf',T?.x.leaf||F.leaf],['Oxidation',F.ox],['Processing',F.proc],['Character',T?.x.char]].filter(x=>x[1]);const k=stockOf(t);if(k)rows.push(['Bought',`${k.total} g${k.price?' for '+money(k.price,k.cur)+' · '+money(k.perG,k.cur)+'/g':''}`]);
  return `<dl class="kv">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}${t.url?`<dt>Product page</dt><dd><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.url.replace(/^https?:\/\/(www\.)?/,'').slice(0,40))}${t.url.length>48?'…':''}</a></dd>`:''}</dl>${t.notes?`<p class="sub notes-text">${esc(t.notes)}</p>`:''}`;
}
function renderTea(){
  const el=$('#view-tea');const t=teaById(state.teaId);
  if(!t){el.innerHTML=`<button class="back" data-a="view" data-v="shelf">← Tea shelf</button><div class="empty"><h2>This tea is no longer on your shelf</h2></div>`;return}
  const F=famOf(t.fam),T=typeOf(t);const bs=brewsOf(t.id).sort((a,b)=>dt(b.at)-dt(a.at));
  const ms=methodsFor(t);let style=state.teaStyle&&ms.some(m=>m.style===state.teaStyle)?state.teaStyle:defaultStyle(t);
  const typ=recFor(t,style),prod=prodFor(t,style);const src=prod&&state.teaSrc==='producer'?'producer':'typical';const r=src==='producer'?prod:typ;
  const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating)[0];
  const used=new Set(bs.map(b=>b.style));const inStyle=bs.filter(b=>b.style===style);const cmp=inStyle.slice(0,6);
  const pDiffers=prod&&(prod.t.join()!==typ.t.join()||prod.g.join()!==typ.g.join()||prod.ml!==typ.ml||prod.sched.join()!==typ.sched.join());
  el.innerHTML=`
   <button class="back" data-a="view" data-v="${t.finished?'library':'shelf'}">← ${t.finished?'Library':'Tea shelf'}</button>
   <div class="tea-hero" style="--liq:${liqHex(teaLiq(t))};--wash:${washOf(liqsOf(t))}"><span class="cup xl"></span>
    <div class="th-title"><div class="eyebrow">${F.name}${T&&norm(T.name)!==norm(t.name)?' · '+esc(T.name):''}</div><h1>${esc(t.name)}</h1><div class="meta">${[t.brand,t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}${t.example?' <span class="tg ex">Example</span>':''}</div>
     <div class="hstats"><span><b>${bs.length}</b> session${bs.length===1?'':'s'}</span>${rated.length?`<span>average <b>${avg(rated.map(b=>b.rating)).toFixed(1)}</b></span><span>best <b class="clay">${best.rating}</b></span>`:''}${bs[0]?`<span>last brewed <b>${fmtDate(bs[0].at)}</b></span>`:''}${t.finished?'':stockHTML(t)}</div></div>
    <div class="actions"><button class="btn ghost" data-a="${t.finished?'restockTea':'finishTea'}" data-v="${esc(t.id)}">${t.finished?'Restock':'Finish & move to library'}</button><button class="btn" data-a="editTea" data-v="${esc(t.id)}">Edit tea</button><button class="btn primary" data-a="logFor" data-v="${esc(t.id)}">＋ Log a session</button></div></div>
   ${t.finished?`<div class="verdict"><div class="v-main"><span class="eyebrow">In your library · finished ${fmtDate(t.finished)} ${dt(t.finished).getFullYear()}</span>${t.verdict?.score?`<span class="score">${t.verdict.score}<small>/10</small></span>`:''}${t.verdict?.rebuy?`<span class="rebuy ${t.verdict.rebuy}">${REBUY[t.verdict.rebuy]}</span>`:''}${t.verdict?.note?`<p class="lib-quote">“${esc(t.verdict.note)}”</p>`:''}</div><div class="tool-row"><button class="btn sm" data-a="finishTea" data-v="${esc(t.id)}">Edit verdict</button><button class="btn sm" data-a="restockTea" data-v="${esc(t.id)}">Restock</button></div></div>`
   :stockOf(t)?.left===0?`<div class="notice"><span>By your sessions, this tea is used up.</span><button class="btn sm" data-a="finishTea" data-v="${esc(t.id)}">Move to library</button></div>`:''}
   <div class="tea-grid">
    <div class="panel">
     <div class="panel-head"><h2>Brewing guide${r.edited&&src==='typical'?' <span class="tg ex" style="vertical-align:middle">Your version</span>':''}</h2>
      <div class="tool-row">${ms.length>1?`<div class="seg sm" role="group" aria-label="Method">${ms.map(m=>`<button data-a="teaStyle" data-v="${m.style}" aria-pressed="${style===m.style}" title="${STYLE_DESC[m.style]}">${STYLE[m.style]}${used.has(m.style)?' •':''}</button>`).join('')}</div>`:`<span class="chip">${STYLE[style]}</span>`}
      ${prod?`<div class="seg sm" role="group" aria-label="Source"><button data-a="teaSrc" data-v="typical" aria-pressed="${src==='typical'}">Typical</button><button data-a="teaSrc" data-v="producer" aria-pressed="${src==='producer'}">${esc(t.brand||'Producer')}’s</button></div>`:''}</div></div>
     <div class="guide-wrap">
      <div class="guide-main">
       <p class="sub"><button class="linkbtn" data-a="editGuide" data-v="${esc(gKey(t))}" data-s="${style}" style="float:right;margin-left:12px;font-size:13px">Edit guide</button>${src==='producer'?`Following ${esc(t.brand||'the producer')}’s instructions${pDiffers?'. Where they differ from the typical guide, the typical value is shown on the card.':', which match the typical guide.'}`:`${STYLE_DESC[style]}.${prod&&pDiffers?` ${esc(t.brand||'The producer')} recommends something different; it is marked on the cards.`:''}`} ${ms.length>1?`Methods for ${esc(T?.name||F.name)}: ${ms.map(m=>STYLE[m.style].toLowerCase()).join(', ')}.`:''}</p>
       ${guideCards(t,r,pDiffers?(src==='producer'?typ:prod):null,src)}
       <div class="howto"><h3>How to brew</h3><ol class="steps">${stepsFor(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
       ${(src==='producer'&&r.pnotes)||(prod&&src==='typical'&&prod.pnotes)?`<div class="pnote"><span class="cap">From ${esc(t.brand||'the producer')}</span><p>${esc(prod.pnotes)}</p></div>`:''}
       <div class="howto quiet"><h3>Good to know</h3><ul class="tips">${r.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <aside class="guide-aside"><div class="panel-head"><h3>About this tea</h3><button class="linkbtn" data-a="editTea" data-v="${esc(t.id)}" style="font-size:13px">Edit</button></div>${teaDetailsHTML(t)}</aside>
     </div>
    </div>
    ${bs.length?`
    <div class="panel">
     <div class="panel-head"><h2>Your sessions against the guide</h2><span class="sub">${inStyle.length} ${STYLE[style].toLowerCase()} session${inStyle.length===1?'':'s'}${bs.length>inStyle.length?` · ${bs.length-inStyle.length} with other methods`:''}</span></div>
     ${cmp.length?`
      <div class="legend"><span class="li"><i class="dash"></i>Typical guide (band = comfortable range)</span>${prod?`<span class="li"><i class="dash prod"></i>Producer</span>`:''}${cmp.map((s,k)=>`<span class="li k${k%6+1}"><i></i>${fmtDate(s.at)}${s.rating?' · '+s.rating:''}</span>`).join('')}</div>
      ${compareChart(cmp,typ,prod)}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Session</th><th class="num">Leaf</th><th class="num">Water</th><th class="num">g/100</th><th class="num">Temp</th><th class="num">Infusions</th><th>Steep times</th><th class="num">Rating</th></tr></thead><tbody>
       <tr class="guide-row"><td>Typical</td><td class="num">${fmtGR(typ.g)}</td><td class="num">${typ.ml} ml</td><td class="num">${typ.per[0]}–${typ.per[1]}</td><td class="num">${fmtTR(typ.t,style)}</td><td class="num">${typ.inf[0]}–${typ.inf[1]}</td><td>${typ.sched.slice(0,5).map(fmtS).join(' ')}${typ.sched.length>5?' …':''}</td><td class="num"></td></tr>
       ${prod?`<tr class="guide-row prod"><td>${esc(t.brand||'Producer')}</td><td class="num">${fmtGR(prod.g)}</td><td class="num">${prod.ml} ml</td><td class="num">${prod.per[0]}</td><td class="num">${fmtTR(prod.t,style)}</td><td class="num">${prod.inf[0]}</td><td>${prod.sched.slice(0,5).map(fmtS).join(' ')}</td><td class="num"></td></tr>`:''}
       ${cmp.map((s,k)=>{const p=per100(s),pv=vsBand(p,typ.per),tv=noTemp(s.style)?'ok':vsBand(s.temp,typ.t),iv=vsBand(s.steeps.length,typ.inf);const mark=v=>v==='low'?'<span class="d-dn">▼</span>':v==='high'?'<span class="d-up">▲</span>':'';
        return `<tr class="click" data-a="openSession" data-v="${esc(s.id)}"><td><span class="swatch-key k${k%6+1}"></span>${fmtDate(s.at)}</td><td class="num">${s.g} g</td><td class="num">${s.ml} ml</td><td class="num">${p??'—'}${mark(pv)}</td><td class="num">${fmtT(s.temp,s.style)}${mark(tv)}</td><td class="num">${s.steeps.length}${mark(iv)}</td><td>${benchHTML('time',s,typ)}</td><td class="num" style="color:var(--clay)">${s.rating||'—'}</td></tr>`}).join('')}
      </tbody></table></div>`:`<p class="sub">No ${STYLE[style].toLowerCase()} sessions yet. Pick another method above to compare those sessions.</p>`}
    </div>
    ${bs.filter(hasAxes).length?`<div class="panel half"><h2>Palate across sessions</h2><div style="max-width:280px;margin:0 auto;width:100%">${radarSVG(bs.filter(hasAxes).slice(0,3).map((s,k)=>({v:s.axes,cls:'rs'+(k+1)})),{size:240})}</div><div class="legend">${bs.filter(hasAxes).slice(0,3).map((s,k)=>`<span class="li k${k+1}"><i></i>${fmtDate(s.at)}${s.rating?' · '+s.rating:''}</span>`).join('')}</div></div>
     <div class="panel half"><h2>What you taste in it</h2>${tagBars(bs)}</div>`:''}
    <div class="panel"><div class="panel-head"><h2>Sessions</h2><span class="sub">newest first</span></div><div class="sess-list">${bs.map(b=>sessCard(b,recFor(t,b.style))).join('')}</div></div>`
    :`<div class="empty"><h2>No sessions yet</h2><p>Log your first session to start comparing against the guide.</p><button class="btn primary" data-a="logFor" data-v="${esc(t.id)}">＋ Log a session</button></div>`}
   </div>`;
}
function tagBars(bs){const tc={};bs.forEach(b=>sessionTags(b).forEach(t=>tc[t]=(tc[t]||0)+1));const top=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10);const m=top[0]?.[1]||1;
  return top.length?`<div class="tagbars">${top.map(([t,n])=>`<div class="tagbar"><span>${esc(t)}</span><span class="b"><i style="width:${n/m*100}%"></i></span><span class="v">${n}</span></div>`).join('')}</div>`:'<p class="sub">Tag flavours on each infusion to see them here.</p>'}
const sessionTags = b=>[...new Set([...(b.tags||[]),...(b.steeps||[]).flatMap(s=>s.tags||[])])];
function sessCard(b,rec){
  const d=dt(b.at);const note=b.notes||b.steeps.map(s=>s.note).filter(Boolean)[0]||'';
  return `<button class="sess" data-a="openSession" data-v="${esc(b.id)}">
   <span class="s-date"><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined,{month:'short'})}</span></span>
   <span class="s-main">${setupStrip(b,rec,true)}<span class="s-line">${STYLE[b.style]||''} · ${benchHTML('time',b,rec)} ${b.example?'<span class="tg ex">Example</span>':''}</span>${note?`<span class="s-note">${esc(note)}</span>`:''}</span>
   <span class="s-side">${b.rating?`<span class="score">${b.rating}<small>/10</small></span>`:'<span class="score none">Unrated</span>'}<span style="width:90px">${liqStrip(b)}</span></span></button>`;
}

/* ═════════ Journal (by date) ═════════ */
function renderJournal(){
  const el=$('#view-journal');if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const all=store.brews;const q=norm(state.jq);
  const focused=document.activeElement?.id==='jq';const caret=focused?document.activeElement.selectionStart:0;
  const list=all.filter(b=>{const t=teaById(b.teaId);return(!q||norm([t?.name,t?.brand,t?.origin,b.notes,sessionTags(b).join(' '),famOf(t?.fam).name].join(' ')).includes(q))&&(!state.jcats.size||state.jcats.has(t?.fam))&&(!state.jmin||(b.rating||0)>=state.jmin)}).sort((a,b)=>dt(b.at)-dt(a.at));
  const counts={};all.forEach(b=>{const c=teaById(b.teaId)?.fam;counts[c]=(counts[c]||0)+1});
  const groups=[];list.forEach(b=>{const k=dt(b.at).toLocaleDateString(undefined,{month:'long',year:'numeric'});if(!groups.length||groups[groups.length-1].k!==k)groups.push({k,items:[]});groups[groups.length-1].items.push(b)});
  el.innerHTML=`<div class="page-head"><div><h1>Journal</h1><p>Every session in the order you brewed it.</p></div></div>
   ${all.length?`<div class="tool-row" style="margin-bottom:12px"><label class="search">${searchIcon}<input id="jq" type="search" placeholder="Search tea, brand, flavours, notes" value="${esc(state.jq)}" aria-label="Search sessions"></label>
    <select class="pill" id="jmin" aria-label="Minimum rating"><option value="0">Any rating</option>${[9,8,7,6,5].map(n=>`<option value="${n}" ${state.jmin==n?'selected':''}>${n}+ only</option>`).join('')}</select></div>
    <div class="chips" style="margin-bottom:8px">${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="jcat" data-v="${c.id}" aria-pressed="${state.jcats.has(c.id)}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div>`:''}
   ${!all.length?`<div class="empty"><h2>No sessions yet</h2><p>Sessions you log under your teas appear here by date.</p><button class="btn primary" data-a="newSession">＋ Log a session</button></div>`:!list.length?`<div class="empty"><h2>No sessions match</h2><button class="btn" data-a="jClear">Clear filters</button></div>`:
    groups.map(g=>`<div class="month"><h2>${g.k}</h2><span>${g.items.length} session${g.items.length>1?'s':''}</span></div><div class="list">${g.items.map(journalCard).join('')}</div>`).join('')}`;
  if(focused){const i=$('#jq');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function journalCard(b){const t=teaById(b.teaId);
  return `<button class="brew" data-a="openSession" data-v="${esc(b.id)}"><span class="cup" style="--liq:${liqHex(b.liq||b.steeps[0]?.liq||teaLiq(t))}"></span>
   <span class="brew-main"><span class="brew-name">${esc(teaName(b))}</span><span class="brew-meta">${[famOf(t?.fam).name,t?.brand].filter(Boolean).map(esc).join(' · ')}</span><span class="brew-params mono">${esc(paramLine(b))}</span>${sessionTags(b).length||b.example?`<span class="tags">${b.example?'<span class="tg ex">Example</span>':''}${sessionTags(b).slice(0,4).map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</span>`:''}</span>
   <span class="brew-side">${b.rating?`<span class="score">${b.rating}<small>/10</small></span>`:'<span class="score none">Unrated</span>'}${spark(b.steeps)}<span class="date">${fmtDate(b.at)}</span></span></button>`}

/* ═════════ Insights ═════════ */
function renderInsights(){
  const el=$('#view-insights');const all=store.brews;
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  if(all.length<2){el.innerHTML=`<div class="empty"><h2>Insights appear after a few sessions</h2><p>Log two or more sessions to see how temperature, leaf ratio and tea family line up with your ratings.</p><button class="btn primary" data-a="newSession">＋ Log a session</button></div>`;return}
  const rated=all.filter(b=>b.rating);const leaf=all.reduce((a,b)=>a+(+b.g||0),0);const teas=allTeas();
  const byCat=FAMS.map(c=>{const bs=all.filter(b=>teaById(b.teaId)?.fam===c.id);return{c,n:bs.length,avg:avg(bs.filter(b=>b.rating).map(b=>b.rating))}}).filter(x=>x.n).sort((a,b)=>b.n-a.n);const maxN=Math.max(...byCat.map(x=>x.n));
  const dialed=teas.map(t=>{const bs=brewsOf(t.id);const r=bs.filter(b=>b.rating);const best=r.slice().sort((a,b)=>b.rating-a.rating||dt(b.at)-dt(a.at))[0];return{t,bs,best,avg:avg(r.map(b=>b.rating))}}).filter(x=>x.best).sort((a,b)=>b.best.rating-a.best.rating||b.bs.length-a.bs.length).slice(0,10);
  const withAxes=rated.filter(hasAxes),fav=withAxes.filter(b=>b.rating>=8),rest=withAxes.filter(b=>b.rating<8);
  const mean=bs=>Object.fromEntries(AXES.map(([k])=>[k,avg(bs.map(b=>b.axes[k]||0))]));
  el.innerHTML=`<div class="page-head"><div><h1>Insights</h1><p>What your best cups have in common.</p></div></div>
   <div class="ins-grid">
    <div class="stats"><div class="stat"><b>${all.length}</b><span>sessions</span></div><div class="stat"><b>${teas.length}</b><span>teas on the shelf</span></div><div class="stat"><b>${rated.length?avg(rated.map(b=>b.rating)).toFixed(1):'—'}</b><span>average rating</span></div><div class="stat"><b>${Math.round(leaf)}<span style="font-size:16px"> g</span></b><span>leaf brewed</span></div></div>
    <div class="panel"><h2>By family</h2><p class="sub">Bar shows sessions; the number is the average rating.</p><div class="cat-rows">${byCat.map(x=>`<button class="cat-row" data-a="shelfFam" data-v="${x.c.id}" style="--c:${liqHex(midLiq(x.c.liqs))}"><span class="nm"><span class="dot"></span>${x.c.name}</span><span class="cat-bar"><i style="width:${x.n/maxN*100}%"></i><em>${x.n}</em></span><span class="avg">${x.avg?x.avg.toFixed(1):'—'}</span></button>`).join('')}</div></div>
    <div class="panel"><h2>Palate of your favourites</h2><p class="sub">Average palate of sessions rated 8+ against the rest.</p>
     ${withAxes.length?`<div style="max-width:280px;margin:0 auto;width:100%">${radarSVG([...(rest.length?[{v:mean(rest),cls:'area2'}]:[]),...(fav.length?[{v:mean(fav)}]:[])],{size:240})}</div><div class="legend"><span class="li" style="--c:var(--accent)"><i></i>Rated 8+ (${fav.length})</span><span class="li" style="--c:var(--clay)"><i></i>Below 8 (${rest.length})</span></div>`:'<p class="sub">Score the palate sliders when you log a session.</p>'}</div>
    <div class="panel wide"><div class="panel-head"><h2>What moves your rating</h2><div class="seg sm">${[['temp','Water temp'],['ratio','Leaf per 100 ml'],['steeps','Infusions'],['total','Total steep time']].map(([k,v])=>`<button data-a="xAxis" data-v="${k}" aria-pressed="${state.xAxis===k}">${v}</button>`).join('')}</div></div><p class="sub">Each dot is a session, coloured by its liquor.</p>${scatter(rated)}</div>
    <div class="panel wide"><h2>Dialled-in recipes</h2><p class="sub">Your best-rated session for each tea.</p>
     <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tea</th><th class="num">Sessions</th><th class="num">Avg</th><th class="num">Best</th><th>Best recipe</th><th></th></tr></thead><tbody>
     ${dialed.map(x=>`<tr class="click" data-a="openTea" data-v="${esc(x.t.id)}"><td><b>${esc(x.t.name)}</b><div class="muted" style="font-size:12px">${esc(x.t.brand||famOf(x.t.fam).name)}</div></td><td class="num">${x.bs.length}</td><td class="num">${x.avg.toFixed(1)}</td><td class="num" style="color:var(--clay)">${x.best.rating}</td><td class="mono" style="font-size:12.5px">${esc(paramLine(x.best))} · ${x.best.steeps.slice(0,6).map(s=>fmtS(s.s)).join(' ')}${x.best.steeps.length>6?' …':''}</td><td><button class="btn sm" data-a="again" data-v="${esc(x.best.id)}">Brew again</button></td></tr>`).join('')}
     </tbody></table></div></div>
    <div class="panel"><h2>Flavours you find most</h2>${tagBars(all)}</div>
    <div class="panel"><h2>Sessions, last 18 weeks</h2>${heatmap(all)}</div>
   </div>`;
}
function scatter(rated){
  const X={temp:{f:b=>noTemp(b.style)?null:toU(b.temp),lab:'Water temperature ('+deg()+')',fmt:v=>v+'°'},ratio:{f:per100,lab:'Grams of leaf per 100 ml',fmt:v=>v+' g'},steeps:{f:b=>b.steeps.length||null,lab:'Number of infusions',fmt:v=>v},total:{f:b=>totalSteep(b)||null,lab:'Total steep time',fmt:fmtS}}[state.xAxis];
  const pts=rated.map(b=>({b,x:X.f(b),y:b.rating})).filter(p=>p.x!=null&&isFinite(p.x));
  if(pts.length<2)return '<p class="sub">Not enough sessions with this measurement yet.</p>';
  const W=720,H=280,pl=40,pr=16,pt=14,pb=42;let lo=Math.min(...pts.map(p=>p.x)),hi=Math.max(...pts.map(p=>p.x));if(lo===hi){lo-=1;hi+=1}
  const ticks=niceTicks(lo,hi,6),x0=ticks[0],x1=ticks[ticks.length-1];const sx=v=>pl+(v-x0)/(x1-x0)*(W-pl-pr),sy=v=>pt+(10-v)/9*(H-pt-pb);
  let g='';[1,4,7,10].forEach(v=>g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${pl-8}" y="${sy(v)+4}" text-anchor="end">${v}</text>`);
  ticks.forEach(t=>g+=`<text x="${sx(t)}" y="${H-pb+18}" text-anchor="middle">${X.fmt(t)}</text>`);
  g+=`<line class="axisline" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/><text x="${(pl+W-pr)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">${X.lab}</text><text x="12" y="${pt+4}" class="lbl-strong">Rating</text>`;
  const seen={};pts.forEach(p=>{const k=Math.round(sx(p.x)/6)+'_'+p.y;const j=seen[k]=(seen[k]||0)+1;const dx=(j-1)*7*((j%2)?1:-1)/2;
    g+=`<circle class="pt" cx="${sx(p.x)+dx}" cy="${sy(p.y)}" r="7" style="fill:${liqHex(p.b.liq||p.b.steeps[0]?.liq||'gold')}"><title>${esc(teaName(p.b))} · ${p.b.rating}/10 · ${esc(String(X.fmt(p.x)))}</title></circle>`});
  return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="min-width:480px" role="img" aria-label="Rating against ${X.lab}">${g}</svg></div>`;
}
function heatmap(all){
  const weeks=18,cell=14,gap=3;const today=new Date();today.setHours(0,0,0,0);const start=new Date(today);start.setDate(start.getDate()-start.getDay()-(weeks-1)*7);
  const counts={};all.forEach(b=>{const d=dt(b.at);d.setHours(0,0,0,0);counts[d.getTime()]=(counts[d.getTime()]||0)+1});const max=Math.max(1,...Object.values(counts));
  let g='';const days=['S','M','T','W','T','F','S'];[1,3,5].forEach(i=>g+=`<text x="0" y="${22+i*(cell+gap)+cell-3}">${days[i]}</text>`);
  for(let w=0;w<weeks;w++)for(let d=0;d<7;d++){const day=new Date(start);day.setDate(start.getDate()+w*7+d);if(day>today)continue;const n=counts[day.getTime()]||0;const x=16+w*(cell+gap),y=22+d*(cell+gap);
    if(day.getDate()<=7&&d===0)g+=`<text x="${x}" y="12">${day.toLocaleDateString(undefined,{month:'short'})}</text>`;
    g+=`<rect class="${n?'cell':'cell0'}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" ${n?`style="fill-opacity:${.3+.7*n/max}"`:''}><title>${day.toDateString()}: ${n} session${n===1?'':'s'}</title></rect>`}
  const W=16+weeks*(cell+gap),H=22+7*(cell+gap);return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="max-width:${W*1.6}px" role="img" aria-label="Brewing activity">${g}</svg></div>`;
}

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
  <div class="gbrowser">
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

/* ═════════ Settings ═════════ */
function modePreview(id){
  if(id==='dial')return `<svg viewBox="0 0 120 48"><path d="M30 42 A26 26 0 1 1 90 42" fill="none" stroke="var(--surface-2)" stroke-width="7" stroke-linecap="round"/><path d="M76 17 A26 26 0 0 1 86 33" fill="none" stroke="var(--accent-soft)" stroke-width="7"/><path d="M30 42 A26 26 0 0 1 80 20" fill="none" stroke="var(--hot)" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="20" r="5" fill="var(--surface)" stroke="var(--hot)" stroke-width="2.5"/></svg>`;
  if(id==='steps')return `<svg viewBox="0 0 120 48"><rect x="4" y="14" width="22" height="20" rx="10" fill="none" stroke="var(--line)"/><text x="15" y="28" text-anchor="middle" style="font:11px var(--f-mono);fill:var(--ink-2)">−5</text><text x="60" y="32" text-anchor="middle" style="font:500 18px var(--f-mono);fill:var(--ink)">95°</text><rect x="94" y="14" width="22" height="20" rx="10" fill="none" stroke="var(--line)"/><text x="105" y="28" text-anchor="middle" style="font:11px var(--f-mono);fill:var(--ink-2)">+5</text></svg>`;
  if(id==='scale')return `<svg viewBox="0 0 120 48">${[0,1,2,3,4,5,6].map(i=>`<rect x="${4+i*16.5}" y="8" width="14" height="13" rx="3" fill="${i===5?'var(--hot)':i>=4?'var(--accent-soft)':'var(--surface-2)'}"/><rect x="${4+i*16.5}" y="26" width="14" height="13" rx="3" fill="var(--surface-2)"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 120 48"><rect x="30" y="10" width="60" height="28" rx="6" fill="var(--surface)" stroke="var(--line)"/><text x="60" y="30" text-anchor="middle" style="font:500 16px var(--f-mono);fill:var(--ink)">93|</text></svg>`;
}
function renderSettings(){
  const s=store.settings;const cts=s.customTypes||[];
  $('#view-settings').innerHTML=`<div class="page-head"><div><h1>Settings</h1><p>Make logging fit the way you brew.</p></div></div>
  <div class="set-grid">
   <div class="panel"><h2>Temperature input</h2><p class="sub">How you set water temperature when logging. You can also switch while logging.</p>
    <div class="modes">${TEMP_MODES.map(([id,n,d])=>`<button class="mode" data-a="setMode" data-v="${id}" aria-pressed="${s.tempMode===id}">${modePreview(id)}<b>${n}</b><span>${d}</span></button>`).join('')}</div>
    <div class="tool-row"><span class="lbl">Units</span><div class="seg sm"><button data-a="setUnit" data-v="C" aria-pressed="${s.unit!=='F'}">Celsius</button><button data-a="setUnit" data-v="F" aria-pressed="${s.unit==='F'}">Fahrenheit</button></div></div>
   </div>
   <div class="panel"><div class="panel-head"><h2>My teaware</h2><span class="sub">${s.vessels.length} piece${s.vessels.length===1?'':'s'}</span></div>
    <p class="sub">Only these appear when you log a session. Capacity fills in the water amount when you pick a vessel.</p>
    <div class="ware">${s.vessels.map(v=>`<div class="ware-item">${vesselSVG(v.type)}<div class="wf"><input id="wn-${esc(v.id)}" data-w="name" data-id="${esc(v.id)}" value="${esc(v.name)}" aria-label="Name"><div class="mlrow"><input id="wm-${esc(v.id)}" data-w="ml" data-id="${esc(v.id)}" inputmode="numeric" value="${v.ml}" aria-label="Capacity in ml"> ml · ${VT[v.type]?.name||''}</div></div><button class="rm" data-a="rmWare" data-v="${esc(v.id)}" aria-label="Remove ${esc(v.name)}">×</button></div>`).join('')}</div>
    <div><div class="lbl" style="margin-bottom:8px">Add teaware</div><div class="vpick">${VTYPES.map(v=>`<button class="vtile" data-a="addWare" data-v="${v.id}">${vesselSVG(v.id)}<span class="vn">${v.name}</span><span class="vm">~${v.ml} ml</span></button>`).join('')}</div></div>
   </div>
   <div class="panel"><div class="panel-head"><h2>Your tea types</h2><span class="sub">${LIB.length} types built in</span></div>
    <p class="sub">Only for a tea that is not in the catalogue. It uses its family’s brewing methods, with your own water range if you set one.</p>
    ${cts.length?`<div class="ct-list">${cts.map(c=>`<div class="ct-item"><input class="input" id="ctn-${esc(c.id)}" data-ct="name" data-id="${esc(c.id)}" value="${esc(c.name)}" aria-label="Type name">
      <select class="input" id="ctf-${esc(c.id)}" data-ct="fam" data-id="${esc(c.id)}" aria-label="Family">${FAMS.map(f=>`<option value="${f.id}" ${c.fam===f.id?'selected':''}>${f.name}</option>`).join('')}</select>
      <span class="ct-t"><input class="input mono" id="ctl-${esc(c.id)}" data-ct="t0" data-id="${esc(c.id)}" inputmode="numeric" placeholder="from" value="${c.t?c.t[0]:''}" aria-label="Water from °C">–<input class="input mono" id="cth-${esc(c.id)}" data-ct="t1" data-id="${esc(c.id)}" inputmode="numeric" placeholder="to" value="${c.t?c.t[1]:''}" aria-label="Water to °C">°C</span>
      <button class="rm" data-a="rmType" data-v="${esc(c.id)}" aria-label="Remove ${esc(c.name)}">×</button></div>`).join('')}</div>`:''}
    <div><button class="btn sm" data-a="addType">＋ Add a tea type</button></div>
   </div>
   <div class="panel"><h2>Your data</h2>
    <div class="tool-row">${store.downloads?'<button class="btn sm" data-a="export" data-v="csv">Export sessions (CSV)</button><button class="btn sm" data-a="export" data-v="json">Export everything (JSON)</button>':'<span class="sub">Export is not available in this view.</span>'}
    ${allTeas().some(t=>t.example)||store.brews.some(b=>b.example)?'<button class="btn sm" data-a="clearEx">Remove example teas</button>':''}</div>
   </div>
  </div>`;
}

/* ═════════ Stock: how much is left ═════════ */
function stockOf(t){
  const s=t?.stock;if(!s||!(s.g>0))return null;
  const since=s.since||t.createdAt||'1970';const used=brewsOf(t.id).filter(b=>b.at>=since).reduce((a,b)=>a+(+b.g||0),0);
  const left=Math.max(0,r1(s.g-used));const per=avg(brewsOf(t.id).map(b=>+b.g||0).filter(Boolean))||recFor(t,defaultStyle(t)).gT;
  return {total:s.g,used:r1(used),left,sessionsLeft:per?Math.floor(left/per):null,price:s.price||null,cur:s.cur||'',perG:s.price?s.price/s.g:null};
}
const money = (n,cur)=>n==null?'':(cur||'')+(n<1?n.toFixed(2):n<10?n.toFixed(2):Math.round(n));
function stockHTML(t,compact){const k=stockOf(t);if(!k)return '';const pct=clamp(k.left/k.total*100,0,100);
  return `<span class="stock${k.left<=0?' out':pct<20?' low':''}" title="${k.used} g of ${k.total} g used"><span class="stock-bar"><i style="width:${pct}%"></i></span>${k.left<=0?'Used up':`${k.left} g left`}${!compact&&k.sessionsLeft!=null&&k.left>0?` · about ${k.sessionsLeft} session${k.sessionsLeft===1?'':'s'}`:''}</span>`}
function parsePrice(str){str=String(str||'').trim();if(!str)return null;const n=parseFloat(str.replace(/[^\d.]/g,''));if(isNaN(n))return null;return {price:n,cur:str.replace(/[\d.,\s]/g,'').slice(0,3)}}

/* ═════════ Library: finished teas ═════════ */
const REBUY = {yes:'Would buy again',maybe:'Maybe again',no:'Wouldn’t rebuy'};
function teaSummary(t){
  const bs=brewsOf(t.id).sort((a,b)=>dt(a.at)-dt(b.at));const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating||dt(b.at)-dt(a.at))[0];
  const tc={};bs.forEach(b=>sessionTags(b).forEach(x=>tc[x]=(tc[x]||0)+1));const tags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
  return {bs,best,avg:rated.length?avg(rated.map(b=>b.rating)):null,first:bs[0]?.at,last:bs[bs.length-1]?.at,grams:r1(bs.reduce((a,b)=>a+(+b.g||0),0)),tags,score:t.verdict?.score||(best?Math.round(avg(rated.map(b=>b.rating))):null)};
}
const monthYear = iso=>iso?dt(iso).toLocaleDateString(undefined,{month:'short',year:'numeric'}):'';
function renderLibrary(){
  const el=$('#view-library');if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const all=allTeas().filter(t=>t.finished);const q=norm(state.libQ);
  const focused=document.activeElement?.id==='libQ';const caret=focused?document.activeElement.selectionStart:0;
  let list=all.map(t=>({t,s:teaSummary(t)})).filter(({t})=>(!q||norm([t.name,t.brand,t.origin,t.harvest,typeOf(t)?.name,famOf(t.fam).name,t.verdict?.note].join(' ')).includes(q))&&(!state.libFam||t.fam===state.libFam)&&(!state.libRebuy||t.verdict?.rebuy===state.libRebuy));
  const sorts={recent:(a,b)=>dt(b.t.finished)-dt(a.t.finished),rating:(a,b)=>(b.s.score||0)-(a.s.score||0),sessions:(a,b)=>b.s.bs.length-a.s.bs.length,name:(a,b)=>a.t.name.localeCompare(b.t.name)};
  list.sort(sorts[state.libSort]||sorts.recent);
  const counts={};all.forEach(t=>counts[t.fam]=(counts[t.fam]||0)+1);
  const sessions=all.reduce((a,t)=>a+brewsOf(t.id).length,0),grams=all.reduce((a,t)=>a+brewsOf(t.id).reduce((x,b)=>x+(+b.g||0),0),0);
  const fav=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];const rebuyN=all.filter(t=>t.verdict?.rebuy==='yes').length;
  el.innerHTML=`<div class="page-head"><div><h1>Library</h1><p>Teas you have finished, with every session and note kept.</p></div></div>
  ${!all.length?`<div class="empty"><h2>Your library is empty</h2><p>When you finish a tea, mark it as finished from its page. It moves here with its sessions, recipes and your final verdict, ready to look back on or buy again.</p><button class="btn" data-a="view" data-v="shelf">Go to the shelf</button></div>`:`
  <div class="stats lib-stats"><div class="stat"><b>${all.length}</b><span>teas finished</span></div><div class="stat"><b>${sessions}</b><span>sessions with them</span></div><div class="stat"><b>${Math.round(grams)}<span style="font-size:16px"> g</span></b><span>leaf brewed</span></div><div class="stat"><b>${rebuyN}</b><span>you’d buy again</span></div></div>
  <div class="tool-row" style="margin:16px 0 10px"><label class="search">${searchIcon}<input id="libQ" type="search" placeholder="Search name, brand, origin, verdict" value="${esc(state.libQ)}" aria-label="Search library"></label>
   <select class="pill" id="libRebuy" aria-label="Would buy again"><option value="">Any verdict</option>${Object.entries(REBUY).map(([k,v])=>`<option value="${k}" ${state.libRebuy===k?'selected':''}>${v}</option>`).join('')}</select>
   <select class="pill" id="libSort" aria-label="Sort"><option value="recent">Recently finished</option><option value="rating" ${state.libSort==='rating'?'selected':''}>Highest rated</option><option value="sessions" ${state.libSort==='sessions'?'selected':''}>Most brewed</option><option value="name" ${state.libSort==='name'?'selected':''}>Name A–Z</option></select></div>
  <div class="chips" style="margin-bottom:18px">${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="libFam" data-v="${c.id}" aria-pressed="${state.libFam===c.id}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div>
  ${list.length?`<div class="libgrid">${list.map(libCard).join('')}</div>`:`<div class="empty"><h2>Nothing matches</h2><button class="btn" data-a="libClear">Clear filters</button></div>`}`}`;
  if(focused){const i=$('#libQ');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function libCard({t,s}){
  const T=typeOf(t);const cols=(s.best?.steeps||[]).map(x=>x.liq).filter(Boolean);const band=cols.length?cols:liqsOf(t);const k=stockOf(t);
  return `<button class="libcard" data-a="openTea" data-v="${esc(t.id)}">
   <span class="lib-body">
    <span class="lib-top" style="--wash:${washOf(band)}"><span class="cup" style="--liq:${liqHex(teaLiq(t))}"></span><span class="lib-title"><span class="tc-name">${esc(t.name)}</span><span class="meta">${[T&&norm(T.name)!==norm(t.name)?T.name:null,t.brand].filter(Boolean).map(esc).join(' · ')||esc(famOf(t.fam).name)}</span></span>${s.score?`<span class="score">${s.score}<small>/10</small></span>`:''}</span>
    <span class="lib-meta">${[t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}</span>
    <span class="lib-dates mono">${s.first?monthYear(s.first)+' – ':''}${monthYear(t.finished)}</span>
    <span class="lib-stats"><span><b>${s.bs.length}</b> sessions</span><span><b>${s.grams}</b> g</span>${s.avg?`<span>avg <b>${s.avg.toFixed(1)}</b></span>`:''}${k?.perG?`<span><b>${money(k.perG*(s.bs.length?s.grams/s.bs.length:0),k.cur)}</b>/session</span>`:''}</span>
    ${s.best?`<span class="recipe mono">Best: ${esc(paramLine(s.best))}</span>`:''}
    ${s.tags.length?`<span class="tags">${s.tags.map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</span>`:''}
    ${t.verdict?.note?`<span class="lib-quote">“${esc(t.verdict.note)}”</span>`:''}
    ${t.verdict?.rebuy?`<span class="rebuy ${t.verdict.rebuy}">${REBUY[t.verdict.rebuy]}</span>`:''}
   </span></button>`;
}

/* finishing a tea */
let FIN=null;
function openFinish(id){const t=teaById(id);if(!t)return;const s=teaSummary(t);
  FIN={id,score:t.verdict?.score||(s.avg?Math.round(s.avg):0),rebuy:t.verdict?.rebuy||'',note:t.verdict?.note||'',editing:!!t.finished};
  openSheet('finish',finishHTML(t,s))}
function finishHTML(t,s){
  return `<div class="sheet-head"><div><h2 id="sheetTitle">${FIN.editing?'Edit verdict':'Finish'} ${esc(t.name)}</h2><span class="sh-sub">${FIN.editing?'In your library':'Moves it from your shelf to your library'}</span></div><button class="x" data-a="close" aria-label="Close">×</button></div>
  <div class="sheet-body sform">
   <section class="scard"><div class="fin-sum"><span class="cup lg" style="--liq:${liqHex(teaLiq(t))}"></span><div><div class="tc-name">${esc(t.name)}</div><div class="sub">${s.bs.length} session${s.bs.length===1?'':'s'}${s.first?' since '+monthYear(s.first):''}${s.avg?' · average '+s.avg.toFixed(1):''}${s.grams?' · '+s.grams+' g brewed':''}</div>${s.best?`<div class="recipe mono" style="font-size:12.5px;color:var(--ink-2)">Best session: ${esc(paramLine(s.best))}</div>`:''}</div></div></section>
   <section class="scard"><div class="scard-head"><h3>Overall score</h3><span class="aside">${s.avg?'suggested from your sessions':''}</span></div><div class="rating" id="fin-score">${finScoreHTML()}</div>
    <div class="field"><span class="lbl">Would you buy it again?</span><div class="seg" id="fin-rebuy">${finRebuyHTML()}</div></div>
    <div class="field"><label class="lbl" for="fin-note">Parting note</label><textarea class="textarea" id="fin-note" rows="3" placeholder="What you’ll remember about it, how it changed, who it would suit…">${esc(FIN.note)}</textarea></div></section>
  </div>
  <div class="sheet-foot"><button class="btn ghost" data-a="close">Cancel</button><button class="btn primary" data-a="saveFinish">${FIN.editing?'Save verdict':'Move to library'}</button></div>`}
const finScoreHTML = ()=>Array.from({length:10},(_,i)=>`<button type="button" data-a="finScore" data-v="${i+1}" class="${FIN.score===i+1?'sel':FIN.score>i+1?'on':''}" aria-pressed="${FIN.score===i+1}">${i+1}</button>`).join('');
const finRebuyHTML = ()=>Object.entries(REBUY).map(([k,v])=>`<button type="button" data-a="finRebuy" data-v="${k}" aria-pressed="${FIN.rebuy===k}">${v}</button>`).join('');
async function saveFinish(){const t=teaById(FIN.id);const nt={...(store.teas.find(x=>x.id===FIN.id)||t)};
  nt.verdict={score:FIN.score||null,rebuy:FIN.rebuy||'',note:$('#fin-note').value.trim()};if(!nt.finished)nt.finished=new Date().toISOString();
  const wasEdit=FIN.editing;try{await store.saveTea(nt);closeSheet();toast(wasEdit?'Verdict saved':'Moved to your library');if(state.view==='tea')renderTea()}catch{toast('Could not save. Try again.')}}

/* ═════════ View switching ═════════ */
function setView(v,opts={}){
  state.view=v;if(v==='tea'){state.teaId=opts.teaId;state.teaStyle=null;state.teaSrc='typical'}if(v==='guide'&&opts.gSel){state.gSel=opts.gSel;state.gStyle=opts.gStyle||null;state.gq=''}
  const tab=v==='tea'?(teaById(state.teaId)?.finished?'library':'shelf'):v;$$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===tab));$('#gearBtn')?.setAttribute('aria-pressed',v==='settings');
  $$('.view').forEach(s=>s.hidden=s.id!=='view-'+v);renderView();window.scrollTo(0,0);
}
function renderView(){({library:renderLibrary,shelf:renderShelf,tea:renderTea,journal:renderJournal,insights:renderInsights,guide:renderGuide,settings:renderSettings})[state.view]()}
function renderAll(){
  const ae=document.activeElement;if(ae?.closest?.('#view-settings,#view-guide')&&['INPUT','SELECT'].includes(ae.tagName)&&ae.id!=='gq'){/* keep focus while typing */}else renderView();
  const k=$('#scrim').dataset.kind;if(!$('#scrim').hidden&&k==='session'&&openId){const b=store.brews.find(x=>x.id===openId);b?$('#sheet').innerHTML=sessionDetailHTML(b):closeSheet()}}

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

/* ═════════ Combobox (tea type, brand, origin) ═════════ */
let comboIdx=-1;
function comboOptions(kind,q){
  const n=norm(q);
  if(kind==='type'){
    const cts=(store.settings.customTypes||[]).map(c=>({v:'c:'+c.id,label:c.name,sub:famOf(c.fam).name+' · your type',fam:c.fam}));
    const lib=LIB.map(t=>({v:t.name,label:t.name,aka:t.aka,sub:famOf(t.fam).name,fam:t.fam,t}));
    if(!n)return {grouped:true,items:[...cts,...lib]};
    const sc=o=>{const a=norm(o.label),b=norm(o.aka),c=norm(o.sub),d=norm(o.t?.x.char);return a.startsWith(n)?4:b.startsWith(n)?3.5:a.includes(n)?3:b.includes(n)?2.5:(n.length>=4&&n.includes(a)&&a.length>=4)?2.2:c.includes(n)?1.5:d.includes(n)?1:0};
    return {items:[...cts,...lib].map(o=>({o,s:sc(o)})).filter(x=>x.s).sort((a,b)=>b.s-a.s).slice(0,30).map(x=>x.o)};
  }
  const list=kind==='brand'?BRANDS:LOCS;if(!n)return {items:[]};
  return {items:list.map(x=>{const k=norm(x),first=norm(x.split(',')[0]);return{x,s:first.startsWith(n)?3:k.startsWith(n)?2.5:first.includes(n)?2:k.includes(n)?1:0,len:x.length}}).filter(o=>o.s).sort((a,b)=>b.s-a.s||a.len-b.len).slice(0,8).map(o=>({v:o.x,label:o.x}))};
}
function renderCombo(input){
  const kind=input.dataset.combo,box=$('#'+input.id+'-list');if(!box)return;const {items,grouped}=comboOptions(kind,input.value);comboIdx=-1;
  if(!items.length&&kind!=='type'){box.hidden=true;return}
  const opt=o=>`<button type="button" data-a="comboPick" data-k="${kind}" data-v="${esc(o.v)}" data-for="${input.id}">${kind==='type'?`<span class="cup sm" style="--liq:${liqHex(midLiq(o.t?.x.liqs||famOf(o.fam).liqs))};width:16px;height:16px;box-shadow:none"></span>`:''}<span><span class="s-name">${esc(o.label)}</span>${o.aka?` <span class="muted" style="font-size:13px">${esc(o.aka)}</span>`:''}</span>${o.sub?`<span class="s-sub">${esc(o.sub)}</span>`:''}</button>`;
  let html='';
  if(grouped){const byFam={};items.forEach(o=>(byFam[o.fam]=byFam[o.fam]||[]).push(o));html=FAMS.filter(f=>byFam[f.id]).map(f=>`<div class="picker-cat">${f.name}</div>${byFam[f.id].map(opt).join('')}`).join('')}
  else html=items.map(opt).join('');
  if(kind==='type')html+=`<button type="button" class="combo-other" data-a="typeOther"><span class="s-name">My tea isn’t listed</span><span class="s-sub">Pick a family instead</span></button>`;
  box.innerHTML=html;box.hidden=false;
}
function hideCombos(){$$('.sugg-list').forEach(b=>b.hidden=true)}

/* ═════════ Tea form ═════════ */
let TF=null;
function openTeaForm(opts={}){
  const ex=opts.id?teaById(opts.id):null;
  TF=ex?{...JSON.parse(JSON.stringify(ex)),then:null,editing:true}:{id:uid('t'),name:'',lib:'',fam:'',brand:'',origin:'',harvest:'',cultivar:'',url:'',notes:'',producer:null,then:opts.then||null};
  if(ex&&!ex.lib){const L=libMatch(ex.name);if(L&&L.fam===ex.fam)TF.lib=L.name;else TF.otherMode=true}
  if(opts.lib){const L=libByName(opts.lib);if(L)Object.assign(TF,{lib:L.name,fam:L.fam,origin:L.origin})}
  openSheet('tea',teaFormHTML());if(!ex&&!opts.lib)setTimeout(()=>$('#tf-type')?.focus(),40);
}
function tfType(){return TF.lib?(TF.lib.startsWith('c:')?customType(TF.lib.slice(2)):libByName(TF.lib)):null}
function validNote(kind,val){if(!val)return '';const ok=kind==='brand'?BRANDS.includes(val):LOCS.includes(val);return ok?`<span class="vok">✓ ${kind==='brand'?'Brand directory':'Recognised place'}</span>`:`<span class="vno">Not in the ${kind==='brand'?'brand':'place'} directory, saved as typed</span>`}
function teaFormHTML(){const f=TF;const Tt=tfType();const fam=Tt?.fam||f.fam;const tmp={fam,lib:f.lib};const ms=fam?methodsFor(tmp):[];const p=f.producer||{};
 return `<div class="sheet-head"><h2 id="sheetTitle">${f.editing?'Edit tea':'Add a tea'}</h2><button class="x" data-a="close" aria-label="Close">×</button></div>
 <form class="sheet-body" id="teaForm" autocomplete="off" novalidate>
  <details class="sec more" id="importBox" ${!f.editing&&!f.lib?'open':''}><summary><h3>Fill in from the product page</h3><span class="aside">optional</span></summary>
   <div class="import" id="importUI">${importHTML()}</div></details>
  <div class="sec">
   <div class="field suggest"><label class="lbl" for="tf-type">Tea type</label>
    ${Tt?`<div class="type-pick"><span class="cup sm" style="--liq:${liqHex(midLiq(liqsOf(tmp)))}"></span><span class="tp-main"><b>${esc(Tt.name)}</b>${Tt.aka?` <span class="muted">${esc(Tt.aka)}</span>`:''}<span class="tp-sub">${famOf(fam).name}${Tt.x?.char?' · '+esc(Tt.x.char):''}</span></span><button type="button" class="btn sm" data-a="typeChange">Change</button></div>`
    :`<input class="input big-input" id="tf-type" data-combo="type" placeholder="Search: sencha, rou gui, earl grey, yiwu…" value="" aria-autocomplete="list"><div class="sugg-list" id="tf-type-list" hidden></div>
      ${f.otherMode?`<div class="field" style="margin-top:10px"><span class="lbl">Family</span><div class="chips">${FAMS.map(c=>`<button type="button" class="chip" data-a="tfFam" data-v="${c.id}" aria-pressed="${f.fam===c.id}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}</button>`).join('')}</div><span class="vnote">The guide uses this family’s typical methods. To reuse a type, add it under Settings → Your tea types.</span></div>`:'<span class="vnote">Choosing the type sets the family and the brewing guide.</span>'}`}
   </div>
   <div class="field"><label class="lbl" for="tf-name">Name on your shelf</label><input class="input" id="tf-name" value="${esc(f.name)}" placeholder="${esc(Tt?.name||'e.g. Kagoshima Sencha')}"><span class="vnote">Optional. Leave blank to use the type name, or add the region, grade or year.</span></div>
  </div>
  <div class="sec"><div class="grid2">
   <div class="field suggest"><label class="lbl" for="tf-brand">Brand</label><input class="input" id="tf-brand" data-combo="brand" value="${esc(f.brand)}" placeholder="Start typing: Ippodo, Mariage Frères…"><div class="sugg-list" id="tf-brand-list" hidden></div><span class="vnote" id="tf-brand-note">${validNote('brand',f.brand)}</span></div>
   <div class="field suggest"><label class="lbl" for="tf-origin">Origin</label><input class="input" id="tf-origin" data-combo="origin" value="${esc(f.origin)}" placeholder="Start typing: Kyoto, Wuyi, Darjeeling…"><div class="sugg-list" id="tf-origin-list" hidden></div><span class="vnote" id="tf-origin-note">${validNote('origin',f.origin)}</span></div>
   <div class="field"><label class="lbl" for="tf-harvest">Harvest / pressing</label><input class="input" id="tf-harvest" value="${esc(f.harvest)}" placeholder="Shincha 2026, Spring 2019…"></div>
   <div class="field"><label class="lbl" for="tf-cultivar">Cultivar</label><input class="input" id="tf-cultivar" value="${esc(f.cultivar)}" placeholder="Yabukita, Qing Xin…"></div>
  </div>
  <div class="grid2"><div class="field"><label class="lbl" for="tf-stockg">Amount bought (g)</label><input class="input mono" id="tf-stockg" inputmode="decimal" value="${f.stock?.g??''}" placeholder="e.g. 50"><span class="vnote">Sessions count it down so you know what’s left.</span></div>
   <div class="field"><label class="lbl" for="tf-price">Price paid</label><input class="input mono" id="tf-price" value="${f.stock?.price!=null?esc((f.stock.cur||'')+f.stock.price):''}" placeholder="e.g. $24"><span class="vnote">Shows cost per gram and per session.</span></div></div>
  <div class="field"><label class="lbl" for="tf-url">Product page</label><input class="input" id="tf-url" type="url" value="${esc(f.url||'')}" placeholder="https://"></div>
  <div class="field"><label class="lbl" for="tf-notes">About this tea</label><textarea class="textarea" id="tf-notes" placeholder="Where you bought it, dry leaf, storage, price per gram…">${esc(f.notes||'')}</textarea></div></div>
  <details class="sec more" ${f.producer?'open':''}><summary><h3>Producer’s brewing instructions</h3><span class="aside">from the packet or website</span></summary>
   ${ms.length?`<p class="vnote">Shown alongside the typical guide where they differ. Leave blank if there are none.</p>
   <div class="grid2"><div class="field"><label class="lbl" for="pr-style">Method</label><select class="input" id="pr-style">${ms.map(m=>`<option value="${m.style}" ${(p.style||ms[0].style)===m.style?'selected':''}>${STYLE[m.style]}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl" for="pr-sched">Steep times</label><input class="input mono" id="pr-sched" value="${esc((p.sched||[]).map(fmtS).join(', '))}" placeholder="60s, 20s, 40s"></div>
    <div class="field"><label class="lbl" for="pr-g">Leaf (g)</label><input class="input mono" id="pr-g" inputmode="decimal" value="${p.g??''}"></div>
    <div class="field"><label class="lbl" for="pr-ml">Water (ml)</label><input class="input mono" id="pr-ml" inputmode="numeric" value="${p.ml??''}"></div>
    <div class="field"><label class="lbl" for="pr-temp">Temperature (${deg()})</label><input class="input mono" id="pr-temp" inputmode="numeric" value="${p.temp!=null&&p.temp!==''?toU(p.temp):''}"></div>
    <div class="field"><label class="lbl" for="pr-notes">Their notes</label><input class="input" id="pr-notes" value="${esc(p.notes||'')}" placeholder="Anything else they suggest"></div></div>`:'<p class="vnote">Choose the tea type first.</p>'}
  </details>
 </form>
 <div class="sheet-foot"><span class="hint" id="tfHint"></span>${f.editing?`<button class="btn danger" data-a="delTea" data-v="${esc(f.id)}">Delete tea</button>`:''}<button class="btn ghost" data-a="close">Cancel</button><button class="btn primary" data-a="saveTea">${f.then==='session'?'Save & log session':f.editing?'Save changes':'Add to shelf'}</button></div>`}
function importHTML(){
  const ai=!!store.sample;
  return `<p class="vnote">This page can’t open links itself. Open the product page, select all of its text, copy it and paste it below${ai&&store.sampleImages?', or add a photo of the label':''}. ${ai?'Claude reads it and fills in the form.':'The form is filled in from what it can recognise.'}</p>
   <textarea class="textarea" id="im-text" placeholder="Paste the product page text here" style="min-height:110px"></textarea>
   <div class="tool-row">${ai&&store.sampleImages?`<label class="btn sm" for="im-photo" style="cursor:pointer">Add label photo</label><input type="file" id="im-photo" accept="${esc((store.imageTypes||['image/jpeg','image/png','image/webp']).join(','))}" hidden><span class="vnote" id="im-photo-name"></span>`:''}
    <button type="button" class="btn sm primary" data-a="importRun" id="im-run">Fill in the form</button><span class="vnote" id="im-status"></span></div>`;
}
function refreshImportUI(){const u=$('#importUI');if(u&&!$('#im-text')?.value)u.innerHTML=importHTML()}
function readTeaForm(){if(!TF)return;const v=id=>$('#'+id)?.value.trim();
  ['name','brand','origin','harvest','cultivar','url'].forEach(k=>{const x=v('tf-'+k);if(x!=null)TF[k]=x});
  if($('#tf-stockg')){const g=parseFloat(v('tf-stockg'));const pr=parsePrice(v('tf-price'));TF.stock=g>0?{g,price:pr?.price??null,cur:pr?.cur||'',since:TF.stock?.since||TF.createdAt||new Date().toISOString()}:null}const n=$('#tf-notes');if(n)TF.notes=n.value;
  if($('#pr-style')){const g=parseFloat(v('pr-g')),ml=parseFloat(v('pr-ml')),tp=parseFloat(v('pr-temp')),sc=parseSched(v('pr-sched')),nt=v('pr-notes');
    TF.producer=(!isNaN(g)||!isNaN(ml)||!isNaN(tp)||sc.length||nt)?{style:v('pr-style'),g:isNaN(g)?null:g,ml:isNaN(ml)?null:ml,temp:isNaN(tp)?null:fromU(tp),sched:sc,notes:nt||''}:null}}
function refreshTeaForm(){const sc=$('#scrim').scrollTop;const imp=$('#im-text')?.value||'';const io=$('#importBox')?.open;$('#sheet').innerHTML=teaFormHTML();if(imp)$('#im-text').value=imp;if(io!=null)$('#importBox').open=io;$('#scrim').scrollTop=sc}
async function saveTeaForm(){readTeaForm();const Tt=tfType();const fam=Tt?.fam||TF.fam;
  if(!Tt&&!TF.fam){$('#tfHint').textContent='Choose the tea type, or a family if it isn’t listed.';return}
  const name=TF.name||Tt?.name;if(!name){$('#tfHint').textContent='Give the tea a name.';$('#tf-name').focus();return}
  const t={id:TF.id,name,lib:TF.lib||'',fam,brand:TF.brand,origin:TF.origin,harvest:TF.harvest,cultivar:TF.cultivar,url:TF.url,notes:TF.notes,producer:TF.producer||null,stock:TF.stock||null,createdAt:TF.createdAt||new Date().toISOString()};if(TF.finished)t.finished=TF.finished;if(TF.verdict)t.verdict=TF.verdict;
  if(TF.example)t.example=true;
  const then=TF.then;const btn=$('[data-a="saveTea"]');btn.disabled=true;
  try{await store.saveTea(t);if(then==='session'){openSessionForm({teaId:t.id})}else{const wasEdit=TF.editing;closeSheet();toast(wasEdit?'Tea saved':'Added to your shelf');if(state.view==='tea'&&state.teaId===t.id)renderTea();else setView('tea',{teaId:t.id})}}
  catch{btn.disabled=false;$('#tfHint').textContent='Could not save. Check your connection and try again.'}}

/* product page import */
function bestLoc(s){if(!s)return '';if(LOCS.includes(s))return s;const n=norm(s);const exact=LOCS.find(l=>norm(l)===n);if(exact)return exact;
  const parts=s.split(',').map(x=>norm(x)).filter(Boolean);const cand=LOCS.filter(l=>norm(l.split(',')[0])===parts[0]);if(cand.length)return cand.sort((a,b)=>a.length-b.length)[0];return s}
function bestBrand(s){if(!s)return '';const n=norm(s);return BRANDS.find(b=>norm(b)===n)||BRANDS.find(b=>norm(b).length>=4&&(n.includes(norm(b))||norm(b).includes(n)))||s}
function heuristicParse(text){
  const out={producer:{}};const n=norm(text);let m;
  let bt=null;LIB.forEach(t=>[t.name,t.aka].forEach(x=>{const k=norm(x);if(k.length>=4&&n.includes(k)&&(!bt||k.length>bt.k))bt={t,k:k.length}}));if(bt)out.type=bt.t.name;
  let bb=null;BRANDS.forEach(b=>{const k=norm(b);if(k.length>=3&&n.includes(k)&&(!bb||k.length>bb.length))bb=b});if(bb)out.brand=bb;
  let bl=null;LOCS.forEach(l=>{const k=norm(l.split(',')[0]);if(k.length>=4&&n.includes(k)&&(!bl||l.split(',').length>bl.split(',').length))bl=l});if(bl)out.origin=bl;
  if((m=text.match(/(\d{2,3})\s*(?:°|º|degrees?)\s*([CF])\b/i))){let v=+m[1];if(m[2].toUpperCase()==='F')v=Math.round((v-32)*5/9);out.producer.temp_c=v}
  if((m=text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i)))out.producer.grams=+m[1];
  else if((m=text.match(/(\d+(?:\.\d+)?)\s*(?:tsp|teaspoons?)/i)))out.producer.grams=r1(+m[1]*2.5);
  if((m=text.match(/(\d{2,4})\s*(?:ml|millilit(?:er|re)s?)\b/i)))out.producer.ml=+m[1];
  else if((m=text.match(/(\d+(?:\.\d+)?)\s*(?:fl\.?\s*)?oz\b/i)))out.producer.ml=Math.round(+m[1]*30);
  const times=[...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:[-–]|to)?\s*(?:\d+(?:\.\d+)?)?\s*(minutes?|mins?|seconds?|secs?)\b/gi)].map(x=>Math.round(+x[1]*(/^m/i.test(x[2])?60:1))).slice(0,6);
  if(times.length)out.producer.steeps_s=times;
  if((m=text.match(/\b((?:spring|summer|autumn|fall|winter|first flush|second flush|shincha)\s+)?(20\d\d|19\d\d)\b/i)))out.harvest=(m[1]?m[1].trim().replace(/^./,c=>c.toUpperCase())+' ':'')+m[2];
  if(/gong\s?fu|gaiwan/i.test(text))out.producer.method='gongfu';else if(/kyusu/i.test(text))out.producer.method='kyusu';else if(/cold[\s-]?brew/i.test(text)&&!times.some(t=>t<3600))out.producer.method='cold';else if(times[0]>=120)out.producer.method='western';
  return out;
}
async function runImport(){
  const text=$('#im-text').value.trim();const photo=$('#im-photo')?.files?.[0]||null;const st=$('#im-status'),btn=$('#im-run');
  if(!text&&!photo){st.textContent='Paste the page text first.';return}
  readTeaForm();btn.disabled=true;let res=null,via='';
  if(store.sample){st.textContent='Reading it…';
    const prompt=`You extract tea product details from a tea shop's product page text${photo?' and/or the attached photo of the label':''}. Reply with only JSON in this shape:
{"type": "<exactly one name from TYPES below, or null>", "family": "<one of FAMILIES, only when type is null>", "name": "<product name as sold>", "brand": "<brand or producer or null>", "origin": "<'Place, Region, Country' or null>", "harvest": "<e.g. 'Spring 2025' or null>", "cultivar": "<or null>", "about": "<one or two sentences describing the tea, or null>",
 "producer": {"method": "<one of ${STY.map(s=>s[0]).join(', ')} or null>", "grams": <number or null>, "ml": <number or null>, "temp_c": <number or null>, "steeps_s": [<seconds per infusion>], "notes": "<other brewing advice or null>"}}
Convert °F to °C, fluid ounces to ml (1 fl oz = 30 ml), teaspoons of loose leaf to grams (1 tsp ≈ 2.5 g) and minutes to seconds. Use only what the source states; use null when something is not given.
FAMILIES: ${FAMS.map(f=>f.id+' ('+f.name+')').join(', ')}
TYPES: ${LIB.map(t=>t.name+(t.aka?' ('+t.aka+')':'')).join('; ')}
PAGE TEXT:
${text.slice(0,30000)||'(none, use the photo)'}`;
    try{res=await store.sample.json(prompt,{modelTier:'quick',...(photo?{images:[photo]}:{})});via='claude'}
    catch(e){if(e?.code==='not_granted'){st.textContent='Claude wasn’t allowed, so the form was filled from what could be recognised.'}res=null}}
  if(!res){if(!text){btn.disabled=false;st.textContent='Paste the page text to fill in without Claude.';return}res=heuristicParse(text);via=via||'local'}
  let n=0;const set=(k,v)=>{if(v&&!TF[k]){TF[k]=v;n++}};
  const L=res.type?libByName(res.type)||libMatch(res.type):null;
  if(L&&!TF.lib){TF.lib=L.name;TF.fam=L.fam;TF.otherMode=false;n++}else if(!TF.lib&&res.family&&FAM[res.family]){TF.fam=res.family;TF.otherMode=true;n++}
  if(res.name&&(!L||norm(res.name)!==norm(L.name)))set('name',String(res.name).slice(0,80));
  set('brand',bestBrand(res.brand));set('origin',bestLoc(res.origin));set('harvest',res.harvest);set('cultivar',res.cultivar);
  if(res.about&&!TF.notes){TF.notes=res.about;n++}
  const p=res.producer||{};const fam=tfType()?.fam||TF.fam;const ms=fam?methodsFor({fam,lib:TF.lib}).map(m=>m.style):[];
  if(p&&(p.grams||p.ml||p.temp_c||(p.steeps_s||[]).length)){const style=ms.includes(p.method)?p.method:ms.includes('western')&&(p.steeps_s?.[0]||0)>=120?'western':ms[0];
    TF.producer={style,g:p.grams??null,ml:p.ml??null,temp:p.temp_c??null,sched:(p.steeps_s||[]).filter(x=>x>0),notes:p.notes||''};n++}
  refreshTeaForm();const st2=$('#im-status');if(st2)st2.textContent=n?`Filled in ${n} field${n>1?'s':''}${via==='claude'?' with Claude':''}. Check them below.`:'Nothing recognisable was found. Fill in the form by hand.';
  $('#im-run').disabled=false;
}

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
  setTimeout(()=>$$('.srow')[S.open]?.scrollIntoView({block:'nearest',behavior:'smooth'}),30)}
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

/* ═════════ Export ═════════ */
async function exportData(kind){let data,filename;
  if(kind==='json'){data=JSON.stringify({teas:allTeas(),sessions:store.brews,settings:store.settings},null,2);filename='loose-leaf-notes.json'}
  else{const q=x=>{x=String(x??'');return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};const cols=['date','tea','type','family','brand','origin','harvest','method','vessel','g','ml','temp_c','infusions','steep_times_s','rating','tags','notes'];
    data=[cols.join(',')].concat(store.brews.map(b=>{const t=teaById(b.teaId)||{};return[b.at,t.name,typeOf(t)?.name||'',famOf(t.fam).name,t.brand,t.origin,t.harvest,STYLE[b.style],vesselOf(b).name,b.g,b.ml,b.temp,b.steeps.length,b.steeps.map(s=>s.s).join(' '),b.rating||'',sessionTags(b).join('; '),b.notes].map(q).join(',')})).join('\n');filename='loose-leaf-sessions.csv'}
  try{await store.downloads.save({filename,data})}catch(e){if(e?.code!=='declined')toast('That export is not available here.')}}

/* ═════════ Events ═════════ */
function arm(btn,label){if(btn.classList.contains('armed'))return true;const old=btn.textContent;btn.classList.add('armed');btn.textContent=label;setTimeout(()=>{if(btn.isConnected){btn.classList.remove('armed');btn.textContent=old}},3500);return false}
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-a]');if(!el){if(!e.target.closest('.suggest'))hideCombos();return}const a=el.dataset.a,v=el.dataset.v;
  switch(a){
   case 'view':closeSheet();setView(v);return;
   case 'close':closeSheet();return;
   case 'openTea':closeSheet();setView('tea',{teaId:v});return;
   case 'teaStyle':state.teaStyle=v;renderTea();return;
   case 'teaSrc':state.teaSrc=v;renderTea();return;
   case 'shelfFam':state.shelfFam=state.shelfFam===v?'':v;if(state.view!=='shelf')setView('shelf');else renderShelf();return;
   case 'shelfClear':state.q='';state.shelfFam='';renderShelf();return;
   case 'jcat':state.jcats.has(v)?state.jcats.delete(v):state.jcats.add(v);renderJournal();return;
   case 'jClear':state.jq='';state.jcats=new Set();state.jmin=0;renderJournal();return;
   case 'xAxis':state.xAxis=v;renderInsights();return;
   case 'newSession':openPicker();return;
   case 'pickTea':case 'logFor':openSessionForm({teaId:v});return;
   case 'newTea':openTeaForm({then:v||null});return;
   case 'libTea':openTeaForm({lib:v});return;
   case 'editTea':openTeaForm({id:v});return;
   case 'openSession':openSessionDetail(v);return;
   case 'editSession':{const b=store.brews.find(x=>x.id===v);if(b)openSessionForm({brew:b,mode:'edit'});return}
   case 'again':{const b=store.brews.find(x=>x.id===v);if(b)openSessionForm({brew:b,mode:'again'});return}
   case 'delSession':if(!arm(el,'Tap again to delete'))return;try{await store.removeBrew(v);closeSheet();toast('Session deleted')}catch{toast('Could not delete. Try again.')}return;
   case 'delTea':{const n=brewsOf(v).length;if(!arm(el,n?`Delete tea and ${n} session${n>1?'s':''}?`:'Tap again to delete'))return;try{await store.removeTea(v);closeSheet();setView('shelf');toast('Tea deleted')}catch{toast('Could not delete. Try again.')}return}
   case 'clearEx':{if(!arm(el,'Tap again to remove'))return;el.disabled=true;try{for(const b of store.brews.filter(b=>b.example))await store.removeBrew(b.id);for(const t of store.teas.filter(t=>t.example))await store.removeTea(t.id);toast('Examples removed')}catch{toast('Could not remove every example. Try again.')}return}
   case 'export':exportData(v);return;
   case 'showFinished':state.showFinished=!state.showFinished;state.shelfFam='';renderShelf();return;
   case 'finishTea':openFinish(v);return;
   case 'restockTea':{const t=teaById(v);if(!t)return;const nt={...(store.teas.find(x=>x.id===v)||t)};delete nt.finished;if(nt.stock)nt.stock={...nt.stock,since:new Date().toISOString()};try{await store.saveTea(nt);toast('Back on your shelf. Update the amount in Edit tea if it changed.');setView('tea',{teaId:v})}catch{toast('Could not save. Try again.')}return}
   case 'finScore':FIN.score=FIN.score===+v?0:+v;$('#fin-score').innerHTML=finScoreHTML();return;
   case 'finRebuy':FIN.rebuy=FIN.rebuy===v?'':v;$('#fin-rebuy').innerHTML=finRebuyHTML();return;
   case 'saveFinish':saveFinish();return;
   case 'libFam':state.libFam=state.libFam===v?'':v;renderLibrary();return;
   case 'libClear':state.libQ='';state.libFam='';state.libRebuy='';renderLibrary();return;
   case 'gSel':state.gSel=v;renderGuide();if(innerWidth<900)$('.gdetail')?.scrollIntoView({block:'start',behavior:'smooth'});return;
   case 'gStyle':state.gStyle=v;renderGuide();return;
   case 'gReset':{const all={...(store.settings.guideOverrides||{})};delete all[state.gSel+'|'+state.gStyle];store.setSettings({guideOverrides:all});renderGuide();toast('Guide reset to default');return}
   case 'editGuide':closeSheet();setView('guide',{gSel:v,gStyle:el.dataset.s});return;
   case 'setMode':store.setSettings({tempMode:v});renderSettings();return;
   case 'setUnit':store.setSettings({unit:v});renderView();return;
   case 'rmWare':store.setSettings({vessels:store.settings.vessels.filter(x=>x.id!==v)});renderSettings();return;
   case 'addWare':{const vt=VT[v];const same=store.settings.vessels.filter(x=>x.type===v).length;store.setSettings({vessels:[...store.settings.vessels,{id:uid('w'),type:v,name:vt.name+(same?' '+(same+1):''),ml:vt.ml}]});renderSettings();toast(vt.name+' added to your teaware');return}
   case 'addType':store.setSettings({customTypes:[...(store.settings.customTypes||[]),{id:uid('c'),name:'New tea type',fam:'other',t:null}]});renderSettings();setTimeout(()=>{const i=$$('[data-ct="name"]').pop();i?.focus();i?.select()},20);return;
   case 'rmType':store.setSettings({customTypes:(store.settings.customTypes||[]).filter(x=>x.id!==v)});renderSettings();return;
   case 'manageWare':if(S&&!confirmLeave(el))return;closeSheet();setView('settings');return;
   // tea form
   case 'comboPick':{const k=el.dataset.k;readTeaForm();if(k==='type'){const prevName=tfType()?.name;TF.lib=v;const Tt=tfType();TF.fam=Tt.fam;TF.otherMode=false;if(!TF.origin&&Tt.origin)TF.origin=Tt.origin;if(TF.name===prevName)TF.name='';refreshTeaForm();setTimeout(()=>$('#tf-name')?.focus(),20)}
     else{TF[k]=v;const inp=$('#'+el.dataset.for);inp.value=v;hideCombos();$('#tf-'+k+'-note').innerHTML=validNote(k,v)}return}
   case 'typeOther':readTeaForm();TF.lib='';TF.otherMode=true;refreshTeaForm();return;
   case 'typeChange':readTeaForm();TF.lib='';refreshTeaForm();setTimeout(()=>{const i=$('#tf-type');i?.focus();if(i)renderCombo(i)},20);return;
   case 'tfFam':readTeaForm();TF.fam=v;refreshTeaForm();return;
   case 'importRun':runImport();return;
   case 'saveTea':saveTeaForm();return;
  }
  if(!S)return;
  switch(a){
   case 'sStyle':{readSF();S.style=v;const rec=sProd()||sRec();['g','ml','temp'].forEach(k=>S.touched.delete(k));S.g=rec.gT;S.ml=rec.ml;S.temp=rec.target;S.rinse=v==='gongfu'&&rec.rinse>0;$('#sf-rinse').checked=S.rinse;pickDefaultVessel();if(!S.steeps.length)S.target=nextTarget();renderSF();return}
   case 'sVessel':{const w=store.settings.vessels.find(x=>x.id===v);S.vesselId=w.id;S.vesselType=w.type;S.vesselName=w.name;if(!S.touched.has('ml')&&w.ml&&['gongfu','kyusu','glass'].includes(S.style)){S.ml=w.ml;if(!S.touched.has('g'))S.g=half(avg(sRec().per)*w.ml/100)}rVessels();rDials();rRatio();rVisual();return}
   case 'sStep':{const[k,d]=v.split(':');S[k]=Math.max(0,r1((+S[k]||0)+ +d));S.touched.add(k);rDials();rRatio();rVisual();return}
   case 'useSugg':case 'useProd':{const r=a==='useProd'?sProd():sRec();S.g=r.gT;S.ml=r.ml;S.temp=r.target;if(!S.steeps.length)S.target=r.sched[0];rDials();rRatio();rTemp();rVisual();rNow();return}
   case 'tMode':store.setSettings({tempMode:v});rTemp();return;
   case 'tAdj':setTemp(fromU(toU(S.temp)+ +v));return;
   case 'tSet':setTemp(+v);return;
   case 'tStart':tStart();return;
   case 'tStop':tStop(true);return;
   case 'tCancel':tStop(false);return;
   case 'tgtAdj':{const st=tStep(S.target);S.target=Math.max(1,S.target+ +v*st);rNow();return}
   case 'logNoTimer':{const p=parseS($('#tgtIn').value);if(p)S.target=p;logSteep(S.target);return}
   case 'sOpen':S.open=S.open===+v?-1:+v;rSteeps();return;
   case 'toggleAdjust':case 'openAdjust':S.adjust=a==='openAdjust'?true:!S.adjust;$('#sf-adjust').hidden=!S.adjust;rPlan();if(S.adjust&&a==='openAdjust')$('#sf-adjust').scrollIntoView({block:'nearest',behavior:'smooth'});return;
   case 'useLast':{const p=S.prev;S.g=p.g;S.ml=p.ml;S.temp=p.temp??S.temp;if(p.vesselId&&store.settings.vessels.some(w=>w.id===p.vesselId)){S.vesselId=p.vesselId;S.vesselType=p.vesselType;S.vesselName=p.vesselName}['g','ml','temp'].forEach(k=>S.touched.add(k));rVessels();rDials();rPlan();rTemp();rVisual();return}
   case 'stRemove':S.steeps.splice(+v,1);S.open=-1;if(!T.run)S.target=nextTarget();rSteeps();rNow();rVisual();return;
   case 'stTime':{const[i,d]=v.split(':').map(Number);const s=S.steeps[i];s.s=Math.max(1,s.s+d*tStep(s.s));rSteeps();rVisual();return}
   case 'stLiq':S.steeps[+v].liq=el.dataset.liq;rSteeps();rVisual();return;
   case 'liqAll':S.showAll['l'+v]=!S.showAll['l'+v];rSteeps();return;
   case 'stScore':{const[i,n]=v.split(':').map(Number);S.steeps[i].score=S.steeps[i].score===n?0:n;rSteeps();return}
   case 'stTag':{const s=S.steeps[+v];const tg=el.dataset.tag;s.tags=s.tags||[];const k=s.tags.indexOf(tg);k>=0?s.tags.splice(k,1):s.tags.push(tg);el.setAttribute('aria-pressed',k<0);return}
   case 'stAllTags':S.showAll['t'+v]=!S.showAll['t'+v];rSteeps();return;
   case 'stAddTag':addStepTag(+v);return;
   case 'sRate':{const r=+v;S.rating=S.rating===r?0:r;rRating();return}
   case 'saveSession':saveSession();return;
  }
});
function confirmLeave(el){if(!S.steeps.length&&!S.editing)return true;return arm(el,'Leave without saving?')}
function addStepTag(i){const inp=$('#st-ctag-'+i);const val=inp.value.trim().toLowerCase();if(!val)return;const s=S.steeps[i];s.tags=s.tags||[];if(!s.tags.includes(val))s.tags.push(val);rSteeps();setTimeout(()=>$('#st-ctag-'+i)?.focus(),0)}
$('#scrim').addEventListener('mousedown',e=>{if(e.target.id==='scrim'&&['session','picker'].includes($('#scrim').dataset.kind))closeSheet()});

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.combo){if(TF&&t.dataset.combo!=='type'){TF[t.dataset.combo]=t.value;const n=$('#tf-'+t.dataset.combo+'-note');if(n)n.innerHTML=validNote(t.dataset.combo,t.value)}renderCombo(t);return}
  if(t.id==='shelfQ'){state.q=t.value;clearTimeout(renderShelf._t);renderShelf._t=setTimeout(renderShelf,120);return}
  if(t.id==='jq'){state.jq=t.value;clearTimeout(renderJournal._t);renderJournal._t=setTimeout(renderJournal,120);return}
  if(t.id==='pickQ'){renderPickList();return}
  if(t.id==='libQ'){state.libQ=t.value;clearTimeout(renderLibrary._t);renderLibrary._t=setTimeout(renderLibrary,120);return}
  if(t.id==='gq'){state.gq=t.value;$('#glItems').innerHTML=guideListHTML();return}
  if(t.dataset.w){const id=t.dataset.id;store.setSettings({vessels:store.settings.vessels.map(x=>x.id===id?{...x,[t.dataset.w]:t.dataset.w==='ml'?(parseInt(t.value)||0):t.value}:x)});return}
  if(t.dataset.ct){const id=t.dataset.id,k=t.dataset.ct;store.setSettings({customTypes:(store.settings.customTypes||[]).map(c=>{if(c.id!==id)return c;if(k==='name')return{...c,name:t.value};if(k==='fam')return{...c,fam:t.value};const lo=parseFloat($('#ctl-'+id).value),hi=parseFloat($('#cth-'+id).value);return{...c,t:!isNaN(lo)&&!isNaN(hi)?[Math.min(lo,hi),Math.max(lo,hi)]:null}})});return}
  if(!S)return;
  if(t.id==='sf-g'||t.id==='sf-ml'){const k=t.id.slice(3);const n=parseFloat(t.value);if(!isNaN(n)){S[k]=n;S.touched.add(k);rRatio();rVisual()}return}
  if(t.id==='tType'){const n=parseFloat(t.value);if(!isNaN(n)){S.temp=clamp(fromU(n),0,100);S.touched.add('temp');rRatio();rVisual()}return}
  if(t.dataset.axis){const k=t.dataset.axis;S.axes[k]=+t.value;$('#axo-'+k).textContent=t.value==='0'?'–':t.value;$('#sf-radar').innerHTML=radarSVG([{v:S.axes}],{size:190});return}
  if(t.dataset.st==='note'){S.steeps[+t.dataset.i].note=t.value;return}
});
document.addEventListener('focusin',e=>{const t=e.target;if(t.dataset?.combo==='type')renderCombo(t)});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='jmin'){state.jmin=+t.value;renderJournal();return}
  if(t.id==='libRebuy'){state.libRebuy=t.value;renderLibrary();return}
  if(t.id==='libSort'){state.libSort=t.value;renderLibrary();return}
  if(t.dataset.ge!=null){commitGuide();return}
  if(t.dataset.ct==='fam'){t.dispatchEvent(new Event('input',{bubbles:true}));return}
  if(t.id==='im-photo'){const f=t.files?.[0];$('#im-photo-name').textContent=f?f.name:'';return}
  if(!S)return;
  if(t.id==='sf-g'||t.id==='sf-ml')rDials();
  if(t.id==='sf-rinse'){S.rinse=t.checked;rNow();rVisual()}
  if(t.dataset.st==='time'){const p=parseS(t.value);const s=S.steeps[+t.dataset.i];if(p){s.s=p}rSteeps();rVisual()}
  if(t.id==='tgtIn'){const p=parseS(t.value);if(p)S.target=p;rNow()}
  if(t.id==='tType')rTemp();
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Escape'&&!$('#scrim').hidden){const open=$$('.sugg-list').find(b=>!b.hidden);if(open){open.hidden=true;return}if(!['form','tea'].includes($('#scrim').dataset.kind))closeSheet();return}
  if(t.dataset?.combo){const box=$('#'+t.id+'-list');const items=box&&!box.hidden?$$('button',box):[];
    if(items.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();comboIdx=(comboIdx+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((b,i)=>b.classList.toggle('hi',i===comboIdx));items[comboIdx].scrollIntoView({block:'nearest'});return}
    if(e.key==='Enter'){e.preventDefault();if(items.length&&(comboIdx>=0||t.dataset.combo==='type'))items[Math.max(0,comboIdx)].click();else hideCombos();return}}
  if(t.id==='tdial'&&S){const map={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:5,PageDown:-5};if(map[e.key]){e.preventDefault();setTemp(fromU(toU(S.temp)+map[e.key]))}return}
  if(t.dataset?.st==='ctag'&&e.key==='Enter'){e.preventDefault();addStepTag(+t.dataset.i);return}
  if(t.id==='tgtIn'&&e.key==='Enter'){e.preventDefault();t.blur();return}
  if(t.dataset?.ge!=null&&e.key==='Enter'){e.preventDefault();t.blur();return}
  if(t.closest?.('#sForm,#teaForm')&&e.key==='Enter'&&t.tagName==='INPUT'){e.preventDefault();t.blur()}
});
document.addEventListener('focusout',e=>{if(e.target.dataset?.combo)setTimeout(()=>{const box=$('#'+e.target.id+'-list');if(box&&!box.contains(document.activeElement))box.hidden=true},180)});
document.addEventListener('submit',e=>e.preventDefault());
document.addEventListener('mousedown',e=>{if(e.target.closest('.sugg-list'))e.preventDefault()});
document.addEventListener('pointerdown',e=>{const d=e.target.closest('#tdial');if(!d||!S)return;e.preventDefault();d.setPointerCapture(e.pointerId);d._drag=true;dialFromEvent(e)});
document.addEventListener('pointermove',e=>{const d=$('#tdial');if(d&&d._drag)dialFromEvent(e)});
document.addEventListener('pointerup',()=>{const d=$('#tdial');if(d)d._drag=false});
document.addEventListener('pointercancel',()=>{const d=$('#tdial');if(d)d._drag=false});

renderView();
store.init();
