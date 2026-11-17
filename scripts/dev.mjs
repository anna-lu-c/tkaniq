import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name.includes('\0')||name.includes('\\')){res.writeHead(400);res.end();return;}
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  const relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(part=>part.startsWith('.'))){res.writeHead(403);res.end();return;}
  if(!(await stat(file)).isFile())throw new Error('not a file');
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Файл не найден');}
});
let port=5173;
function start(){server.listen(port,'127.0.0.1');}
server.on('error',error=>{if(error.code==='EADDRINUSE'&&port<5193){port++;start();}else{console.error(error.message);process.exit(1);}});
server.on('listening',()=>console.log(`\n  ТканIQ: http://127.0.0.1:${port}/\n  Для остановки: Ctrl+C. После изменений обновите страницу.\n`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
start();
