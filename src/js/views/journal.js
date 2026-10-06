/* ═════════ Journal (by date) ═════════ */
function renderJournal(){
  const el=$('#view-journal');if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const all=store.brews;const q=norm(state.jq);
  const focused=document.activeElement?.id==='jq';const caret=focused?document.activeElement.selectionStart:0;
  const list=all.filter(b=>{const t=teaById(b.teaId);return(!q||norm([t?.name,t?.brand,t?.origin,b.notes,sessionTags(b).join(' '),famOf(t?.fam).name].join(' ')).includes(q))&&(!state.jcats.size||state.jcats.has(t?.fam))&&(!state.jmin||(b.rating||0)>=state.jmin)}).sort((a,b)=>dt(b.at)-dt(a.at));
  const counts={};all.forEach(b=>{const c=teaById(b.teaId)?.fam;counts[c]=(counts[c]||0)+1});
  const groups=[];list.forEach(b=>{const k=dt(b.at).toLocaleDateString(undefined,{month:'long',year:'numeric'});if(!groups.length||groups[groups.length-1].k!==k)groups.push({k,items:[]});groups[groups.length-1].items.push(b)});
  const now=new Date(),mk=d=>d.getFullYear()*12+d.getMonth();const thisMonth=all.filter(b=>mk(dt(b.at))===mk(now)).length;
  const rated=all.filter(b=>b.rating);const top=Object.entries(all.reduce((m,b)=>(m[b.teaId]=(m[b.teaId]||0)+1,m),{})).sort((a,b)=>b[1]-a[1])[0];
  el.innerHTML=`<div class="page-head"><div><h1>Journal</h1><p>Every session in the order you brewed it.</p></div></div>
   ${all.length?famChips(counts,id=>state.jcats.has(id),'jcat',!state.jcats.size):''}
   ${!all.length?`<div class="empty"><h2>No sessions yet</h2><p>Sessions you log under your teas appear here by date.</p><button class="btn primary" data-a="newSession">＋ Log a session</button></div>`:`
   <div class="with-rail"><div class="rail-main">
    <div class="tool-row lib-tools"><label class="search">${searchIcon}<input id="jq" type="search" placeholder="Search tea, brand, flavours, notes" value="${esc(state.jq)}" aria-label="Search sessions"></label>
     <select class="pill" id="jmin" aria-label="Minimum rating"><option value="0">Any rating</option>${[9,8,7,6,5].map(n=>`<option value="${n}" ${state.jmin==n?'selected':''}>${n}+ only</option>`).join('')}</select></div>
    ${!list.length?`<div class="empty"><h2>No sessions match</h2><button class="btn" data-a="jClear">Clear filters</button></div>`:`
    <div class="tbl-wrap jtbl-wrap"><table class="tbl jtbl"><thead><tr><th scope="col">Name</th><th scope="col">Tea type</th><th scope="col">Date</th><th scope="col">Brew info</th><th scope="col" class="num">Rating</th></tr></thead>
     <tbody>${groups.map(g=>`<tr class="jmonth"><th colspan="5" scope="rowgroup">${g.k}<span>${g.items.length} session${g.items.length>1?'s':''}</span></th></tr>${g.items.map(journalRow).join('')}`).join('')}</tbody></table></div>`}
   </div>
   ${rail([[thisMonth,'this month'],[streak(all),'day streak'],[all.length,'sessions in all'],rated.length&&[avg(rated.map(b=>b.rating)).toFixed(1),'average rating'],top&&[`<span class="rail-name">${esc(teaById(top[0])?.name||'—')}</span>`,`most brewed · ${top[1]}`],[steepTotal(all),'spent steeping']])}
   </div>`}`;
  if(focused){const i=$('#jq');i.focus();try{i.setSelectionRange(caret,caret)}catch{}}
}
function steepTotal(all){const m=all.reduce((a,b)=>a+totalSteep(b),0)/60;return m<60?Math.round(m)+'<small> min</small>':r1(m/60)+'<small> h</small>'}
/* consecutive days with a session, ending today or yesterday */
function streak(all){const days=new Set(all.map(b=>{const d=dt(b.at);d.setHours(0,0,0,0);return +d}));const d=new Date();d.setHours(0,0,0,0);
  if(!days.has(+d))d.setDate(d.getDate()-1);let n=0;while(days.has(+d)){n++;d.setDate(d.getDate()-1)}return n}
function journalRow(b){const t=teaById(b.teaId);const T=typeOf(t);
  return `<tr class="click" data-a="openTea" data-v="${esc(b.teaId)}" tabindex="0" role="link" aria-label="${esc(teaName(b))}, ${fmtDate(b.at)}">
   <td><span class="jname"><span class="cup sm" style="--liq:${liqHex(b.liq||b.steeps[0]?.liq||teaLiq(t))}"></span><span><b>${esc(teaName(b))}</b>${t?.brand?`<small>${esc(t.brand)}</small>`:''}${b.example?'<span class="tg ex">Example</span>':''}</span></span></td>
   <td>${esc(T?.name||famOf(t?.fam).name)}${T?`<small>${esc(famOf(t.fam).name)}</small>`:''}</td>
   <td class="mono">${fmtDate(b.at)}</td>
   <td><span class="mono jinfo">${esc(paramLine(b))}</span>${spark(b.steeps)}</td>
   <td class="num">${b.rating?`<b>${b.rating}</b><small>/10</small>`:'<span class="muted">—</span>'}</td></tr>`}
