export function prune(s) {
  const functions=[];const re=/\b(?:void|float|int|uint|bool|[biu]?vec[234]|mat[234]|MatS|Waves)\s+(\w+)\s*\([^;{}]*\)\s*\{/g;
  let m;while((m=re.exec(s))){let i=re.lastIndex,n=1;for(;n&&i<s.length;i++){if(s[i]==='{')n++;else if(s[i]==='}')n--;}
    functions.push({name:m[1],start:m.index,end:i,text:s.slice(m.index,i)});re.lastIndex=i;}
  const used=new Set(['main']);let more=true;while(more){more=false;for(const f of functions)if(used.has(f.name))for(const g of functions)if(!used.has(g.name)&&new RegExp('\\b'+g.name+'\\s*\\(').test(f.text)){used.add(g.name);more=true;}}
  for(const f of functions.reverse())if(!used.has(f.name))s=s.slice(0,f.start)+s.slice(f.end);
  s=s.replace(/uniform\s+(?:(?:highp|mediump|lowp)\s+)?(\w+)\s+(\w+)\s*(\[\s*\d+\s*\])?\s*;/g,(decl,type,name)=>{const uses=s.match(new RegExp('\\b'+name+'\\b','g'));return uses.length>1?decl:'';});
  return s;
}
