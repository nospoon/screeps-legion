# Screeps Colony Automation

## Overview
This project provides an automated Screeps AI for managing a colony with optimized resource harvesting, dynamic spawning, and automated defense.

## Features
- **Dynamic Harvester Assignment**:
  - Calculates free mining slots around each source using room terrain and occupancy
  - Distributes harvesters evenly via slot-based source assignment
- **Spawn Manager**:
  - Determines desired creep counts per role, especially harvesters based on available mining slots
  - Supports spawn boost threshold and max WORK parts per role
- **Defense Module**:
  - Monitors hostiles and spawns defenders when threats exceed current defense capacity
- **Cost Matrix Cache**:
  - Caches pathfinding cost matrices per room to reduce CPU overhead

## Project Structure
```
/harvester.js       # Harvester role logic
/spawnManager.js    # Dynamic spawn decision logic
/defender.js        # Automated defense role
/costMatrixCache.js # Pathfinding cost matrix caching
/config.js          # Configurable parameters per role
/main.js            # Entry point, orchestrates room and creep operations
```

## Implementation Details

### harvester.js
- Toggles between **harvest phase** and **deposit phase** based on `creep.memory.harvesting` and store capacity.
- **Harvest Phase**:
  - Uses `Game.map.getRoomTerrain` to scan adjacent tiles for walkable spots (excluding walls, non-road structures, and occupied tiles).
  - Builds a `slotSources` array, repeating each source ID for each available slot minus one reserved spot.
  - Sorts all active harvesters by name and indexes into `slotSources` to assign sources evenly.
  - Falls back to the nearest active source if no slots are available.
- **Deposit Phase**:
  - Prefers containers/storage when haulers exist, otherwise fills spawns/extensions.
  - Drops energy if no valid deposit target is found.

### spawnManager.js
- Calculates `desired` creep count per role:
  - For harvesters, sums up all free mining slots across sources.
  - Enforces minimum counts for other roles.
- Chooses creep body based on `spawnBoostThreshold`:
  - Builds greedy bodies when energy is abundant, capped by `maxWorkPerRole`.
- Spawns defenders first against hostiles, then other roles.

### defender.js
- Counts hostile creeps in each room.
- Spawns `defender` creeps when `hostilesCount > currentDefenderCount`.

### costMatrixCache.js
- Maintains a cache of `CostMatrix` per room.
- Invalidates cache when terrain or structures change.
- Provides efficient `Room.findPath` calls.