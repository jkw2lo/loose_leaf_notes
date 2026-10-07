/* ═════════ Arrange mode & mockup export ═════════
   A drop-in layout editor with no dependencies. Copy this file into any project, mark up the page, call Arrange.init().

   Markup
     data-arr="key"           A container. Its direct [data-arr-item] children can be dragged to reorder and hidden.
     data-arr-grid            On a container: it is a grid of --arr-n equal columns (the page's CSS sets --arr-n), and
                              each item spans var(--arr-span) of them. Items can be resized by dragging their right edge.
     data-arr-auto            On a container: every direct child becomes a block automatically (id and label are taken
                              from its id, first heading or class). Explicit data-arr-item children keep their own ids.
     data-arr-item="id"       A block. data-arr-label names it in the editor; data-arr-span is its default width.
                              Every block can also be given a height (bottom edge) and, outside grids, a width (right edge).
     data-arr-split="key"     A two-column grid whose fixed column can be dragged wider or narrower. data-arr-fixed="1|2"
                              says which column is fixed; data-arr-min / data-arr-max bound it (px). The page's CSS
                              reads the width as var(--arr-w, <default>), so media queries can still collapse it.
     data-mock="type"         How the element appears in an exported mockup (for example "act.pill"), with optional
                              data-mock-label and data-mock-name. data-mock-skip leaves an element out. Unmarked headings,
                              tables, inputs and tab lists are exported too, unless they sit inside a marked element;
                              note.region, nav.sidetabs and anything with data-mock-open let their contents through.

   Arrange.init({
     name,                    Project name, used in exported mockups.
     load(), save(layout),    Read and write the saved layout ({key: {order, span, hide, h, wd, w}}).
     defaults,                Optional layout used under whatever the user saves.
     current(),               Name of the screen being shown.
     screens: [{name, show}], Every screen, for "Export all pages"; show() may be async.
     before(), restore(),     Called before and after exporting every page, to note and put back where you were.
     canExport(),             Return a message to block "Export all pages" (for example, unsaved work).
     shortcut: 'e'            Key that toggles arrange mode (ignored while typing).
   })
   Exports are UI Field Guide mockup files ({app, version, name, screens:[{sid, name, frame, notes, els, base}]}): open
   them with Open → Open a file. Widths are scaled to the tool's frame (1280 desktop, 834 tablet, 390 mobile). Each screen
   carries its original (base), so the tool's Copy for Claude → Changes only lists just what you changed.
   Arrange.toggle(on?)  Arrange.apply()  Arrange.exportMockup(all) */
