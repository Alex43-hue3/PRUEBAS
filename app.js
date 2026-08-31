const API="https://pelisplushd.tvymas.workers.dev";
const state={view:"movies",page:1,item:null,hls:null,detail:null};

const $=s=>document.querySelector(s);
const grid=$("#grid"), statusEl=$("#status");

function setStatus(t){statusEl.textContent=t}
function playerStatus(t){$("#playerStatus").textContent=t}

async function getJSON(url){
  const r=await fetch(url,{headers:{Accept:"application/json"}});
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}

function firstArray(data, keys){
  for(const k of keys){
    if(Array.isArray(data?.[k])) return data[k];
  }
  if(Array.isArray(data)) return data;
  return [];
}

function normalize(item){
  return {
    title:item.title||item.name||item.nombre||"Sin título",
    image:item.image||item.poster||item.posterUrl||item.thumbnail||item.cover||"",
    year:item.year||item.año||"",
    rating:item.rating||item.vote_average||"",
    url:item.url||item.link||item.detailUrl||"",
    raw:item
  };
}

async function loadCatalog(){
  setStatus("Cargando "+(state.view==="movies"?"películas":"series")+"…");
  grid.innerHTML="";
  $("#pageLabel").textContent="Página "+state.page;

  const endpoint=state.view==="movies"
    ? `${API}/peliculas?page=${state.page}`
    : `${API}/series?page=${state.page}`;

  try{
    const data=await getJSON(endpoint);
    const items=firstArray(data,["peliculas","movies","series","results","data","items"]).map(normalize);
    const total=data.totalPages||data.total_pages||data.pages||null;

    if(total) $("#pageLabel").textContent=`Página ${state.page} / ${total}`;
    $("#prev").disabled=state.page<=1;
    $("#next").disabled=total?state.page>=total:false;

    if(!items.length){
      setStatus("La API no devolvió contenido en esta página.");
      return;
    }

    setStatus(`${items.length} elementos encontrados`);
    items.forEach(item=>{
      const card=document.createElement("article");
      card.className="card";
      card.innerHTML=`
        <img src="${escapeAttr(item.image)}" alt="">
        <div class="info">
          <h3>${escapeHTML(item.title)}</h3>
          <div class="meta">${escapeHTML(String(item.year||""))}${item.rating?" · ⭐ "+escapeHTML(String(item.rating)):""}</div>
        </div>`;
      card.onclick=()=>openDetail(item);
      grid.appendChild(card);
    });
  }catch(e){
    console.error(e);
    setStatus("Error cargando catálogo: "+e.message);
  }
}

function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(v){return escapeHTML(v)}

async function openDetail(item){
  state.item=item;
  $("#catalogView").hidden=true;
  $("#detailView").hidden=false;
  $("#detail").innerHTML=`<div class="detailBox"><div><img src="${escapeAttr(item.image)}" alt=""></div><div><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.raw.description||item.raw.sinopsis||"")}</p><div id="detailStatus">Cargando servidores…</div><div class="servers" id="servers"></div></div></div>`;

  if(!item.url){
    $("#detailStatus").textContent="Este elemento no tiene URL de detalle.";
    return;
  }

  try{
    const data=await getJSON(item.url);
    state.detail=data;
    const servers=firstArray(data,["embeds","servers","sources"]);
    const videoServers=Array.isArray(data?.embeds?.video)?data.embeds.video:servers;

    $("#detailStatus").textContent=videoServers.length?`${videoServers.length} servidor(es)`:"No se encontraron servidores";

    const box=$("#servers");
    videoServers.forEach((s,i)=>{
      const stream=s.stream_url||s.streamUrl||s.streamurl;
      const link=s.link||s.url||s.embed;
      const b=document.createElement("button");
      b.textContent=s.name||s.server||`Servidor ${i+1}`;
      b.onclick=()=>stream?resolveStream(stream):link?playCandidate({url:link,type:"embed"}):null;
      box.appendChild(b);
    });

    // Si la respuesta de detalle ya trae una fuente directa, también la mostramos.
    const direct=collectCandidates(data);
    direct.forEach((c,i)=>{
      const b=document.createElement("button");
      b.textContent=`Fuente directa ${i+1}`;
      b.onclick=()=>playCandidate(c).catch(e=>playerStatus(e.message));
      box.appendChild(b);
    });
  }catch(e){
    $("#detailStatus").textContent="No se pudo obtener el detalle: "+e.message;
  }
}

