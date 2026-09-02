/* NETVISION PERFILES — perfiles, avatares, fondos y gestión */
'use strict';
const PKEY='netvision_profiles_v7', AKEY='netvision_active_v7';
let editingId=null,creating=false,avatar='',background='';
const AVATARS=[
 'https://api.dicebear.com/10.x/adventurer/svg?seed=Alex&backgroundColor=111827',
 'https://api.dicebear.com/10.x/adventurer/svg?seed=Laura&backgroundColor=1d2440',
 'https://api.dicebear.com/10.x/lorelei/svg?seed=Diego&backgroundColor=171b31',
 'https://api.dicebear.com/10.x/lorelei/svg?seed=Kids&backgroundColor=241b36',
 'https://api.dicebear.com/10.x/bottts/svg?seed=Neo&backgroundColor=101a2d',
 'https://api.dicebear.com/10.x/personas/svg?seed=Nova&backgroundColor=20182f',
 'https://api.dicebear.com/10.x/pixel-art/svg?seed=Pixel&backgroundColor=111827',
 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Fun&backgroundColor=281d2e'
];
const BACKGROUNDS=[
 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85'
];
function save(){localStorage.setItem(PKEY,JSON.stringify(NV.state.profiles))}
function img(u){return `<img src="${NV.esc(u)}" alt="Avatar" loading="lazy">`}
function applyBackground(url){document.body.style.backgroundImage=url?`linear-gradient(135deg,rgba(3,6,15,.84),rgba(5,8,18,.72) 48%,rgba(3,5,12,.9)),url("${String(url).replace(/"/g,'&quot;')}")`:'radial-gradient(circle at 15% 8%,#172544 0,#070b14 32%,#03060d 72%)';document.body.style.backgroundSize='cover';document.body.style.backgroundPosition='center';document.body.style.backgroundAttachment='fixed';const gate=NV.$('#profileGate');if(gate)gate.style.backgroundImage=url?`linear-gradient(135deg,rgba(3,6,15,.84),rgba(5,8,18,.78)),url("${String(url).replace(/"/g,'&quot;')}")`:''}
function seedProfiles(){
 if(NV.state.profiles.length)return;
 NV.state.profiles=[
  {id:'default-alex',name:'Alex',avatar:AVATARS[0],background:BACKGROUNDS[0]},
  {id:'default-laura',name:'Laura',avatar:AVATARS[1],background:BACKGROUNDS[3]},
  {id:'default-diego',name:'Diego',avatar:AVATARS[2],background:BACKGROUNDS[1]},
  {id:'default-kids',name:'Kids',avatar:AVATARS[3],background:BACKGROUNDS[4]}
 ];save();
}
NV.renderProfiles=()=>{const box=NV.$('#profileList');if(!box)return;box.innerHTML='';NV.state.profiles.forEach((p,i)=>{const b=document.createElement('button');b.className='profile-choice';b.innerHTML=`<div class="profile-avatar">${img(p.avatar)}</div><strong>${NV.esc(p.name)}</strong><small>Entrar</small>`;b.onclick=()=>NV.enter(i);box.appendChild(b)});const add=document.createElement('button');add.className='profile-choice add-profile';add.innerHTML='<div class="profile-avatar plus">+</div><strong>Agregar perfil</strong><small>Nuevo usuario</small>';add.onclick=()=>NV.openProfile(null,true);box.appendChild(add)};
NV.openProfile=(id,force=false)=>{creating=!!force;editingId=force?null:(id||null);const p=editingId?NV.state.profiles.find(x=>x.id===editingId):null;avatar=p?.avatar||AVATARS[0];background=p?.background||BACKGROUNDS[0];NV.$('#profileModalTitle').textContent=p?'Editar perfil':'Crear perfil';NV.$('#profileName').value=p?.name||'';NV.$('#deleteProfile').classList.toggle('hidden',!p);renderPicker();NV.$('#profileModal').classList.remove('hidden')};
function renderPicker(){NV.$('#editAvatar').innerHTML=img(avatar);NV.$('#avatarPicker').innerHTML=AVATARS.map((u,i)=>`<button type="button" class="avatar-option ${u===avatar?'active':''}" data-i="${i}">${img(u)}</button>`).join('');NV.$$('#avatarPicker .avatar-option').forEach(b=>b.onclick=()=>{avatar=AVATARS[+b.dataset.i];renderPicker()});NV.$('#backgroundPicker').innerHTML=BACKGROUNDS.map((u,i)=>`<button type="button" class="background-option ${u===background?'active':''}" data-i="${i}" style="background-image:linear-gradient(180deg,transparent,#050812aa),url('${u}')"><span>Fondo ${i+1}</span></button>`).join('');NV.$$('#backgroundPicker .background-option').forEach(b=>b.onclick=()=>{background=BACKGROUNDS[+b.dataset.i];applyBackground(background);renderPicker()});applyBackground(background)}
NV.applyProfile=p=>{if(!p)return;NV.$('#hello').textContent=`Hola, ${p.name}`;NV.$('#profileMiniName').textContent=p.name;NV.$('#profileMiniAvatar').innerHTML=img(p.avatar);applyBackground(p.background||BACKGROUNDS[0])};
NV.$('#saveProfile').onclick=()=>{const name=NV.$('#profileName').value.trim();if(!name){NV.toast('Escribe un nombre');return}if(editingId){const p=NV.state.profiles.find(x=>x.id===editingId);if(!p)return;Object.assign(p,{name,avatar,background});NV.state.activeProfile=p;localStorage.setItem(AKEY,p.id);save();NV.applyProfile(p);NV.renderProfiles();NV.$('#profileModal').classList.add('hidden');NV.toast('Perfil actualizado')}else{const p={id:crypto.randomUUID?.()||String(Date.now()),name,avatar,background};NV.state.profiles.push(p);save();NV.renderProfiles();NV.$('#profileModal').classList.add('hidden');if(creating)NV.enter(NV.state.profiles.length-1);else NV.toast('Perfil creado')}};
NV.$('#deleteProfile').onclick=()=>{if(!editingId)return;if(!confirm('¿Eliminar este perfil?'))return;NV.state.profiles=NV.state.profiles.filter(p=>p.id!==editingId);save();if(NV.state.activeProfile?.id===editingId){NV.state.activeProfile=null;localStorage.removeItem(AKEY);NV.stopAllPlayback?.();NV.$('#app').classList.add('hidden');NV.$('#profileGate').classList.remove('hidden');applyBackground('')}NV.$('#profileModal').classList.add('hidden');NV.renderProfiles()};
NV.$('#addProfileFromSettings').onclick=()=>NV.openProfile(null,true);
NV.$$('#profileModal [data-close]').forEach(b=>b.onclick=()=>NV.$('#profileModal').classList.add('hidden'));