(function(){
'use strict';
const S={on:false,o:{},raf:0};
const qa=(sel,r=document)=>[...r.querySelectorAll(sel)];
const kids=c=>[...c.children].filter(e=>e.hasAttribute('data-arr-item'));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const user=()=>{try{return S.o.load?.()||{}}catch{return {}}};
function eff(key){const d=S.o.defaults?.[key]||{},u=user()[key]||{};const m=k=>({...(d[k]||{}),...(u[k]||{})});return {...d,...u,span:m('span'),h:m('h'),wd:m('wd')}}
const setMap=(key,map,id,v)=>{const cur={...(user()[key]?.[map]||{})};v==null?delete cur[id]:cur[id]=v;setUser(key,{[map]:Object.keys(cur).length?cur:undefined})};
function setUser(key,patch){const all={...user()};const cur={...(all[key]||{}),...patch};Object.keys(cur).forEach(k=>cur[k]===undefined&&delete cur[k]);
  if(Object.keys(cur).length)all[key]=cur;else delete all[key];S.o.save?.(all);schedule()}
/* next frame, or a short timeout when frames are paused (a background tab) */
const nextFrame=fn=>{let done=false;const go=()=>{if(!done){done=true;fn()}};requestAnimationFrame(go);setTimeout(go,100)};
const schedule=()=>{if(!S.raf){S.raf=1;nextFrame(apply)}};

/* apply the saved layout: order, hidden blocks, widths. Runs after every DOM change, so re-rendered pages keep it. */
function apply(){S.raf=0;
  qa('[data-arr-auto]').forEach(autotag);
  qa('[data-arr]').forEach(c=>{const st=eff(c.dataset.arr);const items=kids(c);if(!items.length)return;
    items.forEach((e,i)=>{if(e._arrIdx==null)e._arrIdx=i});   // where the page first put it, so a reset can put it back
    const ix=e=>{const i=st.order?st.order.indexOf(e.dataset.arrItem):-1;return i<0?1e6+e._arrIdx:i};
    const sorted=items.slice().sort((a,b)=>ix(a)-ix(b)||a._arrIdx-b._arrIdx);
    if(sorted.some((e,i)=>e!==items[i])){const anchor=items[items.length-1].nextSibling;sorted.forEach(e=>c.insertBefore(e,anchor))}
    const grid=c.hasAttribute('data-arr-grid');
    items.forEach(e=>{const id=e.dataset.arrItem;e.classList.toggle('arr-off',!!st.hide?.includes(id));
      if(grid){const sp=st.span?.[id]??e.dataset.arrSpan;sp?e.style.setProperty('--arr-span',sp):e.style.removeProperty('--arr-span')}
      size(e,'--arr-h','arr-hset',st.h[id]);size(e,'--arr-iw','arr-wset',grid?null:st.wd[id])})});
  qa('[data-arr-split]').forEach(c=>{const w=eff(c.dataset.arrSplit).w;w?c.style.setProperty('--arr-w',w+'px'):c.style.removeProperty('--arr-w')});
  if(S.on)decorate();
}

function size(e,v,cls,px){if(px){e.style.setProperty(v,px+'px');e.classList.add(cls)}else if(e.classList.contains(cls)){e.style.removeProperty(v);e.classList.remove(cls)}}
/* data-arr-auto: make every direct child a block, named after its id, first heading or class */
const human=s=>{s=String(s).replace(/[-_]+/g,' ').trim();return s.charAt(0).toUpperCase()+s.slice(1)};
function autotag(c){const used=new Set(kids(c).map(e=>e.dataset.arrItem));
  [...c.children].forEach(e=>{if(e.hasAttribute('data-arr-item')||e.classList.contains('arr-ui')||/^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(e.tagName))return;
    const hd=e.matches('h1,h2,h3')?e:e.querySelector(':scope>h1,:scope>h2,:scope>h3,:scope>*>h1,:scope>*>h2,:scope>*>h3');
    const ht=(e.getAttribute('aria-label')||(hd?text(hd):'')).slice(0,40);
    const base=e.id||ht.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||[...e.classList].find(x=>!x.startsWith('arr-'))||e.tagName.toLowerCase();let id=base,n=2;while(used.has(id))id=base+'-'+n++;used.add(id);
    e.setAttribute('data-arr-item',id);if(!e.dataset.arrLabel)e.dataset.arrLabel=ht||human(base)})}

/* ── editor chrome ── */
const depth=e=>{let n=0,p=e.parentElement;while(p){if(p.hasAttribute?.('data-arr-item'))n++;p=p.parentElement}return n};
function gridCols(c){const cs=getComputedStyle(c);const cols=cs.gridTemplateColumns.split(' ').filter(x=>x&&x!=='none');return {n:cols.length,gap:parseFloat(cs.columnGap)||0,cols:cols.map(parseFloat),cs}}
function decorate(){
  qa('[data-arr]').forEach(c=>{const grid=c.hasAttribute('data-arr-grid');const n=grid?gridCols(c).n:0;
    kids(c).forEach(e=>{let ov=[...e.children].find(x=>x.classList.contains('arr-ov'));const label=e.dataset.arrLabel||e.dataset.arrItem;const off=e.classList.contains('arr-off');
      const sp=getComputedStyle(e).getPropertyValue('--arr-span').trim()||'1';
      const html=`<span class="arr-tag"><span class="arr-grip" aria-hidden="true">⠿</span>${esc(label)}${grid?`<span class="arr-span">${Math.min(+sp,n)}/${n}</span>`:''}</span><button type="button" class="arr-eye" data-arr-act="hide">${off?'Show':'Hide'}</button>${!grid||n>1?'<span class="arr-w" title="Drag to change the width. Double-click to reset."></span>':''}<span class="arr-hg" title="Drag to change the height. Double-click to reset."></span>`;
      if(!ov){ov=document.createElement('div');ov.className='arr-ui arr-ov';ov.tabIndex=0;ov.setAttribute('role','group');e.appendChild(ov)}
      ov.classList.toggle('arr-parent',!!e.querySelector('[data-arr-item]'));
      if(ov._h!==html){ov.innerHTML=html;ov._h=html}
      ov.setAttribute('aria-label',`${label}${off?', hidden':''}. Arrow keys move it, Shift with left and right changes its width, Shift with up and down its height, H hides it.`);
      ov.style.zIndex=40+depth(e)})});
  qa('[data-arr-split]').forEach(c=>{const {cols,gap,cs}=gridCols(c);let h=[...c.children].find(x=>x.classList.contains('arr-split'));
    if(cols.length<2){h?.remove();return}
    if(!h){h=document.createElement('div');h.className='arr-ui arr-split';h.tabIndex=0;h.setAttribute('role','separator');h.setAttribute('aria-orientation','vertical');h.innerHTML='<span class="arr-split-w"></span>';c.appendChild(h)}
    const f=c.dataset.arrFixed==='2'?2:1;const w=f===1?cols[0]:cols[cols.length-1];
    const x=f===1?parseFloat(cs.paddingLeft)+cols[0]+gap/2:c.clientWidth-parseFloat(cs.paddingRight)-cols[cols.length-1]-gap/2;
    h.style.left=(x-7)+'px';const lab=h.querySelector('.arr-split-w'),txt=Math.round(w)+' px';if(lab.textContent!==txt)lab.textContent=txt;
    h.setAttribute('aria-label',`Column width ${Math.round(w)} pixels. Left and right arrows resize, Home resets.`);h.setAttribute('aria-valuenow',Math.round(w))});
}
const undecorate=()=>qa('.arr-ov,.arr-split,.arr-mark').forEach(e=>e.remove());

/* ── drag to reorder, drag the edge to resize, drag the splitter ── */
let D=null;
function onDown(ev){if(!S.on||ev.button>0)return;const t=ev.target;
  const sp=t.closest('.arr-split');if(sp){const c=sp.parentElement;const {cols}=gridCols(c);const f=c.dataset.arrFixed==='2'?2:1;
    D={k:'split',c,f,x0:ev.clientX,w0:f===1?cols[0]:cols[cols.length-1],min:+c.dataset.arrMin||160,max:+c.dataset.arrMax||800};start(ev,sp);return}
  const ov=t.closest('.arr-ov');if(!ov||t.closest('[data-arr-act]'))return;const item=ov.parentElement,c=item.parentElement;
  if(t.closest('.arr-w')){if(c.hasAttribute('data-arr-grid')){const {n,gap,cols}=gridCols(c);D={k:'span',item,c,n,gap,col:cols[0]||1}}else D={k:'wd',item,c};start(ev,ov);return}
  if(t.closest('.arr-hg')){D={k:'h',item,c};start(ev,ov);return}
  D={k:'move',item,c,x0:ev.clientX,y0:ev.clientY,moved:false};start(ev,ov)}
function start(ev,el){ev.preventDefault();try{el.setPointerCapture(ev.pointerId)}catch{}document.body.classList.add('arr-busy')}
function onMove(ev){if(!D)return;
  if(D.k==='split'){const dx=ev.clientX-D.x0;D.w=Math.round(clamp(D.w0+(D.f===1?dx:-dx),D.min,D.max));D.c.style.setProperty('--arr-w',D.w+'px');decorate();return}
  if(D.k==='wd'){const r=D.item.getBoundingClientRect();D.v=Math.round(clamp(ev.clientX-r.left,40,D.c.clientWidth));size(D.item,'--arr-iw','arr-wset',D.v);decorate();return}
  if(D.k==='h'){const r=D.item.getBoundingClientRect();D.v=Math.round(clamp(ev.clientY-r.top,24,4000));size(D.item,'--arr-h','arr-hset',D.v);decorate();return}
  if(D.k==='span'){const r=D.item.getBoundingClientRect();D.span=clamp(Math.round((ev.clientX-r.left+D.gap)/(D.col+D.gap)),1,D.n);D.item.style.setProperty('--arr-span',D.span);decorate();return}
  const dx=ev.clientX-D.x0,dy=ev.clientY-D.y0;if(!D.moved&&Math.hypot(dx,dy)<5)return;D.moved=true;
  D.item.classList.add('arr-dragging');D.item.style.translate=`${dx}px ${dy}px`;D.target=dropTarget(D,ev.clientX,ev.clientY);mark(D.target)}
function onUp(){if(!D)return;const d=D;D=null;document.body.classList.remove('arr-busy');
  if(d.k==='split'){if(d.w!=null)setUser(d.c.dataset.arrSplit,{w:d.w});return}
  if(d.k==='span'){if(d.span!=null)setMap(d.c.dataset.arr,'span',d.item.dataset.arrItem,d.span);return}
  if(d.k==='wd'||d.k==='h'){if(d.v!=null)setMap(d.c.dataset.arr,d.k,d.item.dataset.arrItem,d.v);return}
  d.item.classList.remove('arr-dragging');d.item.style.translate='';qa('.arr-mark').forEach(e=>e.remove());
  if(d.moved&&d.target){const {sib,before}=d.target;d.c.insertBefore(d.item,before?sib:sib.nextSibling);saveOrder(d.c)}}
function dropTarget(d,x,y){let best=null,bd=1e9;
  kids(d.c).filter(e=>e!==d.item).forEach(sib=>{const r=sib.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const dist=Math.hypot(x-cx,y-cy);
    if(dist<bd){bd=dist;const row=Math.abs(y-cy)<r.height/2;best={sib,r,row,before:row?x<cx:y<cy}}});return best}
function mark(t){let m=document.querySelector('.arr-mark');if(!t){m?.remove();return}
  if(!m){m=document.createElement('div');m.className='arr-ui arr-mark';document.body.appendChild(m)}
  const r=t.r;Object.assign(m.style,t.row?{left:(t.before?r.left-4:r.right+1)+'px',top:r.top+'px',width:'3px',height:r.height+'px'}:{left:r.left+'px',top:(t.before?r.top-4:r.bottom+1)+'px',width:r.width+'px',height:'3px'})}
const saveOrder=c=>setUser(c.dataset.arr,{order:kids(c).map(e=>e.dataset.arrItem)});
function toggleHide(item){const key=item.parentElement.dataset.arr,id=item.dataset.arrItem;const h=new Set(eff(key).hide||[]);h.has(id)?h.delete(id):h.add(id);setUser(key,{hide:[...h]})}
function onClick(ev){if(!S.on)return;const b=ev.target.closest('[data-arr-act]');
  if(!b){if(ev.target.closest('.arr-ov,.arr-split')){ev.preventDefault();ev.stopPropagation()}return}ev.preventDefault();ev.stopPropagation();
  const a=b.dataset.arrAct;if(a==='hide')return toggleHide(b.closest('[data-arr-item]'));bar[a]?.()}
function onDbl(ev){if(!S.on)return;const g=ev.target.closest('.arr-w,.arr-hg');if(!g)return;ev.preventDefault();ev.stopPropagation();const item=g.closest('[data-arr-item]'),c=item.parentElement;
  const map=g.classList.contains('arr-hg')?'h':c.hasAttribute('data-arr-grid')?'span':'wd';setMap(c.dataset.arr,map,item.dataset.arrItem,null)}
function onKey(ev){const t=ev.target;
  if(!S.on){if(S.o.shortcut&&ev.key===S.o.shortcut&&!ev.metaKey&&!ev.ctrlKey&&!ev.altKey&&!t.closest?.('input,textarea,select,[contenteditable]'))toggle(true);return}
  if(ev.key==='Escape'||(ev.key===S.o.shortcut&&!t.closest?.('input,textarea,select,[contenteditable]'))){ev.preventDefault();ev.stopPropagation();toggle(false);return}
  if(t.classList?.contains('arr-split')){const c=t.parentElement,key=c.dataset.arrSplit;const {cols}=gridCols(c);const f=c.dataset.arrFixed==='2'?2:1;const w=f===1?cols[0]:cols[cols.length-1];
    if(ev.key==='Home'){ev.preventDefault();setUser(key,{w:undefined});return}
    const d={ArrowLeft:-10,ArrowRight:10}[ev.key];if(d){ev.preventDefault();setUser(key,{w:Math.round(clamp(w+(f===1?d:-d),+c.dataset.arrMin||160,+c.dataset.arrMax||800))})}return}
  if(!t.classList?.contains('arr-ov'))return;const item=t.parentElement,c=item.parentElement;const dir={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1}[ev.key];
  if(ev.key==='h'||ev.key==='H'){ev.preventDefault();toggleHide(item);return}
  if(!dir)return;ev.preventDefault();
  if(ev.shiftKey){const key=c.dataset.arr,id=item.dataset.arrItem,r=item.getBoundingClientRect();
    if(ev.key==='ArrowUp'||ev.key==='ArrowDown')return setMap(key,'h',id,Math.round(Math.max(24,r.height+dir*10)));
    if(c.hasAttribute('data-arr-grid')){const {n}=gridCols(c);const cur=+getComputedStyle(item).getPropertyValue('--arr-span')||1;return setMap(key,'span',id,clamp(cur+dir,1,n))}
    return setMap(key,'wd',id,Math.round(clamp(r.width+dir*10,40,c.clientWidth)))}
  const sib=kids(c);const i=sib.indexOf(item),j=i+dir;if(j<0||j>=sib.length)return;
  c.insertBefore(item,dir<0?sib[j]:sib[j].nextSibling);saveOrder(c);requestAnimationFrame(()=>[...item.children].find(x=>x.classList.contains('arr-ov'))?.focus())}

/* ── toolbar ── */
const bar={
  done:()=>toggle(false),
  reset(){const all={...user()};qa('[data-arr]').forEach(c=>delete all[c.dataset.arr]);qa('[data-arr-split]').forEach(c=>delete all[c.dataset.arrSplit]);S.o.save?.(all);
    schedule();say('Layout reset for this page')},
  layout(){share(JSON.stringify({layout:user()},null,1),'layout.json','Layout copied. Paste it to bake it in as the default.')},
  async page(){const m=await exportMockup(false);share(JSON.stringify(m,null,1),slug(m.name)+'.json','Mockup downloaded and copied. Open it in UI Field Guide with Open → Open a file')},
  async all(){const why=S.o.canExport?.();if(why){say(why);return}say('Exporting every page…');const m=await exportMockup(true);share(JSON.stringify(m,null,1),slug(m.name)+'.json',`Mockup of ${m.screens.length} pages downloaded. Open it in UI Field Guide with Open → Open a file`)}
};
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'mockup';
function barHTML(){return `<div class="arr-ui arr-bar" role="toolbar" aria-label="Arrange mode"><b>Arrange</b><span class="arr-hint">Drag blocks to reorder · drag the right or bottom edge, or a column divider, to resize · double-click an edge to reset</span><span class="arr-msg" role="status" aria-live="polite"></span>
  <button type="button" data-arr-act="reset">Reset page</button><button type="button" data-arr-act="layout">Copy layout</button><button type="button" data-arr-act="page">Export page</button>${S.o.screens?.length?'<button type="button" data-arr-act="all">Export all pages</button>':''}<button type="button" class="arr-done" data-arr-act="done">Done</button></div>`}
function say(msg){const m=document.querySelector('.arr-msg');if(m){m.textContent=msg;clearTimeout(say._t);say._t=setTimeout(()=>m.textContent='',4000)}}
async function share(text,file,msg){let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch{}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=file;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}catch{}
  if(ok)say(msg);else showText(text)}
function showText(text){let p=document.querySelector('.arr-text');if(!p){p=document.createElement('div');p.className='arr-ui arr-text';document.body.appendChild(p)}
  p.innerHTML=`<p>Copy this text:</p><textarea readonly aria-label="Exported JSON"></textarea><button type="button">Close</button>`;p.querySelector('textarea').value=text;p.querySelector('textarea').select();p.querySelector('button').onclick=()=>p.remove()}

function toggle(on=!S.on){if(on===S.on)return;S.on=on;document.body.classList.toggle('arr-on',on);
  if(on){document.body.insertAdjacentHTML('beforeend',barHTML());apply();document.querySelector('.arr-ov')?.focus({preventScroll:true})}
  else{qa('.arr-bar,.arr-text').forEach(e=>e.remove());undecorate()}}

/* ── mockup export: a UI Field Guide mockup file. Element types are the tool's codes; unknown ones fall back to note.box. ── */
const ALIAS={'inp.search':'in.search','inp.text':'in.text','inp.date':'in.date','inp.textarea':'in.textarea','sel.dropdown':'sel.select','sel.gradient':'sel.swatch'};
const FRAMES={desktop:1280,tablet:834,mobile:390};
function guess(e){const tag=e.tagName,ty=(e.getAttribute('type')||'').toLowerCase();
  if(tag==='H1')return 'txt.heading';if(tag==='H2')return 'txt.sub';if(tag==='TABLE')return 'data.table';if(tag==='SELECT')return 'sel.select';if(tag==='TEXTAREA')return 'in.textarea';
  if(e.getAttribute('role')==='tablist')return 'nav.pills';if(tag==='INPUT')return ty==='range'?'sel.slider':ty==='search'?'in.search':ty==='date'||ty==='datetime-local'?'in.date':'in.text';return 'note.box'}
const text=e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim();
function labelOf(e,type){if(e.dataset.mockLabel)return e.dataset.mockLabel;
  if(type==='data.table')return qa('th',e).filter(th=>th.closest('thead')).map(text).filter(Boolean).join(', ');
  if(e.tagName==='SELECT')return [...e.options].map(o=>o.text).join(', ');
  if(e.tagName==='INPUT'||e.tagName==='TEXTAREA'){const l=e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`);const wrap=e.closest('label');return e.getAttribute('aria-label')||(l&&text(l))||(wrap&&text(wrap))||e.placeholder||''}
  if(e.getAttribute('role')==='tablist')return qa('[role=tab]',e).map(text).join(', ');
  return e.getAttribute('aria-label')||text(e).slice(0,80)}
/* regions and tab panels are containers: what's inside them is exported too. Other marked elements are leaves. */
const OPEN=new Set(['note.region','nav.sidetabs']);
const closedIn=e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.dataset?.mock&&!OPEN.has(p.dataset.mock)&&!p.hasAttribute('data-mock-open'))return true;return false};
function measure(name,sid){
  const W=document.documentElement.clientWidth;const frame=W>=1024?'desktop':W>=600?'tablet':'mobile';const k=FRAMES[frame]/W;const out=[];
  const add=(e,type)=>{const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return;
    const el={type:ALIAS[type]||type,x:Math.round((r.left+scrollX)*k),y:Math.round((r.top+scrollY)*k),w:Math.round(r.width*k),h:Math.round(r.height*k),t:labelOf(e,type)};
    if(e.dataset.mockNote)el.note=e.dataset.mockNote;out.push(el)};
  qa('[data-mock]').forEach(e=>{if(!e.closest('.arr-ui,[data-mock-skip]'))add(e,e.dataset.mock)});
  qa('h1,h2,table,select,textarea,input[type=range],input[type=search],input[type=text],input[type=date],input[type=datetime-local],[role=tablist]').forEach(e=>{if(!e.hasAttribute('data-mock')&&!e.closest('[data-mock-skip],.arr-ui')&&!closedIn(e))add(e,guess(e))});
  out.sort((a,b)=>a.y-b.y||a.x-b.x);out.forEach((e,i)=>e.bid=`${sid}-${i+1}`);
  // base: the page as it is now, so the tool's Copy for Claude → Changes only can list just what you change
  return {sid,name,frame,notes:`Measured from the live page at ${W}px wide${Math.abs(k-1)>.01?`, scaled to the ${FRAMES[frame]}px frame`:''}.`,els:out,
   base:{title:name,url:/^https?:/.test(location.href)?location.href.split('#')[0]:'',at:Date.now(),els:out.map(e=>({...e}))},guides:[],layout:''}}
const frames=n=>new Promise(r=>{const f=k=>k?nextFrame(()=>f(k-1)):setTimeout(r,60);f(n)});
async function exportMockup(all){const wasOn=S.on;if(wasOn){undecorate();document.body.classList.remove('arr-on')}
  const y=scrollY;const screens=[];const sid=(n,i)=>(slug(n)||'screen')+'-'+(i+1);
  try{if(all){await S.o.before?.();for(const [i,sc] of (S.o.screens||[]).entries()){await sc.show();scrollTo(0,0);await frames(2);screens.push(measure(sc.name,sid(sc.name,i)))}await S.o.restore?.()}
   else{const n=S.o.current?.()||document.title;scrollTo(0,0);await frames(1);screens.push(measure(n,sid(n,0)))}}
  finally{scrollTo(0,all?0:y);if(wasOn){document.body.classList.add('arr-on');apply()}}
  return {app:'ui-field-guide',version:2,name:all?S.o.name||document.title:`${S.o.name||document.title} – ${screens[0]?.name||''}`,style:null,screens,cur:screens[0]?.sid}}

function init(o){S.o=o||{};
  if(!document.getElementById('arr-style')){const st=document.createElement('style');st.id='arr-style';st.textContent=STYLES;document.head.appendChild(st)}
  const ours=n=>n.nodeType===1?!!n.closest('.arr-ui'):!!n.parentElement?.closest('.arr-ui');
  new MutationObserver(ms=>{if(ms.some(m=>!ours(m.target)&&[...m.addedNodes,...m.removedNodes].some(n=>!(n.classList?.contains('arr-ui')))))schedule()}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointerdown',onDown,true);document.addEventListener('pointermove',onMove);document.addEventListener('pointerup',onUp);document.addEventListener('pointercancel',onUp);
  document.addEventListener('click',onClick,true);document.addEventListener('dblclick',onDbl,true);document.addEventListener('keydown',onKey,true);
  addEventListener('resize',()=>{if(S.on)schedule()});schedule()}
/* the editor's own styles, so the file works on its own. --arr-n (columns), --arr-span and --arr-w come from the page. */
const STYLES=`:root{--arr-c:#2563eb}
:where([data-arr-grid]){display:grid;grid-template-columns:repeat(var(--arr-n,6),minmax(0,1fr))}
:where([data-arr-grid])>:where([data-arr-item]){grid-column:span min(var(--arr-span,1),var(--arr-n,6))}
body:not(.arr-on) .arr-off{display:none!important}
body.arr-on [data-arr-item],body.arr-on [data-arr-split]{position:relative}
body.arr-on .arr-off{opacity:.45}
body.arr-busy,body.arr-busy *{user-select:none!important;cursor:grabbing!important}
.arr-ov{position:absolute;inset:0;border:1.5px dashed var(--arr-c);border-radius:inherit;background:color-mix(in srgb,var(--arr-c) 5%,transparent);cursor:grab;touch-action:none;min-height:24px}
.arr-ov:hover{background:color-mix(in srgb,var(--arr-c) 10%,transparent)}
.arr-ov:focus-visible{outline:3px solid var(--arr-c);outline-offset:2px}
.arr-off>.arr-ov{background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--arr-c) 14%,transparent) 0 6px,transparent 6px 12px)}
.arr-tag{position:absolute;left:6px;top:6px;display:inline-flex;gap:6px;align-items:center;max-width:calc(100% - 70px);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--arr-c);color:#fff;font:600 11px/1.3 system-ui,sans-serif;padding:3px 8px;border-radius:6px;pointer-events:none}
.arr-span{opacity:.75;font-weight:500}
.arr-parent>.arr-tag{top:-10px;left:10px;font-size:10px;padding:2px 7px}
.arr-parent>.arr-eye{top:-10px;right:10px;font-size:10px;padding:2px 7px}
.arr-eye{position:absolute;right:6px;top:6px;font:600 11px/1.3 system-ui,sans-serif;padding:3px 8px;border-radius:6px;border:1px solid var(--arr-c);background:#fff;color:var(--arr-c);cursor:pointer}
.arr-w{position:absolute;top:50%;right:-6px;width:10px;height:40px;max-height:80%;transform:translateY(-50%);border-radius:5px;background:var(--arr-c);box-shadow:0 0 0 2px #fff;cursor:ew-resize}
.arr-dragging{opacity:.65;z-index:100}
.arr-hset{height:var(--arr-h)!important;min-height:0!important;overflow:auto}
.arr-wset{width:var(--arr-iw)!important;max-width:100%;flex:none!important;min-width:0!important}
.arr-hg{position:absolute;left:50%;bottom:-6px;width:40px;max-width:60%;height:10px;transform:translateX(-50%);border-radius:5px;background:var(--arr-c);box-shadow:0 0 0 2px #fff;cursor:ns-resize}
.arr-parent>.arr-w,.arr-parent>.arr-hg{opacity:.55}
.arr-split{position:absolute;top:0;bottom:0;width:14px;z-index:60;display:grid;place-items:center;cursor:col-resize;touch-action:none}
.arr-split::before{content:"";position:absolute;top:0;bottom:0;left:6px;width:2px;background:var(--arr-c);opacity:.55}
.arr-split:hover::before,.arr-split:focus-visible::before{opacity:1;width:3px}
.arr-split:focus-visible{outline:none}
.arr-split-w{position:sticky;top:45vh;background:var(--arr-c);color:#fff;font:600 10px/1.3 system-ui,sans-serif;padding:2px 5px;border-radius:4px;white-space:nowrap}
.arr-mark{position:fixed;z-index:2147483646;background:var(--arr-c);border-radius:2px;pointer-events:none}
.arr-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:max-content;max-width:calc(100% - 24px);padding:8px 10px 8px 14px;border-radius:14px;background:#15181c;color:#fff;font:13px/1.3 system-ui,sans-serif;box-shadow:0 12px 40px -8px rgba(0,0,0,.5)}
.arr-bar button{font:600 12.5px/1.2 system-ui,sans-serif;padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#fff;cursor:pointer}
.arr-bar button:hover{background:rgba(255,255,255,.1)}
.arr-bar .arr-done{background:var(--arr-c);border-color:var(--arr-c)}
.arr-hint{opacity:.65;font-size:12px}
.arr-msg{color:#8fe3bf;font-size:12px}
.arr-text{position:fixed;left:50%;top:10vh;transform:translateX(-50%);z-index:2147483647;width:min(640px,calc(100% - 24px));display:grid;gap:8px;padding:14px;border-radius:12px;background:#15181c;color:#fff;font:13px system-ui,sans-serif}
.arr-text textarea{height:50vh;font:12px ui-monospace,monospace}
@media (max-width:760px){.arr-hint{display:none}.arr-bar{bottom:8px}}`;
window.Arrange={init,toggle,apply:()=>apply(),exportMockup,get on(){return S.on}};
})();
