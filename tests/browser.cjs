const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 try{
 const ctx=await browser.newContext({viewport:{width:1260,height:950},offline:true,acceptDownloads:true,reducedMotion:'reduce'});
 const page=await ctx.newPage();const errors=[];const web=[];page.on('request',r=>{if(/^https?:/.test(r.url()))web.push(r.url())});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(pathToFileURL(path.resolve('dist/index.html')).href);
 try{await page.waitForFunction(()=>window.__gallery?.ready,{},{timeout:20000});}catch(e){console.error(errors);throw e}
 assert.equal(await page.locator('canvas[data-ready]').count(),10);
 assert.equal(await page.locator('#emotion option').count(),13);
 assert.equal(await page.locator('#motion option').count(),12);
 const stats=()=>page.evaluate(()=>__gallery.actors.map(a=>a.inspect()));
 const orig=await stats();assert.notEqual(orig[0].frame,orig[1].frame);
 await page.locator('[data-preset="2"]').click();
 let s=await stats();assert.equal(s[0].motion,'point-and-laugh');assert.equal(s[0].growth,'Fault');assert.deepEqual(s[0].forms,{Crown:0,Comet:0,Fault:6});assert.equal(s[1].motion,'bashful-fold');
 const beforeFace=s[0].time;await page.locator('#emotion').selectOption('tearful');
 s=await stats();assert.equal(s[0].emotion,'tearful');assert.equal(s[0].time,beforeFace);assert.deepEqual(s[1],orig[1]);
 await page.locator('#actor-1').click();await page.locator('[data-preset="3"]').click();s=await stats();assert.equal(s[1].motion,'downtrodden');assert.equal(s[0].time,beforeFace);
 assert.ok(await page.evaluate(()=>{const a=__gallery.actors;return a[0].display.material!==a[1].display.material&&a[0].display.material.map!==a[1].display.material.map&&a[0].display.geometry===a[1].display.geometry}));
 await page.locator('#light-look').selectOption('amber');await page.locator('[data-view="angle"]').click();
 const down=page.waitForEvent('download');await page.locator('#export').click();const json=await down;const exported=require('node:fs').readFileSync(await json.path(),'utf8');assert.equal(JSON.parse(exported).lighting.look,'amber');
 await page.locator('#light-look').selectOption('red');
 await page.locator('#import').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(exported)});
 await page.waitForFunction(()=>document.querySelector('#light-look').value==='amber');
 assert.equal(await page.locator('#light-look').inputValue(),'amber');
 if(process.env.EXPORT_GLTF){
  const g=page.waitForEvent('download');await page.locator('#export-glb').click();const f=await g;
  const data=require('node:fs').readFileSync(await f.path());
  assert.ok(data.toString('ascii',0,4)==='glTF');
  const j=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
  assert.equal(j.animations.length,12);
  assert.ok(j.nodes.some(n=>n.name?.startsWith('Crown_')));
  assert.ok(!j.nodes.some(n=>n.name?.startsWith('Comet_')));
 }
 const atlasWait=page.waitForEvent('download');await page.locator('#export-atlas').click();const atlas=await atlasWait;
 const png=require('node:fs').readFileSync(await atlas.path());assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),3072);
 await page.locator('#actor-0').click();await page.locator('[data-preset="2"]').click();
 await page.locator('#actor-1').click();await page.locator('[data-preset="1"]').click();
 await page.locator('#light-look').selectOption('white');await page.locator('[data-view="front"]').click();
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'proof-desktop.png',fullPage:true});
 await page.locator('#scrub').fill('0.44');const scrub=await stats();assert.ok(Math.abs(scrub[1].time/scrub[1].duration-.44)<.004);
 await page.locator('[data-preset="1"]').click();
 await page.locator('#play').click();
 await page.waitForFunction((x)=>__gallery.actors[0].inspect().draws>x, (await stats())[0].draws,{timeout:8000});
 await page.locator('#play').click();const paused=await stats();await page.locator('#actor-1').click(); await page.locator('#replay').click();await page.locator('#play').click();
 s=await stats();assert.ok(s[1].time<.5);assert.ok(s[0].time>=paused[0].time);
 await page.setViewportSize({width:405,height:860});await page.locator('#pair').uncheck();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'proof-phone.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),405);
 assert.deepEqual(web,[]);assert.deepEqual(errors,[]);
 console.log('offline file:// · 10 real previews · isolated simultaneous actors · LED snap · body presets · camera/light controls · JSON round trip · Android-size viewport · no requests/errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
