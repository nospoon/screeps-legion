// hauler.js
module.exports.run = function(creep) {
  // Opportunistic resource salvage
  const tomb = creep.pos.findClosestByPath(FIND_TOMBSTONES, { filter: t => t.store[RESOURCE_ENERGY] > 0 });
  if (tomb && creep.store.getFreeCapacity() >= tomb.store[RESOURCE_ENERGY]) {
    if (creep.withdraw(tomb, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(tomb, { reusePath: 20 });
    }
    return;
  }
  const drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY });
  if (drop && creep.store.getFreeCapacity() > 0) {
    if (creep.pickup(drop) === ERR_NOT_IN_RANGE) {
      creep.moveTo(drop, { reusePath: 20 });
    }
    return;
  }

  // Standard hauling: withdraw then transfer
  if (creep.store[RESOURCE_ENERGY] === 0) {
    const source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 0
    });
    if (source) {
      if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { reusePath: 20 });
      }
    }
  } else {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { reusePath: 20 });
      }
    }
  }
};
