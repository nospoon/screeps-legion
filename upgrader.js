// upgrader.js
// Upgrades the room controller, fetching energy as needed
module.exports.run = function(creep) {
  if (creep.memory.upgrading === undefined) creep.memory.upgrading = false;
  if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.upgrading = false;
  }
  if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
    creep.memory.upgrading = true;
  }

  if (creep.memory.upgrading) {
    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { reusePath: 20 });
    }
  } else {
    // withdraw from storage or container
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) &&
                    s.store[RESOURCE_ENERGY] > 0
    });
    if (target) {
      if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { reusePath: 20 });
      }
    } else {
      // fallback to harvest
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { reusePath: 20 });
      }
    }
  }
};
