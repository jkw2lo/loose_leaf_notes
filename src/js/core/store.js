/* ═════════ State & storage ═════════ */
const state = {libQ:'',libFam:'',libRebuy:'',libSort:'recent',shelfSel:null,shelfPage:null,shelfTab:'stats',shelfStyle:null,gq:'',gSel:null,gStyle:null,view:'shelf',teaId:null,teaStyle:null,teaSrc:'typical',jq:'',jcats:new Set(),jmin:0,shelfFam:'',xAxis:'temp'};
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
