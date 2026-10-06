// Propulsion restrictions are applied in physics, including carried craft and rail rotation.
export function thrustAvailability(v) {
  const spec = v.type.atmosphericThrust;
  if (!spec) return 1;
  const density = v.parent ? Math.max(0, v.zone?.pressure || 0) * 1.225 : Math.max(0, v.env?.density || 0);
  return Math.min(1.2, density / spec.referenceDensity);
}
export function applyPropulsion(v, force, torque, dt) {
  const available = thrustAvailability(v);
  force.multiplyScalar(available); torque.multiplyScalar(available);
  if (!v.type.vectorPods) return;
  const forward = Math.max(0, -force.z), up = Math.max(0, force.y);
  const target = forward + up > 1 ? Math.atan2(up, forward) : (v.podTilt || 0);
  const angle = v.podTilt || 0, step = v.type.vectorPods.rate * dt;
  v.podTilt = angle + Math.max(-step, Math.min(step, target - angle));
  const sin = Math.sin(v.podTilt), cos = Math.cos(v.podTilt);
  // Project the requested main/lift force onto the actual pod axis. A pod in
  // transit cannot instantaneously deliver the force of the requested pose.
  const magnitude = forward * cos + up * sin;
  force.z = Math.max(0, force.z) - magnitude * cos;
  force.y = Math.min(0, force.y) + magnitude * sin;
}
