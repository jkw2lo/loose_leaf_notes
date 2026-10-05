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
