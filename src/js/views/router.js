/* ═════════ View switching ═════════ */
function setView(v,opts={}){
  if(state.view==='brew'&&v!=='brew'){tReset();S=null;$('#view-brew').innerHTML=''}
  state.view=v;document.body.dataset.view=v;if(v==='tea'){state.teaId=opts.teaId;state.teaStyle=null;state.teaSrc='typical'}if(v==='guide'&&opts.gSel){state.gSel=opts.gSel;state.gStyle=opts.gStyle||null;state.gq=''}
  const tid=v==='brew'?S?.teaId:state.teaId;const tab=v==='tea'||v==='brew'?(teaById(tid)?.finished?'library':'shelf'):v;$$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===tab));$('#gearBtn')?.setAttribute('aria-pressed',v==='settings');
  $$('.view').forEach(s=>s.hidden=s.id!=='view-'+v);renderView();window.scrollTo(0,0);
}
function renderView(){({library:renderLibrary,shelf:renderShelf,tea:renderTea,journal:renderJournal,insights:renderInsights,guide:renderGuide,settings:renderSettings,brew:renderBrew})[state.view]()}
function renderAll(){
  if(state.view==='brew'){if(S)rCompare();else renderView()}else{
  const ae=document.activeElement;if(ae?.closest?.('#view-settings,#view-guide')&&['INPUT','SELECT'].includes(ae.tagName)&&ae.id!=='gq'){/* keep focus while typing */}else renderView();}
  const k=$('#scrim').dataset.kind;if(!$('#scrim').hidden&&k==='session'&&openId){const b=store.brews.find(x=>x.id===openId);b?$('#sheet').innerHTML=sessionDetailHTML(b):closeSheet()}}
