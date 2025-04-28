// costMatrixCache.js
// Cache PathFinder CostMatrix per room to speed up pathfinding
module.exports.getMatrix = function(room) {
  if (!Memory.costMatrices) Memory.costMatrices = {};
  const entry = Memory.costMatrices[room.name];
  // reuse for 10 ticks
  if (entry && Game.time - entry.timestamp < 10) {
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
