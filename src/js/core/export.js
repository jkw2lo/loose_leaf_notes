/* ═════════ Export ═════════ */
async function exportData(kind){let data,filename;
  if(kind==='json'){data=JSON.stringify({teas:allTeas(),sessions:store.brews,settings:store.settings},null,2);filename='loose-leaf-notes.json'}
  else{const q=x=>{x=String(x??'');return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};const cols=['date','tea','type','family','brand','origin','harvest','method','vessel','g','ml','temp_c','infusions','steep_times_s','rating','tags','notes'];
    data=[cols.join(',')].concat(store.brews.map(b=>{const t=teaById(b.teaId)||{};return[b.at,t.name,typeOf(t)?.name||'',famOf(t.fam).name,t.brand,t.origin,t.harvest,STYLE[b.style],vesselOf(b).name,b.g,b.ml,b.temp,b.steeps.length,b.steeps.map(s=>s.s).join(' '),b.rating||'',sessionTags(b).join('; '),b.notes].map(q).join(',')})).join('\n');filename='loose-leaf-sessions.csv'}
  await saveFile(filename,data)}

/* Outside a Claude artifact (for example on GitHub Pages) there is no downloads capability,
   so files are saved with an ordinary browser download instead. */
const STANDALONE = !window.claude;
const canExport = ()=>!!store.downloads||STANDALONE;
async function saveFile(filename,data){
  if(store.downloads){try{await store.downloads.save({filename,data})}catch(e){if(e?.code!=='declined')toast('That export is not available here.')}return}
  const url=URL.createObjectURL(new Blob([data],{type:filename.endsWith('.csv')?'text/csv':'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/* Restore a JSON backup made with "Export everything". Teas and sessions are added or
   replaced by id; nothing already in the journal is deleted. */
async function importBackup(file){
  let d;try{d=JSON.parse(await file.text())}catch{toast('That file is not a Loose Leaf Notes backup.');return}
  const teas=Array.isArray(d?.teas)?d.teas:[],sessions=Array.isArray(d?.sessions)?d.sessions:[];
  if(!teas.length&&!sessions.length){toast('That backup has no teas or sessions in it.');return}
  try{
    for(const t of teas)if(t?.id&&t.name)await store.saveTea(t);
    for(const b of sessions)if(b?.id&&b.teaId)await store.saveBrew(b);
    if(d.settings&&typeof d.settings==='object')store.setSettings({...DEFAULT_SETTINGS,...d.settings});
    toast(`Restored ${teas.length} tea${teas.length===1?'':'s'} and ${sessions.length} session${sessions.length===1?'':'s'}`);renderView();
  }catch{toast('Could not finish restoring. Some items may not have been saved.')}
}
