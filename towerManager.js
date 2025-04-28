// towerManager.js
// Handles tower defense: attack hostiles or repair friendly structures
module.exports.run = function(room) {
  const towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
  if (towers.length === 0) return;
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
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
