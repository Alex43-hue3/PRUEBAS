/* NETVISION PLAYER — un solo reproductor visual, directo/HLS/iframe */
'use strict';
function setMedia(item,mode){
 NV.$('#mediaTypeLabel').textContent=mode==='series'?'SERIE':'PELÍCULA';
 NV.$('#mediaTitle').textContent=item.title||'Sin título';
 NV.$('#mediaPoster').src=item.image||item.banner||'';
 NV.$('#mediaMeta').textContent=[item.year,item.rating?`★ ${item.rating}`:'',mode==='series'?'Serie':'Película'].filter(Boolean).join(' · ');
 NV.$('#mediaDescription').textContent=item.description||'Información entregada por la API.';
 NV.$('#episodesPanel').classList.toggle('hidden',mode!=='series');
}
function resetMedia(){const v=NV.$('#mediaVideo'),f=NV.$('#mediaFrame');if(NV.state.mediaHls){try{NV.state.mediaHls.destroy()}catch{}NV.state.mediaHls=null}v.pause();v.removeAttribute('src');v.load();v.classList.remove('hidden');f.src='about:blank';f.classList.add('hidden');NV.hide('#mediaEmpty');NV.hide('#mediaLoading')}
function isHls(u){return /\.m3u8(?:$|[?#])/i.test(u)||/\/streamproxy\?/i.test(u)||/\.m3u8/i.test(u)}
function isProviderPlayerUrl(u){return /mobilephoneaccess\.shop\/.*\/master\.txt(?:$|[?#])/i.test(u)}
function isDirect(u){return /\.(mp4|webm|mov|ogg)(?:$|[?#])/i.test(u)}
function isHttp(u){return /^https?:\/\//i.test(u)}
function isAdOrPlayerUrl(u){return /(^|\.)mobilephoneaccess\.shop\//i.test(u)||/doubleclick\.net|googlesyndication\.com|adservice\.google|popads|propellerads|onclickads|adsterra/i.test(u)}
function orderSources(urls,embeds=[]){
 const all=[...(urls||[]),...(embeds||[])].filter(Boolean).map(String).filter(isHttp).filter(u=>!isProviderPlayerUrl(u)&&!isAdOrPlayerUrl(u));
 const unique=[...new Set(all)];
 const score=u=>{if(isHls(u))return 0;if(isDirect(u))return 5;if(/stream|video|source|file|media/i.test(u))return 10;return 20};
 return unique.sort((a,b)=>score(a)-score(b));
}
function setLoading(text){NV.$('#mediaLoadingText').textContent=text;NV.show('#mediaLoading')}
async function extractMasterTxt(u){
 try{
  const r=await fetch(u,{method:'GET',cache:'no-store',headers:{Accept:'text/plain,application/vnd.apple.mpegurl,*/*'}});
  if(!r.ok)return [];
  const text=await r.text();
  const urls=[];
  for(const m of text.matchAll(/https?:\/\/[^\s"'<>]+/gi)){
   const x=m[0].replace(/[),.;]+$/,'');
   if(/\.m3u8(?:$|[?#])/i.test(x)&&!isAdOrPlayerUrl(x)) urls.push(x);
  }
  return [...new Set(urls)];
 }catch{return []}
}
async function playSource(u){
 const v=NV.$('#mediaVideo'),f=NV.$('#mediaFrame');
 if(!u||!isHttp(u)||isAdOrPlayerUrl(u))return false;
 NV.hide('#mediaEmpty');
 if(NV.state.mediaHls){try{NV.state.mediaHls.destroy()}catch{}NV.state.mediaHls=null}
 v.pause();v.removeAttribute('src');v.load();f.src='about:blank';f.classList.add('hidden');v.classList.remove('hidden');v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
 if(isProviderPlayerUrl(u)){
   const extracted=await extractMasterTxt(u);
   for(const x of extracted){if(await playSource(x))return true}
   return false;
 }
 if(isHls(u)){
  if(v.canPlayType('application/vnd.apple.mpegurl'))return await nativeVideo(u);
  if(!window.Hls||!Hls.isSupported())return false;
  return await new Promise(resolve=>{
   const h=new Hls({enableWorker:true,lowLatencyMode:false,backBufferLength:30,maxBufferLength:45,maxMaxBufferLength:60,startLevel:-1,xhrSetup:x=>{try{x.withCredentials=false}catch{}}});
   NV.state.mediaHls=h;let done=false;
   const finish=ok=>{if(done)return;done=true;if(!ok){try{h.destroy()}catch{}NV.state.mediaHls=null}resolve(ok)};
   h.loadSource(u);h.attachMedia(v);
   h.on(Hls.Events.MANIFEST_PARSED,()=>{if(getSettings?.().autoplay!==false)v.play().catch(()=>{});finish(true)});
   h.on(Hls.Events.ERROR,(_,d)=>{if(d?.fatal)finish(false)});
   setTimeout(()=>finish(false),15000);
  });
 }
 // Último intento seguro: dejar que <video> detecte el formato. No se abre iframe ni reproductor externo.
 return await nativeVideo(u);
}
async function nativeVideo(u){
 const v=NV.$('#mediaVideo');v.classList.remove('hidden');NV.$('#mediaFrame').classList.add('hidden');v.src=u;v.load();
 try{await waitVideo(v,12000);if(getSettings?.().autoplay!==false)v.play().catch(()=>{});return true}catch{v.pause();v.removeAttribute('src');v.load();return false}
}
function waitVideo(v,timeout){return new Promise((resolve,reject)=>{if(v.readyState>=2){resolve();return}let done=false;const clean=()=>{v.removeEventListener('loadedmetadata',ok);v.removeEventListener('canplay',ok);v.removeEventListener('error',bad);clearTimeout(t)};const ok=()=>{if(done)return;done=true;clean();resolve()};const bad=()=>{if(done)return;done=true;clean();reject(new Error('Fuente no compatible'))};const t=setTimeout(bad,timeout);v.addEventListener('loadedmetadata',ok);v.addEventListener('canplay',ok);v.addEventListener('error',bad)})}
async function playSources(urls,embeds=[]){
 const ordered=orderSources(urls,embeds);
 if(!ordered.length)return false;
 for(const u of ordered){
  setLoading(isHls(u)?'Preparando transmisión…':'Buscando fuente directa…');
  try{const ok=await playSource(u);if(ok){NV.hide('#mediaLoading');return true}}catch(e){console.warn('[NETVISION] fuente fallida',u,e)}
 }
 return false;
}
function renderEpisodes(episodes){const panel=NV.$('#episodesPanel');if(!episodes.length){panel.classList.remove('hidden');NV.$('#episodeList').innerHTML='<div class="empty-catalog" style="padding:30px 10px;border:0"><i class="fa-solid fa-list"></i><p>No se encontraron episodios.</p></div>';return}panel.classList.remove('hidden');const groups={};episodes.forEach(e=>(groups[e.season||'1']??=[]).push(e));const seasons=Object.keys(groups).sort((a,b)=>Number(a)-Number(b));NV.$('#seasonTitle').textContent=seasons.length>1?`Temporadas (${seasons.length})`:`Temporada ${seasons[0]}`;NV.$('#episodeList').innerHTML=seasons.map(s=>`<div class="season-block"><h3>Temporada ${NV.esc(s)}</h3>${groups[s].map((e,i)=>`<button class="episode-item" data-season="${NV.esc(s)}" data-idx="${i}"><span>${NV.esc(e.number)}</span><strong>${NV.esc(e.title)}</strong><i class="fa-solid fa-play"></i></button>`).join('')}</div>`).join('');NV.$$('#episodeList .episode-item').forEach(b=>b.onclick=async()=>{NV.$$('#episodeList .episode-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');const e=groups[b.dataset.season][+b.dataset.idx];setLoading('Buscando episodio…');try{const ex=await NVApi.resolveEpisode(e);const ok=await playSources(ex.urls||[],ex.embeds||[]);if(!ok){NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se encontró una fuente reproducible para este episodio'}}catch(err){console.error(err);NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se pudo reproducir el episodio'}finally{NV.hide('#mediaLoading')}})}
NV.openMedia=async(item,mode)=>{NV.stopMedia();NV.state.currentMedia={item,mode};NV.setView('media');setMedia(item,mode);resetMedia();NV.updateListButtons?.();if(mode==='series'){setLoading('Cargando episodios…');try{const ex=await NVApi.resolve(item,mode);renderEpisodes(ex.episodes||[]);NV.hide('#mediaLoading');if(!(ex.episodes||[]).length){const ok=await playSources(ex.urls||[],ex.embeds||[]);if(!ok)NV.show('#mediaEmpty')}}catch(e){console.error(e);NV.hide('#mediaLoading');NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se pudo cargar la serie'}return}setLoading('Buscando fuente…');try{const ex=await NVApi.resolve(item,mode);const ok=await playSources(ex.urls||[],ex.embeds||[]);if(!ok){NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se encontró una fuente reproducible'}}catch(e){console.error(e);NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se pudo consultar la fuente';NV.$('#mediaEmpty small').textContent=e.message||'Error de conexión'}finally{NV.hide('#mediaLoading')}};
NV.$('#mediaRetry').onclick=()=>{const m=NV.state.currentMedia;if(m)NV.openMedia(m.item,m.mode)};
NV.$('#mediaPlayAgain').onclick=()=>{const m=NV.state.currentMedia;if(m)NV.openMedia(m.item,m.mode)};
NV.$('#mediaBack').onclick=()=>{const m=NV.state.currentMedia;NV.stopMedia();NV.setView(m?.mode||'home')};
NV.$('#closeEpisodes').onclick=()=>NV.$('#episodesPanel').classList.add('hidden');
NV.$('#mediaFullscreen').onclick=async()=>{const p=NV.$('#mediaPlayer');if(!document.fullscreenElement){try{await p.requestFullscreen({navigationUI:'hide'})}catch{p.classList.add('is-fullscreen')}}else document.exitFullscreen?.()};
document.addEventListener('fullscreenchange',()=>NV.$('#mediaPlayer')?.classList.toggle('is-fullscreen',document.fullscreenElement===NV.$('#mediaPlayer')));
