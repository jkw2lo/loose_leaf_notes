/* ═════════ Stock: how much is left ═════════ */
function stockOf(t){
  const s=t?.stock;if(!s||!(s.g>0))return null;
  const since=s.since||t.createdAt||'1970';const used=brewsOf(t.id).filter(b=>b.at>=since).reduce((a,b)=>a+(+b.g||0),0);
  const left=Math.max(0,r1(s.g-used));const per=avg(brewsOf(t.id).map(b=>+b.g||0).filter(Boolean))||recFor(t,defaultStyle(t)).gT;
  return {total:s.g,used:r1(used),left,sessionsLeft:per?Math.floor(left/per):null,price:s.price||null,cur:s.cur||'',perG:s.price?s.price/s.g:null};
}
const money = (n,cur)=>n==null?'':(cur||'')+(n<1?n.toFixed(2):n<10?n.toFixed(2):Math.round(n));
function stockHTML(t,compact){const k=stockOf(t);if(!k)return '';const pct=clamp(k.left/k.total*100,0,100);
  return `<span class="stock${k.left<=0?' out':pct<20?' low':''}" title="${k.used} g of ${k.total} g used"><span class="stock-bar"><i style="width:${pct}%"></i></span>${k.left<=0?'Used up':`${k.left} g left`}${!compact&&k.sessionsLeft!=null&&k.left>0?` · about ${k.sessionsLeft} session${k.sessionsLeft===1?'':'s'}`:''}</span>`}
function parsePrice(str){str=String(str||'').trim();if(!str)return null;const n=parseFloat(str.replace(/[^\d.]/g,''));if(isNaN(n))return null;return {price:n,cur:str.replace(/[\d.,\s]/g,'').slice(0,3)}}

