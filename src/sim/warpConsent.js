export const WARP_LEVELS = [1, 2, 4, 10, 50, 100, 1000, 10000, 100000];
// One world clock. Requests are ceilings, and a newly joined player starts at
// normal speed. An internal safety slowdown does not grant anyone permission.
export function requestedWarp(players) {
 return players.length?Math.min(...players.map(p=>p.warpRequestIndex||0)):0;
}
export function warpBeforeEvent(levels, index, now, nextEvent, realStep) {
 if(!Number.isFinite(nextEvent))return index;
 const remaining=Math.max(0,nextEvent-now);
 while(index>0&&levels[index]*Math.max(realStep,.001)>remaining)index--;
 return index;
}
