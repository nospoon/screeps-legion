// prototypes.js
// Extend Creep with smartMove using cached cost matrices
const costMatrixCache = require('./costMatrixCache');

Creep.prototype.smartMove = function(target, opts = {}) {
  return this.moveTo(target, Object.assign({
    reusePath: opts.reusePath || 20,
    costCallback: (roomName, costMatrix) => costMatrixCache.getMatrix(Game.rooms[roomName])
  }, opts));
};
