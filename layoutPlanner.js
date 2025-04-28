// layoutPlanner.js
// Basic stamp-based layout planner: one-time placement of extensions & towers per RCL
module.exports.plan = function(room) {
  const currentLevel = room.controller.level;
  if (room.memory.layoutPlanned === currentLevel) return;
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  if (!spawn) return;
  // Extension stamp offsets around spawn
  const extOffsets = [
    {x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},
    {x:-1,y:0},{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1}
  ];
  for (const off of extOffsets) {
    room.createConstructionSite(spawn.pos.x + off.x, spawn.pos.y + off.y, STRUCTURE_EXTENSION);
  }
  // Tower stamp offsets at cardinal positions
  const towerOffsets = [
    {x:2,y:0},{x:0,y:2},{x:-2,y:0},{x:0,y:-2}
  ];
  for (const off of towerOffsets) {
    room.createConstructionSite(spawn.pos.x + off.x, spawn.pos.y + off.y, STRUCTURE_TOWER);
  }
  room.memory.layoutPlanned = currentLevel;
};
