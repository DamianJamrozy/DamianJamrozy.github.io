import assert from 'node:assert/strict';
import test from 'node:test';
import { TRACK_ACCESS, distanceToTrackAccess, isAtTrackGate, isTrackAccessPaved, trackAccessIntersectsBounds } from '../career-drive/track-access.js';
import { sampleRoad, roadProfile, ROAD_VERTICAL_SCALE } from '../career-drive/road-layout.js';

test('the circuit access makes one monotonic right-hand turn and reaches a separate physical gate',()=>{
  const {entry,gate,points,width}=TRACK_ACCESS;
  assert.deepEqual(points[0],entry);assert.deepEqual(points.at(-1),gate);
  assert.ok(entry.x<sampleRoad(entry.distance).x+roadProfile(entry.distance).width/2);
  assert.ok(gate.x-sampleRoad(gate.distance).x>roadProfile(gate.distance).width/2+width*2);
  for(const [index,point] of points.entries()) {
    if(!index) continue;
    assert.ok(point.x>points[index-1].x);
    assert.ok(point.distance>points[index-1].distance,'the branch cannot double back over itself');
    assert.ok(Math.hypot(point.x-points[index-1].x,(point.distance-points[index-1].distance)*ROAD_VERTICAL_SCALE)<20);
    assert.equal(distanceToTrackAccess(point),0);
    assert.equal(isTrackAccessPaved(point),true);
  }
  assert.equal(isAtTrackGate(entry),false);
  assert.equal(isAtTrackGate(gate),true);
  assert.equal(isAtTrackGate({x:sampleRoad(gate.distance).x,distance:gate.distance}),false);
  assert.equal(isTrackAccessPaved({x:gate.x+200,distance:gate.distance}),false);
});

test('projected footprints reserve the corridor, including facades anchored below its visible road',()=>{
  const point=TRACK_ACCESS.points[20];
  assert.equal(trackAccessIntersectsBounds({left:point.x-30,right:point.x+30,minDistance:point.distance-300,maxDistance:point.distance+20}),true);
  assert.equal(trackAccessIntersectsBounds({left:point.x+300,right:point.x+350,minDistance:point.distance-300,maxDistance:point.distance+20}),false);
  assert.equal(trackAccessIntersectsBounds({left:point.x-30,right:point.x+30,minDistance:10000,maxDistance:10500}),false);
});
