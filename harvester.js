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
    // harvesting-phase: dynamic slot-based assignment with nearest-source fallback
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    if (sources.length === 0) {
      creep.memory.harvesting = false;
      return;
    }
    const harvesters = creep.room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === 'harvester' && c.memory.home === creep.memory.home && c.memory.harvesting
    }).sort((a, b) => a.name.localeCompare(b.name));
    const terrain = Game.map.getRoomTerrain(creep.room.name);
    const slotSources = [];
    sources.forEach(src => {
      let free = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const x = src.pos.x + dx, y = src.pos.y + dy;
          if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
          if (creep.room.lookForAt(LOOK_STRUCTURES, x, y).some(o => o.structureType !== STRUCTURE_ROAD)) continue;
          if (creep.room.lookForAt(LOOK_CREEPS, x, y).length) continue;
          free++;
        }
      }
      const allowed = Math.max(0, free - 1);
      for (let i = 0; i < allowed; i++) slotSources.push(src.id);
    });
    let sid;
    if (slotSources.length > 0) {
      const idx = harvesters.findIndex(h => h.name === creep.name);
      sid = slotSources[idx % slotSources.length];
    } else {
      const fallback = creep.pos.findClosestByRange(sources);
      sid = fallback ? fallback.id : sources[0].id;
    }
    const source = Game.getObjectById(sid);
    creep.memory.sourceId = sid;
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.smartMove(source);
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
