/* ═════════ Insights ═════════ */
function renderInsights(){
  const el=$('#view-insights');const all=store.brews;
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  if(all.length<2){el.innerHTML=`<div class="empty"><h2>Insights appear after a few sessions</h2><p>Log two or more sessions to see how temperature, leaf ratio and tea family line up with your ratings.</p><button class="btn primary" data-a="newSession">＋ Log a session</button></div>`;return}
  const rated=all.filter(b=>b.rating);const leaf=all.reduce((a,b)=>a+(+b.g||0),0);const teas=allTeas();
  const byCat=FAMS.map(c=>{const bs=all.filter(b=>teaById(b.teaId)?.fam===c.id);return{c,n:bs.length,avg:avg(bs.filter(b=>b.rating).map(b=>b.rating))}}).filter(x=>x.n).sort((a,b)=>b.n-a.n);const maxN=Math.max(...byCat.map(x=>x.n));
  const dialed=teas.map(t=>{const bs=brewsOf(t.id);const r=bs.filter(b=>b.rating);const best=r.slice().sort((a,b)=>b.rating-a.rating||dt(b.at)-dt(a.at))[0];return{t,bs,best,avg:avg(r.map(b=>b.rating))}}).filter(x=>x.best).sort((a,b)=>b.best.rating-a.best.rating||b.bs.length-a.bs.length).slice(0,10);
  const withAxes=rated.filter(hasAxes),fav=withAxes.filter(b=>b.rating>=8),rest=withAxes.filter(b=>b.rating<8);
  const mean=bs=>Object.fromEntries(AXES.map(([k])=>[k,avg(bs.map(b=>b.axes[k]||0))]));
  el.innerHTML=`<div class="page-head"><div><h1>Insights</h1><p>What your best cups have in common.</p></div></div>
   <div class="ins-grid" data-arr="insights-grid" data-arr-auto>
    <div class="stats"><div class="stat"><b>${all.length}</b><span>sessions</span></div><div class="stat"><b>${teas.length}</b><span>teas on the shelf</span></div><div class="stat"><b>${rated.length?avg(rated.map(b=>b.rating)).toFixed(1):'—'}</b><span>average rating</span></div><div class="stat"><b>${Math.round(leaf)}<span style="font-size:16px"> g</span></b><span>leaf brewed</span></div></div>
    <div class="panel"><h2>By family</h2><p class="sub">Bar shows sessions; the number is the average rating.</p><div class="cat-rows">${byCat.map(x=>`<button class="cat-row" data-a="shelfFam" data-v="${x.c.id}" style="--c:${liqHex(midLiq(x.c.liqs))}"><span class="nm"><span class="dot"></span>${x.c.name}</span><span class="cat-bar"><i style="width:${x.n/maxN*100}%"></i><em>${x.n}</em></span><span class="avg">${x.avg?x.avg.toFixed(1):'—'}</span></button>`).join('')}</div></div>
    <div class="panel"><h2>Palate of your favourites</h2><p class="sub">Average palate of sessions rated 8+ against the rest.</p>
     ${withAxes.length?`<div style="max-width:280px;margin:0 auto;width:100%">${radarSVG([...(rest.length?[{v:mean(rest),cls:'area2'}]:[]),...(fav.length?[{v:mean(fav)}]:[])],{size:240})}</div><div class="legend"><span class="li" style="--c:var(--accent)"><i></i>Rated 8+ (${fav.length})</span><span class="li" style="--c:var(--clay)"><i></i>Below 8 (${rest.length})</span></div>`:'<p class="sub">Score the palate sliders when you log a session.</p>'}</div>
    <div class="panel wide"><div class="panel-head"><h2>What moves your rating</h2><div class="seg sm">${[['temp','Water temp'],['ratio','Leaf per 100 ml'],['steeps','Infusions'],['total','Total steep time']].map(([k,v])=>`<button data-a="xAxis" data-v="${k}" aria-pressed="${state.xAxis===k}">${v}</button>`).join('')}</div></div><p class="sub">Each dot is a session, coloured by its liquor.</p>${scatter(rated)}</div>
    <div class="panel wide"><h2>Dialled-in recipes</h2><p class="sub">Your best-rated session for each tea.</p>
     <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tea</th><th class="num">Sessions</th><th class="num">Avg</th><th class="num">Best</th><th>Best recipe</th><th></th></tr></thead><tbody>
     ${dialed.map(x=>`<tr class="click" data-a="openTea" data-v="${esc(x.t.id)}"><td><b>${esc(x.t.name)}</b><div class="muted" style="font-size:12px">${esc(x.t.brand||famOf(x.t.fam).name)}</div></td><td class="num">${x.bs.length}</td><td class="num">${x.avg.toFixed(1)}</td><td class="num" style="color:var(--clay)">${x.best.rating}</td><td class="mono" style="font-size:12.5px">${esc(paramLine(x.best))} · ${x.best.steeps.slice(0,6).map(s=>fmtS(s.s)).join(' ')}${x.best.steeps.length>6?' …':''}</td><td><button class="btn sm" data-a="again" data-v="${esc(x.best.id)}">Brew again</button></td></tr>`).join('')}
     </tbody></table></div></div>
    <div class="panel"><h2>Flavours you find most</h2>${tagBars(all)}</div>
    <div class="panel"><h2>Sessions, last 18 weeks</h2>${heatmap(all)}</div>
   </div>`;
}
function scatter(rated){
  const X={temp:{f:b=>noTemp(b.style)?null:toU(b.temp),lab:'Water temperature ('+deg()+')',fmt:v=>v+'°'},ratio:{f:per100,lab:'Grams of leaf per 100 ml',fmt:v=>v+' g'},steeps:{f:b=>b.steeps.length||null,lab:'Number of infusions',fmt:v=>v},total:{f:b=>totalSteep(b)||null,lab:'Total steep time',fmt:fmtS}}[state.xAxis];
  const pts=rated.map(b=>({b,x:X.f(b),y:b.rating})).filter(p=>p.x!=null&&isFinite(p.x));
  if(pts.length<2)return '<p class="sub">Not enough sessions with this measurement yet.</p>';
  const W=720,H=280,pl=40,pr=16,pt=14,pb=42;let lo=Math.min(...pts.map(p=>p.x)),hi=Math.max(...pts.map(p=>p.x));if(lo===hi){lo-=1;hi+=1}
  const ticks=niceTicks(lo,hi,6),x0=ticks[0],x1=ticks[ticks.length-1];const sx=v=>pl+(v-x0)/(x1-x0)*(W-pl-pr),sy=v=>pt+(10-v)/9*(H-pt-pb);
  let g='';[1,4,7,10].forEach(v=>g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${pl-8}" y="${sy(v)+4}" text-anchor="end">${v}</text>`);
  ticks.forEach(t=>g+=`<text x="${sx(t)}" y="${H-pb+18}" text-anchor="middle">${X.fmt(t)}</text>`);
  g+=`<line class="axisline" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/><text x="${(pl+W-pr)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">${X.lab}</text><text x="12" y="${pt+4}" class="lbl-strong">Rating</text>`;
  const seen={};pts.forEach(p=>{const k=Math.round(sx(p.x)/6)+'_'+p.y;const j=seen[k]=(seen[k]||0)+1;const dx=(j-1)*7*((j%2)?1:-1)/2;
    g+=`<circle class="pt" cx="${sx(p.x)+dx}" cy="${sy(p.y)}" r="7" style="fill:${liqHex(p.b.liq||p.b.steeps[0]?.liq||'gold')}"><title>${esc(teaName(p.b))} · ${p.b.rating}/10 · ${esc(String(X.fmt(p.x)))}</title></circle>`});
  return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="min-width:480px" role="img" aria-label="Rating against ${X.lab}">${g}</svg></div>`;
}
function heatmap(all){
  const weeks=18,cell=14,gap=3;const today=new Date();today.setHours(0,0,0,0);const start=new Date(today);start.setDate(start.getDate()-start.getDay()-(weeks-1)*7);
  const counts={};all.forEach(b=>{const d=dt(b.at);d.setHours(0,0,0,0);counts[d.getTime()]=(counts[d.getTime()]||0)+1});const max=Math.max(1,...Object.values(counts));
  let g='';const days=['S','M','T','W','T','F','S'];[1,3,5].forEach(i=>g+=`<text x="0" y="${22+i*(cell+gap)+cell-3}">${days[i]}</text>`);
  for(let w=0;w<weeks;w++)for(let d=0;d<7;d++){const day=new Date(start);day.setDate(start.getDate()+w*7+d);if(day>today)continue;const n=counts[day.getTime()]||0;const x=16+w*(cell+gap),y=22+d*(cell+gap);
    if(day.getDate()<=7&&d===0)g+=`<text x="${x}" y="12">${day.toLocaleDateString(undefined,{month:'short'})}</text>`;
    g+=`<rect class="${n?'cell':'cell0'}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" ${n?`style="fill-opacity:${.3+.7*n/max}"`:''}><title>${day.toDateString()}: ${n} session${n===1?'':'s'}</title></rect>`}
  const W=16+weeks*(cell+gap),H=22+7*(cell+gap);return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="max-width:${W*1.6}px" role="img" aria-label="Brewing activity">${g}</svg></div>`;
}
