/* ═════════ View switching ═════════ */
function setView(v,opts={}){
  // Home is the shelf unless Settings → Home page picks Brew today
  if(v==='home'&&!homeOn()&&!opts.force)v='shelf';
  if(state.view==='brew'&&v!=='brew'){tReset();S=null;$('#view-brew').innerHTML=''}
  if(v==='home'&&S?.home&&!brewDirty())hbClear(); // after a brew is logged, start fresh
  hbEnd();
  state.view=v;document.body.dataset.view=v;if(v==='tea'){state.teaId=opts.teaId;state.teaStyle=null;state.teaSrc='typical'}if(v==='guide'&&opts.gSel){state.gSel=opts.gSel;state.gStyle=opts.gStyle||null;state.gq=''}
  const tid=v==='brew'?S?.teaId:state.teaId;const tab=v==='tea'||v==='brew'?(teaById(tid)?.finished?'library':'shelf'):v;$$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===tab));$('#gearBtn')?.setAttribute('aria-pressed',v==='settings');
  $$('.view').forEach(s=>s.hidden=s.id!=='view-'+v);renderView();window.scrollTo(0,0);
}
function renderView(){({library:renderLibrary,shelf:renderShelf,tea:renderTea,journal:renderJournal,insights:renderInsights,guide:renderGuide,settings:renderSettings,brew:renderBrew,home:renderHome})[state.view]()}
function renderAll(){
  if(state.view==='brew'){if(S)rCompare();else renderView()}else if(state.view==='home'&&S?.home){/* keep the brew in progress */}else{
  const ae=document.activeElement;if(ae?.closest?.('#view-settings,#view-guide')&&['INPUT','SELECT'].includes(ae.tagName)&&ae.id!=='gq'){/* keep focus while typing */}else renderView();}
  const k=$('#scrim').dataset.kind;if(!$('#scrim').hidden&&k==='session'&&openId){const b=store.brews.find(x=>x.id===openId);b?$('#sheet').innerHTML=sessionDetailHTML(b):closeSheet()}
  maybeSetup()}
