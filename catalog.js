// Content lives in JSON. No API keys, chat, or arbitrary prompts.
const IDS=['cotton','linen','wool','silk','viscose','acetate'];
const text=x=>typeof x==='string'&&x.trim().length>0;
export function validateCatalog(fabrics,questions){
 if(!Array.isArray(fabrics)||fabrics.length!==6)throw new Error('Нужно ровно шесть карточек.');
 const ids=new Set();
 for(const f of fabrics){
  if(!IDS.includes(f.id)||ids.has(f.id))throw new Error('Неизвестный или повторяющийся id ткани.');
  ids.add(f.id);
  if(!['name','origin','shortDescription','limitations'].every(k=>text(f[k]))||!['natural','chemical'].includes(f.group))throw new Error('Проверьте основные поля карточки '+f.id);
  if(!Array.isArray(f.visibleFeatures)||!f.visibleFeatures.every(text)||!f.properties||!['touch','crease','water','usage'].every(k=>text(f.properties[k])))throw new Error('Проверьте свойства карточки '+f.id);
  if(!Array.isArray(f.images))throw new Error('Поле images должно быть массивом.');
  for(const im of f.images){
   if(!im||!text(im.src)||!/^assets\/images\/fabrics\/[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp)$/i.test(im.src)||im.src.includes('..')||!text(im.alt)||im.caption!==undefined&&typeof im.caption!=='string')throw new Error('Проверьте путь и описание фото в '+f.id);
  }
 }
 const expected=['q_surface','q_pile','q_shine','q_slubs','q_touch','q_crease','q_drape','q_water'];
 if(!Array.isArray(questions)||questions.length!==expected.length||new Set(questions.map(q=>q.id)).size!==expected.length)throw new Error('Нужно восемь разных вопросов.');
 for(const q of questions){
  if(!expected.includes(q.id)||!['text','hint','why'].every(k=>text(q[k])))throw new Error('Проверьте вопрос чек-листа.');
  const sets={q_touch:['cool','neutral','warm','unknown'],q_crease:['retains','recovers','unknown'],q_water:['spreads','stays','unknown']};
  if(sets[q.id]&&!q.options)throw new Error('У вопроса отсутствуют варианты ответа.');
  if(q.options){const allowed=sets[q.id]||['yes','no','unknown'];if(q.options.length!==allowed.length||new Set(q.options.map(x=>x[0])).size!==allowed.length||!q.options.every(x=>Array.isArray(x)&&allowed.includes(x[0])&&text(x[1])))throw new Error('Нельзя менять служебные значения ответов.');}
 }
 return {fabrics,questions};
}
export async function loadCatalog(){
 const urls=['./data/fabrics.json','./data/questions.json'];
 const data=await Promise.all(urls.map(async url=>{const response=await fetch(new URL(url,import.meta.url));if(!response.ok)throw new Error('Не загружен '+url+' ('+response.status+').');return response.json();}));
 return validateCatalog(...data);
}
