// towerManager.js
// Handles tower defense: attack hostiles or repair friendly structures
const config = require('./config');

module.exports.run = function(room) {
  const towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
  if (towers.length === 0) return;
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  // auto rampart construction on key structures when under attack
  if (config.rampartAuto && hostiles.length > 0) {
    room.memory.rampartsPlanned = room.memory.rampartsPlanned || {};
    const keyTypes = [STRUCTURE_SPAWN, STRUCTURE_STORAGE];
    const keyStructures = room.find(FIND_MY_STRUCTURES, { filter: s => keyTypes.includes(s.structureType) });
    for (const s of keyStructures) {
      if (room.memory.rampartsPlanned[s.id]) continue;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const x = s.pos.x + dx, y = s.pos.y + dy;
          if (x < 0 || x > 49 || y < 0 || y > 49) continue;
          const terrain = Game.map.getRoomTerrain(room.name).get(x, y);
          if (terrain === TERRAIN_MASK_WALL) continue;
          const at = room.lookForAt(LOOK_STRUCTURES, x, y);
          if (at.some(str => str.structureType === STRUCTURE_RAMPART)) continue;
          room.createConstructionSite(x, y, STRUCTURE_RAMPART);
        }
      }
      room.memory.rampartsPlanned[s.id] = true;
    }
  }
  if (hostiles.length > 0) {
    for (const tower of towers) {
      const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (target) tower.attack(target);
    }
  } else {
    for (const tower of towers) {
      const target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
      });
      if (target && tower.store[RESOURCE_ENERGY] > 0) {
        tower.repair(target);
      }
    }
  }
};
