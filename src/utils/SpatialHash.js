/**
 * SpatialHash — 3D spatial hash grid for efficient neighbor queries.
 * Used by NeuralField to find nearby nodes for drawing connections.
 * 
 * Performance Refactor: Uses a pre-allocated Uint32Array for query results 
 * to completely eliminate per-frame Array allocations and GC stutter.
 */
export class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.inverseCellSize = 1 / cellSize;
    this.cells = new Map();
    // Pre-allocated array to avoid creating arrays every frame (fixes GC spikes)
    this.queryResults = new Uint32Array(2000); 
  }

  clear() {
    this.cells.clear();
  }

  _getKey(x, y, z) {
    const cx = Math.floor(x * this.inverseCellSize);
    const cy = Math.floor(y * this.inverseCellSize);
    const cz = Math.floor(z * this.inverseCellSize);
    return (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791);
  }

  insert(x, y, z, index) {
    const key = this._getKey(x, y, z);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(index);
  }

  queryRadius(x, y, z, radius, positions) {
    let resultCount = 0;
    const cellRadius = Math.ceil(radius * this.inverseCellSize);
    const cx = Math.floor(x * this.inverseCellSize);
    const cy = Math.floor(y * this.inverseCellSize);
    const cz = Math.floor(z * this.inverseCellSize);
    const radiusSq = radius * radius;
    const maxResults = this.queryResults.length;

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = ((cx + dx) * 73856093) ^ ((cy + dy) * 19349663) ^ ((cz + dz) * 83492791);
          const cell = this.cells.get(key);
          if (!cell) continue;

          for (let i = 0; i < cell.length; i++) {
            const idx = cell[i];
            const idx3 = idx * 3;
            const distX = positions[idx3] - x;
            const distY = positions[idx3 + 1] - y;
            const distZ = positions[idx3 + 2] - z;
            const distSq = distX * distX + distY * distY + distZ * distZ;

            if (distSq > 0 && distSq < radiusSq) {
              if (resultCount < maxResults) {
                this.queryResults[resultCount++] = idx;
              }
            }
          }
        }
      }
    }

    return resultCount;
  }
}
