// Experimental rules. These values are not calibrated probabilities.
export const questionGroups={q_surface:'surface',q_pile:'surface',q_shine:'surface',q_slubs:'structure',q_touch:'touch',q_crease:'crease',q_drape:'drape',q_water:'water'};
export function chooseQuestions(bank,rules,ids,max=10){
 if(ids.length<2)return [];
 return bank.map((q,index)=>{
  const options=q.options||[['yes','Да'],['no','Нет'],['unknown','Не знаю']];
  const spread=Math.max(0,...options.filter(([v])=>v!=='unknown').map(([v])=>{const logs=ids.map(id=>Math.log(rules[q.id]?.[v]?.[id]||1));return Math.max(...logs)-Math.min(...logs);}));
  return {id:q.id,spread,index};
 }).filter(q=>q.spread>.001).sort((a,b)=>b.spread-a.spread||a.index-b.index).slice(0,Math.min(10,max)).map(q=>q.id);
}
export function collectEvidence(bank,rules,scores,answers){
 const ids=scores.map(r=>r.id).filter(id=>!['other','not_fabric'].includes(id));
 const groups=new Map();
 for(const q of bank){const value=answers[q.id];if(value==null||value==='unknown')continue;
  const options=q.options||[['yes','Да'],['no','Нет'],['unknown','Не знаю']];
  if(!options.some(([v])=>v===value))throw new Error('Некорректный ответ.');
  const row=Object.fromEntries(ids.map(id=>[id,Math.log(rules[q.id]?.[value]?.[id]||1)]));
  if(Math.max(...Object.values(row))-Math.min(...Object.values(row))<.001)continue;
  const group=questionGroups[q.id]||q.id;if(!groups.has(group))groups.set(group,[]);groups.get(group).push(row);
 }
 const logs=Object.fromEntries(ids.map(id=>[id,0]));const groupLeaders=[];
 for(const rows of groups.values()){
  const means=ids.map(id=>({id,value:rows.reduce((sum,row)=>sum+row[id],0)/rows.length})).sort((a,b)=>b.value-a.value);
  for(const item of means)logs[item.id]+=item.value;
  if(means.length>1&&means[0].value-means[1].value>.06)groupLeaders.push(means[0].id);
 }
 return {factors:Object.fromEntries(ids.map(id=>[id,Math.min(1.8,Math.max(.6,Math.exp(logs[id])))])),groups:groups.size,contradictory:new Set(groupLeaders).size>1};
}
