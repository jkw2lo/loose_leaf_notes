/* ═════════ Tea page ═════════ */
function guideCards(tea,r,other,src){
  const own=new Set(store.settings.vessels.map(v=>v.type));const best=r.vessels.find(v=>own.has(v))||r.vessels[0];const o=other;
  const diff=(cond,label)=>o&&cond?`<span class="pdiff ${src==='producer'?'typ':''}">${src==='producer'?'Typical':'Producer'} ${label}</span>`:'';
  const alts=r.vessels.filter(v=>v!==best);
  const card=(art,cap,val,sub,extra='')=>`<div class="gc"><div class="gc-art">${art}</div><div class="gc-body"><span class="cap">${cap}</span><b>${val}</b>${sub?`<span class="gc-sub">${sub}</span>`:''}${extra}</div></div>`;
  return `<div class="gcards">
   ${card(vesselSVG(best),'Teaware',`<span class="gc-text">${VT[best].name}</span>${own.has(best)?' <span class="own-mark" title="In your teaware">✓</span>':''}`,alts.length?'or '+alts.map(v=>VT[v].name+(own.has(v)?' ✓':'')).join(', '):'',own.has(best)?'':'<span class="gc-sub"><button class="linkbtn" data-a="view" data-v="settings">Not in your teaware</button></span>')}
   ${card(leafSVG(r.gT,r.dry),'Leaf',fmtGR(r.g),`${r.per[0]===r.per[1]?r.per[0]:r.per[0]+'–'+r.per[1]} g per 100 ml`,diff(o&&o.g.join()!==r.g.join(),fmtGR(o?.g||[0,0])))}
   ${card(beakerSVG(r.ml,VT[best].ml),r.style==='ice'?'Ice':'Water',`${r.ml} ${r.style==='ice'?'g':'ml'}`,`ratio 1:${Math.round(r.ml/r.gT)}`,diff(o&&o.ml!==r.ml,(o?.ml||'')+' ml'))}
   ${card(thermoSVG(r.target,r.t,r.style),'Temperature',fmtTR(r.t,r.style),noTemp(r.style)?'no heat':stage(r.t[0])+(stage(r.t[0])!==stage(r.t[1])?' to '+stage(r.t[1]):''),diff(o&&!noTemp(r.style)&&o.t.join()!==r.t.join(),o?fmtTR(o.t,o.style):''))}
   ${card(steepsSVG(r.sched.map(s=>({s,liq:midLiq(r.liqs)})),null,90,50),'Infusions',`${r.inf[0]===r.inf[1]?r.inf[0]:r.inf[0]+'–'+r.inf[1]}${r.rinse?` <small class="muted">+ ${r.rinse>1?'2 rinses':'rinse'}</small>`:''}`,'',`<div class="sched">${r.sched.map((s,i)=>`<span><i>${i+1}</i>${fmtS(s)}</span>`).join('')}</div>${diff(o&&o.sched.join()!==r.sched.join(),o?o.sched.map(fmtS).join(' '):'')}`)}
   ${card(`<span class="cup lg" style="--liq:${liqHex(midLiq(r.liqs))}"></span>`,'Liquor',`<span class="gc-text">${LIQM[r.liqs[0]].n} to ${LIQM[r.liqs[r.liqs.length-1]].n.toLowerCase()}</span>`,'',`<div class="liq-typ">${r.liqs.map(id=>`<span class="sw s" style="--c:${liqHex(id)}" title="${LIQM[id].n}"></span>`).join('')}</div>`)}
  </div>`;
}
function teaDetailsHTML(t){
  const T=typeOf(t),F=famOf(t.fam);
  const rows=[['Type',T?`${T.name}${T.aka&&!T.custom?' · '+T.aka:''}`:'Not in the catalogue'],['Family',`${F.name} · ${F.native}`],['Origin',t.origin],['Brand',t.brand],['Harvest',t.harvest],['Cultivar',t.cultivar],['Leaf',T?.x.leaf||F.leaf],['Oxidation',F.ox],['Processing',F.proc],['Character',T?.x.char]].filter(x=>x[1]);const k=stockOf(t);if(k)rows.push(['Bought',`${k.total} g${k.price?' for '+money(k.price,k.cur)+' · '+money(k.perG,k.cur)+'/g':''}`]);
  return `<dl class="kv">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}${t.url?`<dt>Product page</dt><dd><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.url.replace(/^https?:\/\/(www\.)?/,'').slice(0,40))}${t.url.length>48?'…':''}</a></dd>`:''}</dl>${t.notes?`<p class="sub notes-text">${esc(t.notes)}</p>`:''}`;
}
function renderTea(){
  const el=$('#view-tea');const t=teaById(state.teaId);
  if(!t){el.innerHTML=`<button class="back" data-a="view" data-v="shelf">← Tea shelf</button><div class="empty"><h2>This tea is no longer on your shelf</h2></div>`;return}
  const F=famOf(t.fam),T=typeOf(t);const bs=brewsOf(t.id).sort((a,b)=>dt(b.at)-dt(a.at));
  const ms=methodsFor(t);let style=state.teaStyle&&ms.some(m=>m.style===state.teaStyle)?state.teaStyle:defaultStyle(t);
  const typ=recFor(t,style),prod=prodFor(t,style);const src=prod&&state.teaSrc==='producer'?'producer':'typical';const r=src==='producer'?prod:typ;
  const rated=bs.filter(b=>b.rating);const best=rated.slice().sort((a,b)=>b.rating-a.rating)[0];
  const used=new Set(bs.map(b=>b.style));const inStyle=bs.filter(b=>b.style===style);const cmp=inStyle.slice(0,6);
  const pDiffers=prod&&(prod.t.join()!==typ.t.join()||prod.g.join()!==typ.g.join()||prod.ml!==typ.ml||prod.sched.join()!==typ.sched.join());
  el.innerHTML=`
   <button class="back" data-a="view" data-v="${t.finished?'library':'shelf'}">← ${t.finished?'Library':'Tea shelf'}</button>
   <div class="tea-hero" style="--liq:${liqHex(teaLiq(t))};--wash:${washOf(liqsOf(t))}"><span class="cup xl"></span>
    <div class="th-title"><div class="eyebrow">${F.name}${T&&norm(T.name)!==norm(t.name)?' · '+esc(T.name):''}</div><h1>${esc(t.name)}</h1><div class="meta">${[t.brand,t.origin,t.harvest].filter(Boolean).map(esc).join(' · ')}${t.example?' <span class="tg ex">Example</span>':''}</div>
     <div class="hstats"><span><b>${bs.length}</b> session${bs.length===1?'':'s'}</span>${rated.length?`<span>average <b>${avg(rated.map(b=>b.rating)).toFixed(1)}</b></span><span>best <b class="clay">${best.rating}</b></span>`:''}${bs[0]?`<span>last brewed <b>${fmtDate(bs[0].at)}</b></span>`:''}${t.finished?'':stockHTML(t)}</div></div>
    <div class="actions"><button class="btn ghost" data-a="${t.finished?'restockTea':'finishTea'}" data-v="${esc(t.id)}">${t.finished?'Restock':'Finish & move to library'}</button><button class="btn" data-a="editTea" data-v="${esc(t.id)}">Edit tea</button><button class="btn primary" data-a="logFor" data-v="${esc(t.id)}">＋ Log a session</button></div></div>
   ${t.finished?`<div class="verdict"><div class="v-main"><span class="eyebrow">In your library · finished ${fmtDate(t.finished)} ${dt(t.finished).getFullYear()}</span>${t.verdict?.score?`<span class="score">${t.verdict.score}<small>/10</small></span>`:''}${t.verdict?.rebuy?`<span class="rebuy ${t.verdict.rebuy}">${REBUY[t.verdict.rebuy]}</span>`:''}${t.verdict?.note?`<p class="lib-quote">“${esc(t.verdict.note)}”</p>`:''}</div><div class="tool-row"><button class="btn sm" data-a="finishTea" data-v="${esc(t.id)}">Edit verdict</button><button class="btn sm" data-a="restockTea" data-v="${esc(t.id)}">Restock</button></div></div>`
   :stockOf(t)?.left===0?`<div class="notice"><span>By your sessions, this tea is used up.</span><button class="btn sm" data-a="finishTea" data-v="${esc(t.id)}">Move to library</button></div>`:''}
   <div class="tea-grid" data-arr="tea-grid" data-arr-auto>
    <div class="panel">
     <div class="panel-head"><h2>Brewing guide${r.edited&&src==='typical'?' <span class="tg ex" style="vertical-align:middle">Your version</span>':''}</h2>
      <div class="tool-row">${ms.length>1?`<div class="seg sm" role="group" aria-label="Method">${ms.map(m=>`<button data-a="teaStyle" data-v="${m.style}" aria-pressed="${style===m.style}" title="${STYLE_DESC[m.style]}">${STYLE[m.style]}${used.has(m.style)?' •':''}</button>`).join('')}</div>`:`<span class="chip">${STYLE[style]}</span>`}
      ${prod?`<div class="seg sm" role="group" aria-label="Source"><button data-a="teaSrc" data-v="typical" aria-pressed="${src==='typical'}">Typical</button><button data-a="teaSrc" data-v="producer" aria-pressed="${src==='producer'}">${esc(t.brand||'Producer')}’s</button></div>`:''}</div></div>
     <div class="guide-wrap">
      <div class="guide-main">
       <p class="sub"><button class="linkbtn" data-a="editGuide" data-v="${esc(gKey(t))}" data-s="${style}" style="float:right;margin-left:12px;font-size:13px">Edit guide</button>${src==='producer'?`Following ${esc(t.brand||'the producer')}’s instructions${pDiffers?'. Where they differ from the typical guide, the typical value is shown on the card.':', which match the typical guide.'}`:`${STYLE_DESC[style]}.${prod&&pDiffers?` ${esc(t.brand||'The producer')} recommends something different; it is marked on the cards.`:''}`} ${ms.length>1?`Methods for ${esc(T?.name||F.name)}: ${ms.map(m=>STYLE[m.style].toLowerCase()).join(', ')}.`:''}</p>
       ${guideCards(t,r,pDiffers?(src==='producer'?typ:prod):null,src)}
       <div class="howto"><h3>How to brew</h3><ol class="steps">${stepsFor(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
       ${(src==='producer'&&r.pnotes)||(prod&&src==='typical'&&prod.pnotes)?`<div class="pnote"><span class="cap">From ${esc(t.brand||'the producer')}</span><p>${esc(prod.pnotes)}</p></div>`:''}
       <div class="howto quiet"><h3>Good to know</h3><ul class="tips">${r.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <aside class="guide-aside"><div class="panel-head"><h3>About this tea</h3><button class="linkbtn" data-a="editTea" data-v="${esc(t.id)}" style="font-size:13px">Edit</button></div>${teaDetailsHTML(t)}</aside>
     </div>
    </div>
    ${bs.length?`
    <div class="panel">
     <div class="panel-head"><h2>Your sessions against the guide</h2><span class="sub">${inStyle.length} ${STYLE[style].toLowerCase()} session${inStyle.length===1?'':'s'}${bs.length>inStyle.length?` · ${bs.length-inStyle.length} with other methods`:''}</span></div>
     ${cmp.length?`
      <div class="legend"><span class="li"><i class="dash"></i>Typical guide (band = comfortable range)</span>${prod?`<span class="li"><i class="dash prod"></i>Producer</span>`:''}${cmp.map((s,k)=>`<span class="li k${k%6+1}"><i></i>${fmtDate(s.at)}${s.rating?' · '+s.rating:''}</span>`).join('')}</div>
      ${compareChart(cmp,typ,prod)}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Session</th><th class="num">Leaf</th><th class="num">Water</th><th class="num">g/100</th><th class="num">Temp</th><th class="num">Infusions</th><th>Steep times</th><th class="num">Rating</th></tr></thead><tbody>
       <tr class="guide-row"><td>Typical</td><td class="num">${fmtGR(typ.g)}</td><td class="num">${typ.ml} ml</td><td class="num">${typ.per[0]}–${typ.per[1]}</td><td class="num">${fmtTR(typ.t,style)}</td><td class="num">${typ.inf[0]}–${typ.inf[1]}</td><td>${typ.sched.slice(0,5).map(fmtS).join(' ')}${typ.sched.length>5?' …':''}</td><td class="num"></td></tr>
       ${prod?`<tr class="guide-row prod"><td>${esc(t.brand||'Producer')}</td><td class="num">${fmtGR(prod.g)}</td><td class="num">${prod.ml} ml</td><td class="num">${prod.per[0]}</td><td class="num">${fmtTR(prod.t,style)}</td><td class="num">${prod.inf[0]}</td><td>${prod.sched.slice(0,5).map(fmtS).join(' ')}</td><td class="num"></td></tr>`:''}
       ${cmp.map((s,k)=>{const p=per100(s),pv=vsBand(p,typ.per),tv=noTemp(s.style)?'ok':vsBand(s.temp,typ.t),iv=vsBand(s.steeps.length,typ.inf);const mark=v=>v==='low'?'<span class="d-dn">▼</span>':v==='high'?'<span class="d-up">▲</span>':'';
        return `<tr class="click" data-a="openSession" data-v="${esc(s.id)}"><td><span class="swatch-key k${k%6+1}"></span>${fmtDate(s.at)}</td><td class="num">${s.g} g</td><td class="num">${s.ml} ml</td><td class="num">${p??'—'}${mark(pv)}</td><td class="num">${fmtT(s.temp,s.style)}${mark(tv)}</td><td class="num">${s.steeps.length}${mark(iv)}</td><td>${benchHTML('time',s,typ)}</td><td class="num" style="color:var(--clay)">${s.rating||'—'}</td></tr>`}).join('')}
      </tbody></table></div>`:`<p class="sub">No ${STYLE[style].toLowerCase()} sessions yet. Pick another method above to compare those sessions.</p>`}
    </div>
    ${bs.filter(hasAxes).length?`<div class="panel half"><h2>Palate across sessions</h2><div style="max-width:280px;margin:0 auto;width:100%">${radarSVG(bs.filter(hasAxes).slice(0,3).map((s,k)=>({v:s.axes,cls:'rs'+(k+1)})),{size:240})}</div><div class="legend">${bs.filter(hasAxes).slice(0,3).map((s,k)=>`<span class="li k${k+1}"><i></i>${fmtDate(s.at)}${s.rating?' · '+s.rating:''}</span>`).join('')}</div></div>
     <div class="panel half"><h2>What you taste in it</h2>${tagBars(bs)}</div>`:''}
    <div class="panel"><div class="panel-head"><h2>Sessions</h2><span class="sub">newest first</span></div><div class="sess-list">${bs.map(b=>sessCard(b,recFor(t,b.style))).join('')}</div></div>`
    :`<div class="empty"><h2>No sessions yet</h2><p>Log your first session to start comparing against the guide.</p><button class="btn primary" data-a="logFor" data-v="${esc(t.id)}">＋ Log a session</button></div>`}
   </div>`;
}
function tagBars(bs){const tc={};bs.forEach(b=>sessionTags(b).forEach(t=>tc[t]=(tc[t]||0)+1));const top=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10);const m=top[0]?.[1]||1;
  return top.length?`<div class="tagbars">${top.map(([t,n])=>`<div class="tagbar"><span>${esc(t)}</span><span class="b"><i style="width:${n/m*100}%"></i></span><span class="v">${n}</span></div>`).join('')}</div>`:'<p class="sub">Tag flavours on each infusion to see them here.</p>'}
const sessionTags = b=>[...new Set([...(b.tags||[]),...(b.steeps||[]).flatMap(s=>s.tags||[])])];
function sessCard(b,rec){
  const d=dt(b.at);const note=b.notes||b.steeps.map(s=>s.note).filter(Boolean)[0]||'';
  return `<button class="sess" data-a="openSession" data-v="${esc(b.id)}">
   <span class="s-date"><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined,{month:'short'})}</span></span>
   <span class="s-main">${setupStrip(b,rec,true)}<span class="s-line">${STYLE[b.style]||''} · ${benchHTML('time',b,rec)} ${b.example?'<span class="tg ex">Example</span>':''}</span>${note?`<span class="s-note">${esc(note)}</span>`:''}</span>
   <span class="s-side">${b.rating?`<span class="score">${b.rating}<small>/10</small></span>`:'<span class="score none">Unrated</span>'}<span style="width:90px">${liqStrip(b)}</span></span></button>`;
}
