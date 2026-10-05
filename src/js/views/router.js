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
