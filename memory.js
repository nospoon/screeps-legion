/**
 * memory.js
 * Memory management utilities
 */
module.exports.clearDeadMemory = function() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
};
