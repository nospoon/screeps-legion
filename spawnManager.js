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
  const roomEnergyCapacity = room.energyCapacityAvailable;

  // dynamic turretRefiller spawn when towers fall below energy threshold
  const towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
  const towersNeeding = towers.filter(t =>
    t.store.getUsedCapacity(RESOURCE_ENERGY) / t.store.getCapacity(RESOURCE_ENERGY)
      < config.turretRefillThreshold
  );
  const currentRef = counts['turretRefiller'] || 0;
  const refBody = config.roles.turretRefiller.body;
  const refCost = refBody.reduce((sum, p) => sum + BODYPART_COST[p], 0);
  if (towersNeeding.length > currentRef && energyAvailable >= refCost) {
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
    // calculate desired count: base min or dynamic based on source slots for harvester
    const { body: baseBody, min } = config.roles[role];
    const count = counts[role] || 0;
    // desired count: base min or maxPerSource*sourceCount for harvesters
    let desired = min;
    if (role === 'harvester') {
      // dynamic harvester count based on free slots minus one reserved per source
      const sources = room.find(FIND_SOURCES_ACTIVE);
      const terrain = Game.map.getRoomTerrain(room.name);
      let totalSlots = 0;
      for (const s of sources) {
        let slots = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const x = s.pos.x + dx;
            const y = s.pos.y + dy;
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
            const structs = room.lookForAt(LOOK_STRUCTURES, x, y);
            if (structs.some(st => st.structureType !== STRUCTURE_ROAD)) continue;
            slots++;
          }
        }
        totalSlots += Math.max(0, slots - 1);
      }
      desired = Math.max(min, totalSlots);
    }
    if (count < desired) {
      const baseCost = baseBody.reduce((sum, p) => sum + BODYPART_COST[p], 0);
      if (energyAvailable < baseCost) continue;
      const name = `${role}_${Game.time}`;
      // decide body shape: base or boosted greedy
      const fraction = energyAvailable / roomEnergyCapacity;
      let buildBody;
      if (fraction < config.spawnBoostThreshold) {
        buildBody = baseBody;
      } else {
        // greedy fill with baseBody pattern, capping WORK parts
        let remaining = energyAvailable;
        const body = [];
        const maxWork = config.maxWorkPerRole[role] || Infinity;
        let workCount = 0;
        while (true) {
          let added = false;
          for (const part of baseBody) {
            if (part === WORK && workCount >= maxWork) continue;
            const cost = BODYPART_COST[part];
            if (cost <= remaining && body.length < 50) {
              body.push(part);
              remaining -= cost;
              added = true;
              if (part === WORK) workCount++;
            }
          }
          if (!added) break;
        }
        buildBody = body;
      }
      spawn.spawnCreep(buildBody, name, { memory: { role, home: room.name } });
      return;
    }
  }
};
