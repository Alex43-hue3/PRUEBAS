const API="https://pelisplushd.tvymas.workers.dev";
const state={view:"movies",page:1,hls:null,item:null};

const $=s=>document.querySelector(s);
const grid=$("#grid");

function setStatus(t){$("#status").textContent=t}
function pstatus(t){$("#playerStatus").textContent=t}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

async function getJSON(url){
  const r=await fetch(url,{headers:{Accept:"application/json"}});
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}

function arr(data,keys){
  for(const k of keys) if(Array.isArray(data?.[k])) return data[k];
  return Array.isArray(data)?data:[];
}

function norm(x){
  return {
    title:x?.title||x?.name||"Sin título",
    image:x?.image||x?.poster||x?.posterUrl||x?.thumbnail||x?.cover||"",
    year:x?.year||"",
    rating:x?.rating||"",
    url:x?.url||x?.link||x?.detailUrl||"",
    raw:x
  };
}

async function loadCatalog(){
  grid.innerHTML="";
  setStatus("Cargando catálogo…");
  const endpoint=state.view==="movies"
    ? `${API}/peliculas?page=${state.page}`
    : `${API}/series?page=${state.page}`;
  try{
    const data=await getJSON(endpoint);
    const items=arr(data,["peliculas","movies","series","results","data","items"]).map(norm);
    const total=data?.totalPages||data?.total_pages||data?.pages||null;
    $("#pageLabel").textContent=total?`Página ${state.page} / ${total}`:`Página ${state.page}`;
    $("#prev").disabled=state.page<=1;
    $("#next").disabled=total?state.page>=total:false;
    if(!items.length){setStatus("La API no devolvió contenido.");return}
    setStatus(`${items.length} elementos encontrados`);
    items.forEach(x=>{
      const c=document.createElement("article");
      c.className="card";
      c.innerHTML=`<img src="${esc(x.image)}" alt=""><div class="info"><h3>${esc(x.title)}</h3><div class="meta">${esc(x.year)}${x.rating?" · ⭐ "+esc(x.rating):""}</div></div>`;
      c.onclick=()=>openDetail(x);
      grid.appendChild(c);
    });
  }catch(e){console.error(e);setStatus("Error: "+e.message)}
}

async function openDetail(item){
  state.item=item;
  $("#catalogView").hidden=true;$("#detailView").hidden=false;
  $("#detail").innerHTML=`<div class="detailBox"><div class="detailHead"><div><img src="${esc(item.image)}" alt=""></div><div><h2>${esc(item.title)}</h2><p id="detailStatus">Cargando información…</p><div id="movieServers"></div><div id="seriesSeasons"></div></div></div></div>`;
  try{
    const data=await getJSON(item.url);
    if(state.view==="movies") renderMovieDetail(data);
    else renderSeriesDetail(data);
  }catch(e){
    $("#detailStatus").textContent="No se pudo obtener el detalle: "+e.message;
  }
}

function videoEntries(data){
  if(Array.isArray(data?.embeds?.video)) return data.embeds.video;
  if(Array.isArray(data?.videos)) return data.videos;
  if(Array.isArray(data?.servers)) return data.servers;
  return [];
}

function streamFrom(x){
  return x?.stream_url||x?.streamUrl||x?.streamurl||x?.stream?.url||null;
}

function renderMovieDetail(data){
  const servers=videoEntries(data);
  $("#detailStatus").textContent=servers.length?"Servidor detectado. Reproducción automática activada.":"No se encontraron servidores";
  const box=$("#movieServers");
  if(!servers.length)return;
  const preferred=servers.find(s=>/vidhide/i.test(String(s?.name||s?.server||"")));
  const selected=preferred||servers.find(s=>streamFrom(s))||servers[0];
  if(streamFrom(selected)) playStreamEndpoint(streamFrom(selected));
  else if(selected?.link||selected?.url) playCandidate({url:selected.link||selected.url,type:"embed"});
}

function renderSeriesDetail(data){
  const seasons=extractSeasons(data);
  const box=$("#seriesSeasons");
  if(!seasons.length){
    $("#detailStatus").textContent="La API no devolvió temporadas/episodios reconocibles.";
    return;
  }
  $("#detailStatus").textContent="Selecciona un episodio.";
  box.innerHTML=`<div class="seasons"><h3>Temporadas</h3></div>`;
  const root=box.querySelector(".seasons");
  seasons.forEach((season,si)=>{
    const s=document.createElement("div");s.className="season";
    s.innerHTML=`<strong>Temporada ${esc(season.number||si+1)}</strong><div class="episodes"></div>`;
    const epBox=s.querySelector(".episodes");
    season.episodes.forEach((ep,ei)=>{
      const b=document.createElement("button");b.className="episode";
      b.textContent=`▶ ${ep.title||`Episodio ${ei+1}`}`;
      b.onclick=()=>playEpisode(ep);
      epBox.appendChild(b);
    });
    root.appendChild(s);
  });
}

function extractSeasons(data){
  const raw=arr(data,["seasons","temporadas"]);
  if(raw.length){
    return raw.map((s,i)=>({
      number:s?.number||s?.season_number||i+1,
      episodes:arr(s,["episodes","episodios","items"]).map(normalizeEpisode)
    })).filter(s=>s.episodes.length);
  }

  const rawEpisodes=arr(data,["episodes","episodios"]);
  if(rawEpisodes.length){
    const map=new Map();
    rawEpisodes.forEach((e,i)=>{
      const ep=normalizeEpisode(e);
      const n=ep.season||1;
      if(!map.has(n))map.set(n,[]);
      map.get(n).push(ep);
    });
    return [...map.entries()].map(([number,episodes])=>({number,episodes}));
  }

  // Algunas APIs pueden devolver una lista de capítulos directamente.
  const direct=arr(data,["chapters","chapters_list"]);
  if(direct.length) return [{number:1,episodes:direct.map(normalizeEpisode)}];

  return [];
}

