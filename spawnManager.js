// spawnManager.js
// Dynamically spawns creeps based on config minimums and available energy
const config = require('./config');
const intel = require('./intel');

module.exports.run = function(spawn) {
  if (spawn.spawning) return;
  // access precomputed creep counts from intel
  const room = spawn.room;
  const counts = (Memory.intel.rooms[room.name] || {}).creepCount || {};
  const energyAvailable = room.energyAvailable;

  // dynamic turretRefiller spawn when towers exist
  const towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
  const currentRef = counts['turretRefiller'] || 0;
  const refBody = config.roles.turretRefiller.body;
  const refCost = refBody.reduce((sum, p) => sum + BODYPART_COST[p], 0);
  if (towers.length > currentRef && energyAvailable >= refCost) {
    const name = `turretRefiller_${Game.time}`;
    spawn.spawnCreep(refBody, name, { memory: { role: 'turretRefiller', home: room.name } });
    return;
  }

  for (const role in config.roles) {
    // dynamic defender spawn when attacked
    if (role === 'defender') {
      const roomIntel = Memory.intel.rooms[room.name] || {};
      const hostilesCount = (roomIntel.hostiles || []).length;
      const currentDef = counts['defender'] || 0;
      const baseBody = config.roles.defender.body;
      const cost = baseBody.reduce((sum, p) => sum + BODYPART_COST[p], 0);
      if (hostilesCount > currentDef && energyAvailable >= cost) {
        const name = `defender_${Game.time}`;
        spawn.spawnCreep(baseBody, name, { memory: { role: 'defender', home: room.name } });
        return;
      }
      // no spawn needed: proceed to other roles
      continue;
    }
    // only spawn repairer if there are damaged structures
    if (role === 'repairer') {
      const damaged = spawn.room.find(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax });
      if (damaged.length === 0) continue;
    }
    // skip builder if no construction sites in room
    if (role === 'builder') {
      if (spawn.room.find(FIND_CONSTRUCTION_SITES).length === 0) continue;
    }
    const { body: baseBody, min } = config.roles[role];
    const count = counts[role] || 0;
    if (count < min) {
      // dynamic body: greedy composition based on baseBody ratio
      const baseCost = baseBody.reduce((sum, p) => sum + BODYPART_COST[p], 0);
      // skip if not enough energy for one base
      if (energyAvailable < baseCost) continue;
      let remaining = energyAvailable;
      const body = [];
      // add parts in baseBody order greedily until no energy or cap reached
      while (true) {
        let added = false;
        for (const part of baseBody) {
          const cost = BODYPART_COST[part];
          if (cost <= remaining && body.length < 50) {
            body.push(part);
            remaining -= cost;
            added = true;
          }
        }
        if (!added) break;
      }
      const name = `${role}_${Game.time}`;
      spawn.spawnCreep(body, name, { memory: { role, home: room.name } });
      return;
    }
  }
};
