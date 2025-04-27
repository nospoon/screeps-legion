// harvester.js
module.exports.run = function(creep) {
  if (creep.memory.harvesting === undefined) creep.memory.harvesting = true;
  if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
    creep.memory.harvesting = false;
  }
  if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.harvesting = true;
  }

  if (creep.memory.harvesting) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { reusePath: 20 });
    }
  } else {
    // deposit strategy: containers if haulers exist, else spawn
    const haulerCount = _.filter(Game.creeps,
      c => c.memory.role === 'hauler' && c.memory.home === creep.memory.home
    ).length;
    let target;
    if (haulerCount > 0) {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (
          (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        )
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => (
            (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
            s.energy < s.energyCapacity
          )
        });
      }
    } else {
      // no haulers: push straight to spawn/extensions
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (
          (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
        )
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => (
            (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          )
        });
      }
    }
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { reusePath: 20 });
      }
    } else {
      creep.drop(RESOURCE_ENERGY);
    }
  }
};
