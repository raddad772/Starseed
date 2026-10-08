export const ACCESS={halfWidth:.65,halfDepth:.85,hatchZ:8,top:-3.2,room:[-3,3,-2,10],climbSeconds:1.6};
export const inBunker=(pos)=>pos[1]<-.6&&pos[1]>ACCESS.top-.6;
export function accessFloor(x,z,{y=0,liftY=ACCESS.top,hatchOpen=false}){
  const lift=Math.abs(x)<ACCESS.halfWidth&&Math.abs(z)<ACCESS.halfDepth;
  if(y>-.6){
    if(Math.abs(x)<ACCESS.halfWidth&&Math.abs(z-ACCESS.hatchZ)<ACCESS.halfDepth&&hatchOpen)return null;
    return undefined;
  }
  if(lift)return Math.abs(y-liftY)<.8?liftY:null;
  if(y>ACCESS.top-.6){const [a,b,c,d]=ACCESS.room;return x>=a&&x<=b&&z>=c&&z<=d?ACCESS.top:null;}
  return undefined;
}
