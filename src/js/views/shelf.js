/* ═════════ Shelf (by tea) ═════════ */
function renderShelf(){
  const el=$('#view-shelf');
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const allT=allTeas();const fin=allT.filter(t=>t.finished);const teas=allT.filter(t=>!t.finished);const q=norm(state.q);
  const shown=teas.filter(t=>!q||norm([t.name,t.brand,t.origin,t.harvest,t.cultivar,t.lib,famOf(t.fam).name].join(' ')).includes(q)).filter(t=>!state.shelfFam||t.fam===state.shelfFam);
  const exN=teas.some(t=>t.example)||store.brews.some(b=>b.example);
  const counts={};teas.forEach(t=>counts[t.fam]=(counts[t.fam]||0)+1);
  const focused=document.activeElement?.id==='shelfQ';const caret=focused?document.activeElement.selectionStart:0;
  let body='';
  if(!allT.length)body=`<div class="empty"><h2>Your tea shelf is empty</h2><p>Add a tea you own, like a Kagoshima sencha or a 2019 Yiwu cake. Each tea keeps its brewing guide and every session you log with it.</p><button class="btn primary" data-a="newTea">＋ Add a tea</button></div>`;
  else if(!shown.length)body=`<div class="empty"><h2>${!teas.length?'Every tea is in your library':'No teas match'}</h2><p>Try another search or family.</p><button class="btn" data-a="shelfClear">Clear</button></div>`;
  else body=FAMS.filter(c=>shown.some(t=>t.fam===c.id)).map(c=>{
    const ts=shown.filter(t=>t.fam===c.id).sort((a,b)=>{const la=brewsOf(a.id).reduce((m,x)=>Math.max(m,+dt(x.at)),0),lb=brewsOf(b.id).reduce((m,x)=>Math.max(m,+dt(x.at)),0);return lb-la||a.name.localeCompare(b.name)});
    return `<section class="cat-sec"><div class="cat-sec-head"><span class="ldot" style="--liq:${liqHex(midLiq(c.liqs))}"></span><h2>${c.name}</h2><span class="native">${c.native}</span><span class="count">${ts.length}</span></div>
    <div class="shelf">${ts.map(teaCard).join('')}</div></section>`}).join('');if(shown.length)body=`<div class="shelf-cols">${body}</div>`;
  el.innerHTML=`
   <div class="page-head"><div><h1>Tea shelf</h1><p>${teas.length?`${teas.length} tea${teas.length>1?'s':''} on hand · ${store.brews.length} session${store.brews.length===1?'':'s'} logged`:'Your teas, grouped by family.'}${fin.length?` · <button class="linkbtn" data-a="view" data-v="library">${fin.length} finished in your library</button>`:''}</p></div>
    <div class="tool-row"><button class="btn" data-a="newTea">＋ Add a tea</button></div></div>
   ${exN?`<div class="notice"><span>Teas marked Example show how a shelf fills in. Your own teas appear alongside them.</span><button class="btn sm" data-a="clearEx">Remove examples</button></div>`:''}
   ${store.mode==='local'?'<div class="notice"><span>Notes are being saved in this browser only.</span></div>':''}
   ${allT.length?`<div class="tool-row cat-jump"><label class="search">${searchIcon}<input id="shelfQ" type="search" placeholder="Find a tea, brand, origin or harvest" value="${esc(state.q)}" aria-label="Search teas"></label>
    <div class="chips">${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="shelfFam" data-v="${c.id}" aria-pressed="${state.shelfFam===c.id}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div></div>`:''}
   ${body}`;
  if(focused){const i=$('#shelfQ');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function teaCard(t){
  const bs=brewsOf(t.id).sort((a,b)=>dt(b.at)-dt(a.at));const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating)[0];
  const T=typeOf(t);const sub=[T&&norm(T.name)!==norm(t.name)?T.name:null,t.brand].filter(Boolean).map(esc).join(' · ');
  return `<article class="tea-card" style="--wash:${washOf(liqsOf(t))}">
   <button class="tc-top" data-a="openTea" data-v="${esc(t.id)}">
    <span class="cup" style="--liq:${liqHex(teaLiq(t))}"></span>
    <span class="tc-title"><span class="tc-name">${esc(t.name)}</span><span class="meta">${sub||esc(t.origin||famOf(t.fam).name)}</span>${t.example?'<span class="tg ex">Example</span>':''}</span>
    ${best?`<span class="tc-score" title="Best session">${best.rating}</span>`:''}
   </button>
   <div class="tc-foot"><span class="tc-stats">${bs.length?`${bs.length} session${bs.length===1?'':'s'} · ${fmtDate(bs[0].at)}`:esc(T?.x.char||'No sessions yet')}</span>${stockHTML(t,true)}
   <button class="btn sm tc-add" data-a="logFor" data-v="${esc(t.id)}" aria-label="Log a session with ${esc(t.name)}">＋ Session</button></div>
  </article>`;
}
const washOf = liqs=>`linear-gradient(100deg,${liqs.map(liqHex).join(',')})`;
function paramLine(b){return [b.g?`${b.g} g`:null,b.ml?`${b.ml} ml`:null,fmtT(b.temp,b.style),`${STYLE[b.style]||''}${(b.steeps||[]).length>1?' ×'+b.steeps.length:''}`].filter(Boolean).join(' · ')}
