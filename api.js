/* NETVISION API CORE v4
   APIs: PelisPlusHD + LaMovie (endpoints verified from their API docs).
*/
'use strict';

window.NETVISION_API = {
  providers: [
    { name:'PelisPlusHD', base:'https://pelisplushd.tvymas.workers.dev' },
    { name:'LaMovie', base:'https://lamoviebot.tvymas.workers.dev' }
  ],
  timeout: 18000
};

(function(){
  const A = window.NETVISION_API;

  function join(base, path){ return base.replace(/\/$/,'') + '/' + String(path).replace(/^\//,''); }
  function slugFrom(item){
    if(item?.slug) return String(item.slug);
    const raw = item?.url || item?.link || item?.permalink || '';
    try { const u = new URL(raw); const p=u.pathname.split('/').filter(Boolean); return p.at(-1)||''; } catch { return String(raw).split('/').filter(Boolean).pop()||''; }
  }
  function arrayFrom(v){
    if(Array.isArray(v)) return v;
    if(!v || typeof v!=='object') return [];
    const keys=['results','items','data','movies','peliculas','series','tvshows','shows','content','posts','entries','list'];
    for(const k of keys){ if(Array.isArray(v[k])) return v[k]; }
    if(v.data && typeof v.data==='object') return arrayFrom(v.data);
    return [];
  }
  function first(v, keys, fallback=''){
    for(const k of keys){
      const x = v?.[k];
      if(x!==undefined && x!==null && String(x).trim()!=='') return x;
    }
    return fallback;
  }
  function normalize(x, kind){
    if(!x || typeof x!=='object') return null;
    const url=first(x,['url','link','permalink','href']);
    const title=first(x,['title','name','post_title','original_title'],'Sin título');
    const image=first(x,['image','poster','poster_url','posterUrl','thumbnail','cover','poster_path','image_url']);
    const banner=first(x,['banner','backdrop','backdrop_url','backdropUrl','backdrop_path', 'hero'],image);
    const year=first(x,['year','release_year','releaseDate','release_date','first_air_date'],'');
    const rating=first(x,['rating','vote_average','score','tmdb_rating'],'');
    const description=first(x,['description','overview','synopsis','sinopsis','excerpt','plot'],'');
    const genres=first(x,['genres','genre','categories'],[]);
    return {
      id:first(x,['id','tmdb_id','_id'], slugFrom(x)||title),
      slug:first(x,['slug','id'],slugFrom(x)),
      title:String(title), image:String(image||''), banner:String(banner||image||''),
      year:String(year||'').slice(0,4), rating:String(rating||''), description:String(description||''),
      genres:Array.isArray(genres)?genres:(genres?String(genres).split(/[,|]/).map(s=>s.trim()).filter(Boolean):[]),
      url:String(url||''), providerUrl:String(url||''), kind, raw:x
    };
  }
  async function getJSON(url, params={}){
    const u=new URL(url);
    Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') u.searchParams.set(k,v); });
    const ctl=new AbortController(); const timer=setTimeout(()=>ctl.abort(),A.timeout);
    try{
      const r=await fetch(u.toString(),{method:'GET',headers:{Accept:'application/json,text/plain,*/*'},cache:'no-store',signal:ctl.signal});
      const text=await r.text();
      if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      try{return JSON.parse(text)}catch{return {rawText:text}};
    }finally{clearTimeout(timer)}
  }
  function endpointFor(kind){ return kind==='series'?'series':'peliculas'; }

  function allHttpUrls(value,out=[]){
    const add=s=>{ if(typeof s!=='string') return; for(const m of s.matchAll(/https?:\/\/[^\s"'<>]+/gi)){ const u=m[0].replace(/[),.;]+$/,''); if(!out.includes(u)) out.push(u); } };
    if(typeof value==='string') add(value);
    else if(Array.isArray(value)) value.forEach(v=>allHttpUrls(v,out));
    else if(value&&typeof value==='object') Object.values(value).forEach(v=>allHttpUrls(v,out));
    return out;
  }
  function findUrls(value,out=[]){
    const found=[];
    const add=(u,priority=0)=>{
      if(typeof u!=='string' || !/^https?:\/\//i.test(u)) return;
      if(!found.some(x=>x.url===u)) found.push({url:u,priority});
    };
    const walk=(v,key='')=>{
      if(typeof v==='string'){
        for(const u of v.matchAll(/https?:\/\/[^\s"\'<>]+/gi)){
          const url=u[0].replace(/[),.;]+$/,'');
          let priority=0;
          if(/proxy_url|proxyUrl|streamproxy/i.test(key)) priority=100;
          else if(/qualities/i.test(key)) priority=90;
          else if(/hls_status/i.test(key)) priority=80;
          else if(/\.(m3u8|mp4|webm|ogg)(\?|$)/i.test(url)) priority=60;
          else if(/streamurl|streamproxy/i.test(url)) priority=95;
          else if(/master\.txt(\?|$)/i.test(url)) priority=75;
          if(/\.(m3u8|mp4|webm|ogg)(\?|$)/i.test(url) || /streamproxy|proxy_url|streamurl/i.test(key) || /streamproxy|\.m3u8|\.mp4|master\.txt/i.test(url)) add(url,priority);
        }
        return;
      }
      if(Array.isArray(v)){v.forEach(x=>walk(x,key));return;}
      if(v&&typeof v==='object'){Object.entries(v).forEach(([k,x])=>walk(x,k));}
    };
    walk(value);
    found.sort((a,b)=>b.priority-a.priority);
    for(const x of found) if(!out.includes(x.url)) out.push(x.url);
    return [...new Set(out)];
  }
  function findQualityProxyUrls(value,out=[]){
    const add=u=>{if(typeof u==='string'&&/^https?:\/\//i.test(u)&&!out.includes(u))out.push(u)};
    const walk=v=>{
      if(!v)return;
      if(Array.isArray(v)){v.forEach(walk);return;}
      if(typeof v!=='object')return;
      Object.entries(v).forEach(([k,x])=>{
        if(/proxy_url|proxyUrl/i.test(k)) add(x);
        walk(x);
      });
    };
    walk(value);
    return [...new Set(out)];
  }

  function findEmbeds(value,out=[]){
    const walk=(v,key='')=>{
      if(typeof v==='string' && /^https?:\/\//i.test(v)){
        if(/embed|iframe|player|source|stream|server|video/i.test(key) || /\/embed\b|\/player\b|embed\.|player\./i.test(v)) out.push(v);
        return;
      }
      if(Array.isArray(v)){v.forEach(x=>walk(x,key));return;}
      if(v&&typeof v==='object') Object.entries(v).forEach(([k,x])=>walk(x,k));
    };
    walk(value);
    return [...new Set(out)];
  }
  function findCandidates(value,out=[]){
    const seen=new Set(out);
    for(const u of allHttpUrls(value,[])){
      if(/\.(m3u8|mp4|webm|ogg)(\?|$)/i.test(u) || /embed|iframe|player|stream|video/i.test(u)) { if(!seen.has(u)){seen.add(u);out.push(u);} }
    }
    return out;
  }

  function findEpisodes(value,out=[]){
    // La API no siempre devuelve las temporadas con la misma estructura.
    // Puede usar: seasons[{season:1,episodes:[...]}], {"1":[...]},
    // season_1, temporada_2, o episodios sin URL (la URL se resuelve después).
    const seen=new Set();
    const seasonKey=/^(?:season|temporada)[ _-]?(\d+)$/i;
    const numericKey=/^\d+$/;
    const episodeLike=(v)=>{
      if(!v || typeof v!=='object' || Array.isArray(v)) return false;
      const num=first(v,['episode_number','episodeNumber','episode','number','num'],null);
      const title=first(v,['title','name','episode_title','episodeTitle'],'');
      const url=first(v,['url','link','episode_url','embed_url','embed','stream_url','extractUrl','extract_url'],'');
      return num!==null || url || /episode|episodio/i.test(String(title));
    };
    function pushEpisode(v,season,fallbackNumber){
      const num=first(v,['episode_number','episodeNumber','episode','number','num'],fallbackNumber??null);
      const title=first(v,['title','name','episode_title','episodeTitle'],`Episodio ${num??out.length+1}`);
      const url=first(v,['url','link','episode_url','embed_url','embed','stream_url','extractUrl','extract_url'],'');
      if(num===null && !url && !/episode|episodio/i.test(String(title))) return;
      const s=first(v,['season','season_number','seasonNumber'],season||'1');
      const key=JSON.stringify([String(s),String(num??''),String(title),String(url)]);
      if(seen.has(key)) return;
      seen.add(key);
      out.push({season:String(s),number:String(num??fallbackNumber??out.length+1),title:String(title),url:String(url||''),raw:v});
    }
    function walk(v,season='1',parentKey=''){
      if(v==null) return;
      if(Array.isArray(v)){
        // Si el arreglo contiene objetos de episodio, no necesitamos otro nivel.
        v.forEach((x,i)=>{
          if(episodeLike(x)) pushEpisode(x,season, i+1);
          else walk(x,season,parentKey);
        });
        return;
      }
      if(typeof v!=='object') return;

      // El propio objeto puede declarar explícitamente la temporada.
      const explicit=first(v,['season','season_number','seasonNumber'],null);
      const currentSeason=explicit!==null ? String(explicit) : season;
      if(episodeLike(v)) pushEpisode(v,currentSeason,null);

      Object.entries(v).forEach(([k,x])=>{
        let nextSeason=currentSeason;
        const m=String(k).match(seasonKey);
        if(m) nextSeason=m[1];
        // Algunas respuestas vienen como {"1":[episodios],"2":[episodios]}.
        // Solo tratamos una clave numérica como temporada cuando su valor contiene episodios.
        else if(numericKey.test(String(k)) && (Array.isArray(x) || (x&&typeof x==='object'))){
          const arr=Array.isArray(x)?x:Object.values(x);
          if(arr.some(episodeLike)) nextSeason=String(k);
        }
        walk(x,nextSeason,k);
      });
    }
    walk(value,'1','');
    return out.sort((a,b)=>{
      const sa=Number(a.season), sb=Number(b.season), na=Number(a.number), nb=Number(b.number);
      return (Number.isFinite(sa)?sa:999)-(Number.isFinite(sb)?sb:999) ||
             (Number.isFinite(na)?na:999)-(Number.isFinite(nb)?nb:999);
    });
  }

  async function list(kind,page=1){
    const endpoint=endpointFor(kind);
    const errors=[];
    for(const provider of A.providers){
      try{
        const data=await getJSON(join(provider.base,endpoint),{page});
        const items=arrayFrom(data).map(x=>normalize(x,kind)).filter(Boolean);
        if(items.length || data?.status==='success' || data?.success===true){
          const totalPages=Number(first(data,['totalPages','total_pages','pages'],0))||0;
          const current=Number(first(data,['currentPage','current_page','page'],page))||page;
          const hasNext=Boolean(data?.hasNextPage ?? data?.has_next ?? (totalPages>current));
          return {items,source:provider,raw:data,page,hasNext,totalPages,current};
        }
      }catch(e){errors.push(`${provider.name}: ${e.message}`)}
    }
    return {items:[],source:null,raw:null,page,hasNext:false,totalPages:0,current:page,errors};
  }

  async function detail(item,kind){
    const slug=slugFrom(item) || item.slug || item.id;
    const endpoint=kind==='series'?`serie/${encodeURIComponent(slug)}`:`pelicula/${encodeURIComponent(slug)}`;
    const errors=[];
    const order=[];
    if(item?.providerName) order.push(...A.providers.filter(p=>p.name===item.providerName));
    order.push(...A.providers.filter(p=>!order.includes(p)));
    for(const provider of order){
      try{
        const data=await getJSON(join(provider.base,endpoint));
        const episodes=findEpisodes(data).map(e=>({...e,seriesSlug:slug,providerName:provider.name}));
        return {data,provider,episodes,embeds:findEmbeds(data),urls:findUrls(data),candidates:findCandidates(data),errors};
      }catch(e){errors.push(`${provider.name}: ${e.message}`)}
    }
    return {data:null,provider:null,episodes:[],embeds:[],urls:[],candidates:[],errors};
  }

  async function streamFromEmbed(embed, provider){
    if(!embed || !provider) return [];
    try{
      const data=await getJSON(join(provider.base,'streamurl'),{url:embed});
      return findUrls(data);
    }catch(e){ return []; }
  }

  async function resolve(item,kind){
    const d=await detail(item,kind);
    let urls=[...findQualityProxyUrls(d.data),...d.urls];
    const candidates=[...new Set([...(d.embeds||[]),...(d.candidates||[])])];
    for(const c of candidates){
      if(urls.some(u=>u===c)) continue;
      const got=await streamFromEmbed(c,d.provider);
      if(got.length) urls.push(...got);
    }
    return {...d,urls:[...new Set(urls)]};
  }

  async function resolveEpisode(ep){
    const errors=[];
    const rawUrl=ep?.url||ep?.link||ep?.extractUrl||ep?.extract_url||'';
    const season=ep?.season||ep?.season_number||'1';
    const number=ep?.number||ep?.episode||ep?.episode_number||'1';
    const slug=ep?.seriesSlug||ep?.slug||'';
    for(const provider of A.providers){
      try{
        // Prefer the documented episode endpoint when the series slug is known.
        if(slug){
          const endpoint=`serie/${encodeURIComponent(slug)}/${encodeURIComponent(season)}/${encodeURIComponent(number)}`;
          const data=await getJSON(join(provider.base,endpoint));
          const urls=findUrls(data);
          const embeds=findEmbeds(data);
          const candidates=findCandidates(data);
          let resolved=[...urls];
          for(const c of [...new Set([...embeds,...candidates])]){
            if(resolved.includes(c)) continue;
            resolved.push(...await streamFromEmbed(c,provider));
          }
          if(resolved.length || embeds.length) return {urls:[...new Set(resolved)],embeds:[...new Set(embeds)],data,provider,errors};
        }
        // Fallback: resolve a URL supplied by the API through its documented streamurl endpoint.
        if(rawUrl){
          const data=/^https?:\/\//i.test(rawUrl) && rawUrl.includes('tvymas.workers.dev')
            ? await getJSON(rawUrl)
            : await getJSON(join(provider.base,'streamurl'),{url:rawUrl});
          const urls=findUrls(data);
          const embeds=findEmbeds(data);
          if(urls.length || embeds.length) return {urls:[...new Set(urls)],embeds:[...new Set(embeds)],data,provider,errors};
        }
      }catch(e){errors.push(`${provider.name}: ${e.message}`)}
    }
    return {urls:[],embeds:[],data:null,provider:null,errors};
  }

  async function search(kind, query){
    const q=String(query||'').trim();
    if(!q) return [];
    const results=[]; const seen=new Set();
    const maxPages=30;
    for(let page=1; page<=maxPages; page++){
      let r;
      try{ r=await list(kind,page); }catch{ break; }
      if(!r.items?.length) break;
      for(const item of r.items){
        const hay=normText([item.title,item.year,item.description,...(item.genres||[])].join(' '));
        if(hay.includes(normText(q))){
          const key=String(item.id||item.title).toLowerCase();
          if(!seen.has(key)){seen.add(key);results.push(item)}
        }
      }
      if(!r.hasNext) break;
    }
    return results;
  }
  function normText(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}

  async function genres(){
    for(const p of A.providers){
      try{
        const d=await getJSON(join(p.base,'generos'));
        const a=arrayFrom(d); if(a.length) return a;
        if(Array.isArray(d)) return d;
      }catch{}
    }
    return [];
  }

  window.NVApi={getJSON,list,search,detail,resolve,resolveEpisode,genres,normalize,findUrls,findQualityProxyUrls,findEpisodes,providers:A.providers};
})();
