
const $=id=>document.getElementById(id);
const DOMAINS=[
'Qualité|qualite,non conformité,non-conformite,rebut,audit,8d,amdec',
'Métrologie|metrologie,mesure,etalonnage,tolerance,incertitude',
'Production|production,fabrication,atelier,industriel',
'Maintenance|maintenance,panne,equipement,reparation',
'Comptabilité|comptabilite,compte,charge,bilan',
'Finance|finance,marge,investissement,rentabilite',
'Trésorerie|tresorerie,paiement,facture,liquidite',
'Fiscalité|fiscalite,taxe,impot,tva,urssaf',
'Juridique|juridique,contrat,droit,litige',
'Commercial|commercial,devis,prospect,vente',
'Marketing|marketing,communication,publicite',
'Relation client|client,avis,fidelisation,retour',
'SAV|sav,reclamation,garantie,service apres vente',
'Cybersécurité|cybersecurite,virus,securite informatique',
'Développement logiciel|developpement,code,logiciel,application',
'Intelligence artificielle|intelligence artificielle,agents,ia,automatisation',
'Gestion de projet|projet,planification,delai,jalon',
'Stratégie|strategie,croissance,positionnement',
'Ressources humaines|recrutement,personnel,formation,rh',
'Logistique|transport,stock,livraison',
'Achats|achats,fournisseur,approvisionnement',
'Commerce électronique|ecommerce,boutique en ligne,panier',
'Artisanat|artisanat,artisan,atelier',
'Bâtiment et travaux|batiment,chantier,travaux,btp',
'Agroalimentaire|alimentaire,cuisine,agriculture,hygiene',
'Environnement|environnement,dechet,ecologie',
'Énergie|energie,electricite,consommation',
'Innovation|innovation,prototype,brevet',
'Formation|formation,apprentissage,eleve',
'Audiovisuel|video,cinema,film,montage',
'Musique|musique,audio,mastering,mixage',
'Photographie|photo,photographie,image',
'Design|design,graphisme,ux,interface',
'Événementiel|evenement,spectacle,festival',
'Communication|communication,presse,contenu',
'Tourisme|tourisme,voyage,hebergement',
'Hôtellerie|hotel,restaurant,restauration',
'Santé et bien-être|sante,bien etre,soin',
'Sécurité au travail|securite,accident,prevention',
'Analyse de données|donnee,data,tableau de bord,statistique',
'International|international,export,import,douane',
'Assurance|assurance,sinistre,risque',
'Immobilier|immobilier,location,local',
'Administration|administration,formulaire,demarche',
'Recherche|recherche,scientifique,experience',
'Service à la personne|service a la personne,aide,domicile',
'Transport|vehicule,mobilite,transporteur',
'Architecture|architecture,plan,construction',
'Gestion des risques|risque,urgence,crise',
'Entrepreneuriat|auto entrepreneur,micro entreprise,entrepreneur'
].map(row=>{const [name,keys]=row.split('|');return {name,keys:keys.split(',')};});
const ROLES=['Analyste','Auditeur','Consultant','Contrôleur','Planificateur','Chercheur','Technicien','Ingénieur','Chef de projet','Coordinateur','Formateur','Expert métier','Inspecteur','Conseiller','Diagnosticien','Responsable qualité','Responsable financier','Médiateur','Architecte','Synthétiseur'];
const METHODS=['PDCA','8D','5 pourquoi','Ishikawa','AMDEC','Pareto','DMAIC','A3','Analyse de risques','Audit','Benchmark','SIPOC','Cartographie','Plan de contrôle','KPI','Revue documentaire','Gemba','SMART','OKR','SWOT','PESTEL','Business model canvas','Analyse de coûts','Budget','Trésorerie prévisionnelle','VSM','SMED','5S','Kanban','Scrum','Analyse de processus','Mesure et validation','Recherche causale','Arbre de défaillances','Test A/B','Priorisation RICE','Matrice d Eisenhower','Conception centrée utilisateur','Design thinking','Revue contradictoire','Conformité réglementaire','Documentation technique','Prototypage','Essais de validation','Analyse de sensibilité','Gestion de crise','Observation terrain','Évaluation fournisseurs','Plan d action','Revue finale'];
const FOCUS=['Diagnostic','Prévention','Optimisation','Contrôle','Pilotage'];
const ANGLES=['opérationnel','financier','réglementaire','client'];
const BASE=['Stratégie et modèle économique','Gestion financière et trésorerie','Coûts, marges et tarifs','Prospection et relation client','Marketing et vente','Qualité et amélioration continue','Organisation et productivité','Risques et cybersécurité','Contrats, fiscalité et conformité','Fournisseurs et achats','Indicateurs et tableaux de bord','Gestion de projet et RH','Plan de continuité'];
const state={agents:[],files:[],report:null,urls:[],install:null};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bytes=n=>n<1024?n+' o':n<1048576?(n/1024).toFixed(1)+' Ko':(n/1048576).toFixed(1)+' Mo';
const db=n=>n>0?(20*Math.log10(n)).toFixed(2)+' dBFS':'−∞ dBFS';
function idToAgent(raw){
 const id=String(raw).trim().toUpperCase();
 if(!/^AG-\d{7}$/.test(id))throw Error('Identifiant attendu : AG-0000001 à AG-1000000');
 const k=Number(id.slice(3))-1;if(k<0||k>=1000000)throw Error('Profil hors catalogue');
 const di=Math.floor(k/20000),si=Math.floor((k%20000)/1000),ri=Math.floor((k%1000)/50),mi=k%50;
 const specialty=FOCUS[Math.floor(si/4)]+' '+DOMAINS[di].name.toLowerCase()+' — angle '+ANGLES[si%4];
 return {id,domain:DOMAINS[di].name,specialty,role:ROLES[ri],method:METHODS[mi],specialtyIndex:si,domainIndex:di};
}
function makeId(di,si,ri,mi){return 'AG-'+String(1+di*20000+si*1000+ri*50+mi).padStart(7,'0');}
function rank(q){const s=norm(q);return DOMAINS.map((d,i)=>({i,score:d.keys.reduce((n,w)=>n+(s.includes(norm(w))?3:0),s.includes(norm(d.name))?8:0)})).sort((a,b)=>b.score-a.score||a.i-b.i);}
function selectAgents(q,count){if(!q.trim())throw Error('Décris d’abord ta mission');const list=rank(q);let picked=list.filter(x=>x.score>0).slice(0,10).map(x=>x.i);picked=[...new Set([...picked,0,6,17,11,48,49,14,15,30,39,9])];return Array.from({length:count},(_,i)=>idToAgent(makeId(picked[i%picked.length],i%20,(i*3)%20,(i*7)%50)));}
function library(a){return [...BASE,'Métier : '+a.domain,'Spécialité : '+a.specialty,'Méthode : '+a.method,'Guide de recherche des preuves','Validation des risques et impacts','Plan de mesure et vérification'];}
function card(a){
 const e=document.createElement('article');e.className='agent-card';
 e.innerHTML='<span class="aid">'+a.id+'</span><h3>'+escapeHtml(a.domain)+'</h3><p><b>'+escapeHtml(a.specialty)+'</b></p><p>Rôle : '+escapeHtml(a.role)+'<br>Méthode : '+escapeHtml(a.method)+'</p><p class="tiny">Bibliothèque spécialisée + 13 modules de gestion d’entreprise</p>';
 const details=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Voir la bibliothèque ('+library(a).length+' références)';details.append(sum);
 const ul=document.createElement('ul');for(const x of library(a)){const li=document.createElement('li');li.textContent=x;ul.append(li);}details.append(ul);e.append(details);
 const b=document.createElement('button');b.textContent='Retirer cet agent';b.className='btn tertiary';b.onclick=()=>{state.agents=state.agents.filter(x=>x.id!==a.id);save();renderAgents();};e.append(b);return e;
}
function save(){try{localStorage.setItem('ae1m-v2-github',JSON.stringify({q:$('missionInput').value,n:$('agentCount').value,ids:state.agents.map(a=>a.id)}));}catch{}}
function restore(){try{const a=JSON.parse(localStorage.getItem('ae1m-v2-github')||'null');if(a){$('missionInput').value=a.q||'';$('agentCount').value=a.n||'10';state.agents=(a.ids||[]).slice(0,10).map(idToAgent);}}catch{}}
function renderCounts(){
 $('activeCount').textContent=state.agents.length+' / 10';$('activeFiles').textContent=state.files.length;$('fileCountTop').textContent=state.files.length;
 $('activeMessages').textContent=state.report?.communications?.length||0;$('fileCount').textContent=state.files.length;$('summaryCount').textContent=state.files.length;
 $('summarySize').textContent=bytes(state.files.reduce((n,f)=>n+f.file.size,0));
 let dur=state.files.reduce((n,f)=>n+(f.data?.duration||0),0);$('summaryDuration').textContent=Math.round(dur)+' s';
}
function renderAgents(){const el=$('agentsList');el.replaceChildren();if(!state.agents.length){el.textContent='Aucun profil sélectionné.';}else state.agents.forEach(a=>el.append(card(a)));renderCounts();}
function notify(id,text,error=false){const el=$(id);el.textContent=text;el.classList.toggle('error',error);}
function toast(text){const el=$('toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3500);}
function select(){try{state.agents=selectAgents($('missionInput').value,Number($('agentCount').value));state.report=null;$('missionResult').hidden=true;save();renderAgents();notify('missionNotice',state.agents.length+' profils sélectionnés.');}catch(e){notify('missionNotice',e.message,true);}}
function report(){
 const q=$('missionInput').value.trim();if(!q)throw Error('Décris ta mission avant analyse');
 if(!state.agents.length)state.agents=selectAgents(q,Number($('agentCount').value));
 const messages=[{from:'Utilisateur',to:'Orchestrateur',type:'mission',message:q}];
 const contributions=state.agents.map((a,i)=>{messages.push({from:'Orchestrateur',to:a.id,type:'délégation',message:'Examiner '+a.specialty+' avec '+a.method});
  const text='Analyse du domaine '+a.domain+' : établir les faits, les preuves, les risques et les critères mesurables. Contrôler coûts, marges, trésorerie, conformité et satisfaction client.';
  messages.push({from:a.id,to:'Équipe',type:'partage',message:text});
  const peer=state.agents[(i+1)%state.agents.length];messages.push({from:a.id,to:peer.id,type:'revue croisée demandée',message:'Vérifier les hypothèses, pièces et impacts de '+a.id});
  return {agent:a,observation:text,checklist:['Documenter faits et sources','Distinguer hypothèses et causes confirmées','Mesurer l’incidence financière et opérationnelle','Définir action corrective et responsable','Suivre un indicateur et recontrôler'],references:library(a)};});
 const evidence=state.files.map(f=>f.file.name+' — '+f.type+' — '+bytes(f.file.size)+(f.data?' — '+JSON.stringify(f.data):''));
 const lines=['# AutoEntrepreneur 1M — Rapport','Mission : '+q,'','Mode : collaboration méthodologique déterministe (sans IA générative)','',...contributions.flatMap((c,i)=>['## '+(i+1)+'. '+c.agent.domain+' / '+c.agent.id,'Spécialisation : '+c.agent.specialty,'Rôle : '+c.agent.role+' | Méthode : '+c.agent.method,c.observation,...c.checklist.map(x=>'- '+x),'','Bibliothèque : '+c.references.join(', '),'']), '## Fichiers reçus',...evidence.map(x=>'- '+x),'','## Communication inter-agents',...messages.map(m=>'- '+m.from+' → '+m.to+' ('+m.type+') : '+m.message),'','## Limites','Les recommandations sont des pistes méthodologiques et ne constituent pas une expertise indépendante. Aucun modèle multimodal ou LLM externe n’est exécuté.'];
 state.report={date:new Date().toISOString(),question:q,agents:state.agents,contributions,communications:messages,evidence,markdown:lines.join('\n')};
 $('reportText').textContent=state.report.markdown;$('missionResult').hidden=false;notify('missionNotice','Rapport produit avec '+state.agents.length+' agents, '+messages.length+' échanges et '+state.files.length+' fichiers.');renderCounts();save();
}
function classify(f){const type=f.type||'',n=f.name.toLowerCase();if(type.startsWith('audio/')||/\.(wav|mp3|aac|flac|ogg|m4a)$/i.test(n))return'audio';if(type.startsWith('image/'))return'image';if(type.startsWith('video/'))return'video';if(/\.(txt|csv|tsv|json|md|srt|log|xml|yaml|yml)$/i.test(n)||type.startsWith('text/'))return'texte';return'document';}
async function analyze(f,entry){
 if(entry.type==='texte'&&f.size<=4e6){const t=await f.text();entry.text=t.slice(0,16000);entry.data={lines:t.split(/\r?\n/).length,preview:t.slice(0,1000)};return;}
 if(entry.type==='image'){try{const bmp=await createImageBitmap(f);entry.data={width:bmp.width,height:bmp.height};bmp.close();}catch{}return;}
 if(entry.type==='audio'&&f.size<80e6){let ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();const buffer=await ctx.decodeAudioData(await f.arrayBuffer());const samples=buffer.length,channels=buffer.numberOfChannels,step=Math.max(1,Math.floor(samples/600000));let sum=0,max=0,clip=0,n=0;
 for(let c=0;c<channels;c++){const a=buffer.getChannelData(c);for(let i=0;i<a.length;i+=step){const x=Math.abs(a[i]);max=Math.max(max,x);sum+=x*x;if(x>=.999)clip++;n++;}}
 const rms=Math.sqrt(sum/Math.max(n,1));entry.data={duration:+buffer.duration.toFixed(2),sampleRate:buffer.sampleRate,channels,peakDbfs:db(max),rmsDbfs:db(rms),crestDb:+(20*Math.log10(Math.max(max,1e-10)/Math.max(rms,1e-10))).toFixed(2),clippedPercent:+(100*clip/Math.max(1,n)).toFixed(3),estimated:step>1};}catch(err){entry.data={note:'Décodage audio non pris en charge par le navigateur'};}finally{await ctx?.close().catch(()=>{});}return;}
 if(entry.type==='video'){try{const video=document.createElement('video');const url=URL.createObjectURL(f);const duration=await new Promise((res,rej)=>{video.preload='metadata';video.onloadedmetadata=()=>res(video.duration);video.onerror=rej;video.src=url;setTimeout(()=>rej(Error('Délai dépassé')),5000);});URL.revokeObjectURL(url);entry.data={duration:Number.isFinite(duration)?duration:null};}catch{}}
}
async function addFiles(list){
 const fs=[...list].slice(0,1500);if(!fs.length)return;notify('importNotice','Analyse de '+fs.length+' fichier(s)…');
 for(const f of fs){const e={file:f,id:crypto.randomUUID?.()||String(Date.now()+Math.random()),path:f.webkitRelativePath||f.name,type:classify(f),status:'Inventorié',data:null,assigned:['*']};state.files.push(e);try{await analyze(f,e);e.status='Analysé';}catch(err){e.status='Inventorié';}}renderFiles();renderAgents();renderCounts();notify('importNotice',fs.length+' fichier(s) importé(s), conservé(s) localement dans la session.');}
function renderFiles(){const el=$('fileList');el.replaceChildren();if(!state.files.length){el.textContent='Aucun fichier importé.';return;}
 state.files.forEach(e=>{const d=document.createElement('div');d.className='file-row';d.innerHTML='<div class="fl-icon">'+({audio:'♫',image:'▣',video:'▷',texte:'≡',document:'▤'}[e.type])+'</div><div class="file-middle"><div class="filename">'+escapeHtml(e.path)+'</div><div class="filemeta">'+e.type+' · '+bytes(e.file.size)+' · '+e.status+'</div></div>';
 const b=document.createElement('div');b.className='row-actions';
 const open=document.createElement('button');open.textContent='Ouvrir';open.onclick=()=>showFile(e);b.append(open);
 const orig=document.createElement('button');orig.textContent='Original';orig.onclick=()=>download(e.file,e.file.name);b.append(orig);
 const del=document.createElement('button');del.textContent='×';del.onclick=()=>{state.files=state.files.filter(f=>f!==e);state.report=null;$('missionResult').hidden=true;renderFiles();renderCounts();};b.append(del);d.append(b);el.append(d);});}
function showFile(e){const d=$('fileDetail');d.replaceChildren();d.hidden=false;state.urls.forEach(URL.revokeObjectURL);state.urls=[];
 const h=document.createElement('h3');h.textContent=e.path;d.append(h);const p=document.createElement('pre');p.textContent=JSON.stringify(e.data||{type:e.type,size:e.file.size,note:'Contenu non analysé'},null,2);d.append(p);
 if(e.text){const preview=document.createElement('pre');preview.textContent=e.text.slice(0,6000);d.append(preview);}
 if(e.type==='audio'||e.type==='video'||e.type==='image'){const u=URL.createObjectURL(e.file);state.urls.push(u);const m=document.createElement(e.type==='image'?'img':e.type);m.src=u;if(e.type!=='image')m.controls=true;m.style.maxWidth='100%';d.append(m);}
 const sel=document.createElement('select');[['*','Toute l’équipe'],...state.agents.map(a=>[a.id,a.domain+' · '+a.id])].forEach(([v,n])=>{const opt=document.createElement('option');opt.value=v;opt.textContent=n;sel.append(opt);});sel.value=e.assigned[0]||'*';sel.onchange=()=>e.assigned=[sel.value];d.append(sel);
 if(e.type==='image')for(const fmt of ['png','jpeg','webp']){const b=document.createElement('button');b.className='btn secondary';b.textContent='Exporter '+fmt.toUpperCase();b.onclick=async()=>{try{const bmp=await createImageBitmap(e.file),c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;c.getContext('2d').drawImage(bmp,0,0);bmp.close();c.toBlob(blob=>{if(blob)download(blob,e.file.name.replace(/\.[^.]+$/,'')+'.'+(fmt==='jpeg'?'jpg':fmt));},'image/'+fmt,.92);}catch(x){toast(x.message);}};d.append(b);}
 if(e.type==='audio')for(const bit of [16,24,32]){const b=document.createElement('button');b.textContent='WAV '+bit+' bits';b.className='btn secondary';b.onclick=async()=>{let ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();const audio=await ctx.decodeAudioData(await e.file.arrayBuffer());download(audioToWav(audio,bit),e.file.name.replace(/\.[^.]+$/,'')+'-'+bit+'.wav');}catch(x){toast('Conversion impossible : '+x.message);}finally{await ctx?.close().catch(()=>{});}};d.append(b);}d.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function audioToWav(a,bits){const n=a.length,ch=a.numberOfChannels,rate=a.sampleRate,size=bits/8,ab=new ArrayBuffer(44+n*ch*size),v=new DataView(ab);const w=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));};
 w(0,'RIFF');v.setUint32(4,36+n*ch*size,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,bits===32?3:1,true);v.setUint16(22,ch,true);v.setUint32(24,rate,true);v.setUint32(28,rate*ch*size,true);v.setUint16(32,ch*size,true);v.setUint16(34,bits,true);w(36,'data');v.setUint32(40,n*ch*size,true);
 let p=44;for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,a.getChannelData(c)[i]));if(bits===16){v.setInt16(p,Math.round(x<0?x*32768:x*32767),true);p+=2;}else if(bits===24){let y=Math.round(x<0?x*8388608:x*8388607);v.setUint8(p,y&255);v.setUint8(p+1,(y>>8)&255);v.setUint8(p+2,(y>>16)&255);p+=3;}else{v.setFloat32(p,x,true);p+=4;}}
 return new Blob([ab],{type:'audio/wav'});
}
function download(data,name){const b=data instanceof Blob?data:new Blob([data],{type:'application/octet-stream'});const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
function exportData(format){const obj={report:state.report,files:state.files.map(f=>({name:f.path,type:f.type,size:f.file.size,analysis:f.data,assigned:f.assigned}))};if(format==='json')return JSON.stringify(obj,null,2);if(format==='md'||format==='txt')return state.report?.markdown||'# Inventaire AutoEntrepreneur 1M\n'+obj.files.map(f=>'- '+f.name+' '+f.type).join('\n');
 const data=obj.files.map(f=>({name:f.name,type:f.type,size:f.size,analysis:JSON.stringify(f.analysis||{})}));
 if(format==='csv'||format==='tsv'){const sep=format==='csv'?',':'\t';return [Object.keys(data[0]||{name:'',type:'',size:'',analysis:''}).join(sep),...data.map(row=>Object.values(row).map(x=>'"'+String(x).replaceAll('"','""')+'"').join(sep))].join('\n');}
 if(format==='html')return '<!doctype html><meta charset="utf-8"><title>Rapport AutoEntrepreneur 1M</title><pre style="white-space:pre-wrap;font:14px system-ui">'+escapeHtml(exportData('md'))+'</pre>';
 if(format==='xml')return '<?xml version="1.0" encoding="utf-8"?><export>'+obj.files.map(f=>'<file><name>'+escapeHtml(f.name)+'</name><type>'+escapeHtml(f.type)+'</type><size>'+f.size+'</size></file>').join('')+'</export>';
 if(format==='yaml')return 'files:\n'+obj.files.map(f=>'  - name: '+JSON.stringify(f.name)+'\n    type: '+f.type+'\n    size: '+f.size).join('\n')+'\n';
 return exportData('json');
}
const EXT={json:'application/json',csv:'text/csv',tsv:'text/tab-separated-values',xml:'application/xml',yaml:'text/yaml',md:'text/markdown',txt:'text/plain',html:'text/html'};
function doExport(format){const text=exportData(format);download(new Blob(['\ufeff',text],{type:(EXT[format]||'text/plain')+';charset=utf-8'}),'AutoEntrepreneur-1M.'+format);}
function crc32(bytes){let c=-1;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;}
function zipDate(d){return ((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((d.getSeconds()/2)&31);}
function zipDay(d){return (((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);}
async function zipExport(){const enc=new TextEncoder();let inputs=[{name:'rapport.md',blob:new Blob([exportData('md')])},{name:'rapport.json',blob:new Blob([exportData('json')])},{name:'inventaire.csv',blob:new Blob([exportData('csv')])}];
 if($('includeOriginals').checked){const total=state.files.reduce((n,f)=>n+f.file.size,0);if(total>400e6)throw Error('ZIP > 400 Mo : exporter par lots');inputs.push(...state.files.map((f,i)=>({name:'originaux/'+i+'-'+f.file.name.replace(/[\\/]/g,'_'),blob:f.file})));}
 let pos=0,parts=[],central=[],centralSize=0;const now=new Date(),tm=zipDate(now),dt=zipDay(now);
 for(const item of inputs){const name=enc.encode(item.name),raw=new Uint8Array(await item.blob.arrayBuffer()),sum=crc32(raw),h=new Uint8Array(30+name.length),v=new DataView(h.buffer);
 v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(8,0,true);v.setUint16(10,tm,true);v.setUint16(12,dt,true);v.setUint32(14,sum,true);v.setUint32(18,raw.length,true);v.setUint32(22,raw.length,true);v.setUint16(26,name.length,true);h.set(name,30);parts.push(h,raw);
 const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(12,tm,true);cv.setUint16(14,dt,true);cv.setUint32(16,sum,true);cv.setUint32(20,raw.length,true);cv.setUint32(24,raw.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,pos,true);c.set(name,46);central.push(c);centralSize+=c.length;pos+=h.length+raw.length;}
 const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,inputs.length,true);v.setUint16(10,inputs.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,pos,true);download(new Blob([...parts,...central,end],{type:'application/zip'}),'AutoEntrepreneur-1M-dossier.zip');}
function business(){const x=id=>Number($(id).value)||0;const r=x('bRevenue'),v=x('bVariable'),f=x('bFixed'),c=x('bContrib'),s=x('bReserve'),net=r-v-f-c-s;const out=$('businessOutput');out.textContent='Revenu : '+r.toFixed(2)+' € | Coûts variables : '+v.toFixed(2)+' € | Coûts fixes : '+f.toFixed(2)+' € | Cotisations : '+c.toFixed(2)+' € | Réserve : '+s.toFixed(2)+' € | Solde indicatif : '+net.toFixed(2)+' €. Simulation simplifiée, à confirmer avec votre régime réel.';}
function pareto(){const rows=$('paretoInput').value.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{const arr=line.split(';');return{name:arr[0],count:Number(arr[1])};}).filter(x=>Number.isFinite(x.count)&&x.count>=0).sort((a,b)=>b.count-a.count);const total=rows.reduce((s,r)=>s+r.count,0);let cum=0;$('paretoOutput').textContent=rows.map(r=>{cum+=r.count;return r.name+' : '+r.count+' ('+(100*r.count/Math.max(1,total)).toFixed(1)+' % ; cumul '+(100*cum/Math.max(1,total)).toFixed(1)+' %)';}).join('\n')||'Aucune donnée valide';}
function bind(){
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current')});b.classList.add('active');b.setAttribute('aria-current','page');document.querySelectorAll('.tab-panel').forEach(x=>x.hidden=x.id!=='tab-'+b.dataset.tab);});
 $('autoSelect').onclick=select;$('startMission').onclick=()=>{try{report();}catch(e){notify('missionNotice',e.message,true);}};
 $('addAgent').onclick=()=>{try{if(state.agents.length>=10)throw Error('10 agents maximum');const a=idToAgent($('agentIdInput').value);if(state.agents.some(x=>x.id===a.id))throw Error('Agent déjà présent');state.agents.push(a);renderAgents();save();}catch(e){toast(e.message);}};
 $('clearAgents').onclick=()=>{state.agents=[];renderAgents();save();};$('missionInput').onchange=save;$('agentCount').onchange=save;
 $('pickFiles').onclick=()=>$('filesInput').click();$('pickFolder').onclick=()=>$('folderInput').click();
 $('filesInput').onchange=async e=>{await addFiles(e.target.files);e.target.value='';};$('folderInput').onchange=async e=>{await addFiles(e.target.files);e.target.value='';};
 const zone=$('dropZone');zone.ondragover=e=>{e.preventDefault();zone.classList.add('drag');};zone.ondragleave=()=>zone.classList.remove('drag');zone.ondrop=async e=>{e.preventDefault();zone.classList.remove('drag');await addFiles(e.dataTransfer.files);};
 $('clearFiles').onclick=()=>{state.files=[];$('fileDetail').hidden=true;renderFiles();renderCounts();};
 $('calculatePareto').onclick=pareto;$('calculateBusiness').onclick=business;
 $('exportReport').onclick=()=>doExport($('exportFormat').value);$('printPdf').onclick=()=>window.print();
 $('exportZip').onclick=()=>zipExport().catch(e=>toast(e.message));document.querySelectorAll('[data-quick-export]').forEach(b=>b.onclick=()=>doExport(b.dataset.quickExport));
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.install=e;$('installButton').hidden=false;});
 $('installButton').onclick=async()=>{if(state.install){state.install.prompt();await state.install.userChoice;state.install=null;$('installButton').hidden=true;}};
 $('onlineStatus').textContent=navigator.onLine?'● Disponible en ligne':'● Hors ligne';
 window.addEventListener('online',()=>{$('onlineStatus').textContent='● Disponible en ligne';});window.addEventListener('offline',()=>{$('onlineStatus').textContent='● Hors ligne';});
 restore();renderAgents();renderFiles();business();pareto();
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Service worker non installé',e));
}
bind();
