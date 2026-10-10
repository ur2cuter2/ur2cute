const escapePointer=s=>s.replace(/~/g,'~0').replace(/\//g,'~1');
export function parseStrictJSON(text){
 const value=JSON.parse(text);const duplicates=[];let i=0;
 const ws=()=>{while(/\s/.test(text[i]??'')&&i<text.length)i++;};
 const string=()=>{const start=i++;while(i<text.length){if(text[i]==='\\'){i+=2;continue;}if(text[i++]==='"')break;}return JSON.parse(text.slice(start,i));};
 const walk=location=>{ws();if(text[i]==='{'){i++;ws();const keys=new Set();if(text[i]==='}'){i++;return;}while(i<text.length){ws();const key=string();if(keys.has(key))duplicates.push({location:`${location}/${escapePointer(key)}`,key});keys.add(key);ws();i++;walk(`${location}/${escapePointer(key)}`);ws();if(text[i++]==='}')break;}}else if(text[i]==='['){i++;ws();let index=0;if(text[i]===']'){i++;return;}while(i<text.length){walk(`${location}/${index++}`);ws();if(text[i++]===']')break;}}else if(text[i]==='"')string();else{while(i<text.length&&!/[\s,}\]]/.test(text[i]))i++;}};
 walk('');return {value,duplicates};
}
