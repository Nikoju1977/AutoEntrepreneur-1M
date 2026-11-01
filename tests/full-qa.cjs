const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {execFileSync}=require('child_process');
const report=[];
const check=(name,fn)=>Promise.resolve().then(fn).then(()=>{report.push({name,passed:true});console.log("PASS",name)}).catch(e=>{report.push({name,passed:false,error:e.message});console.error("FAIL",name,e.message);throw e});
const wait=t=>new Promise(ok=>setTimeout(ok,t));
function wavBuffer(){const rate=16000,frames=rate/2,bytes=44+frames*2,b=Buffer.alloc(bytes);b.write('RIFF',0);b.writeUInt32LE(bytes-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(frames*2,40);for(let i=0;i<frames;i++)b.writeInt16LE(Math.round(12000*Math.sin(i*2*Math.PI*440/rate)),44+2*i);return b}
async function run(){
 await check('50 domaines × 20 spécialités × 20 rôles × 50 méthodes et bibliothèques complètes',async()=>{
  const s=fs.readFileSync('assets/app.mjs','utf8');
  const get=v=>{const line=s.split('\n').find(x=>x.startsWith('const '+v+'='));assert(line,'Missing '+v);const m=/^const [A-Z]+="([^"]+)"\.split\("\|"\);/.exec(line);assert(m,'Invalid array declaration '+v);return m[1].split('|')};
  const domains=get('SLUGS'),names=get('NAMES'),methods=get('METHODS'),roles=get('ROLES');
  assert.equal(domains.length,50);assert.equal(names.length,50);assert.equal(methods.length,50);assert.equal(new Set(methods).size,50);assert.equal(roles.length,20);assert.equal(new Set(domains).size,50);
  for(const slug of domains){assert(fs.existsSync('references/domaines/'+slug+'.md'),slug);for(let i=0;i<20;i++)assert(fs.existsSync('references/specialites/'+slug+'--'+String(i).padStart(2,'0')+'.md'),slug+' '+i)}
  const matches=[...s.matchAll(/"(0[1-9]-[^"]+|1[0-3]-[^"]+)"/g)].map(m=>m[1]);
  const shared=s.match(/const BASE_DOCS=(\[[^\n]+\]);/);assert(shared);
  for(const file of JSON.parse(shared[1]))assert(fs.existsSync('references/entreprise/'+file+'.md'),file);
  const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));assert(manifest.start_url);assert(manifest.icons.length>=1);for(const icon of manifest.icons)assert(fs.existsSync(icon.src.replace(/^\.\//,'')),icon.src);
 });
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await context.newPage();const pageErrors=[],failedRequests=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('requestfailed',r=>failedRequests.push(r.url()+' '+r.failure()?.errorText));
 await check('Démarrage mobile et six onglets, zéro erreur JS',async()=>{
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  assert(await page.locator('h1').isVisible());
  const tabs=await page.locator('[data-tab]').all();
  assert.equal(tabs.length,6);
  for(const name of ['mission','files','agents','tools','exports','admin']){
    await page.locator('[data-tab="'+name+'"]').click();
    assert(await page.locator('#tab-'+name).isVisible(),name);
  }
  assert.deepEqual(pageErrors,[]);
 });
 await check('Liens officiels et recherche, 17 entrées HTTPS',async()=>{
  await page.locator('[data-tab="admin"]').click();
  assert.equal(await page.locator('.official-link').count(),17);
  const urls=await page.locator('.official-link').evaluateAll(a=>a.map(x=>x.href));
  assert(urls.every(x=>x.startsWith('https://')));
  await page.locator('#officialSearch').fill('URSSAF');
  assert((await page.locator('.official-link').count())>=2);
  await page.locator('#officialSearch').fill('');
 });
 await check('Fiche entreprise sauvegardée, validation SIRET et conservation après rechargement',async()=>{
  await page.locator('#aeName').fill('Entreprise Test');
  await page.locator('#aeSiret').fill('123');
  await page.locator('#saveProfile').click();
  assert((await page.locator('#toast').textContent()).includes('14 chiffres'));
  await page.locator('#aeSiret').fill('12345678901234');
  await page.locator('#aeActivity').fill('Artisanat');
  await page.locator('#saveProfile').click();
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-tab="admin"]').click();
  assert.equal(await page.locator('#aeName').inputValue(),'Entreprise Test');
  assert.equal(await page.locator('#aeActivity').inputValue(),'Artisanat');
 });
 await check('Livre de recettes + dépenses + calculs de soldes + suppression',async()=>{
  await page.locator('#cashLabel').fill('Prestation client');
  await page.locator('#cashAmount').fill('1500');
  await page.locator('#addCash').click();
  assert((await page.locator('#totalIn').textContent()).includes('1\u202f500'));
  await page.locator('#cashType').selectOption('depense');
  await page.locator('#cashLabel').fill('Achat fournitures');
  await page.locator('#cashAmount').fill('400');
  await page.locator('#addCash').click();
  assert((await page.locator('#netIn').textContent()).includes('1\u202f100'));
  const lines=await page.locator('#ledgerList>div').count();assert.equal(lines,2);
  page.once('dialog',d=>d.accept());
  await page.locator('#ledgerList>div').first().locator('button').click();
  assert.equal(await page.locator('#ledgerList>div').count(),1);
 });
 await check('Échéances : ajout, coche, persistance',async()=>{
  await page.locator('#taskName').fill('Déclaration URSSAF');
  await page.locator('#taskDate').fill('2026-11-30');
  await page.locator('#addTask').click();
  assert((await page.locator('#tasksList').innerText()).includes('URSSAF'));
  await page.locator('#tasksList input[type=checkbox]').first().check();
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-tab="admin"]').click();
  assert(await page.locator('#tasksList input[type=checkbox]').first().isChecked());
 });
 await check('Facture export HTML : TVA 20 %, montants et anti-doublon',async()=>{
  await page.locator('#invoiceKind').selectOption('FACTURE');
  await page.locator('#invNumber').fill('F-TEST-001');
  await page.locator('#invClient').fill('Client A, Paris');
  await page.locator('#invService').fill('Prestation qualité');
  await page.locator('#invAmount').fill('100');
  await page.locator('#invVatMode').selectOption('reel');
  await page.locator('#invVatRate').fill('20');
  const [d]=await Promise.all([page.waitForEvent('download'),page.locator('#createInvoice').click()]);
  const html=fs.readFileSync(await d.path(),'utf8');
  assert(html.includes('FACTURE F-TEST-001'));assert(html.includes('120,00'));
  await page.locator('#createInvoice').click();
  assert((await page.locator('#toast').textContent()).includes('déjà utilisé'));
 });
 await check('Sélection 10 agents, rôles, refus 11e, test du millionième profil',async()=>{
  await page.locator('[data-tab="mission"]').click();
  await page.locator('#missionInput').fill('Résoudre une non-conformité qualité, URSSAF et trésorerie');
  await page.locator('#agentCount').selectOption('10');
  await page.locator('#autoSelect').click();
  assert.equal(await page.locator('.agent-card').count(),10);
  await page.locator('[data-tab="agents"]').click();
  await page.locator('#agentIdInput').fill('AG-1000000');
  await page.locator('#addAgent').click();
  assert((await page.locator('#toast').textContent()).includes('10 profils maximum'));
  await page.locator('#clearAgents').click();
  await page.locator('#addAgent').click();
  assert((await page.locator('.agent-card').first().textContent()).includes('AG-1000000'));
  await page.locator('.agent-card summary').first().click();
  const hrefs=await page.locator('.agent-card details a').evaluateAll(a=>a.map(x=>new URL(x.href).pathname.split('/').slice(-2).join('/')));
  for(const href of hrefs)assert(fs.existsSync(href.startsWith('domaines/')||href.startsWith('specialites/')||href.startsWith('entreprise/')?'references/'+href:'__bad'),href);
 });
 await check('Rapport collaboratif et communication multi-agents',async()=>{
  await page.locator('[data-tab="mission"]').click();await page.locator('#autoSelect').click();await page.locator('#startMission').click();
  assert(await page.locator('#missionResult').isVisible());
  assert((await page.locator('#reportText').innerText()).includes('SYNTHÈSES DES AGENTS'));
  assert.equal(await page.locator('#activeMessages').innerText(),'9');
 });
 await check('Outils Pareto et calcul de trésorerie',async()=>{
  await page.locator('[data-tab="tools"]').click();
  await page.locator('#paretoInput').fill('A;30\nB;10');
  await page.locator('#calculatePareto').click();
  assert((await page.locator('#paretoOutput').innerText()).includes('75.0 %'));
  await page.locator('#calculateBusiness').click();
  assert((await page.locator('#businessOutput').innerText()).includes('2\u202f100'));
 });
 await check('Import CSV, WAV analysé, vidéo conservée, ZIP valide avec originaux',async()=>{
  await page.locator('[data-tab="files"]').click();
  await page.locator('#filesInput').setInputFiles([
    {name:'table.csv',mimeType:'text/csv',buffer:Buffer.from('type;valeur\nA;7')},
    {name:'sample.wav',mimeType:'audio/wav',buffer:wavBuffer()},
    {name:'video.mov',mimeType:'video/quicktime',buffer:Buffer.from('fake video content')}
  ]);
  await page.waitForFunction(()=>document.querySelector('#fileCount').textContent==='3',{timeout:15000});
  assert((await page.locator('#fileList').textContent()).includes('Hz'),'WAV metadata missing');
  await page.locator('#fileList button').first().click();
  assert(await page.locator('#fileDetail').isVisible());
  await page.locator('[data-tab="exports"]').click();
  const [d]=await Promise.all([page.waitForEvent('download'),page.locator('#exportZip').click()]);
  const out=await d.path();
  const output=execFileSync('python3',['-c','import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print("|".join(z.namelist()))',out],{encoding:'utf8'});
  assert(output.includes('originaux/sample.wav'));
  assert(output.includes('originaux/table.csv'));
 });
 await check('Exports JSON, CSV, YAML, XML, MD, TSV, TXT, HTML',async()=>{
  const formats=['json','csv','yaml','xml','md','tsv','txt','html'];
  for(const kind of formats){
    await page.locator('#exportFormat').selectOption(kind);
    const [d]=await Promise.all([page.waitForEvent('download'),page.locator('#exportReport').click()]);
    const content=fs.readFileSync(await d.path(),'utf8');assert(content.length>10,kind);
    if(kind==='json')assert(JSON.parse(content).mission?.question);
    if(kind==='xml')assert(content.includes('<rapport>'));
  }
 });
 await check('Export sauvegarde JSON et restauration après perte volontaire',async()=>{
  await page.locator('[data-tab="admin"]').click();
  const [d]=await Promise.all([page.waitForEvent('download'),page.locator('#backupBusiness').click()]);
  const data=fs.readFileSync(await d.path(),'utf8');assert.equal(JSON.parse(data).format,'AE1M_BACKUP_V3');
  await page.locator('#aeName').fill('Changement temporaire');await page.locator('#saveProfile').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#restoreJson').setInputFiles({name:'sauvegarde.json',mimeType:'application/json',buffer:Buffer.from(data)});
  await page.waitForFunction(()=>document.getElementById('aeName').value==='Entreprise Test');
  assert.equal(await page.locator('#aeName').inputValue(),'Entreprise Test');
 });
 await check('PWA installable et rechargement hors connexion',async()=>{
  assert(await page.evaluate(()=>('serviceWorker' in navigator)));
  const active=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return !!r.active});
  assert(active);
  await page.reload({waitUntil:'networkidle'});
  await context.setOffline(true);
  await page.reload({waitUntil:'load'});
  assert(await page.locator('h1').isVisible());
  await page.locator('[data-tab="admin"]').click();assert(await page.locator('#totalIn').isVisible());
  await context.setOffline(false);
 });
 await check('Aucune erreur JavaScript non gérée',()=>assert.deepEqual(pageErrors,[]));
 await check('Pas de débordement horizontal critique à 390 px',async()=>{
  const dims=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(dims.scroll<=dims.viewport+10,JSON.stringify(dims));
 });
 await browser.close();
 console.log("COMPLETE QA",report.length,"passed");
}
run().catch(e=>{console.error(e.stack);process.exitCode=1});