function collectCandidates(data){
  const out=[];
  const add=(url,type)=>{
    if(typeof url!=="string"||!/^https?:\/\//i.test(url))return;
    if(!out.some(x=>x.url===url))out.push({url,type});
  };
  for(const x of data?.embeds?.video||[]) add(x?.stream_url,"stream_url");
  for(const q of data?.qualities||[]){add(q?.proxy_url,"proxy_url");add(q?.url,"quality_url")}
  for(const x of data?.videos?.hls||[])add(x,"hls");
  add(data?.stream_url,"stream_url");
  add(data?.proxy_url,"proxy_url");
  return out;
}

async function resolveStream(streamUrl){
  try{
    playerStatus("Consultando fuente…");
    const data=await getJSON(streamUrl);
    $("#debug").textContent=JSON.stringify(data,null,2);
    const candidates=collectCandidates(data);
    if(!candidates.length) throw new Error("La API no devolvió una fuente reproducible.");
    for(const c of candidates.sort((a,b)=>(a.type==="proxy_url"?-1:0)-(b.type==="proxy_url"?-1:0))){
      try{await playCandidate(c);return}catch(e){console.warn(c,e)}
    }
    throw new Error("Ninguna fuente pudo reproducirse.");
  }catch(e){playerStatus("Error: "+e.message)}
}

function isHLS(url){
  return /\.m3u8(?:$|[?#])/i.test(url)||url.includes("/streamproxy?");
}

async function playCandidate(c){
  $("#detailView").hidden=true;
  $("#playerView").hidden=false;
  destroyPlayer();

  if(isHLS(c.url)){
    playerStatus("Abriendo HLS…");
    const video=$("#video");
    if(video.canPlayType("application/vnd.apple.mpegurl")){
      video.src=c.url; await video.play().catch(()=>{}); return;
    }
    if(window.Hls&&Hls.isSupported()){
      await new Promise((resolve,reject)=>{
        const h=new Hls({enableWorker:true,lowLatencyMode:false});
        state.hls=h;
        let done=false;
        const fail=()=>{if(done)return;done=true;h.destroy();state.hls=null;reject(new Error("HLS no pudo cargar la fuente"))};
        h.on(Hls.Events.MANIFEST_PARSED,async()=>{if(done)return;done=true;playerStatus("Reproduciendo");try{await video.play()}catch{}resolve()});
        h.on(Hls.Events.ERROR,(_,d)=>{if(d?.fatal)fail()});
        h.loadSource(c.url);h.attachMedia(video);
        setTimeout(()=>{if(!done)fail()},15000);
      });
      return;
    }
    throw new Error("Este navegador no soporta HLS.");
  }

  if(/\.(mp4|webm)(?:$|[?#])/i.test(c.url)){
    $("#video").src=c.url;
    await $("#video").play().catch(()=>{});
    playerStatus("Reproduciendo video directo");
    return;
  }

  $("#video").hidden=true;
  $("#frame").hidden=false;
  $("#frame").src=c.url;
  playerStatus("Abriendo reproductor externo");
}

function destroyPlayer(){
  if(state.hls){state.hls.destroy();state.hls=null}
  const v=$("#video");v.pause();v.removeAttribute("src");v.load();v.hidden=false;
  const f=$("#frame");f.src="";f.hidden=true;
}

function closeDetail(){
  $("#detailView").hidden=true;$("#catalogView").hidden=false;
}

function closePlayer(){
  destroyPlayer();$("#playerView").hidden=true;$("#detailView").hidden=false;
}

$("#back").onclick=closeDetail;
$("#backFromPlayer").onclick=closePlayer;
$("#prev").onclick=()=>{if(state.page>1){state.page--;loadCatalog()}};
$("#next").onclick=()=>{state.page++;loadCatalog()};

document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{
  state.view=b.dataset.view;state.page=1;
  $("#pageTitle").textContent=state.view==="movies"?"Películas":"Series";
  document.querySelectorAll("[data-view]").forEach(x=>x.style.background=x===b?"#745cff":"#222638");
  loadCatalog();
});

loadCatalog();
