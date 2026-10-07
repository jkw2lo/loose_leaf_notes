/* ═════════ Settings ═════════ */
function modePreview(id){
  if(id==='dial')return `<svg viewBox="0 0 120 48"><path d="M30 42 A26 26 0 1 1 90 42" fill="none" stroke="var(--surface-2)" stroke-width="7" stroke-linecap="round"/><path d="M76 17 A26 26 0 0 1 86 33" fill="none" stroke="var(--accent-soft)" stroke-width="7"/><path d="M30 42 A26 26 0 0 1 80 20" fill="none" stroke="var(--hot)" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="20" r="5" fill="var(--surface)" stroke="var(--hot)" stroke-width="2.5"/></svg>`;
  if(id==='steps')return `<svg viewBox="0 0 120 48"><rect x="4" y="14" width="22" height="20" rx="10" fill="none" stroke="var(--line)"/><text x="15" y="28" text-anchor="middle" style="font:11px var(--f-mono);fill:var(--ink-2)">−5</text><text x="60" y="32" text-anchor="middle" style="font:500 18px var(--f-mono);fill:var(--ink)">95°</text><rect x="94" y="14" width="22" height="20" rx="10" fill="none" stroke="var(--line)"/><text x="105" y="28" text-anchor="middle" style="font:11px var(--f-mono);fill:var(--ink-2)">+5</text></svg>`;
  if(id==='scale')return `<svg viewBox="0 0 120 48">${[0,1,2,3,4,5,6].map(i=>`<rect x="${4+i*16.5}" y="8" width="14" height="13" rx="3" fill="${i===5?'var(--hot)':i>=4?'var(--accent-soft)':'var(--surface-2)'}"/><rect x="${4+i*16.5}" y="26" width="14" height="13" rx="3" fill="var(--surface-2)"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 120 48"><rect x="30" y="10" width="60" height="28" rx="6" fill="var(--surface)" stroke="var(--line)"/><text x="60" y="30" text-anchor="middle" style="font:500 16px var(--f-mono);fill:var(--ink)">93|</text></svg>`;
}
function renderSettings(){
  const s=store.settings;const cts=s.customTypes||[];
  $('#view-settings').innerHTML=`<div class="page-head"><div><h1>Settings</h1><p>Make logging fit the way you brew.</p></div></div>
  <div class="set-grid">
   <div class="panel"><h2>Temperature input</h2><p class="sub">How you set water temperature when logging. You can also switch while logging.</p>
    <div class="modes">${TEMP_MODES.map(([id,n,d])=>`<button class="mode" data-a="setMode" data-v="${id}" aria-pressed="${s.tempMode===id}">${modePreview(id)}<b>${n}</b><span>${d}</span></button>`).join('')}</div>
    <div class="tool-row"><span class="lbl">Units</span><div class="seg sm"><button data-a="setUnit" data-v="C" aria-pressed="${s.unit!=='F'}">Celsius</button><button data-a="setUnit" data-v="F" aria-pressed="${s.unit==='F'}">Fahrenheit</button></div></div>
   </div>
   <div class="panel"><div class="panel-head"><h2>My teaware</h2><span class="sub">${s.vessels.length} piece${s.vessels.length===1?'':'s'}</span></div>
    <p class="sub">Only these appear when you log a session. Capacity fills in the water amount when you pick a vessel.</p>
    <div class="ware">${s.vessels.map(v=>`<div class="ware-item">${vesselSVG(v.type)}<div class="wf"><input id="wn-${esc(v.id)}" data-w="name" data-id="${esc(v.id)}" value="${esc(v.name)}" aria-label="Name"><div class="mlrow"><input id="wm-${esc(v.id)}" data-w="ml" data-id="${esc(v.id)}" inputmode="numeric" value="${v.ml}" aria-label="Capacity in ml"> ml · ${VT[v.type]?.name||''}</div></div><button class="rm" data-a="rmWare" data-v="${esc(v.id)}" aria-label="Remove ${esc(v.name)}">×</button></div>`).join('')}</div>
    <div><div class="lbl" style="margin-bottom:8px">Add teaware</div><div class="vpick">${VTYPES.map(v=>`<button class="vtile" data-a="addWare" data-v="${v.id}">${vesselSVG(v.id)}<span class="vn">${v.name}</span><span class="vm">~${v.ml} ml</span></button>`).join('')}</div></div>
   </div>
   <div class="panel"><div class="panel-head"><h2>Your tea types</h2><span class="sub">${LIB.length} types built in</span></div>
    <p class="sub">Only for a tea that is not in the catalogue. It uses its family’s brewing methods, with your own water range if you set one.</p>
    ${cts.length?`<div class="ct-list">${cts.map(c=>`<div class="ct-item"><input class="input" id="ctn-${esc(c.id)}" data-ct="name" data-id="${esc(c.id)}" value="${esc(c.name)}" aria-label="Type name">
      <select class="input" id="ctf-${esc(c.id)}" data-ct="fam" data-id="${esc(c.id)}" aria-label="Family">${FAMS.map(f=>`<option value="${f.id}" ${c.fam===f.id?'selected':''}>${f.name}</option>`).join('')}</select>
      <span class="ct-t"><input class="input mono" id="ctl-${esc(c.id)}" data-ct="t0" data-id="${esc(c.id)}" inputmode="numeric" placeholder="from" value="${c.t?c.t[0]:''}" aria-label="Water from °C">–<input class="input mono" id="cth-${esc(c.id)}" data-ct="t1" data-id="${esc(c.id)}" inputmode="numeric" placeholder="to" value="${c.t?c.t[1]:''}" aria-label="Water to °C">°C</span>
      <button class="rm" data-a="rmType" data-v="${esc(c.id)}" aria-label="Remove ${esc(c.name)}">×</button></div>`).join('')}</div>`:''}
    <div><button class="btn sm" data-a="addType">＋ Add a tea type</button></div>
   </div>
   <div class="panel"><h2>Layout</h2><p class="sub">Drag blocks to reorder them, drag edges and column dividers to resize, and hide what you don’t use. Press <kbd>E</kbd> on any page to start, and Esc to finish. Your layout is saved with your settings.</p>
    <div class="tool-row"><button class="btn sm primary" data-a="arrange">Arrange the layout</button>${Object.keys(s.layout||{}).length?'<button class="btn sm" data-a="layoutReset">Reset every page</button>':''}</div></div>
   <div class="panel"><h2>Your data</h2>
    <div class="tool-row">${canExport()?'<button class="btn sm" data-a="export" data-v="csv">Export sessions (CSV)</button><button class="btn sm" data-a="export" data-v="json">Export everything (JSON)</button>':'<span class="sub">Export is not available in this view.</span>'}
    <label class="btn sm" for="importFile" style="cursor:pointer">Restore from a backup</label><input type="file" id="importFile" accept="application/json,.json" hidden>
    ${allTeas().some(t=>t.example)||store.brews.some(b=>b.example)?'<button class="btn sm" data-a="clearEx">Remove example teas</button>':''}</div>
   </div>
  </div>`;
}
