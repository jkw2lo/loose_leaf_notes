/* ═════════ Journal (by date) ═════════ */
function renderJournal(){
  const el=$('#view-journal');if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const all=store.brews;const q=norm(state.jq);
  const focused=document.activeElement?.id==='jq';const caret=focused?document.activeElement.selectionStart:0;
  const list=all.filter(b=>{const t=teaById(b.teaId);return(!q||norm([t?.name,t?.brand,t?.origin,b.notes,sessionTags(b).join(' '),famOf(t?.fam).name].join(' ')).includes(q))&&(!state.jcats.size||state.jcats.has(t?.fam))&&(!state.jmin||(b.rating||0)>=state.jmin)}).sort((a,b)=>dt(b.at)-dt(a.at));
  const counts={};all.forEach(b=>{const c=teaById(b.teaId)?.fam;counts[c]=(counts[c]||0)+1});
  const groups=[];list.forEach(b=>{const k=dt(b.at).toLocaleDateString(undefined,{month:'long',year:'numeric'});if(!groups.length||groups[groups.length-1].k!==k)groups.push({k,items:[]});groups[groups.length-1].items.push(b)});
  el.innerHTML=`<div class="page-head"><div><h1>Journal</h1><p>Every session in the order you brewed it.</p></div></div>
   ${all.length?`<div class="tool-row" style="margin-bottom:12px"><label class="search">${searchIcon}<input id="jq" type="search" placeholder="Search tea, brand, flavours, notes" value="${esc(state.jq)}" aria-label="Search sessions"></label>
    <select class="pill" id="jmin" aria-label="Minimum rating"><option value="0">Any rating</option>${[9,8,7,6,5].map(n=>`<option value="${n}" ${state.jmin==n?'selected':''}>${n}+ only</option>`).join('')}</select></div>
    <div class="chips" style="margin-bottom:8px">${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="jcat" data-v="${c.id}" aria-pressed="${state.jcats.has(c.id)}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div>`:''}
   ${!all.length?`<div class="empty"><h2>No sessions yet</h2><p>Sessions you log under your teas appear here by date.</p><button class="btn primary" data-a="newSession">＋ Log a session</button></div>`:!list.length?`<div class="empty"><h2>No sessions match</h2><button class="btn" data-a="jClear">Clear filters</button></div>`:
    groups.map(g=>`<div class="month"><h2>${g.k}</h2><span>${g.items.length} session${g.items.length>1?'s':''}</span></div><div class="list">${g.items.map(journalCard).join('')}</div>`).join('')}`;
  if(focused){const i=$('#jq');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function journalCard(b){const t=teaById(b.teaId);
  return `<button class="brew" data-a="openSession" data-v="${esc(b.id)}"><span class="cup" style="--liq:${liqHex(b.liq||b.steeps[0]?.liq||teaLiq(t))}"></span>
   <span class="brew-main"><span class="brew-name">${esc(teaName(b))}</span><span class="brew-meta">${[famOf(t?.fam).name,t?.brand].filter(Boolean).map(esc).join(' · ')}</span><span class="brew-params mono">${esc(paramLine(b))}</span>${sessionTags(b).length||b.example?`<span class="tags">${b.example?'<span class="tg ex">Example</span>':''}${sessionTags(b).slice(0,4).map(x=>`<span class="tg">${esc(x)}</span>`).join('')}</span>`:''}</span>
   <span class="brew-side">${b.rating?`<span class="score">${b.rating}<small>/10</small></span>`:'<span class="score none">Unrated</span>'}${spark(b.steeps)}<span class="date">${fmtDate(b.at)}</span></span></button>`}
