// Evaluates the Draft 2020-12 keywords used by chapter.schema.json.
// This is deliberately scoped to that contract, not a general JSON Schema library.
const pointer=s=>String(s).replace(/~/g,'~0').replace(/\//g,'~1');
export function schemaErrors(schema,value){
 const errors=[];
 const visit=(rule,data,location)=>{
  if(rule.$ref){const referenced=rule.$ref.slice(2).split('/').reduce((r,k)=>r[k.replace(/~1/g,'/').replace(/~0/g,'~')],schema);return visit(referenced,data,location);}
  const add=(message,expected,actual=data)=>errors.push({location,message,expected,actual});
  if(rule.type){const valid=rule.type==='object'?data!==null&&typeof data==='object'&&!Array.isArray(data):rule.type==='array'?Array.isArray(data):rule.type==='integer'?Number.isInteger(data):typeof data===rule.type;if(!valid){add('型が仕様と一致しません',rule.type);return;}}
  if('const'in rule&&data!==rule.const)add('固定値が仕様と一致しません',rule.const);
  if(rule.enum&&!rule.enum.includes(data))add('許可されていない値です',rule.enum);
  if(typeof data==='string'){if(rule.minLength&&[...data].length<rule.minLength)add('文字列が空です',`length >= ${rule.minLength}`);if(rule.pattern&&!new RegExp(rule.pattern,'u').test(data))add('文字列の形式が不正です',rule.pattern);}
  if(typeof data==='number'&&rule.minimum!==undefined&&data<rule.minimum)add('数値が最小値未満です',rule.minimum);
  if(Array.isArray(data)){if(rule.minItems!==undefined&&data.length<rule.minItems)add('要素数が不足しています',rule.minItems,data.length);if(rule.maxItems!==undefined&&data.length>rule.maxItems)add('要素数が上限を超えています',rule.maxItems,data.length);if(rule.uniqueItems&&new Set(data.map(x=>JSON.stringify(x))).size!==data.length)add('配列に重複があります','unique items');if(rule.items)data.forEach((item,i)=>visit(rule.items,item,`${location}/${i}`));}
  if(data&&typeof data==='object'&&!Array.isArray(data)){for(const key of rule.required??[])if(!Object.hasOwn(data,key))errors.push({location:`${location}/${pointer(key)}`,message:'必須項目がありません',expected:'required',actual:null});for(const [key,item]of Object.entries(data)){if(Object.hasOwn(rule.properties??{},key))visit(rule.properties[key],item,`${location}/${pointer(key)}`);else if(rule.additionalProperties===false)errors.push({location:`${location}/${pointer(key)}`,message:'未定義の項目です',expected:'defined property',actual:item});}}
 };
 visit(schema,value,'');return errors;
}
