// Habitability is only potential. Former life requires evidence in the history.
export function lifeHistory(body) {
  const b=body.data||body,h=b.history;
  if(b.life || h?.lifeStage>0)return 'present';
  if(h?.lifeEver===true || h?.life?.extinct===true || (typeof h?.life?.extinct==='number'&&Number.isFinite(h.life.extinct)))return 'past';
  return 'none';
}
export const hostedLife = body => lifeHistory(body)!=='none';