function normalizeEpisode(e){
  return {
    title:e?.title||e?.name||e?.episode_title||`Episodio ${e?.episode_number||""}`.trim(),
    season:e?.season||e?.season_number||1,
    number:e?.episode||e?.episode_number||e?.number||"",
    url:e?.url||e?.link||e?.detailUrl||"",
    stream_url:e?.stream_url||e?.streamUrl||null,
    raw:e
  };
}

async function playEpisode(ep){
  if(ep.stream_url){await playStreamEndpoint(ep.stream_url);return}
  if(ep.url){
    try{
      const data=await getJSON(ep.url);
      const entries=videoEntries(data);
      const preferred=entries.find(s=>/vidhide/i.test(String(s?.name||s?.server||"")));
      const chosen=preferred||entries.find(s=>streamFrom(s))||entries[0];
      if(streamFrom(chosen)) return playStreamEndpoint(streamFrom(chosen));
      if(chosen?.link||chosen?.url) return playCandidate({url:chosen.link||chosen.url,type:"embed"});
      const direct=collect(data)[0];
      if(direct)return playCandidate(direct);
      throw new Error("No se encontró una fuente reproducible para el episodio.");
    }catch(e){openPlayer();pstatus("Error: "+e.message)}
    return;
  }
  pstatus("El episodio no tiene URL de reproducción.");
}

function collect(data){
  const out=[];
  const add=(url,type)=>{if(typeof url==="string"&&/^https?:\/\//i.test(url)&&!out.some(x=>x.url===url))out.push({url,type})};
  for(const x of data?.embeds?.video||[])add(streamFrom(x),"stream_url");
  for(const q of data?.qualities||[]){add(q?.proxy_url,"proxy_url");add(q?.url,"quality_url")}
  for(const x of data?.videos?.hls||[])add(x,"hls");
  add(data?.stream_url,"stream_url");add(data?.proxy_url,"proxy_url");
  return out.filter(x=>x.url);
}

async function playStreamEndpoint(endpoint){
  openPlayer();pstatus("Buscando automáticamente la fuente…");
  try{
    const data=await getJSON(endpoint);
    $("#debug").textContent=JSON.stringify(data,null,2);
    const candidates=collect(data);
    if(!candidates.length)throw new Error("El endpoint no devolvió fuentes.");
    for(const c of candidates){
      try{await playCandidate(c);return}catch(e){console.warn(e)}
    }
    throw new Error("Ninguna fuente pudo reproducirse.");
  }catch(e){pstatus("No se pudo reproducir: "+e.message)}
}

function openPlayer(){
  $("#detailView").hidden=true;$("#playerView").hidden=false;destroy();
}
function isHls(u){return /\.m3u8(?:$|[?#])/i.test(u)||u.includes("/streamproxy?")}
async function playCandidate(c){
  destroy();const u=c.url;
  if(isHls(u)){
    pstatus("Abriendo HLS…");const v=$("#video");
    if(v.canPlayType("application/vnd.apple.mpegurl")){v.src=u;await v.play().catch(()=>{});pstatus("Reproduciendo");return}
    if(!window.Hls||!Hls.isSupported())throw new Error("HLS no soportado");
    await new Promise((resolve,reject)=>{
      const h=new Hls({enableWorker:true,lowLatencyMode:false});state.hls=h;let done=false;
      const fail=()=>{if(done)return;done=true;h.destroy();state.hls=null;reject(new Error("HLS no pudo cargar la fuente"))};
      h.on(Hls.Events.MANIFEST_PARSED,async()=>{if(done)return;done=true;pstatus("Reproduciendo");try{await v.play()}catch{}resolve()});
      h.on(Hls.Events.ERROR,(_,d)=>{if(d?.fatal)fail()});
      h.loadSource(u);h.attachMedia(v);setTimeout(()=>{if(!done)fail()},15000);
    });return;
  }
  if(/\.(mp4|webm)(?:$|[?#])/i.test(u)){const v=$("#video");v.src=u;await v.play().catch(()=>{});pstatus("Reproduciendo");return}
  $("#video").hidden=true;$("#frame").hidden=false;$("#frame").src=u;pstatus("Abriendo reproductor externo");
}

function destroy(){
  if(state.hls){state.hls.destroy();state.hls=null}
  const v=$("#video");v.pause();v.removeAttribute("src");v.load();v.hidden=false;
  $("#frame").src="";$("#frame").hidden=true;
}

function backCatalog(){destroy();$("#detailView").hidden=true;$("#playerView").hidden=true;$("#catalogView").hidden=false}
function backDetail(){destroy();$("#playerView").hidden=true;$("#detailView").hidden=false}

$("#back").onclick=backCatalog;
$("#backFromPlayer").onclick=backDetail;
$("#prev").onclick=()=>{if(state.page>1){state.page--;loadCatalog()}};
$("#next").onclick=()=>{state.page++;loadCatalog()};
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{
  state.view=b.dataset.view;state.page=1;
  $("#pageTitle").textContent=state.view==="movies"?"Películas":"Series";
  document.querySelectorAll("[data-view]").forEach(x=>x.style.background=x===b?"#745cff":"#222638");
  loadCatalog();
});
loadCatalog();
