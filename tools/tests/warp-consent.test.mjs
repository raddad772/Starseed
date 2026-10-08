import test from 'node:test';
import assert from 'node:assert/strict';
import { Game,WARP_LEVELS } from '../../src/game.js';
import {requestedWarp,warpBeforeEvent} from '../../src/sim/warpConsent.js';
function game(){const players=[{warpRequestIndex:0},{warpRequestIndex:0}];return {players,cur:players[0],warpIndex:0,vessels:[],warpBlockers:()=>[],message:()=>{},setWarp:Game.prototype.setWarp};}
test('both players must opt in; the lowest requested rate wins and either can cancel',()=>{
 const g=game();g.setWarp(6);assert.equal(g.warpIndex,0);
 g.cur=g.players[1];g.setWarp(4);assert.equal(g.warpIndex,4);
 g.setWarp(6);assert.equal(g.warpIndex,6);
 g.cur=g.players[0];g.setWarp(0);assert.equal(g.warpIndex,0);assert.equal(requestedWarp(g.players),0);
});
test('safety cannot grant consent and a new player blocks previously agreed warp',()=>{
 const g=game();g.cur=null;g.setWarp(8);assert.equal(g.warpIndex,0);
 g.players.forEach(p=>p.warpRequestIndex=6);g.setWarp(6);assert.equal(g.warpIndex,6);
 g.warpBlockers=()=>[{why:'burn'}];g.setWarp(6);assert.equal(g.warpIndex,0);
 assert.equal(requestedWarp(g.players),6,'consent ceilings survive automatic slowdown');
 g.players.push({});assert.equal(requestedWarp(g.players),0);
});
test('event clipping cannot skip a burn even at the highest requested speed',()=>{
 const index=warpBeforeEvent(WARP_LEVELS,8,100,102,.05);
 assert.ok(WARP_LEVELS[index]*.05<=2);assert.equal(warpBeforeEvent(WARP_LEVELS,8,102,102,.05),0);
 assert.equal(warpBeforeEvent(WARP_LEVELS,8,0,Infinity,.05),8);
});
