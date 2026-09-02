/* NETVISION FINAL APP — interfaz principal y navegación */
'use strict';
const NV=window.NV={
 state:{view:'home',profiles:[],activeProfile:null,channels:[],filteredChannels:[],category:'Todos',channelIndex:-1,tvHls:null,mediaHls:null,currentMedia:null,catalog:{movies:{},series:{}},catalogItems:{movies:[],series:[]}},
 $:s=>document.querySelector(s), $$:s=>[...document.querySelectorAll(s)],
 esc:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 norm:v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(),
 show:s=>NV.$(s)?.classList.remove('hidden'), hide:s=>NV.$(s)?.classList.add('hidden'),
 toast:m=>{const t=NV.$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400)},
 stopElement(v){if(!v)return;try{v.pause()}catch{}try{v.removeAttribute('src')}catch{}try{v.load()}catch{}}
};
NV.listKey=()=>`netvision_mylist_v1_${NV.state.activeProfile?.id||'guest'}`;
NV.getMyList=()=>{try{const v=JSON.parse(localStorage.getItem(NV.listKey())||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
NV.saveMyList=list=>localStorage.setItem(NV.listKey(),JSON.stringify(list));
NV.itemListKey=(item,kind)=>`${kind}:${String(item?.id||item?.slug||item?.url||item?.link||item?.title||'').trim()}`;
NV.channelListKey=c=>`channel:${String(c?.id||c?.url||c?.name||'').trim()}`;
NV.isInMyList=(item,kind)=>NV.getMyList().some(x=>x.key===NV.itemListKey(item,kind));
NV.isChannelInMyList=c=>NV.getMyList().some(x=>x.key===NV.channelListKey(c));
NV.toggleMyList=(item,kind)=>{
 const key=NV.itemListKey(item,kind), list=NV.getMyList(), found=list.findIndex(x=>x.key===key);
 if(found>=0){list.splice(found,1);NV.saveMyList(list);NV.toast('Eliminado de Mi lista');}
 else{list.unshift({key,type:kind,title:item.title||'Sin título',image:item.image||item.banner||'',year:item.year||'',description:item.description||'',genres:item.genres||[]});NV.saveMyList(list);NV.toast('Agregado a Mi lista');}
 NV.updateListButtons?.(); NV.renderMyList?.();
};
NV.toggleChannelMyList=c=>{
 const key=NV.channelListKey(c),list=NV.getMyList(),found=list.findIndex(x=>x.key===key);
 if(found>=0){list.splice(found,1);NV.saveMyList(list);NV.toast('Canal eliminado de Mi lista');}
 else{list.unshift({key,type:'channel',title:c.name||'Canal',group:c.group||'TV EN VIVO',logo:c.logo||'',url:c.url||'',id:c.id||''});NV.saveMyList(list);NV.toast('Canal agregado a Mi lista');}
 NV.updateListButtons?.();NV.renderMyList?.();
};
NV.updateListButtons=()=>{
 const b=NV.$('#mediaListBtn'), m=NV.state.currentMedia;
 if(b&&m){const yes=NV.isInMyList(m.item,m.mode);b.classList.toggle('saved',yes);b.querySelector('i')?.classList.toggle('fa-regular',!yes);b.querySelector('i')?.classList.toggle('fa-solid',yes);const sp=b.querySelector('span');if(sp)sp.textContent=yes?'En mi lista':'Agregar a mi lista';}
 const tb=NV.$('#tvListBtn'),idx=NV.state.channelIndex,c=idx>=0?NV.state.channels[idx]:null;
 if(tb&&c){const yes=NV.isChannelInMyList(c);tb.classList.toggle('saved',yes);tb.querySelector('i')?.classList.toggle('fa-regular',!yes);tb.querySelector('i')?.classList.toggle('fa-solid',yes);const sp=tb.querySelector('span');if(sp)sp.textContent=yes?'En mi lista':'Agregar a mi lista';}
};
NV.openMyList=()=>{NV.$('#myListModal')?.classList.remove('hidden');NV.renderMyList?.()};
NV.renderMyList=()=>{
 const box=NV.$('#myListResults');if(!box)return;const list=NV.getMyList();
 if(!list.length){box.innerHTML='<div class="list-empty"><i class="fa-regular fa-bookmark"></i><strong>Tu lista está vacía</strong><small>Agrega películas, series o canales desde sus pantallas.</small></div>';return}
 box.innerHTML=list.map((x,i)=>{
   const img=x.image||x.logo||''; const kind=x.type==='channel'?'TV EN VIVO':x.type==='series'?'SERIE':'PELÍCULA';
   return `<article class="saved-item"><button class="saved-main" data-i="${i}">${img?`<img src="${NV.esc(img)}" alt="">`:'<span class="saved-placeholder"><i class="fa-solid fa-tv"></i></span>'}<span><strong>${NV.esc(x.title)}</strong><small>${NV.esc(kind)}${x.year?' · '+NV.esc(x.year):x.group?' · '+NV.esc(x.group):''}</small></span></button><button class="saved-remove" data-remove="${i}" title="Quitar"><i class="fa-solid fa-xmark"></i></button></article>`;
 }).join('');
 NV.$$('#myListResults .saved-main').forEach(b=>b.onclick=()=>{const x=list[+b.dataset.i];NV.$('#myListModal').classList.add('hidden');if(x.type==='channel'){NV.setView('tv');setTimeout(()=>{NV.state.category='Todos';NV.state.filteredChannels=NV.state.channels.slice();renderCategories();renderChannels();const i=NV.state.channels.findIndex(c=>NV.channelListKey(c)===x.key);if(i>=0)playChannel(i)},100)}else{const item=[...(NV.state.catalogItems.movies||[]),...(NV.state.catalogItems.series||[])].find(m=>NV.itemListKey(m,x.type)===x.key)||{id:x.key.split(':').slice(1).join(':'),title:x.title,image:x.image,year:x.year,description:x.description,genres:x.genres};NV.openMedia(item,x.type)}});
 NV.$$('#myListResults .saved-remove').forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.remove;list.splice(i,1);NV.saveMyList(list);NV.renderMyList();NV.updateListButtons?.();NV.toast('Eliminado de Mi lista')});
};
NV.stopTV=()=>{if(NV.state.tvHls){try{NV.state.tvHls.destroy()}catch{}NV.state.tvHls=null}NV.stopElement(NV.$('#tvVideo'))};
NV.stopMedia=()=>{
 if(NV.state.mediaHls){try{NV.state.mediaHls.destroy()}catch{}NV.state.mediaHls=null}
 const v=NV.$('#mediaVideo');
 if(v){try{v.pause()}catch{}try{v.removeAttribute('src')}catch{}try{v.srcObject=null}catch{}try{v.load()}catch{}}
 const f=NV.$('#mediaFrame');
 if(f){
   // Reemplazar el iframe garantiza que cualquier audio de un reproductor externo
   // (YouTube/embeds/proveedores) quede completamente destruido al salir.
   const fresh=f.cloneNode(false);
   fresh.src='about:blank';
   fresh.className=f.className;
   fresh.classList.add('hidden');
   f.replaceWith(fresh);
 }
 NV.state.currentMedia=null;
};
NV.stopAllPlayback=()=>{
 try{NV.stopTV()}catch{}
 try{NV.stopMedia()}catch{}
 NV.$$('video,audio').forEach(el=>{try{el.pause()}catch{}try{el.removeAttribute('src')}catch{}try{el.srcObject=null}catch{}try{el.load()}catch{}});
 NV.$$('#mediaFrame').forEach(f=>{try{f.src='about:blank'}catch{}});
};
NV.setView=view=>{
 if(NV.state.view==='tv'&&view!=='tv')NV.stopTV();
 if(NV.state.view==='media'&&view!=='media')NV.stopMedia();
 NV.state.view=view;
 NV.$$('.screen').forEach(x=>x.classList.add('hidden'));
 if(view==='home')NV.show('#homeScreen');
 if(view==='tv')NV.show('#tvScreen');
 if(view==='movies'||view==='series'){NV.show('#catalogScreen');window.NVCatalog?.load(view)}
 if(view==='media')NV.show('#mediaScreen');
 window.scrollTo({top:0,behavior:'instant'});
};
NV.enter=i=>{
 const p=NV.state.profiles[i];
 if(!p)return;
 // Cambiar de perfil siempre corta cualquier reproducción anterior,
 // incluso si el usuario cambia de perfil desde una ventana/modal.
 NV.stopAllPlayback?.();
 NV.state.activeProfile=p;
 localStorage.setItem('netvision_active_v7',p.id);
 NV.$('#profileGate').classList.add('hidden');
 NV.$('#app').classList.remove('hidden');
 NV.applyProfile?.(p);
 NV.setView('home');
};
NV.loadProfiles=()=>{let a=[];try{a=JSON.parse(localStorage.getItem('netvision_profiles_v7')||'[]')}catch{}NV.state.profiles=Array.isArray(a)?a:[];NV.renderProfiles?.();const id=localStorage.getItem('netvision_active_v7');const idx=NV.state.profiles.findIndex(p=>p.id===id);if(idx>=0)NV.enter(idx)};
function bind(){
 NV.$$('.home-card').forEach(b=>b.onclick=()=>NV.setView(b.dataset.view));
 NV.$('#homeBtn').onclick=()=>NV.setView('home');
 NV.$('#mainMenuBtn').onclick=()=>NV.setView('home');
 NV.$$('[data-home]').forEach(b=>b.onclick=()=>NV.setView('home'));
 NV.$('#settingsBtn').onclick=()=>NV.openSettings?.();
 NV.$('#profileBtn').onclick=()=>NV.openProfileSwitcher?.();
 NV.$('#searchBtn').onclick=()=>{ if(NV.state.view==='tv'){NV.$('#channelSearch')?.focus();} else if(NV.state.view==='movies'||NV.state.view==='series'){NV.$('#catalogSearch')?.focus();} else {NV.toast('Entra a TV, Películas o Series para buscar');} };
 NV.$('#myListBtn').onclick=()=>NV.openMyList();
 NV.$('#mediaListBtn')?.addEventListener('click',()=>{const m=NV.state.currentMedia;if(m)NV.toggleMyList(m.item,m.mode)});
 NV.$('#tvListBtn')?.addEventListener('click',()=>{const i=NV.state.channelIndex,c=i>=0?NV.state.channels[i]:null;if(c)NV.toggleChannelMyList(c);else NV.toast('Selecciona un canal primero')});
 NV.$$('#myListModal [data-close-list]').forEach(b=>b.onclick=()=>NV.$('#myListModal').classList.add('hidden')); 
 NV.$('#manageProfilesGate').onclick=()=>NV.openProfile?.(null,true);
 NV.$('#catalogRefresh')?.addEventListener('click',()=>{if(NV.state.view==='movies'||NV.state.view==='series')NVCatalog.load(NV.state.view)});
 window.addEventListener('keydown',e=>{
   if(NV.state.view!=='tv'||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
   if(e.key==='ArrowLeft'){e.preventDefault();NV.changeChannel?.(-1)}
   if(e.key==='ArrowRight'){e.preventDefault();NV.changeChannel?.(1)}
   if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen?.();
 });
}
document.addEventListener('DOMContentLoaded',()=>{bind();NV.loadProfiles()});
