/* NETVISION TV — M3U, categorías, lista lateral y cambio de canal */
'use strict';
const NETVISION_M3U_FALLBACK=`#EXTM3U

#EXTINF:-1 tvg-id="MariaVision.mx@SD" tvg-logo="https://i.imgur.com/GylOPxE.png" group-title="Religioso",María Visión
https://1601580044.rsc.cdn77.org/live/_jcn_/amlst:Mariavision/master.m3u8


#EXTINF:-1 tvg-id="beINSPORTSXTRAenEspanol.us@SD" tvg-logo="https://i.imgur.com/V562tpO.png" group-title="Deportes",beIN Sports XTRA
https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Documentales",Curiosity Animales 
https://d2j2obpavpuw3t.cloudfront.net/CuriosityAnimales.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Documentales",Curiosity Explora 
https://d2bvy2sb4c0dbv.cloudfront.net/CuriosityEspanol.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Documentales",Curiosity Motores 
https://d5ts03kapml2e.cloudfront.net/CuriosityMotores.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Documentales",Curiosity Now 
https://amg00170-curiositystream-amg00170c3-rakuten-us-2289.playouts.now.amagi.tv/playlist/amg00170-curiositystreamllcfast-curiositynowrow-rakutenus/playlist.m3u8


#EXTINF:-1 tvg-logo="https://imgur.com/76pIwxw.png" group-title="Entretenimiento" , Las Estrellas
https://dai.google.com/ssai/event/_e1s_U52SCGL6zTnlTrbVQ/master.m3u8

#EXTINF:-1 tvg-id="XHGVTDT.mx" tvg-country="MX" tvg-language="Spanish" tvg-logo="https://i.imgur.com/15kcNRb.png" group-title="Entretenimiento",TV MÁS
https://5ca9af4645e15.streamlock.net/rtv/videortv/playlist.m3u8

#EXTINF:-1 tvg-id="AlcanceTV.mx" tvg-logo="https://i.imgur.com/5nYjRlb.png" group-title="Religioso",Alcance TV
https://5bf8041cb3fed.streamlock.net/AlcanceTV/AlcanceTV/playlist.m3u8

#EXTINF:-1 tvg-id="AMXNoticias.mx" tvg-logo="https://i.imgur.com/snIU1UA.jpg" group-title="Noticias",AMX Noticias
https://5e50264bd6766.streamlock.net/mexiquense2/videomexiquense2/playlist.m3u8

#EXTINF:-1 tvg-id="AntenaTV.mx" tvg-logo="https://i.imgur.com/1sAgSME.png" group-title="Música",Antena TV
https://5ca9af4645e15.streamlock.net/grd/videogrd/playlist.m3u8

#EXTINF:-1 tvg-id="MexiquenseTV.mx" tvg-logo="https://i.imgur.com/iVfzakA.png" group-title="Noticias",Mexiquense TV
https://5e50264bd6766.streamlock.net/mexiquense/videomexiquense/playlist.m3u8

#EXTINF:-1 tvg-id="ImagenUniversalTV.do" tvg-logo="https://i.imgur.com/DP6HmDV.png" group-title="Películas",Imagen Universal TV
https://imagenuniversaltv.net:3771/live/iutvlive.m3u8

#EXTINF:-1 tvg-id="Kronehit.at" tvg-logo="https://i.imgur.com/dQJQv1X.png" group-title="Música",Kronehit
https://bitcdn-kronehit.bitmovin.com/v2/hls/playlist.m3u8

#EXTINF:-1 tvg-id="LatinZone.us" tvg-logo="https://i.imgur.com/duEDsne.png" group-title="Música",Latin Zone TV 
https://cdn.streamingcpanel.com:3784/live/latinzonetvlive.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Películas",Rakuten TV Cine Español 
https://3ed8837c27bf41dabe8e2627be2e57e6.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6196/master.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Películas",Rakuten TV Crime Series 
https://4ac0fe739f05408abf89ce151aced344.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6220/master.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Películas",Rakuten TV Romance 
https://4b95c0f7aa2b4cae80f6515600154151.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6105/master.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Documentales",Rakuten TV ciencia ficion 
https://sci-fi-rakuten-tv-es.fast.rakuten.tv/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6740/master.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Entretenimiento",Telemundo Accion
https://xumo-drct-ch835-ekq0p.fast.nbcuni.com/live/master.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/30HzeQe.png" group-title="Entretenimiento",Telemundo Romance
https://xumo-drct-ch836-57aiq.fast.nbcuni.com/live/master.m3u8

#EXTINF:-1 tvg-id="AztecaInternacional.mx@SD" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/e/eb/Azteca_Internacional_logo_2023.png" group-title="Entretenimiento",Azteca Internacional 
https://azt-mun.otteravision.com/azt/mun/mun.m3u8

#EXTINF:-1 tvg-id="EWTN.us@SpainLatinAmerica" tvg-logo="https://i.imgur.com/sua70RO.png" group-title="Religioso",EWTN Spain
https://cdn3.wowza.com/1/SmVrQmZCUXZhVDgz/b3J3MFJv/hls/live/playlist.m3u8

#EXTINF:-1 tvg-id="FIFAPlus.uk@Spain" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/FIFA%2B_(2025).svg/960px-FIFA%2B_(2025).svg.png" group-title="Deportes",FIFA+ 
https://d63fabad.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWVzX0ZJRkFQbHVzU3BhbmlzaF9ITFM/playlist.m3u8

#EXTINF:-1 tvg-id="Historia.es@SD" tvg-logo="https://i.imgur.com/VUy8xIG.png" group-title="Documentales",Historia 
https://d1k3vzh2ivy22k.cloudfront.net/Historia.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Películas",Latino Classic TV 
https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/4d419a88-a62c-496f-b8a1-984e746f8259/manifest.m3u8

#EXTINF:-1 tvg-id="LatinaTVInternacional.do@SD" tvg-logo="https://i.imgur.com/UAfyeYT.png" group-title="Películas",Latina TV 
https://5790d294af2dc.streamlock.net/latinatv/latinatv/chunklist.m3u8

#EXTINF:-1 tvg-id="LoveNatureenEspanol.us@SD" tvg-logo="https://i.imgur.com/7uNdcWB.png" group-title="Documentales",Love Nature 
https://amg01515-amg01515c17-xumo-us-2489.playouts.now.amagi.tv/bamus-lovenaturespanish-roku/playlist.m3u8

#EXTINF:-1 tvg-id="MAXAnime.ve@SD" tvg-logo="https://i.imgur.com/Oj3hEBh.jpg" group-title="Anime",MAX Anime 
https://cdnlive.klicgo.net/maxanime/live/playlist.m3u8

#EXTINF:-1 tvg-id="RedBullTV.at@ES" tvg-logo="https://images.pluto.tv/channels/5e7cb84a172a0f0007da69e4/colorLogoPNG.png" group-title="Deportes",Red Bull ES 
https://886bd3fbc782459f8de7555d32d7e9ce.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-957-WORBLATAMESFAST-WHALETVPLUS/957/whaletvplus/hls/master/playlist.m3u8

#EXTINF:-1 tvg-id="TraceLatina.fr@SD" tvg-logo="https://i.imgur.com/CUVAi4u.png" group-title="Música",Trace Latina 
https://amg01131-tracetv-tracelatina-glewed-vtnk7.amagi.tv/playlist.m3u8

#EXTINF:-1 tvg-id="TVGetsemani.sv@SD" tvg-logo="https://i.imgur.com/C9SJCcE.jpg" group-title="Religioso",TV Getsemaní 
https://serversv.com:8080/hls/tvgetsemani.m3u8

#EXTINF:-1 tvg-id="VevoLatino.us@SD" tvg-logo="https://i.imgur.com/D7SwmuB.png" group-title="Música",Vevo Latino 
https://amg00056-amg00056c13-rakuten-es-3246.playouts.now.amagi.tv/playlist.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/dZHktKR.png" group-title="Música",Vevo Pop Spain 
https://amg00056-amg00056c10-rakuten-es-3242.playouts.now.amagi.tv/playlist.m3u8

#EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/dZHktKR.png" group-title="Música",Vevo Pop UK 
https://d2n3779oy6efpi.cloudfront.net/playlist.m3u8

#EXTINF:-1 tvg-id="VMLatino.cr@SD" tvg-logo="https://i.imgur.com/Dvo1b82.png" group-title="Música",VM Latino 
https://59ef525c24caa.streamlock.net/vmtv/vmlatino/playlist.m3u8

#EXTINF:-1 tvg-id="XITESiempreLatino.us@SD" tvg-logo="https://i.imgur.com/bwmIEgG.png" group-title="Música",XITE Siempre Latino 
https://d1xc25jm9e0l4b.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-xplkt8i7m24dc/XITE_Siempre_Latino.m3u8

#EXTINF:-1 tvg-id="981PearlFM.sx" tvg-logo="https://i.imgur.com/GY750xh.jpg" group-title="Música",Pearl
https://live2.tensila.com/pearl-v-1.pearlfm/hls/live/mystream.m3u8

#EXTINF:-1 tvg-id="13Festival.cl" tvg-logo="https://i.imgur.com/hTUe0Pw.png" group-title="Música",13 Festival
https://origin.dpsgo.com/ssai/event/Nftd0fM2SXasfDlRphvUsg/master.m3u8

#EXTINF:-1 tvg-id="1014" tvg-name="PlanetaTV" tvg-logo="https://cdn.m3u.cl/logo/1014_PlanetaTV.png" group-title="Música", PlanetaTV
https://tls-cl.cdnz.cl/planetatv/live/playlist.m3u8

#EXTINF:-1 tvg-logo="https://graph.facebook.com/CanalExtremadura/picture?width=200&height=200" group-title="Caricaturas" tvg-name="Infantil (Canal Extremadura)",Infantil 
https://cdn-canalextremadura.watchity.net/fast2/master.m3u8

#EXTINF:-1 tvg-logo="https://graph.facebook.com/TBNEspana/picture?width=200&height=200" group-title="Religioso" tvg-name="TBN España",TBN España
https://edge.xn--tbnespaa-j3a.es/LiveApp/streams/tbnlive.m3u8
`;
function parseM3U(text){const out=[];let meta=null;for(const raw of String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/)){const line=raw.trim();if(!line)continue;if(/^#EXTINF/i.test(line)){const comma=line.indexOf(',');const info=comma>=0?line.slice(0,comma):line;const name=comma>=0?line.slice(comma+1).trim():'Canal';const a={};for(const m of info.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g))a[m[1].toLowerCase()]=m[2];meta={name,group:a['group-title']||'Otros',logo:a['tvg-logo']||'',id:a['tvg-id']||name}}else if(!line.startsWith('#')&&meta){out.push({...meta,url:line});meta=null}}return out}
async function loadM3U(){let text='';try{const urls=[new URL('canales.m3u',document.baseURI).href,'canales.m3u'];let last;for(const url of urls){try{const r=await fetch(url+'?v='+Date.now(),{cache:'no-store'});if(r.ok){text=await r.text();break}last=r.status}catch(e){last=e}}if(!text)throw Error(last||'No se pudo descargar M3U')}catch(e){console.warn('[NETVISION] usando M3U incorporado',e);text=NETVISION_M3U_FALLBACK}NV.state.channels=parseM3U(text);NV.state.filteredChannels=NV.state.channels.slice();NV.state.category='Todos';NV.state.channelIndex=-1;renderCategories();renderChannels();if(!NV.state.channels.length){NV.toast('La lista de canales está vacía')}}
function groups(){return ['Todos',...new Set(NV.state.channels.map(c=>c.group||'Otros').filter(Boolean))]}
function renderCategories(){const side=NV.$('#categoryTabs');if(!side)return;side.innerHTML=groups().map(g=>`<button class="category-tab ${g===NV.state.category?'active':''}" data-group="${NV.esc(g)}"><span>${NV.esc(g)}</span><b>${g==='Todos'?NV.state.channels.length:NV.state.channels.filter(c=>c.group===g).length}</b></button>`).join('');NV.$$('#categoryTabs .category-tab').forEach(b=>b.onclick=()=>{NV.state.category=b.dataset.group;renderCategories();renderChannels()})}
function renderChannels(){const q=NV.norm(NV.$('#channelSearch')?.value);let a=NV.state.channels.filter(c=>NV.state.category==='Todos'||c.group===NV.state.category);if(q)a=a.filter(c=>NV.norm(c.name).includes(q)||NV.norm(c.group).includes(q));NV.state.filteredChannels=a;const title=NV.$('#categoryTitle');const list=NV.$('#channelList');if(title)title.textContent=NV.state.category==='Todos'?'Todos los canales':NV.state.category;if(!list)return;list.innerHTML=a.length?a.map((c,i)=>{const saved=NV.isChannelInMyList?.(c);return `<button class="channel-item ${NV.state.channelIndex===NV.state.channels.indexOf(c)?'active':''}" data-i="${i}"><span class="channel-logo">${c.logo?`<img src="${NV.esc(c.logo)}" alt="">`:'<i class="fa-solid fa-tv"></i>'}</span><span><strong>${NV.esc(c.name)}</strong><small>${NV.esc(c.group)}</small></span><i class="${saved?'fa-solid':'fa-regular'} fa-star list-star"></i></button>`}).join(''):'<div class="channel-empty"><i class="fa-solid fa-tv"></i><strong>No hay canales</strong><small>Prueba otra categoría o búsqueda.</small></div>';NV.$$('#channelList .channel-item').forEach(b=>{b.onclick=()=>playChannel(+b.dataset.i);b.querySelector('.list-star')?.addEventListener('click',e=>{e.stopPropagation();const c=NV.state.filteredChannels[+b.dataset.i];if(c)NV.toggleChannelMyList(c)})})}
function playChannel(i){const c=NV.state.filteredChannels[i];if(!c)return;NV.state.channelIndex=NV.state.channels.indexOf(c);const v=NV.$('#tvVideo');NV.hide('#tvEmpty');NV.$('#tvCurrentName').textContent=c.name;NV.$('#tvCurrentGroup').textContent=c.group;NV.$('#tvNowName').textContent=c.name;NV.$('#tvNowGroup').textContent=c.group;NV.$('#tvLogo').innerHTML=c.logo?`<img src="${NV.esc(c.logo)}">`:'<i class="fa-solid fa-tv"></i>';if(NV.state.tvHls){try{NV.state.tvHls.destroy()}catch{}NV.state.tvHls=null}v.pause();v.removeAttribute('src');v.load();if(/\.m3u8($|\?)/i.test(c.url)&&window.Hls&&Hls.isSupported()){NV.state.tvHls=new Hls({enableWorker:true,lowLatencyMode:true,maxBufferLength:20});NV.state.tvHls.loadSource(c.url);NV.state.tvHls.attachMedia(v);NV.state.tvHls.on(Hls.Events.MANIFEST_PARSED,()=>v.play().catch(()=>{}));NV.state.tvHls.on(Hls.Events.ERROR,(_,d)=>{if(d?.fatal)NV.toast('No se pudo reproducir este canal')})}else{v.src=c.url;v.play().catch(()=>{})}renderChannels();NV.updateListButtons?.();NV.$('#channelSidebar').classList.remove('open')}
NV.changeChannel=dir=>{const a=NV.state.filteredChannels;if(!a.length)return;let p=a.findIndex(c=>NV.state.channels.indexOf(c)===NV.state.channelIndex);if(p<0)p=0;playChannel((p+dir+a.length)%a.length)};
NV.$('#channelSearch').oninput=renderChannels;NV.$('#openSidebar').onclick=()=>NV.$('#channelSidebar').classList.add('open');NV.$('#closeSidebar').onclick=()=>NV.$('#channelSidebar').classList.remove('open');NV.$('#tvPrev').onclick=()=>NV.changeChannel(-1);NV.$('#tvNext').onclick=()=>NV.changeChannel(1);NV.$('#fsPrev').onclick=()=>NV.changeChannel(-1);NV.$('#fsNext').onclick=()=>NV.changeChannel(1);NV.$('#fsClose').onclick=()=>document.exitFullscreen?.();NV.$('#tvFullscreen').onclick=async()=>{const p=NV.$('#tvPlayer');if(!document.fullscreenElement){try{await p.requestFullscreen({navigationUI:'hide'})}catch{p.classList.add('pseudo-fullscreen')}}else document.exitFullscreen?.()};document.addEventListener('fullscreenchange',()=>{const p=NV.$('#tvPlayer');if(!p)return;p.classList.toggle('is-fullscreen',document.fullscreenElement===p)});
const oldSetView=NV.setView;NV.setView=view=>{if(NV.state.view==='tv'&&view!=='tv')NV.stopTV();oldSetView(view);if(view==='tv'&&!NV.state.channels.length)loadM3U()};
loadM3U();
