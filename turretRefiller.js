// turretRefiller.js
// Role to refill towers with energy
module.exports.run = function(creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) {
    // withdraw from storage or containers
    const source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) &&
                    s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    if (source) {
      if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { reusePath: 20 });
      }
    }
    return;
  }
  // deliver to towers
  const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });
  if (tower) {
    if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(tower, { reusePath: 20 });
    }
  }
};
