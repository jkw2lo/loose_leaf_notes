/* ═════════ Combobox (tea type, brand, origin) ═════════ */
let comboIdx=-1;
function comboOptions(kind,q){
  const n=norm(q);
  if(kind==='type'){
    const cts=(store.settings.customTypes||[]).map(c=>({v:'c:'+c.id,label:c.name,sub:famOf(c.fam).name+' · your type',fam:c.fam}));
    const lib=LIB.map(t=>({v:t.name,label:t.name,aka:t.aka,sub:famOf(t.fam).name,fam:t.fam,t}));
    if(!n)return {grouped:true,items:[...cts,...lib]};
    const sc=o=>{const a=norm(o.label),b=norm(o.aka),c=norm(o.sub),d=norm(o.t?.x.char);return a.startsWith(n)?4:b.startsWith(n)?3.5:a.includes(n)?3:b.includes(n)?2.5:(n.length>=4&&n.includes(a)&&a.length>=4)?2.2:c.includes(n)?1.5:d.includes(n)?1:0};
    return {items:[...cts,...lib].map(o=>({o,s:sc(o)})).filter(x=>x.s).sort((a,b)=>b.s-a.s).slice(0,30).map(x=>x.o)};
  }
  const list=kind==='brand'?BRANDS:LOCS;if(!n)return {items:[]};
  return {items:list.map(x=>{const k=norm(x),first=norm(x.split(',')[0]);return{x,s:first.startsWith(n)?3:k.startsWith(n)?2.5:first.includes(n)?2:k.includes(n)?1:0,len:x.length}}).filter(o=>o.s).sort((a,b)=>b.s-a.s||a.len-b.len).slice(0,8).map(o=>({v:o.x,label:o.x}))};
}
function renderCombo(input){
  const kind=input.dataset.combo,box=$('#'+input.id+'-list');if(!box)return;const {items,grouped}=comboOptions(kind,input.value);comboIdx=-1;
  if(!items.length&&kind!=='type'){box.hidden=true;return}
  const opt=o=>`<button type="button" data-a="comboPick" data-k="${kind}" data-v="${esc(o.v)}" data-for="${input.id}">${kind==='type'?`<span class="cup sm" style="--liq:${liqHex(midLiq(o.t?.x.liqs||famOf(o.fam).liqs))};width:16px;height:16px;box-shadow:none"></span>`:''}<span><span class="s-name">${esc(o.label)}</span>${o.aka?` <span class="muted" style="font-size:13px">${esc(o.aka)}</span>`:''}</span>${o.sub?`<span class="s-sub">${esc(o.sub)}</span>`:''}</button>`;
  let html='';
  if(grouped){const byFam={};items.forEach(o=>(byFam[o.fam]=byFam[o.fam]||[]).push(o));html=FAMS.filter(f=>byFam[f.id]).map(f=>`<div class="picker-cat">${f.name}</div>${byFam[f.id].map(opt).join('')}`).join('')}
  else html=items.map(opt).join('');
  if(kind==='type')html+=`<button type="button" class="combo-other" data-a="typeOther"><span class="s-name">My tea isn’t listed</span><span class="s-sub">Pick a family instead</span></button>`;
  box.innerHTML=html;box.hidden=false;
}
function hideCombos(){$$('.sugg-list').forEach(b=>b.hidden=true)}
