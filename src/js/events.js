/* ═════════ Events ═════════ */
function arm(btn,label){if(btn.classList.contains('armed'))return true;const old=btn.textContent;btn.classList.add('armed');btn.textContent=label;setTimeout(()=>{if(btn.isConnected){btn.classList.remove('armed');btn.textContent=old}},3500);return false}
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-a]');if(!el){if(!e.target.closest('.suggest'))hideCombos();return}const a=el.dataset.a,v=el.dataset.v;
  switch(a){
   case 'view':if(v!=='brew'&&!leaveOK())return;closeSheet();setView(v);return;
   case 'close':closeSheet();return;
   case 'openTea':if(!leaveOK())return;closeSheet();setView('tea',{teaId:v});return;
   case 'teaStyle':state.teaStyle=v;renderTea();return;
   case 'teaSrc':state.teaSrc=v;renderTea();return;
   case 'shelfFam':state.shelfFam=state.shelfFam===v?'':v;state.shelfPage=null;if(state.view!=='shelf')setView('shelf');else renderShelf();return;
   case 'shelfClear':state.shelfFam='';state.shelfPage=null;renderShelf();return;
   case 'shelfPick':state.shelfSel=v;state.shelfStyle=null;renderShelf();if(innerWidth<900)$('#homePanel')?.scrollIntoView({block:'start',behavior:'smooth'});return;
   case 'shelfPage':state.shelfPage=+v;renderShelf();return;
   case 'shelfTab':state.shelfTab=v;$('#homePanel').innerHTML=shelfPanel(teaById(state.shelfSel));return;
   case 'shelfStyle':state.shelfStyle=v;$('#homePanel').innerHTML=shelfPanel(teaById(state.shelfSel));return;
   case 'jcat':if(!v)state.jcats=new Set();else state.jcats.has(v)?state.jcats.delete(v):state.jcats.add(v);renderJournal();return;
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
   case 'manageWare':if(!leaveOK())return;closeSheet();setView('settings');return;
   // tea form
   case 'comboPick':{const k=el.dataset.k;readTeaForm();if(k==='type'){const prevName=tfType()?.name;TF.lib=v;const Tt=tfType();TF.fam=Tt.fam;TF.otherMode=false;if(!TF.origin&&Tt.origin)TF.origin=Tt.origin;if(TF.name===prevName)TF.name='';refreshTeaForm();setTimeout(()=>$('#tf-name')?.focus(),20)}
     else{TF[k]=v;const inp=$('#'+el.dataset.for);inp.value=v;hideCombos();$('#tf-'+k+'-note').innerHTML=validNote(k,v)}return}
   case 'typeOther':readTeaForm();TF.lib='';TF.otherMode=true;refreshTeaForm();return;
   case 'typeChange':readTeaForm();TF.lib='';refreshTeaForm();setTimeout(()=>{const i=$('#tf-type');i?.focus();if(i)renderCombo(i)},20);return;
   case 'tfFam':readTeaForm();TF.fam=v;refreshTeaForm();return;
   case 'importRun':runImport();return;
   case 'saveTea':saveTeaForm();return;
  }
  if(S)brewAction(a,v,el);
});
$('#scrim').addEventListener('mousedown',e=>{if(e.target.id==='scrim'&&['session','picker'].includes($('#scrim').dataset.kind))closeSheet()});

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.combo){if(TF&&t.dataset.combo!=='type'){TF[t.dataset.combo]=t.value;const n=$('#tf-'+t.dataset.combo+'-note');if(n)n.innerHTML=validNote(t.dataset.combo,t.value)}renderCombo(t);return}
  if(t.id==='jq'){state.jq=t.value;clearTimeout(renderJournal._t);renderJournal._t=setTimeout(renderJournal,120);return}
  if(t.id==='pickQ'){renderPickList();return}
  if(t.id==='libQ'){state.libQ=t.value;clearTimeout(renderLibrary._t);renderLibrary._t=setTimeout(renderLibrary,120);return}
  if(t.id==='gq'){state.gq=t.value;$('#glItems').innerHTML=guideListHTML();return}
  if(t.dataset.w){const id=t.dataset.id;store.setSettings({vessels:store.settings.vessels.map(x=>x.id===id?{...x,[t.dataset.w]:t.dataset.w==='ml'?(parseInt(t.value)||0):t.value}:x)});return}
  if(t.dataset.ct){const id=t.dataset.id,k=t.dataset.ct;store.setSettings({customTypes:(store.settings.customTypes||[]).map(c=>{if(c.id!==id)return c;if(k==='name')return{...c,name:t.value};if(k==='fam')return{...c,fam:t.value};const lo=parseFloat($('#ctl-'+id).value),hi=parseFloat($('#cth-'+id).value);return{...c,t:!isNaN(lo)&&!isNaN(hi)?[Math.min(lo,hi),Math.max(lo,hi)]:null}})});return}
  if(S)brewInput(t);
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
  if(S)brewChange(t);
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Escape'&&!$('#scrim').hidden){const open=$$('.sugg-list').find(b=>!b.hidden);if(open){open.hidden=true;return}if(!['form','tea'].includes($('#scrim').dataset.kind))closeSheet();return}
  if(t.dataset?.combo){const box=$('#'+t.id+'-list');const items=box&&!box.hidden?$$('button',box):[];
    if(items.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();comboIdx=(comboIdx+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((b,i)=>b.classList.toggle('hi',i===comboIdx));items[comboIdx].scrollIntoView({block:'nearest'});return}
    if(e.key==='Enter'){e.preventDefault();if(items.length&&(comboIdx>=0||t.dataset.combo==='type'))items[Math.max(0,comboIdx)].click();else hideCombos();return}}
  if(t.dataset?.st==='ctag'&&e.key==='Enter'){e.preventDefault();addStepTag(+t.dataset.i);return}
  if(t.dataset?.ge!=null&&e.key==='Enter'){e.preventDefault();t.blur();return}
  if(t.tagName==='TR'&&t.dataset.a&&(e.key==='Enter'||e.key===' ')){e.preventDefault();t.click();return}
  if(t.closest?.('#view-brew,#teaForm')&&e.key==='Enter'&&t.tagName==='INPUT'){e.preventDefault();t.blur()}
});
document.addEventListener('focusout',e=>{if(e.target.dataset?.combo)setTimeout(()=>{const box=$('#'+e.target.id+'-list');if(box&&!box.contains(document.activeElement))box.hidden=true},180)});
document.addEventListener('submit',e=>e.preventDefault());
document.addEventListener('mousedown',e=>{if(e.target.closest('.sugg-list'))e.preventDefault()});
