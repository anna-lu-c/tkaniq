import {readFile,writeFile,copyFile,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const file=new URL('data/fabrics.json',root);
try{
 const cards=JSON.parse(await readFile(file,'utf8'));
 const photos=JSON.parse(await readFile(new URL('data/photo-sources.json',root),'utf8'));
 if(!Array.isArray(cards)||cards.length!==6||new Set(cards.map(c=>c.id)).size!==6)throw new Error('Expected six different cards.');
 for(const p of photos){const card=cards.find(c=>c.id===p.id);if(!card)throw new Error('Missing card: '+p.id);await access(new URL(p.image.src,root));}
 // Validate everything before changing the catalog. Preserve all custom text and existing images.
 for(const p of photos){const card=cards.find(c=>c.id===p.id);card.images=[p.image,...(card.images||[]).filter(im=>im.src!==p.image.src)];card.sourceRefs=[...new Set([...(card.sourceRefs||[]),p.image.sourceUrl])];}
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const backup=new URL('data/fabrics.backup-'+stamp+'.json',root);
 await copyFile(file,backup);
 await writeFile(file,JSON.stringify(cards,null,2)+'\n');
 console.log('Added photos for all six cards. Your text and existing photos were preserved.');
 console.log('Backup: '+backup.pathname);
 console.log('Refresh the site with Ctrl+F5. Source credits: /photo-sources.html');
}catch(error){console.error('Photos were not applied: '+error.message);process.exitCode=1;}
