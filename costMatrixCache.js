// costMatrixCache.js
// Cache PathFinder CostMatrix per room to speed up pathfinding
module.exports.getMatrix = function(room) {
  if (!Memory.costMatrices) Memory.costMatrices = {};
  // purge stale entries every 500 ticks
  if (Game.time % 500 === 0) {
    for (const rn in Memory.costMatrices) {
      const e = Memory.costMatrices[rn];
      if (Game.time - e.timestamp > 1000) delete Memory.costMatrices[rn];
    }
  }
  const entry = Memory.costMatrices[room.name];
  // dynamic TTL: 10 ticks when visible, else infinite
  const ttl = Game.rooms[room.name] ? 10 : Infinity;
  if (entry && Game.time - entry.timestamp < ttl) {
    return PathFinder.CostMatrix.deserialize(entry.matrix);
  }
  const cm = new PathFinder.CostMatrix();
  const terrain = Game.map.getRoomTerrain(room.name);
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) cm.set(x, y, 255);
    }
  }
  // weight roads low cost
  for (const road of room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_ROAD })) {
    cm.set(road.pos.x, road.pos.y, 1);
  }
  Memory.costMatrices[room.name] = { timestamp: Game.time, matrix: cm.serialize() };
  return cm;
};
