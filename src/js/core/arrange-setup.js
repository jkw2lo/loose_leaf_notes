/* ═════════ Arrange mode: this app's settings for the layout editor (src/js/ui/arrange.js) ═════════
   The layout saves with your other settings, so it syncs. Press E (or Settings → Layout) to arrange. */
const SCREEN_NAMES = {shelf:'Home Page',library:'Library',journal:'Journal',tea:'Tea Info',brew:'Tea Log Page',insights:'Insights',guide:'Guides',settings:'Settings'};
let arrBack=null;
const arrTea = ()=>state.shelfSel||allTeas().find(t=>!t.finished)?.id||allTeas()[0]?.id;
Arrange.init({
  name:'Loose Leaf Notes',
  load:()=>store.settings.layout||{},
  save:layout=>store.setSettings({layout}),
  shortcut:'e',
  current:()=>SCREEN_NAMES[state.view]||state.view,
  canExport:()=>state.view==='brew'&&brewDirty()?'Save or leave this brew before exporting every page.':'',
  before:()=>{closeSheet();arrBack={view:state.view,teaId:state.view==='brew'?S?.teaId:state.teaId}},
  restore:()=>{const b=arrBack||{view:'shelf'};b.view==='brew'&&b.teaId?openSessionForm({teaId:b.teaId}):setView(b.view,{teaId:b.teaId})},
  screens:[
   {name:'Home Page',show:()=>setView('shelf')},
   {name:'Library',show:()=>setView('library')},
   {name:'Journal',show:()=>setView('journal')},
   {name:'Tea Info',show:()=>arrTea()?setView('tea',{teaId:arrTea()}):setView('shelf')},
   {name:'Tea Log Page',show:()=>arrTea()?openSessionForm({teaId:arrTea()}):setView('shelf')},
   {name:'Insights',show:()=>setView('insights')},
   {name:'Guides',show:()=>setView('guide')},
   {name:'Settings',show:()=>setView('settings')}]
});