/* ═════════ Library: every tea, in rotation first, then finished ═════════ */
const REBUY = {yes:'Would buy again',maybe:'Maybe again',no:'Wouldn’t rebuy'};
function teaSummary(t){
  const bs=brewsOf(t.id).sort((a,b)=>dt(a.at)-dt(b.at));const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating||dt(b.at)-dt(a.at))[0];
  const tc={};bs.forEach(b=>sessionTags(b).forEach(x=>tc[x]=(tc[x]||0)+1));const tags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
  return {bs,best,avg:rated.length?avg(rated.map(b=>b.rating)):null,first:bs[0]?.at,last:bs[bs.length-1]?.at,grams:r1(bs.reduce((a,b)=>a+(+b.g||0),0)),tags,score:t.verdict?.score||(best?Math.round(avg(rated.map(b=>b.rating))):null)};
}
const monthYear = iso=>iso?dt(iso).toLocaleDateString(undefined,{month:'short',year:'numeric'}):'';
/* the narrow metrics column beside Library and Journal */
const rail = items=>`<aside class="rail" aria-label="Metrics">${items.filter(Boolean).map(([v,l])=>`<div class="rail-stat"><b>${v}</b><span>${l}</span></div>`).join('')}</aside>`;
function spentStr(teas){const by={};teas.forEach(t=>{const k=stockOf(t);if(k?.price)by[k.cur]=(by[k.cur]||0)+k.price});const e=Object.entries(by);return e.length?e.map(([c,n])=>money(n,c)).join(' + '):null}
function renderLibrary(){
  const el=$('#view-library');if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const all=allTeas();const q=norm(state.libQ);
  const focused=document.activeElement?.id==='libQ';const caret=focused?document.activeElement.selectionStart:0;
  const list=all.map(t=>({t,s:teaSummary(t)})).filter(({t})=>(!q||norm([t.name,t.brand,t.origin,t.harvest,typeOf(t)?.name,famOf(t.fam).name,t.verdict?.note].join(' ')).includes(q))&&(!state.libFam||t.fam===state.libFam)&&(!state.libRebuy||t.verdict?.rebuy===state.libRebuy));
  const when=x=>x.t.finished?+dt(x.t.finished):lastBrewAt(x.t);
  const sorts={recent:(a,b)=>when(b)-when(a),rating:(a,b)=>(b.s.score||0)-(a.s.score||0),sessions:(a,b)=>b.s.bs.length-a.s.bs.length,name:(a,b)=>a.t.name.localeCompare(b.t.name)};
  list.sort(sorts[state.libSort]||sorts.recent);
  const rot=list.filter(x=>!x.t.finished),fin=list.filter(x=>x.t.finished);
  const counts={};all.forEach(t=>counts[t.fam]=(counts[t.fam]||0)+1);
  const nFin=all.filter(t=>t.finished).length,grams=store.brews.reduce((a,b)=>a+(+b.g||0),0),rebuyN=all.filter(t=>t.verdict?.rebuy==='yes').length,spent=spentStr(all);
  const rated=all.map(t=>teaSummary(t).score).filter(Boolean);
  const sec=(title,items,note)=>items.length?`<section class="lib-sec"><div class="lib-sec-head"><h2>${title}</h2><span class="count">${items.length}</span>${note?`<span class="muted">${note}</span>`:''}</div><div class="libgrid">${items.map(libCard).join('')}</div></section>`:'';
  el.innerHTML=`<div class="page-head"><div><h1>Library</h1><p>Every tea you have kept notes on: the ones in rotation, then the ones you have finished.</p></div></div>
  ${!all.length?`<div class="empty"><h2>Your library is empty</h2><p>Teas you add appear here, and stay with their sessions and verdict after you finish them.</p><button class="btn primary" data-a="newTea">＋ Add a tea</button></div>`:`
  ${famChips(counts,id=>state.libFam===id,'libFam',!state.libFam)}
  <div class="with-rail"><div class="rail-main">
   <div class="tool-row lib-tools"><label class="search">${searchIcon}<input id="libQ" type="search" placeholder="Search name, brand, origin, verdict" value="${esc(state.libQ)}" aria-label="Search library"></label>
    <select class="pill" id="libRebuy" aria-label="Would buy again"><option value="">Any verdict</option>${Object.entries(REBUY).map(([k,v])=>`<option value="${k}" ${state.libRebuy===k?'selected':''}>${v}</option>`).join('')}</select>
    <select class="pill" id="libSort" aria-label="Sort"><option value="recent">Most recent</option><option value="rating" ${state.libSort==='rating'?'selected':''}>Highest rated</option><option value="sessions" ${state.libSort==='sessions'?'selected':''}>Most brewed</option><option value="name" ${state.libSort==='name'?'selected':''}>Name A–Z</option></select></div>
   ${list.length?sec('In rotation',rot)+sec('Finished',fin):`<div class="empty"><h2>Nothing matches</h2><button class="btn" data-a="libClear">Clear filters</button></div>`}
  </div>
  ${rail([[all.length,'teas in all'],[all.length-nFin,'in rotation'],[nFin,'finished'],[store.brews.length,'sessions'],[Math.round(grams)+'<small> g</small>','leaf brewed'],spent&&[spent,'spent on tea'],rated.length&&[avg(rated).toFixed(1),'average rating'],nFin&&[rebuyN,'you’d buy again']])}
  </div>`}`;
  if(focused){const i=$('#libQ');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function libCard({t,s}){
  const T=typeOf(t);const cols=(s.best?.steeps||[]).map(x=>x.liq).filter(Boolean);const band=cols.length?cols:liqsOf(t);const k=stockOf(t);
  return `<button class="libcard" data-a="openTea" data-v="${esc(t.id)}">
   <span class="lib-body">
    <span class="lib-top" style="--wash:${washOf(band)}"><span class="cup" style="--liq:${liqHex(teaLiq(t))}"></span><span class="lib-title"><span class="tc-name">${esc(t.name)}</span><span class="meta">${[T&&norm(T.name)!==norm(t.name)?T.name:null,t.brand].filter(Boolean).map(esc).join(' · ')||esc(famOf(t.fam).name)}</span></span>${s.score?`<span class="score">${s.score}<small>/10</small></span>`:''}</span>
    <span class="lib-meta">${[t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}</span>
    <span class="lib-dates mono">${t.finished?`${s.first?monthYear(s.first)+' – ':''}${monthYear(t.finished)}`:`In rotation${s.first?' since '+monthYear(s.first):''}`}</span>${t.finished?'':stockHTML(t,true)}
    <span class="lib-stats"><span><b>${s.bs.length}</b> sessions</span><span><b>${s.grams}</b> g</span>${s.avg?`<span>avg <b>${s.avg.toFixed(1)}</b></span>`:''}${k?.perG?`<span><b>${money(k.perG*(s.bs.length?s.grams/s.bs.length:0),k.cur)}</b>/session</span>`:''}</span>
    ${s.best?`<span class="recipe mono">Best: ${esc(paramLine(s.best))}</span>`:''}
    ${s.tags.length?`<span class="tags">${s.tags.map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</span>`:''}
    ${t.verdict?.note?`<span class="lib-quote">“${esc(t.verdict.note)}”</span>`:''}
    ${t.verdict?.rebuy?`<span class="rebuy ${t.verdict.rebuy}">${REBUY[t.verdict.rebuy]}</span>`:''}
   </span></button>`;
}

/* finishing a tea */
let FIN=null;
function openFinish(id){const t=teaById(id);if(!t)return;const s=teaSummary(t);
  FIN={id,score:t.verdict?.score||(s.avg?Math.round(s.avg):0),rebuy:t.verdict?.rebuy||'',note:t.verdict?.note||'',editing:!!t.finished};
  openSheet('finish',finishHTML(t,s))}
function finishHTML(t,s){
  return `<div class="sheet-head"><div><h2 id="sheetTitle">${FIN.editing?'Edit verdict':'Finish'} ${esc(t.name)}</h2><span class="sh-sub">${FIN.editing?'In your library':'Moves it from your shelf to your library'}</span></div><button class="x" data-a="close" aria-label="Close">×</button></div>
  <div class="sheet-body sform">
   <section class="scard"><div class="fin-sum"><span class="cup lg" style="--liq:${liqHex(teaLiq(t))}"></span><div><div class="tc-name">${esc(t.name)}</div><div class="sub">${s.bs.length} session${s.bs.length===1?'':'s'}${s.first?' since '+monthYear(s.first):''}${s.avg?' · average '+s.avg.toFixed(1):''}${s.grams?' · '+s.grams+' g brewed':''}</div>${s.best?`<div class="recipe mono" style="font-size:12.5px;color:var(--ink-2)">Best session: ${esc(paramLine(s.best))}</div>`:''}</div></div></section>
   <section class="scard"><div class="scard-head"><h3>Overall score</h3><span class="aside">${s.avg?'suggested from your sessions':''}</span></div><div class="rating" id="fin-score">${finScoreHTML()}</div>
    <div class="field"><span class="lbl">Would you buy it again?</span><div class="seg" id="fin-rebuy">${finRebuyHTML()}</div></div>
    <div class="field"><label class="lbl" for="fin-note">Parting note</label><textarea class="textarea" id="fin-note" rows="3" placeholder="What you’ll remember about it, how it changed, who it would suit…">${esc(FIN.note)}</textarea></div></section>
  </div>
  <div class="sheet-foot"><button class="btn ghost" data-a="close">Cancel</button><button class="btn primary" data-a="saveFinish">${FIN.editing?'Save verdict':'Move to library'}</button></div>`}
const finScoreHTML = ()=>Array.from({length:10},(_,i)=>`<button type="button" data-a="finScore" data-v="${i+1}" class="${FIN.score===i+1?'sel':FIN.score>i+1?'on':''}" aria-pressed="${FIN.score===i+1}">${i+1}</button>`).join('');
const finRebuyHTML = ()=>Object.entries(REBUY).map(([k,v])=>`<button type="button" data-a="finRebuy" data-v="${k}" aria-pressed="${FIN.rebuy===k}">${v}</button>`).join('');
async function saveFinish(){const t=teaById(FIN.id);const nt={...(store.teas.find(x=>x.id===FIN.id)||t)};
  nt.verdict={score:FIN.score||null,rebuy:FIN.rebuy||'',note:$('#fin-note').value.trim()};if(!nt.finished)nt.finished=new Date().toISOString();
  const wasEdit=FIN.editing;try{await store.saveTea(nt);closeSheet();toast(wasEdit?'Verdict saved':'Moved to your library');if(state.view==='tea')renderTea()}catch{toast('Could not save. Try again.')}}