/* V8 — selector de perfiles y ajustes independientes */
const SETTINGS_KEY='netvision_settings_v1';
function getSettings(){try{return Object.assign({autoplay:true,reducedMotion:false},JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'))}catch{return {autoplay:true,reducedMotion:false}}}
function saveSettings(v){localStorage.setItem(SETTINGS_KEY,JSON.stringify(v));document.documentElement.classList.toggle('reduced-motion',!!v.reducedMotion)}
NV.openProfileSwitcher=()=>{const box=NV.$('#profileSwitchList');if(!box)return;box.innerHTML=NV.state.profiles.map((p,i)=>`<button class="profile-switch-item ${NV.state.activeProfile?.id===p.id?'active':''}" data-i="${i}"><span class="profile-switch-avatar">${img(p.avatar)}</span><span><strong>${NV.esc(p.name)}</strong><small>${NV.state.activeProfile?.id===p.id?'Perfil actual':'Cambiar a este perfil'}</small></span><i class="fa-solid fa-chevron-right"></i></button>`).join('');NV.$$('#profileSwitchList .profile-switch-item').forEach(b=>b.onclick=()=>{NV.enter(+b.dataset.i);NV.$('#profileSwitchModal').classList.add('hidden')});NV.$('#profileSwitchModal').classList.remove('hidden')}
NV.openSettings=()=>{const s=getSettings();NV.$('#settingAutoplay').checked=!!s.autoplay;NV.$('#settingReducedMotion').checked=!!s.reducedMotion;NV.$('#settingsModal').classList.remove('hidden')}
function closeSettings(){NV.$('#settingsModal')?.classList.add('hidden')}
function openCreateFromSettings(){closeSettings();NV.openProfile(null,true)}
NV.$$('#profileSwitchModal [data-close-switch]').forEach(b=>b.onclick=()=>NV.$('#profileSwitchModal').classList.add('hidden'));
NV.$('#switchAddProfile').onclick=openCreateFromSettings;
NV.$('#settingsCreateProfile').onclick=openCreateFromSettings;
NV.$('#settingsManageProfiles').onclick=()=>{closeSettings();NV.openProfileSwitcher?.()};
NV.$('#settingAutoplay').onchange=e=>{const s=getSettings();s.autoplay=e.target.checked;saveSettings(s);NV.toast('Preferencia guardada')};
NV.$('#settingReducedMotion').onchange=e=>{const s=getSettings();s.reducedMotion=e.target.checked;saveSettings(s);NV.toast('Preferencia guardada')};
NV.$('#settingsResetPreferences').onclick=()=>{if(!confirm('¿Restablecer las preferencias de NETVISION?'))return;saveSettings({autoplay:true,reducedMotion:false});NV.openSettings();NV.toast('Preferencias restablecidas')};
NV.$$('#settingsModal [data-close-settings]').forEach(b=>b.onclick=closeSettings);
saveSettings(getSettings());
