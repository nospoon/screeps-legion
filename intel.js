// intel.js
// Collects and stores global intel for rooms in Memory.intel
module.exports.refresh = function() {
  // Initialize intel container
  Memory.intel = Memory.intel || {};
  Memory.intel.rooms = {};
  // Pre-calc creep counts per role per home
  const countsByRoom = {};
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const home = creep.memory.home;
    const role = creep.memory.role;
    countsByRoom[home] = countsByRoom[home] || {};
    countsByRoom[home][role] = (countsByRoom[home][role] || 0) + 1;
  }
  // Gather intel per room
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const dropped = room.find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY });
    const tombs = room.find(FIND_TOMBSTONES, { filter: t => t.store[RESOURCE_ENERGY] > 0 });
    Memory.intel.rooms[roomName] = {
      hostiles: hostiles.map(c => c.id),
      dropped: dropped.map(r => r.id),
      tombstones: tombs.map(t => t.id),
      sources: room.find(FIND_SOURCES).map(s => s.id),
      creepCount: countsByRoom[roomName] || {}
    };
  }
};
