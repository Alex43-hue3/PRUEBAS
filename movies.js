/* NETVISION CATALOG — catálogo, categorías, paginación y filtro */
'use strict';
(function(){
 const C={mode:'movies',page:1,items:[],hasNext:false,busy:false,totalPages:0,genre:'Todos',prefetching:false,genreList:[],query:''};
 function setText(id,v){const e=NV.$(id);if(e)e.textContent=v||''}
 function placeholder(title){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="100%" height="100%" fill="#0a1220"/><text x="50%" y="50%" fill="#4388ff" font-size="32" text-anchor="middle" font-family="Arial">${title}</text></svg>`)}
 function itemGenres(item){return (item.genres||[]).map(g=>String(g).trim()).filter(Boolean)}
 function uniqueById(items){const seen=new Set();return items.filter(x=>{const k=String(x.id||x.title).toLowerCase();if(seen.has(k))return false;seen.add(k);return true})}
 function renderGenres(){
   const box=NV.$('#catalogGenres');if(!box)return;
   const fromItems=C.items.flatMap(itemGenres);
   const all=[...new Set(['Todos',...C.genreList,...fromItems].map(x=>String(x).trim()).filter(Boolean))];
   box.innerHTML=all.map(g=>`<button class="genre-chip ${g===C.genre?'active':''}" data-genre="${NV.esc(g)}">${NV.esc(g)}</button>`).join('');
   NV.$$('#catalogGenres .genre-chip').forEach(b=>b.onclick=async()=>{C.genre=b.dataset.genre;renderGenres();renderItems();if(C.genre!=='Todos'&&!C.items.some(x=>itemGenres(x).some(g=>NV.norm(g)===NV.norm(C.genre)))){await prefetchAll();renderGenres();renderItems()}});
 }
 function visibleItems(){
   if(C.genre==='Todos')return C.items;
   const q=NV.norm(C.genre);return C.items.filter(x=>itemGenres(x).some(g=>NV.norm(g)===q||NV.norm(g).includes(q)||q.includes(NV.norm(g))));
 }
 function render(items=C.items){
   const g=NV.$('#catalogGrid');if(!g)return;g.innerHTML='';
   if(!items.length){g.innerHTML=`<div class="empty-catalog"><i class="fa-solid fa-film"></i><h2>No se encontró contenido</h2><p>Prueba otra categoría o actualiza el catálogo.</p><button id="retryCatalog" class="primary-btn">Reintentar</button></div>`;NV.$('#retryCatalog').onclick=()=>NVCatalog.load(C.mode);return}
   items.forEach(item=>{const c=document.createElement('article');c.className='catalog-card';const poster=item.image||item.banner||placeholder('NETVISION');const genres=itemGenres(item).slice(0,2).join(' · ');c.innerHTML=`<div class="catalog-poster"><img src="${NV.esc(poster)}" alt="${NV.esc(item.title)}" loading="lazy"><span class="rating">★ ${NV.esc(item.rating||'—')}</span><button class="play-card" aria-label="Reproducir"><i class="fa-solid fa-play"></i></button></div><div class="catalog-info"><h3 title="${NV.esc(item.title)}">${NV.esc(item.title)}</h3><span>${NV.esc(item.year||'')} · ${NV.esc(genres|| (C.mode==='movies'?'Película':'Serie'))}</span></div>`;c.onclick=()=>NV.openMedia(item,C.mode);c.querySelector('.play-card').onclick=e=>{e.stopPropagation();NV.openMedia(item,C.mode)};g.appendChild(c)})
 }
 function filteredBySearch(items){const q=NV.norm(C.query);if(!q)return items;return items.filter(x=>NV.norm([x.title,x.year,x.description,...itemGenres(x)].join(' ')).includes(q));}
 function renderItems(){const v=filteredBySearch(visibleItems());const label=C.mode==='movies'?'películas':'series';setText('#catalogStatus',`${v.length} ${label}${C.genre!=='Todos'?' en '+C.genre:''}${C.query?' · búsqueda: '+C.query:''}`);render(v);NV.$('#catalogMore')?.classList.toggle('hidden',!C.hasNext||C.genre!=='Todos'||!!C.query);NV.$('#catalogSearchClear')?.classList.toggle('hidden',!C.query)}
 async function prefetchAll(){
   if(C.prefetching)return;
   C.prefetching=true;
   try{
     let guard=0;
     while(C.hasNext&&guard<30){guard++;const next=C.page+1;const r=await NVApi.list(C.mode,next);if(!r.items.length)break;C.items=uniqueById([...C.items,...r.items]);C.page=next;C.hasNext=r.hasNext;C.totalPages=r.totalPages||C.totalPages;NV.state.catalogItems[C.mode]=C.items.slice();renderGenres();if(C.genre==='Todos')render(C.items);}
   }catch(e){console.warn('[NETVISION] prefetch',e)}finally{C.prefetching=false}
 }
 let searchSeq=0;
 async function runCatalogSearch(value){
   C.query=String(value||'').trim();renderGenres();renderItems();
   if(!C.query){return}
   const seq=++searchSeq;
   const local=filteredBySearch(visibleItems());
   if(local.length || !C.hasNext)return;
   setText('#catalogStatus','Buscando en todo el catálogo…');
   await prefetchAll();
   if(seq!==searchSeq)return;
   renderGenres();renderItems();
 }
 NV.$('#catalogSearch')?.addEventListener('input',e=>{clearTimeout(NV.$('#catalogSearch')._t);NV.$('#catalogSearch')._t=setTimeout(()=>runCatalogSearch(e.target.value),180)});
 NV.$('#catalogSearchClear')?.addEventListener('click',()=>{if(NV.$('#catalogSearch')){NV.$('#catalogSearch').value='';runCatalogSearch('');NV.$('#catalogSearch').focus()}});
 window.NVCatalog={
   ...C,
   async load(mode){
     C.mode=mode;C.page=1;C.items=[];C.hasNext=false;C.genre='Todos';C.totalPages=0;C.genreList=[];C.query='';
     setText('#catalogTitle',mode==='movies'?'Películas':'Series');setText('#catalogEyebrow',mode==='movies'?'PELÍCULAS':'SERIES');setText('#catalogSubtitle',mode==='movies'?'Explora películas por categoría.':'Explora series por categoría, temporadas y episodios.');
     NV.$('#catalogGenres').innerHTML='';if(NV.$('#catalogSearch'))NV.$('#catalogSearch').value='';NV.show('#catalogLoading');
     try{
       const r=await NVApi.list(mode,1);C.items=uniqueById(r.items||[]);C.hasNext=!!r.hasNext;C.totalPages=r.totalPages||0;NV.state.catalogItems[mode]=C.items.slice();
       try{const gs=await NVApi.genres();C.genreList=(gs||[]).map(x=>typeof x==='string'?x:(x?.name||x?.title||x?.genre||'')).filter(Boolean)}catch{}
       renderGenres();renderItems();
       if(C.hasNext) prefetchAll();
       NV.$('#catalogMore')?.classList.toggle('hidden',!C.hasNext);
       if(!C.items.length)NV.toast('No se encontraron títulos.');
     }catch(e){console.error(e);setText('#catalogStatus','Error consultando el catálogo');render([]);NV.toast('No se pudo cargar el catálogo')}finally{NV.hide('#catalogLoading')}
   },
   async more(){
     if(C.busy||!C.hasNext)return;C.busy=true;NV.show('#catalogLoading');
     try{const r=await NVApi.list(C.mode,C.page+1);C.items=uniqueById([...C.items,...(r.items||[])]);C.page++;C.hasNext=!!r.hasNext;NV.state.catalogItems[C.mode]=C.items.slice();renderGenres();renderItems()}finally{C.busy=false;NV.hide('#catalogLoading')}
   },
   get items(){return C.items},
   get mode(){return C.mode}
 };
 NV.$('#catalogMore')?.addEventListener('click',()=>NVCatalog.more());
})();
