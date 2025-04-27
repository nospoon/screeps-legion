// roomManager.js
// Handles upgrading controller and planning extensions
const config = require('./config');
module.exports.run = function(room) {
  // upgrade controller if no urgent spawn
  if (Game.cpu.bucket > config.cpuThrottle) {
    const upgraderCount = _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.memory.home === room.name).length;
    if (upgraderCount > 0) {
      for (const creep of _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.memory.home === room.name)) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
          creep.memory.state = 'withdraw';
        }
        if (creep.memory.state === 'withdraw') {
          creep.withdraw(creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0 }));
        } else {
          creep.upgradeController(room.controller);
        }
      }
    }

  }
};
