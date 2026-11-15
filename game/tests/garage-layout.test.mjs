import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GARAGES } from '../career-drive/vehicles.js';
import { garageAccess,garageDockRoute,garageExitRoute,distanceToGarageAccess,isGaragePaved } from '../career-drive/garage-layout.js';
import { sampleRoad,roadLaneCenter,ROAD_VERTICAL_SCALE } from '../career-drive/road-layout.js';

test('each parking driveway joins the real travel lane, bends off before the lot, and remains a paved continuous route',()=>{
  for(const garage of GARAGES) {
    const access=garageAccess(garage);
    assert.equal(access.entrance.x,sampleRoad(access.entrance.distance).x+roadLaneCenter(access.entrance.distance));
    assert.ok(access.entrance.distance<garage.distance-250);
    assert.equal(access.lot.x,sampleRoad(garage.distance).x+garage.side*garage.offset);
    assert.ok(access.width>80 && access.width<120);
    for(const [index,point] of access.points.entries()) {
      assert.ok(isGaragePaved(point,garage));
      const previous=access.points[index-1];
      if(previous) assert.ok(Math.hypot(point.x-previous.x,(point.distance-previous.distance)*ROAD_VERTICAL_SCALE)<45);
    }
    assert.ok(!isGaragePaved({x:access.lot.x+210,distance:garage.distance},garage));
    assert.ok(!isGaragePaved({x:access.lot.x+100,distance:garage.distance-170},garage),'the narrowing apron must not classify the adjacent grass as pavement');
    assert.equal(distanceToGarageAccess({x:Infinity,distance:0},garage),Infinity);
  }
});

test('the C-Max approach passes below the UCI grounds before turning outside its facade',()=>{
  const garage=GARAGES[0],access=garageAccess(garage);
  const facade={x:sampleRoad(5500).x-235,distance:5500};
  for(const point of access.points) {
    const clearBelow=(facade.distance-point.distance)*ROAD_VERTICAL_SCALE>52+access.width/2;
    const clearBeside=Math.abs(point.x-facade.x)>120+access.width/2;
    assert.ok(clearBelow||clearBeside,'the driveable corridor must not pass through the university building');
  }
});

test('both empty bays are entered from the paved apron while keeping clear of the other parked car',()=>{
  for(const garage of GARAGES) for(const exchanged of [false,true]) {
    const access=garageAccess(garage);
    const dock={x:access.lot.x+garage.side*(exchanged?32:-36),distance:garage.distance+16};
    const parked={x:access.lot.x+garage.side*(exchanged?-36:32),distance:garage.distance+16};
    const route=garageDockRoute(garage,dock);
    assert.deepEqual(route.at(-1),dock);
    assert.equal(route.at(-2).x,dock.x);
    for(const point of route) {
      assert.ok(isGaragePaved(point,garage));
      if(Math.abs(point.distance-parked.distance)*ROAD_VERTICAL_SCALE<90) assert.ok(Math.abs(point.x-parked.x)>40);
    }
  }
});

test('departures reverse the same access corridor after leaving either bay through the wide paved apron',()=>{
  for(const garage of GARAGES) for(const exchanged of [false,true]) {
    const access=garageAccess(garage);
    const dock={x:access.lot.x+garage.side*(exchanged?32:-36),distance:garage.distance+16};
    const parked={x:access.lot.x+garage.side*(exchanged?-36:32),distance:garage.distance+16};
    const route=garageExitRoute(garage,dock,dock,parked);
    assert.deepEqual(route.at(-1),access.entrance);
    assert.deepEqual(route.slice(-access.points.length),[...access.points].reverse());
    for(const point of route) {
      assert.ok(isGaragePaved(point,garage));
      if(Math.abs(point.distance-parked.distance)*ROAD_VERTICAL_SCALE<90) assert.ok(Math.abs(point.x-parked.x)>40);
    }
  }
});
