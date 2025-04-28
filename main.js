// main.js
const config = require('./config');
const intel = require('./intel');
const { clearDeadMemory } = require('./memory');
const spawnManager = require('./spawnManager');
const roomManager = require('./roomManager');
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
    const layoutPlanner = require('./layoutPlanner');
    const towerManager = require('./towerManager');
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      try { layoutPlanner.plan(room); } catch(e) { console.error('layoutPlanner:', e); }
      try { towerManager.run(room); } catch(e) { console.error('towerManager:', e); }
    }
  }
  // Refresh global intel before operations
  intel.refresh();
  clearDeadMemory();
  // High-level managers only when bucket is healthy
  if (Game.cpu.bucket > config.cpuThrottle) {
    // Manage spawns
    for (const spawnName in Game.spawns) {
      try { spawnManager.run(Game.spawns[spawnName]); }
      catch (e) { console.error(`spawnManager error (${spawnName}):`, e); }
    }
    // Manage rooms
    for (const roomName in Game.rooms) {
      try { roomManager.run(Game.rooms[roomName]); }
      catch (e) { console.error(`roomManager error (${roomName}):`, e); }
    }
  }
  // Always run creep roles
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const role = creep.memory.role;
    if (roles[role]) {
      try { roles[role].run(creep); }
      catch (e) { console.error(`Role ${role} error for creep ${name}:`, e); }
    }
  }
};
