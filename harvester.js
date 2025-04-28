// harvester.js
module.exports.run = function(creep) {
  if (creep.memory.harvesting === undefined) creep.memory.harvesting = true;
  if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
    creep.memory.harvesting = false;
  }
  if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.harvesting = true;
  }

  // deposit-first: if in deposit-phase and carrying energy, unload before harvesting
  if (!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    // deposit to containers if haulers exist, else to spawns/extensions
    const haulerCount = _.filter(Game.creeps,
      c => c.memory.role === 'hauler' && c.memory.home === creep.memory.home
    ).length;
    let target;
    if (haulerCount > 0) {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: s =>
        (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: s =>
          (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
        });
      }
    } else {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: s =>
        (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
        s.energy < s.energyCapacity
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: s =>
          (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
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
    return;
  }

  if (creep.memory.harvesting) {
    // harvesting-phase: lock or pick source
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    if (sources.length === 0) {
      creep.memory.harvesting = false;
      return;
    }
    // build workCounts per source
    const harvesters = creep.room.find(FIND_MY_CREEPS, { filter: c =>
      c.memory.role === 'harvester' &&
      c.memory.home === creep.memory.home &&
      c.store.getUsedCapacity(RESOURCE_ENERGY) === 0
    });
    const workCounts = {};
    for (const s of sources) workCounts[s.id] = 0;
    for (const h of harvesters) {
      const sid = h.memory.sourceId;
      if (workCounts[sid] !== undefined) workCounts[sid] += h.getActiveBodyparts(WORK);
    }
    // regen rate per tick
    const regenRate = (sources[0].energyCapacity || 300) / 300;
    // try existing sourceId
    let target = creep.memory.sourceId && Game.getObjectById(creep.memory.sourceId);
    if (!target || target.energy === 0 || workCounts[target.id] * HARVEST_POWER > regenRate) {
      // pick sustainable or nearest
      sources.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
      target = sources.find(s => workCounts[s.id] * HARVEST_POWER <= regenRate) || sources[0];
      creep.memory.sourceId = target.id;
    }
    // harvest or move
    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.smartMove(target);
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
