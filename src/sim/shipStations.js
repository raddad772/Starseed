import { nearbyShipStation } from './exploration.js';
import { ExplorationApp } from '../ui/apps/exploration.js';

export function interactShipStation(vessel, player, input) {
  const station=nearbyShipStation(vessel,player);
  if(!station)return false;
  player.prompt={key:'F',text:station.label};
  if(input.hit('KeyF')){
    const app=player.ui.explorationApp ||= new ExplorationApp(player.game,player);
    app.setup(vessel,station);player.ui.suit.show(app);
  }
  return true;
}
