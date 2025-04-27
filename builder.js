// builder.js
// Builds construction sites and falls back to upgrading controller
module.exports.run = function(creep) {
  if (creep.memory.building === undefined) creep.memory.building = false;
  if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.building = false;
  }
  if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
    creep.memory.building = true;
  }

  if (!creep.memory.building) {
    // get energy from storage or containers
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) &&
                    s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    if (target) {
      if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { reusePath: 20 });
      }
    } else {
      // fallback harvest
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { reusePath: 20 });
      }
    }
  } else {
    // build or fallback to upgrade
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, { reusePath: 20 });
      }
    } else {
      // fallback: upgrade controller
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { reusePath: 20 });
      }
    }
  }
};
