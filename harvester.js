// harvester.js
module.exports.run = function(creep) {
  if (creep.memory.harvesting === undefined) creep.memory.harvesting = true;
  if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
    creep.memory.harvesting = false;
  }
  if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.harvesting = true;
  }

  // deposit-first: if carrying energy, unload before harvesting
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
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
    // pick nearest source that won't deplete before refresh
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    // sum WORK parts assigned per source
    const harvesters = creep.room.find(FIND_MY_CREEPS, {
      filter: c =>
        c.memory.role === 'harvester' &&
        c.memory.home === creep.memory.home &&
        c.store.getUsedCapacity(RESOURCE_ENERGY) === 0
    });
    const workCounts = {};
    for (const s of sources) workCounts[s.id] = 0;
    for (const h of harvesters) {
      const id = h.memory.sourceId;
      if (workCounts[id] !== undefined) workCounts[id] += h.getActiveBodyparts(WORK);
    }
    // source regen rate (energy per tick)
    const regenTime = 300;
    const capacity = (sources[0] && sources[0].energyCapacity) || 3000;
    const regenRate = capacity / regenTime;
    // sort by distance
    sources.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
    // choose nearest source with work capacity <= regen rate
    let target = sources.find(s => workCounts[s.id] * HARVEST_POWER <= regenRate);
    if (!target) {
      // all sources saturated; pick nearest
      target = sources[0];
    }
    // guard against no sources
    if (!target) {
      creep.memory.harvesting = false;
      return;
    }
    creep.memory.sourceId = target.id;
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
