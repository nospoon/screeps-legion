// repairer.js
module.exports.run = function(creep) {
  const damaged = creep.room.find(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax });
  if (damaged.length === 0) return;
  if (creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.harvest = true;
  }
  if (creep.memory.harvest) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { reusePath: 20 });
    } else {
      creep.memory.harvest = false;
    }
  } else {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax });
    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { reusePath: 20 });
    }
  }
};
