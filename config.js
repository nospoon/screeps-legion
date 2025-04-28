/**
 * config.js
 * Tunable parameters for roles and thresholds
 */
module.exports = {
  roles: {
    harvester: { body: [WORK, CARRY, MOVE], min: 2, maxPerSource: 2 },
    hauler:    { body: [CARRY, CARRY, MOVE], min: 2 },
    builder:   { body: [WORK, CARRY, MOVE], min: 2 },
    upgrader:  { body: [WORK, CARRY, MOVE], min: 1 },
    repairer:  { body: [WORK, CARRY, MOVE], min: 1 },
    defender:  { body: [TOUGH, ATTACK, MOVE], min: 0 },
    turretRefiller: { body: [CARRY, CARRY, MOVE], min: 0 },
    remoteMiner:{ body: [WORK, CARRY, MOVE], min: 0 }
  },
  cpuThrottle: 200, // bucket threshold to skip non-critical tasks
  // when to spawn turretRefiller (fraction of tower energy remaining)
  turretRefillThreshold: 0.5,
  // enable auto rampart construction on key structures when under attack
  rampartAuto: true,
  // when to boost spawns to build full-size bodies
  spawnBoostThreshold: 0.8,
  // caps for WORK parts on roles to avoid overspending
  maxWorkPerRole: {
    builder: 5,
    upgrader: 5,
    repairer: 5
  }
};
