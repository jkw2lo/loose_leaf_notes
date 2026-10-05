/* ═════════ Utilities ═════════ */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const LS = {get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const r1 = n=>Math.round(n*10)/10;
const half = n=>Math.round(n*2)/2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const uid = p=>(p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const avg = a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const dt = iso=>new Date(iso);
const fmtDate = iso=>dt(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const fmtLong = iso=>dt(iso).toLocaleString(undefined,{weekday:'short',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
function fmtS(s){s=Math.round(s||0);if(s<60)return s+'s';if(s<3600){const m=Math.floor(s/60),x=s%60;return m+':'+String(x).padStart(2,'0')}const h=Math.floor(s/3600),m=Math.round((s%3600)/60);return h+'h'+(m?m+'m':'')}
function fmtLongS(s){s=Math.round(s||0);if(s<60)return s+' seconds';if(s<3600){const m=s/60;return (m%1?fmtS(s):m)+(m===1?' minute':' minutes')}const h=s/3600;return (h%1?r1(h):h)+(h===1?' hour':' hours')}
function fmtClock(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function parseS(str){str=String(str).trim().toLowerCase();if(!str)return null;let m;
  if((m=str.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m?)?$/)))return Math.round(+m[1]*3600+(+m[2]||0)*60);
  if((m=str.match(/^(\d+(?:\.\d+)?)\s*m(?:in)?(?:\s*(\d+)\s*s?)?$/)))return Math.round(+m[1]*60+(+m[2]||0));
  if((m=str.match(/^(\d+):(\d{1,2})$/)))return +m[1]*60+ +m[2];
  if((m=str.match(/^(\d+)\s*s?$/)))return +m[1];return null}
const parseSched = str=>String(str||'').split(/[,;\/]+|\s+(?=\d)/).map(x=>parseS(x)).filter(x=>x>0);
function toLocalInput(iso){const d=dt(iso);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600)}
const unitF = ()=>store.settings.unit==='F';
const toU = c=>unitF()?Math.round(c*9/5+32):Math.round(c);
const fromU = v=>unitF()?r1((v-32)*5/9):v;
const deg = ()=>'°'+(unitF()?'F':'C');
const noTemp = st=>st==='cold'||st==='ice';
const fmtT = (c,style)=>style==='cold'?'Fridge':style==='ice'?'Ice':(c==null||c===''?'—':toU(c)+deg());
const fmtTR = (r,style)=>style==='cold'?'Fridge, 2–8°C':style==='ice'?'Ice, melting':r[0]===r[1]?toU(r[0])+deg():`${toU(r[0])}–${toU(r[1])}${deg()}`;
const fmtGR = g=>g[0]===g[1]?`${g[0]} g`:`${g[0]}–${g[1]} g`;
const per100 = b=>b.g>0&&b.ml>0?r1(b.g/b.ml*100):null;
const ratioStr = b=>b.g>0&&b.ml>0?'1:'+Math.round(b.ml/b.g):'—';
const totalSteep = b=>(b.steeps||[]).reduce((a,s)=>a+(s.s||0),0);
const stage = c=>c>=99?'full boil':c>=90?'rolling':c>=80?'string of pearls':c>=70?'shrimp eyes':c>=50?'crab eyes':c>=20?'warm':'cold';
