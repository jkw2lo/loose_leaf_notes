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
