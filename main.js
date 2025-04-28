// main.js
// load extensions
require('./prototypes');
const config = require('./config');
const intel = require('./intel');
const { clearDeadMemory } = require('./memory');
const spawnManager = require('./spawnManager');
const roomManager = require('./roomManager');
const layoutPlanner = require('./layoutPlanner');
const towerManager = require('./towerManager');
const roles = {
  harvester: require('./harvester'),
  hauler: require('./hauler'),
  builder: require('./builder'),
  upgrader: require('./upgrader'),
  repairer: require('./repairer'),
  turretRefiller: require('./turretRefiller'),
  defender: require('./defender')
};

module.exports.loop = function () {
  // run tower and layout planners
  if (Game.cpu.bucket > config.cpuThrottle) {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      try { layoutPlanner.plan(room); } catch(e) { console.log('layoutPlanner error:', e); }
      try { towerManager.run(room); } catch(e) { console.log('towerManager error:', e); }
    }
  }
  // Refresh global intel before operations
  intel.refresh();
  clearDeadMemory();
  // Manage spawns (critical)
  for (const spawnName in Game.spawns) {
    try { spawnManager.run(Game.spawns[spawnName]); }
    catch (e) { console.log(`spawnManager error (${spawnName}): ${e}`); }
  }
  // Manage rooms (non-critical)
  if (Game.cpu.bucket > config.cpuThrottle) {
    for (const roomName in Game.rooms) {
      try { roomManager.run(Game.rooms[roomName]); }
      catch (e) { console.log(`roomManager error (${roomName}): ${e}`); }
    }
  }
  // Always run creep roles
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const role = creep.memory.role;
    if (roles[role]) {
      try { roles[role].run(creep); }
      catch (e) { console.log(`Role ${role} error for creep ${name}: ${e}`); }
    }
  }
  // reset idleMoved flag occasionally to allow reposition again if needed
  if (Game.time % 100 === 0) {
    for (const c of Object.values(Game.creeps)) delete c.memory.idleMoved;
  }
  // move idle creeps off roads to avoid blocking (skip harvesters)
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    // skip harvesters, repositioned recently, fatigued, or carrying energy
    if (creep.memory.role === 'harvester' || creep.memory.idleMoved || creep.fatigue > 0 || creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) continue;
    const here = creep.pos.lookFor(LOOK_STRUCTURES);
    if (here.some(s => s.structureType === STRUCTURE_ROAD)) {
      // find adjacent non-road, non-wall
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const x = creep.pos.x + dx, y = creep.pos.y + dy;
          if (x < 0 || x > 49 || y < 0 || y > 49) continue;
          const terrain = Game.map.getRoomTerrain(creep.pos.roomName).get(x, y);
          if (terrain === TERRAIN_MASK_WALL) continue;
          const at = creep.room.lookForAt(LOOK_STRUCTURES, x, y);
          if (!at.some(s => s.structureType === STRUCTURE_ROAD)) {
            creep.moveTo(x, y, { reusePath: 5 });
            creep.memory.idleMoved = true;
            dx = 2; dy = 2; // break loops
          }
        }
      }
    }
  }
};
