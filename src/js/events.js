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
  if(t.id==='importFile'){const f=t.files?.[0];if(f)importBackup(f);t.value='';return}
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
