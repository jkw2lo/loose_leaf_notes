/* ═════════ Illustrations ═════════ */
function vesselSVG(type){
  const v=VT[type]||VT.gaiwan,m='m-'+v.mat;let p='';
  switch(v.icon){
    case 'gaiwan':p=`<ellipse class="${m}" cx="32" cy="42" rx="22" ry="3.5"/><path class="${m}" d="M15 24 C16 35 23 39 32 39 C41 39 48 35 49 24 Z"/><path class="${m}" d="M13 24 C18 14 46 14 51 24 Z"/><ellipse class="${m}" cx="32" cy="13.5" rx="4" ry="2"/>`;break;
    case 'teapot':p=`<path class="${m}" d="M17 30 C10 28 8 22 5 17 L8.5 15.5 C11 20 14 23 18 24.5"/><path class="${m} nofill" d="M46 24 C57 22 58 37 45 37"/><ellipse class="${m}" cx="31" cy="31" rx="16" ry="11"/><path class="${m}" d="M22 21 C25 16.5 37 16.5 40 21 Z"/><circle class="${m}" cx="31" cy="15" r="2.5"/>`;break;
    case 'bigpot':p=`<path class="${m}" d="M14 30 C7 28 5 21 3 15 L6.5 14 C8.5 19 11 23 15 24"/><path class="${m} nofill" d="M49 22 C60 20 61 38 48 39"/><ellipse class="${m}" cx="32" cy="30" rx="19" ry="13"/><path class="${m}" d="M21 18.5 C25 13 39 13 43 18.5 Z"/><circle class="${m}" cx="32" cy="12" r="2.5"/>`;break;
    case 'glass':p=`<path class="${m} nofill" d="M46 18 C56 18 56 34 46 34"/><path class="${m}" d="M18 12 H46 V36 C46 41 42 43 38 43 H26 C22 43 18 41 18 36 Z"/><path class="liquid" d="M19.5 25 H44.5 V36 C44.5 40 41.5 41.5 38 41.5 H26 C22.5 41.5 19.5 40 19.5 36 Z"/><path class="${m}" d="M18 14 L12 11"/><rect class="${m}" x="20" y="8" width="24" height="4" rx="1.5"/>`;break;
    case 'kyusu':p=`<path class="${m}" d="M17 31 C11 30 9 26 7 22 L10 21 C12 24 14 26 18 27"/><rect class="${m}" x="44" y="18" width="17" height="6" rx="3" transform="rotate(-28 44 21)"/><ellipse class="${m}" cx="30" cy="31" rx="15" ry="11"/><path class="${m}" d="M21 22 C24 17.5 36 17.5 39 22 Z"/><circle class="${m}" cx="30" cy="16.5" r="2.2"/>`;break;
    case 'houhin':p=`<path class="${m}" d="M14 28 L7 25 L8 29 Z"/><path class="${m}" d="M13 27 C13 40 51 40 51 27 Z"/><path class="${m}" d="M17 27 C21 19 43 19 47 27 Z"/><ellipse class="${m}" cx="32" cy="19.5" rx="3.5" ry="2"/>`;break;
    case 'shibo':p=`<path class="${m}" d="M10 30 C10 38 54 38 54 30 Z"/><path class="${m}" d="M12 30 C18 24 46 24 52 30 Z"/><ellipse class="${m}" cx="32" cy="24.5" rx="3.5" ry="1.8"/><path class="${m}" d="M10 30 L6 28.5 L7 31 Z"/>`;break;
    case 'mug':p=`<path class="${m} nofill" d="M42 20 C52 20 52 35 42 35"/><rect class="${m}" x="18" y="14" width="24" height="29" rx="3"/><path class="liquid" d="M19.5 20 H40.5 V40 C40.5 41 40 41.5 39 41.5 H21 C20 41.5 19.5 41 19.5 40 Z"/><path class="${m} nofill" d="M34 14 C34 9 38 7 41 6"/><rect class="${m}" x="40" y="3" width="7" height="6" rx="1"/>`;break;
    case 'tumbler':p=`<path class="${m}" d="M19 7 H45 L42 44 H22 Z"/><path class="liquid" d="M20.5 14 H43.5 L41 42.5 H23 Z"/><ellipse fill="#4E6E32" cx="28" cy="34" rx="4" ry="1.6" transform="rotate(-20 28 34)"/><ellipse fill="#4E6E32" cx="35" cy="38" rx="4" ry="1.6" transform="rotate(25 35 38)"/><ellipse fill="#4E6E32" cx="33" cy="18" rx="4" ry="1.6" transform="rotate(10 33 18)"/>`;break;
    case 'chawan':p=`<rect class="${m}" x="25" y="40" width="14" height="4" rx="1.5"/><path class="${m}" d="M11 17 H53 C52 32 45 41 32 41 C19 41 12 32 11 17 Z"/><ellipse class="matcha" cx="32" cy="19.5" rx="19" ry="2.6"/>`;break;
    case 'jar':p=`<rect class="${m}" x="19" y="13" width="26" height="32" rx="6"/><path class="liquid" d="M20.5 22 H43.5 V39 C43.5 42 41.5 43.5 39 43.5 H25 C22.5 43.5 20.5 42 20.5 39 Z"/><rect class="m-ceramic" x="20" y="7" width="24" height="7" rx="2"/>`;break;
    case 'saucepan':p=`<rect class="${m}" x="10" y="18" width="34" height="24" rx="4"/><path class="liquid" d="M11.5 24 H42.5 V38 C42.5 40 41 40.5 40 40.5 H14 C12.5 40.5 11.5 40 11.5 38 Z"/><rect class="${m}" x="44" y="20" width="18" height="5" rx="2.5"/><path class="${m} nofill" d="M20 14 C20 10 24 10 24 6 M30 14 C30 10 34 10 34 6"/>`;break;
  }
  return `<svg class="vsvg" viewBox="0 0 64 48" aria-hidden="true">${p}</svg>`;
}
function rng(seed){let s=seed%2147483647||7;return()=>(s=s*16807%2147483647)/2147483647}
function leafSVG(g,dry){
  const [col,form]=dry||FAM.other.dry;
  if(form==='powder'){const h=6+Math.min(26,(g||0)*4);return `<svg viewBox="0 0 80 58" aria-hidden="true"><ellipse class="plate" cx="40" cy="52" rx="36" ry="5"/><path d="M${40-h*1.2} 51 Q40 ${51-h*2} ${40+h*1.2} 51 Z" fill="${col}"/></svg>`}
  const n=clamp(Math.round((g||0)*1.6),2,30);const R=rng(Math.round((g||1)*97)+col.length*13+form.length);
  const w=30,hMax=6+26*Math.min(1,n/30);const items=[];
  for(let i=0;i<n;i++){const x=(R()*2-1)*w*(.35+.65*Math.min(1,n/10));const cap=hMax*(1-Math.pow(x/w,2));const y=50-R()*Math.max(3,cap);items.push({x:40+x,y,a:Math.round(R()*180),k:R()})}
  items.sort((a,b)=>b.y-a.y);
  const shape=it=>{const f=`fill="${col}" style="filter:brightness(${(.8+it.k*.45).toFixed(2)})"`,X=it.x.toFixed(1),Y=it.y.toFixed(1);
    if(form==='ball')return `<circle cx="${X}" cy="${Y}" r="3.3" ${f}/>`;
    if(form==='chunk')return `<path d="M${(it.x-4).toFixed(1)} ${Y} l3 -3.5 l4.5 1 l1.5 3.5 l-3 3 l-4.5 -.5 z" ${f} transform="rotate(${it.a} ${X} ${Y})"/>`;
    const rx=form==='needle'?7:form==='bud'?5:form==='twist'?7:6,ry=form==='needle'?1.3:form==='bud'?2.1:form==='twist'?1.8:2.7;
    return `<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" ${f} transform="rotate(${it.a} ${X} ${Y})"/>`};
  return `<svg viewBox="0 0 80 58" aria-hidden="true"><ellipse class="plate" cx="40" cy="52" rx="36" ry="5"/><g class="leafs">${items.map(shape).join('')}</g></svg>`;
}
let bkN=0;
function beakerSVG(ml,cap){
  const scales=[50,100,150,200,250,300,400,500,750,1000,1500];const top=scales.find(s=>s>=Math.max(ml||0,cap||0)*1.1)||Math.ceil((ml||100)/500)*500;
  const y0=58,y1=12,h=y0-y1,f=clamp((ml||0)/top,0,1);const wy=y0-h*f;const id='bk'+(++bkN);
  let ticks='';for(let i=1;i<=4;i++){const y=y0-h*i/4;ticks+=`<line class="beaker-tick" x1="14" x2="${i%2?20:23}" y1="${y}" y2="${y}"/>`}
  return `<svg viewBox="0 0 56 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="M12 8 V56 C12 59 14 61 17 61 H39 C42 61 44 59 44 56 V8 Z"/></clipPath></defs>
  <rect class="beaker-water" x="10" y="${wy}" width="36" height="${62-wy}" clip-path="url(#${id})"/>
  <path class="beaker-glass" style="fill-opacity:.35" d="M12 8 V56 C12 59 14 61 17 61 H39 C42 61 44 59 44 56 V8 M9 8 H47"/>${ticks}
  <text x="47" y="${y1+4}" style="font-size:8px;fill:var(--ink-3);font-family:var(--f-mono)">${top}</text></svg>`;
}
function thermoSVG(temp,range,style){
  const cold=noTemp(style);const y0=48,y1=6,h=y0-y1,yv=v=>y0-h*clamp(v,0,100)/100;const tv=cold?3:(temp??0);
  return `<svg viewBox="0 0 44 64" aria-hidden="true"><rect class="thermo-tube" x="16" y="3" width="10" height="48" rx="5"/><circle class="thermo-tube" cx="21" cy="54" r="7.5"/>
  <rect class="${cold?'thermo-cold':'thermo-fill'}" x="18.5" y="${yv(tv)}" width="5" height="${54-yv(tv)}" rx="2.5"/><circle class="${cold?'thermo-cold':'thermo-fill'}" cx="21" cy="54" r="5"/>
  ${range&&!cold?`<line class="thermo-band" x1="31" x2="31" y1="${yv(range[1])}" y2="${yv(range[0])}"/>`:''}
  ${[0,50,100].map(v=>`<line class="beaker-tick" x1="11" x2="15" y1="${yv(v)}" y2="${yv(v)}"/>`).join('')}</svg>`;
}
function steepsSVG(steeps,rec,W=70,H=50){
  const st=(steeps||[]).map(s=>s.s);const n=Math.max(st.length,rec?.sched.length||0,1);const max=Math.max(...st,...(rec?rec.sched.slice(0,n):[]),1);const bw=Math.max(2,Math.min(8,(W-4)/n-2));
  const y=v=>H-4-Math.sqrt(v/max)*(H-10);let g=`<line class="beaker-tick" x1="0" x2="${W}" y1="${H-4}" y2="${H-4}"/>`;
  st.forEach((s,i)=>{const x=2+i*(W-4)/n;g+=`<rect x="${x}" y="${y(s)}" width="${bw}" height="${H-4-y(s)}" rx="1.5" style="fill:${steeps[i].liq?liqHex(steeps[i].liq):'var(--accent)'}"/>`});
  if(rec&&rec.sched.length>1)g+=`<polyline class="guide" points="${rec.sched.slice(0,n).map((s,i)=>`${(2+i*(W-4)/n+bw/2).toFixed(1)},${y(s).toFixed(1)}`).join(' ')}"/>`;
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`;
}
function setupStrip(b,rec,mini){
  const v=vesselOf(b);const n=(b.steeps||[]).length;const tea=teaById(b.teaId);const dry=b.dry||dryOf(tea||{fam:'other'});
  return `<div class="setup${mini?' mini':''}">
   <div class="tile wide"><div class="art">${vesselSVG(v.type)}</div>${mini?'':`<span class="cap">Vessel</span>`}<span class="nm">${esc(v.name)}</span></div>
   <div class="tile"><div class="art">${leafSVG(b.g,dry)}</div>${mini?'':`<span class="cap">Leaf</span>`}<b>${b.g||'—'} g</b>${!mini&&rec?benchHTML('leaf',b,rec):''}</div>
   <div class="tile"><div class="art">${beakerSVG(b.ml,v.ml)}</div>${mini?'':`<span class="cap">Water</span>`}<b>${b.ml||'—'} ml</b>${mini?'':`<span class="nm muted mono">${ratioStr(b)}</span>`}</div>
   <div class="tile"><div class="art">${thermoSVG(b.temp,rec?.t,b.style)}</div>${mini?'':`<span class="cap">Temp</span>`}<b>${fmtT(b.temp,b.style)}</b>${!mini&&rec?benchHTML('temp',b,rec):''}</div>
   <div class="tile"><div class="art">${steepsSVG(b.steeps,rec)}</div>${mini?'':`<span class="cap">Infusions</span>`}<b>${n}${b.rinse&&!mini?'<small class="muted" style="font-size:11px"> +rinse</small>':''}</b>${!mini&&rec?benchHTML('inf',b,rec):''}</div>
  </div>`;
}
function niceTicks(lo,hi,n){if(hi<=lo)hi=lo+1;const span=hi-lo,step0=span/n,mag=Math.pow(10,Math.floor(Math.log10(step0)));const step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=step0);const out=[];for(let v=Math.floor(lo/step)*step;v<=hi+step*.999;v+=step)out.push(r1(v));return out}
function radarSVG(series,{size=200,labels=true}={}){
  const n=AXES.length,cx=size/2,cy=size/2,R=size/2-(labels?34:8);
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*R*v/5,cy+Math.sin(a)*R*v/5]};
  let g='';for(let l=1;l<=5;l++)g+=`<polygon class="grid" points="${AXES.map((_,i)=>pt(i,l).join(',')).join(' ')}" ${l===5?'':'stroke-dasharray="2 3"'}/>`;
  AXES.forEach((_,i)=>{const[x,y]=pt(i,5);g+=`<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`});
  series.forEach(s=>{g+=`<polygon class="${s.cls||'area'}" points="${AXES.map(([k],i)=>pt(i,Math.max(0,s.v[k]||0)).join(',')).join(' ')}"/>`;if(!s.cls)AXES.forEach(([k],i)=>{const[x,y]=pt(i,s.v[k]||0);g+=`<circle class="vtx" cx="${x}" cy="${y}" r="2.5"/>`})});
  if(labels)AXES.forEach(([,lab],i)=>{const[x,y]=pt(i,6.15);const an=Math.abs(x-cx)<4?'middle':x>cx?'start':'end';g+=`<text x="${x}" y="${y+4}" text-anchor="${an}" class="lbl-strong">${lab}</text>`});
  return `<svg class="chart-svg" viewBox="-14 0 ${size+28} ${size}" role="img" aria-label="Palate profile">${g}</svg>`;
}
const hasAxes = b=>b.axes&&Object.values(b.axes).some(v=>v>0);
function compareChart(sessions,rec,prod){
  const W=720,H=260,pl=46,pr=16,pt=14,pb=34;
  const n=Math.max(rec.sched.length,prod?.sched.length||0,...sessions.map(s=>s.steeps.length),2);
  const all=[...rec.sched.map(s=>s*1.35),...(prod?prod.sched:[]),...sessions.flatMap(s=>s.steeps.map(x=>x.s))];const max=Math.max(...all,10);
  const sx=i=>pl+i/(n-1)*(W-pl-pr),sy=v=>H-pb-Math.sqrt(Math.max(0,v)/max)*(H-pb-pt);
  const cand=[5,10,20,30,45,60,90,120,180,300,600,1800,3600,7200,14400,28800];const ticks=cand.filter(t=>t<=max);const tk=ticks.length>6?ticks.filter((_,i)=>i%2===ticks.length%2):ticks;
  let g=tk.map(t=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${sy(t)}" y2="${sy(t)}"/><text x="${pl-8}" y="${sy(t)+4}" text-anchor="end">${fmtS(t)}</text>`).join('');
  for(let i=0;i<n;i++)g+=`<text x="${sx(i)}" y="${H-pb+16}" text-anchor="middle">${i+1}</text>`;
  g+=`<text x="${(pl+W-pr)/2}" y="${H-2}" text-anchor="middle" class="lbl-strong">Infusion</text>`;
  const sc=rec.sched;if(sc.length>1){const up=sc.map((s,i)=>`${sx(i)},${sy(s*1.35)}`),dn=sc.map((s,i)=>`${sx(i)},${sy(s*.75)}`).reverse();g+=`<polygon class="band" points="${up.concat(dn).join(' ')}"/><polyline class="guide" points="${sc.map((s,i)=>`${sx(i)},${sy(s)}`).join(' ')}"/>`}
  if(prod&&prod.sched.length>1)g+=`<polyline class="guide prod" points="${prod.sched.map((s,i)=>`${sx(i)},${sy(s)}`).join(' ')}"/>`;
  sessions.forEach((s,k)=>{const c='c'+(k%6+1);const pts=s.steeps.map((x,i)=>`${sx(i)},${sy(x.s)}`);if(pts.length>1)g+=`<polyline class="ln ${c}" points="${pts.join(' ')}"/>`;s.steeps.forEach((x,i)=>g+=`<circle class="${c}" cx="${sx(i)}" cy="${sy(x.s)}" r="3.5"><title>${fmtDate(s.at)} · infusion ${i+1}: ${fmtS(x.s)}</title></circle>`)});
  return `<div class="tbl-wrap"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" style="min-width:520px" role="img" aria-label="Steep times by infusion against the guide">${g}</svg></div>`;
}
function spark(st){if(!st||!st.length)return'';const m=Math.max(...st.map(s=>s.s));return `<span class="spark" aria-hidden="true">${st.slice(0,16).map(s=>`<i style="height:${Math.max(2,Math.round(s.s/m*18))}px;background:${s.liq?liqHex(s.liq):'var(--accent)'};opacity:1"></i>`).join('')}</span>`}
function liqStrip(b){const cols=(b.steeps||[]).map(s=>s.liq).filter(Boolean);if(!cols.length&&b.liq)cols.push(b.liq);return cols.length?`<div class="lstrip" title="Liquor by infusion">${cols.map(c=>`<i style="background:${liqHex(c)}"></i>`).join('')}</div>`:''}
const pips = n=>`<span class="pips" aria-label="${n||0} of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
const searchIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>';
