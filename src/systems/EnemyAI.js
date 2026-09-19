// Utility functions for enemy AI — used by EnemyTank.js
export function lineOfSight(scene, fromX, fromY, toX, toY) {
  // Simple raycast check against stone blocks.
  // Returns true if there's a clear shot (no stone in the way).
  const steps = 20;
  const dx = (toX - fromX) / steps;
  const dy = (toY - fromY) / steps;
  for (let i = 0; i < steps; i++) {
    const cx = fromX + dx * i;
    const cy = fromY + dy * i;
    // Check if any stone block occupies this point
    const blocked = scene.terrainBuilder?.stoneBlocks?.getChildren()?.some(b => {
      return Math.abs(b.x - cx) < 16 && Math.abs(b.y - cy) < 16;
    });
    if (blocked) return false;
  }
  return true;
}

export function predictPlayerPos(player, dt) {
  // Extrapolate player position by one dt tick using current velocity
  const vx = player.body?.velocity?.x || 0;
  const vy = player.body?.velocity?.y || 0;
  return {
    x: player.x + vx * dt,
    y: player.y + vy * dt,
  };
}
