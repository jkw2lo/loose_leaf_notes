/* ═════════ Shelf: teas in rotation ═════════
   A paged list of the teas you have on hand; picking one shows its stats and brew guide beside it. */
const SHELF_PER=8;
function famChips(counts,isOn,action,allOn){
  return `<div class="chips fam-chips" data-mock="sel.chips" data-mock-label="${['All',...FAMS.filter(c=>counts[c.id]).map(c=>c.name)].join(', ')}"><button class="chip" data-a="${action}" data-v="" aria-pressed="${allOn}">All<span class="n">${Object.values(counts).reduce((a,b)=>a+b,0)}</span></button>${FAMS.filter(c=>counts[c.id]).map(c=>`<button class="chip" data-a="${action}" data-v="${c.id}" aria-pressed="${isOn(c.id)}" style="--c:${liqHex(midLiq(c.liqs))}"><span class="dot"></span>${c.name}<span class="n">${counts[c.id]}</span></button>`).join('')}</div>`}
const lastBrewAt = t=>brewsOf(t.id).reduce((m,x)=>Math.max(m,+dt(x.at)),0);
function renderShelf(){
  const el=$('#view-shelf');
  if(store.mode==='pending'){el.innerHTML='<p class="loading">Opening your notes…</p>';return}
  const allT=allTeas();const fin=allT.filter(t=>t.finished);const teas=allT.filter(t=>!t.finished);
  const shown=teas.filter(t=>!state.shelfFam||t.fam===state.shelfFam).sort((a,b)=>lastBrewAt(b)-lastBrewAt(a)||a.name.localeCompare(b.name));
  const exN=teas.some(t=>t.example)||store.brews.some(b=>b.example);
  const counts={};teas.forEach(t=>counts[t.fam]=(counts[t.fam]||0)+1);
  if(!shown.some(t=>t.id===state.shelfSel))state.shelfSel=shown[0]?.id||null;
  const pages=Math.max(1,Math.ceil(shown.length/SHELF_PER));
  if(state.shelfPage==null||state.shelfPage>=pages)state.shelfPage=Math.max(0,Math.floor(shown.findIndex(t=>t.id===state.shelfSel)/SHELF_PER));
  const page=shown.slice(state.shelfPage*SHELF_PER,(state.shelfPage+1)*SHELF_PER);
  let body='';
  if(!allT.length)body=`<div class="empty"><h2>Your tea shelf is empty</h2><p>Add a tea you own, like a Kagoshima sencha or a 2019 Yiwu cake. Each tea keeps its brewing guide and every session you log with it.</p><button class="btn primary" data-a="newTea">＋ Add a tea</button></div>`;
  else if(!shown.length)body=`<div class="empty"><h2>${!teas.length?'Every tea is in your library':'No teas match'}</h2><p>${!teas.length?'Add a new tea, or restock one from your library.':'Try another family.'}</p><button class="btn" data-a="${!teas.length?'newTea':'shelfClear'}">${!teas.length?'＋ Add a tea':'Show all'}</button></div>`;
  else body=`<div class="home" data-arr-split="home" data-arr-fixed="1" data-arr-min="220" data-arr-max="560">
    <div class="home-list"><div class="tlist" role="listbox" aria-label="Teas in rotation" data-mock="lay.list" data-mock-label="${esc(page.map(t=>t.name).join(', '))}">${page.map(t=>shelfRow(t,t.id===state.shelfSel)).join('')}</div>
     ${pages>1?`<div class="dots" role="group" aria-label="Pages of teas" data-mock="nav.dots" data-mock-label="">${Array.from({length:pages},(_,p)=>`<button type="button" data-a="shelfPage" data-v="${p}" aria-label="Page ${p+1}" aria-current="${p===state.shelfPage}"></button>`).join('')}</div>`:''}</div>
    <div class="home-panel" id="homePanel" data-mock="nav.sidetabs" data-mock-label="Tea stats, Brew guide">${shelfPanel(teaById(state.shelfSel))}</div></div>`;
  el.innerHTML=`
   <div class="page-head"><div><h1>Tea shelf</h1><p>${teas.length?`${teas.length} tea${teas.length>1?'s':''} in rotation · ${store.brews.length} session${store.brews.length===1?'':'s'} logged`:'The teas you have on hand.'}${fin.length?` · <button class="linkbtn" data-a="view" data-v="library">${fin.length} finished in your library</button>`:''}</p></div>
    <div class="tool-row"><button class="btn" data-a="newTea" data-mock="act.button">＋ Add a tea</button></div></div>
   ${exN?`<div class="notice"><span>Teas marked Example show how a shelf fills in. Your own teas appear alongside them.</span><button class="btn sm" data-a="clearEx">Remove examples</button></div>`:''}
   ${store.mode==='local'?'<div class="notice"><span>Notes are being saved in this browser only.</span></div>':''}
   ${teas.length?famChips(counts,id=>state.shelfFam===id,'shelfFam',!state.shelfFam):''}
   ${body}`;
}
function shelfRow(t,sel){const T=typeOf(t);const n=brewsOf(t.id).length;const k=stockOf(t);
  return `<button class="trow" role="option" aria-selected="${sel}" data-a="shelfPick" data-v="${esc(t.id)}"><span class="cup sm" style="--liq:${liqHex(teaLiq(t))}"></span>
   <span class="trow-main"><span class="trow-name">${esc(t.name)}</span><span class="trow-sub">${[T&&norm(T.name)!==norm(t.name)?T.name:null,t.brand].filter(Boolean).map(esc).join(' · ')||esc(famOf(t.fam).name)}</span></span>
   <span class="trow-side">${k?`<span class="${k.left<=0?'out':k.left/k.total<.2?'low':''}">${k.left} g</span>`:''}<span>${n} brew${n===1?'':'s'}</span></span><span class="trow-arrow" aria-hidden="true">›</span></button>`}

