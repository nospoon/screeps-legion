// defender.js
// Basic melee defender: seek and attack hostiles
module.exports.run = function(creep) {
  const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length === 0) {
    // idle near spawn
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (spawn && creep.pos.getRangeTo(spawn) > 3) creep.moveTo(spawn, { reusePath: 20 });
    return;
  }
  const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if (target) {
    if (creep.attack(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { reusePath: 20 });
    }
  }
};
