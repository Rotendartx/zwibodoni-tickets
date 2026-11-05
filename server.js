const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DATA = path.join(__dirname, 'tickets.json');
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) { console.error('Set ADMIN_PASSWORD before starting.'); process.exit(1); }
function readTickets(){ try { return JSON.parse(fs.readFileSync(DATA,'utf8')); } catch { return []; } }
function writeTickets(t){ fs.writeFileSync(DATA, JSON.stringify(t,null,2)); }
function send(res,status,obj){ res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(obj)); }
function body(req){ return new Promise((resolve,reject)=>{let s=''; req.on('data',c=>{s+=c;if(s.length>20000) reject(new Error('Request too large'));}); req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch{reject(new Error('Invalid JSON'));}});}); }
function cookie(req){ return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('admin_session='))?.slice(14); }
const sessions = new Set();
function admin(req){ return sessions.has(cookie(req)); }
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET' && url.pathname==='/') {res.writeHead(302,{Location:'/apply.html'}); return res.end();}
 if(req.method==='GET' && ['/apply.html','/admin.html'].includes(url.pathname)){ const p=path.join(__dirname,'public',path.basename(url.pathname)); res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); return fs.createReadStream(p).pipe(res); }
 if(req.method==='POST' && url.pathname==='/api/apply') {try{const b=await body(req); if(!b.name?.trim()||!b.phone?.trim()||!b.paymentMethod) return send(res,400,{error:'Please complete all fields.'}); const t=readTickets(); const code='ZW'+crypto.randomBytes(4).toString('hex').toUpperCase(); const item={code,name:b.name.trim().slice(0,80),phone:b.phone.trim().slice(0,30),paymentMethod:b.paymentMethod,status:'pending',createdAt:new Date().toISOString(),eventDate:'5 December 2026',amount:50}; t.push(item); writeTickets(t); return send(res,201,{code,status:item.status});}catch(e){return send(res,400,{error:e.message});}}
 if(req.method==='POST' && url.pathname==='/api/admin/login'){try{const b=await body(req); if(b.password!==ADMIN_PASSWORD) return send(res,401,{error:'Incorrect password'}); const token=crypto.randomBytes(32).toString('hex'); sessions.add(token); res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`,'Cache-Control':'no-store'}); return res.end(JSON.stringify({ok:true}));}catch(e){return send(res,400,{error:e.message});}}
 if(url.pathname.startsWith('/api/admin/')) {if(!admin(req)) return send(res,401,{error:'Please sign in.'});
  if(req.method==='GET'&&url.pathname==='/api/admin/tickets') return send(res,200,readTickets());
  if(req.method==='POST'&&url.pathname==='/api/admin/status'){try{const b=await body(req); const t=readTickets(); const item=t.find(x=>x.code===b.code); if(!item)return send(res,404,{error:'Ticket not found'}); if(!['confirmed','pending'].includes(b.status))return send(res,400,{error:'Invalid status'}); item.status=b.status; writeTickets(t); return send(res,200,{ok:true});}catch(e){return send(res,400,{error:e.message});}}
 }
 if(req.method==='GET'&&url.pathname.startsWith('/api/ticket/')){const code=url.pathname.split('/').pop();const t=readTickets().find(x=>x.code===code);return t?send(res,200,{code:t.code,status:t.status,eventDate:t.eventDate,amount:t.amount}):send(res,404,{error:'Ticket not found'});}
 res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');
});
server.listen(PORT,()=>console.log(`Ticket site running on port ${PORT}`));