/* the panel beside the list: tabs with Log a brew beside them, then tea info and brews | stats and flavour */
function shelfPanel(t){if(!t)return '';const tab=state.shelfTab||'stats';
  return `<div class="hp-head"><div class="seg sidetabs" role="tablist" data-mock-skip aria-label="${esc(t.name)}"><button type="button" role="tab" data-a="shelfTab" data-v="stats" aria-pressed="${tab==='stats'}" aria-selected="${tab==='stats'}">Tea stats</button><button type="button" role="tab" data-a="shelfTab" data-v="guide" aria-pressed="${tab==='guide'}" aria-selected="${tab==='guide'}">Brew guide</button></div>
    <button class="hs-log" data-a="logFor" data-v="${esc(t.id)}" data-mock="act.pill"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Log a brew</button></div>
   ${tab==='guide'?shelfGuide(t):shelfStats(t)}`}
function shelfStats(t){
  const T=typeOf(t),bs=brewsOf(t.id).sort((a,b)=>dt(a.at)-dt(b.at)),k=stockOf(t);
  const opened=t.stock?.since||t.createdAt||bs[0]?.at;const days=opened?Math.max(0,Math.floor((Date.now()-dt(opened))/864e5)):null;
  const rated=bs.filter(hasAxes);const pal={};AXES.forEach(([x])=>pal[x]=rated.length?avg(rated.map(b=>b.axes[x]||0)):0);
  return `<div class="hs" data-arr-split="shelf-stats" data-arr-fixed="2" data-arr-min="150" data-arr-max="360">
   <div class="hs-col" data-arr="shelf-main">
    <div class="hs-info hs-grow" data-arr-item="info" data-arr-label="Tea info" data-mock="note.box" data-mock-label="Tea info"><span class="cup" style="--liq:${liqHex(teaLiq(t))}"></span><div class="hs-info-txt"><h2>${esc(t.name)}</h2><span class="meta">${[t.brand,T?.name&&norm(T.name)!==norm(t.name)?T.name:famOf(t.fam).name].filter(Boolean).map(esc).join(' · ')}</span>${t.origin||t.harvest?`<span class="meta">${[t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}</span>`:''}
     <span class="hs-links"><button class="linkbtn" data-a="openTea" data-v="${esc(t.id)}">Tea page &amp; sessions</button><button class="linkbtn" data-a="editTea" data-v="${esc(t.id)}">Edit</button></span></div></div>
    <div class="hs-card hs-heat" data-arr-item="heat" data-arr-label="Brews heatmap" data-mock="data.heatmap" data-mock-label="Brews"><h3>Brews</h3>${bs.length?heatmap(bs):'<p class="muted hs-note">No brews yet.</p>'}</div>
    <div class="hs-card" data-arr-item="price" data-arr-label="Price vs. rating" data-mock="data.scatter" data-mock-label="Price vs. rating"><h3>Price vs. rating</h3>${priceRating(t)}</div>
   </div>
   <div class="hs-col" data-arr="shelf-side">
    <div class="hs-card hs-stat" data-arr-item="strip" data-arr-label="Brews and days"><div class="hs-strip" data-mock="lay.stats" data-mock-label="${bs.length} brews, ${days??'—'} days since opened"><div><b>${bs.length}</b><span>brew${bs.length===1?'':'s'}</span></div><div><b>${days??'—'}</b><span>day${days===1?'':'s'} since opened</span></div></div></div>
    <div class="hs-card hs-grow" data-arr-item="radar" data-arr-label="Flavour profile" data-mock="data.radar" data-mock-label="Flavour profile"><h3>Flavour profile</h3>${rated.length?`<div class="hs-radar">${radarSVG([{v:pal}],{size:200})}</div><span class="muted hs-note">Average of ${rated.length} rated brew${rated.length===1?'':'s'}</span>`:'<p class="muted hs-note">Rate the palate on a brew to see its shape here.</p>'}</div>
    <div class="hs-card hs-gauge" data-arr-item="gauge" data-arr-label="Grams used">${k?gaugeSVG(k.used,k.total):`<div class="hs-nostock"><span class="muted">How much did you buy?</span><button class="linkbtn" data-a="editTea" data-v="${esc(t.id)}">Add the amount</button></div>`}</div>
   </div>
  </div>`}
function gaugeSVG(used,total){const p=clamp(used/total,0,1);const R=52,cx=64,cy=62;const a=Math.PI*(1-p);
  const x=cx+R*Math.cos(a),y=cy-R*Math.sin(a);
  return `<svg class="gauge" viewBox="0 0 128 74" role="img" aria-label="${used} of ${total} grams used" data-mock="data.gauge" data-mock-label="${Math.round(used)}/${total} g used"><path class="g-track" d="M${cx-R} ${cy} A${R} ${R} 0 0 1 ${cx+R} ${cy}"/>${p>0?`<path class="g-val${p>=.8?' low':''}" d="M${cx-R} ${cy} A${R} ${R} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}"/>`:''}
   <text class="g-big" x="${cx}" y="${cy-8}" text-anchor="middle">${Math.round(used)}<tspan class="g-of">/${total} g</tspan></text><text class="g-sub" x="${cx}" y="${cy+9}" text-anchor="middle">used</text></svg>`}
/* every tea with a price and a rating; this one is highlighted */
function priceRating(cur){
  const pts=allTeas().map(t=>{const k=stockOf(t);const r=brewsOf(t.id).filter(b=>b.rating);return k?.perG&&r.length?{t,x:k.perG*100,y:avg(r.map(b=>b.rating)),cur:k.cur}:null}).filter(Boolean);
  const me=pts.find(p=>p.t.id===cur.id);
  if(pts.length<2)return `<p class="muted hs-note">${me?'Add prices and ratings to more teas to compare.':'Add a price and rate a brew to place this tea among the others.'}</p>`;
  const W=300,H=170,pl=30,pr=10,pt=10,pb=30;const lo=0,hi=Math.max(...pts.map(p=>p.x))*1.1;const sx=v=>pl+(v-lo)/(hi-lo)*(W-pl-pr),sy=v=>pt+(10-v)/9*(H-pt-pb);
  let g='';[1,5,10].forEach(v=>g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${pl-6}" y="${sy(v)+4}" text-anchor="end">${v}</text>`);
  niceTicks(lo,hi,4).filter(v=>v<=hi).forEach(v=>g+=`<text x="${sx(v)}" y="${H-pb+14}" text-anchor="middle">${money(v,pts[0].cur)}</text>`);
  g+=`<text x="${(pl+W-pr)/2}" y="${H-2}" text-anchor="middle" class="lbl-strong">Price per 100 g</text>`;
  pts.sort((a,b)=>(a.t.id===cur.id)-(b.t.id===cur.id)).forEach(p=>{const m=p.t.id===cur.id;g+=`<circle class="pt${m?' me':''}" cx="${sx(p.x)}" cy="${sy(p.y)}" r="${m?7:5}" style="fill:${liqHex(teaLiq(p.t))}"><title>${esc(p.t.name)} · ${money(p.x,p.cur)}/100 g · ${p.y.toFixed(1)}/10</title></circle>`});
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Price per 100 grams against average rating">${g}</svg>${me?'':'<span class="muted hs-note">This tea needs a price and a rating to appear.</span>'}`}
function shelfGuide(t){const ms=methodsFor(t);const style=ms.some(m=>m.style===state.shelfStyle)?state.shelfStyle:defaultStyle(t);const r=prodFor(t,style)||recFor(t,style);
  return `<div class="hg">${ms.length>1?`<div class="seg sm" role="group" aria-label="Method">${ms.map(m=>`<button type="button" data-a="shelfStyle" data-v="${m.style}" aria-pressed="${m.style===style}">${STYLE[m.style]}</button>`).join('')}</div>`:''}
   <div class="hg-cols"><section><h3>Instructions</h3><ol class="bw-steps" data-mock="txt.numbered">${stepsFor(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
    <section><h3>Details${r.producer?` <span class="muted">· ${esc(t.brand||'producer')}’s recipe</span>`:''}</h3>${guideList(r)}</section></div></div>`}
const washOf = liqs=>`linear-gradient(100deg,${liqs.map(liqHex).join(',')})`;
function paramLine(b){return [b.g?`${b.g} g`:null,b.ml?`${b.ml} ml`:null,fmtT(b.temp,b.style),`${STYLE[b.style]||''}${(b.steeps||[]).length>1?' ×'+b.steeps.length:''}`].filter(Boolean).join(' · ')}
