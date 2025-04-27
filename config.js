/**
 * config.js
 * Tunable parameters for roles and thresholds
 */
module.exports = {
  roles: {
    harvester: { body: [WORK, CARRY, MOVE], min: 2 },
    hauler:    { body: [CARRY, CARRY, MOVE], min: 2 },
    builder:   { body: [WORK, CARRY, MOVE], min: 2 },
    upgrader:  { body: [WORK, CARRY, MOVE], min: 1 },
    repairer:  { body: [WORK, CARRY, MOVE], min: 1 },
    defender:  { body: [TOUGH, ATTACK, MOVE], min: 0 },
    remoteMiner:{ body: [WORK, CARRY, MOVE], min: 0 }
  },
  cpuThrottle: 200 // bucket threshold to skip non-critical tasks
};
