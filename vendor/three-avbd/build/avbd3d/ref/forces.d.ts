import { Force, type BodySystem, type Rigid } from './body.ts';
import { type Quat, type V3 } from './math.ts';
import type { Solver } from './solver.ts';
/**
 * Ball-socket joint (linear rows) plus an angle lock (angular rows), with optional fracture
 * on the angular force. Stiffness Infinity makes a row hard (dual variable + stabilization);
 * a finite stiffness makes it a spring; 0 disables it. When bodyA is null, rA is a world point.
 *
 * Two extensions the demo does not have, both opt-in (`rest` null and `yield` Infinity are the
 * demo's joint to the bit, wherever the bodies' quaternions share a hemisphere: see evaluateAng):
 * the angle lock can hold a relative rotation other than none (`rest`), and a hard one can give
 * under load and keep the bend (`yield`).
 */
export declare class Joint extends Force {
    readonly rA: V3;
    readonly rB: V3;
    readonly C0Lin: V3;
    readonly C0Ang: V3;
    readonly penaltyLin: V3;
    readonly penaltyAng: V3;
    readonly lambdaLin: V3;
    readonly lambdaAng: V3;
    stiffnessLin: number;
    stiffnessAng: number;
    fracture: number;
    torqueArm: number;
    broken: boolean;
    /**
     * Whether `fracture` also limits the linear force |λ_lin|, not just the angular one (the demo
     * breaks on the angular force alone: with a rigid angle lock, the torque; this is the GPU
     * solver's negative threshold, GpuSolver3D.appendJoints `linear`).
     */
    fractureLinear: boolean;
    /**
     * The relative rotation the angle lock holds, B's orientation in A's frame (x, y, z, w):
     * rotB = rotA·rest. null: the identity, rotA = rotB, as in the demo. Set it before the
     * first step, or take it from the bodies as they are (holdCurrentRotation).
     */
    rest: Quat | null;
    /**
     * Past this angular force, |λ_ang| (as for `fracture`) on a hard angle lock, the joint yields:
     * in the dual update its rest turns to where the bodies are and λ_ang is cut back to this
     * length, so it carries no more than this and keeps the bend. Fracture still applies above it.
     * Infinity: it never yields.
     */
    yield: number;
    /**
     * The rest the joint was made with, which `bend` is measured from: a yield moves `rest` away
     * from it. null: the rest the joint holds when it first yields (set then), so a joint that has
     * not yielded has not bent. A scene that makes a joint already bent sets `rest` to the bent
     * turn and this to the straight one.
     */
    restStart: Quat | null;
    /**
     * Past this bend (rad, see `bend`) a plastic joint breaks, in the dual update of the iteration
     * it yields in: the way a sustained overload tears it, since yielding cuts its force back
     * before the fracture test sees more than a sudden jump. Infinity: it never breaks on its bend.
     */
    breakBend: number;
    constructor(solver: Solver, bodyA: Rigid | null, bodyB: Rigid, rA: ArrayLike<number>, rB: ArrayLike<number>, stiffnessLin?: number, stiffnessAng?: number, fracture?: number);
    /** Linear constraint: anchor A minus anchor B, in world space. */
    evaluateLin(out: V3): V3;
    /**
     * Angular constraint: relative rotation vector, scaled by torqueArm to length units: the turn
     * from rotB to the rotation B should have, rotA (no rest, the demo's lock) or rotA·rest. It is
     * taken the short way round: q and −q are one rotation, and when rotB and the one it should have
     * are in opposite hemispheres (opposite signs, or a turn of more than 180°) the demo's vector
     * is the long way, which pushes the bodies further apart (the GPU solver always takes the short
     * way). Where they share a hemisphere, as the demo's bodies do, this is the demo's lock to the bit.
     */
    evaluateAng(out: V3): V3;
    /** Hold the bodies' rotations as they are now: rest = rotA⁻¹·rotB (what a yield does). */
    holdCurrentRotation(): void;
    /** How far the joint has bent (rad, 0 to π): the turn from the rest it started with to the one it holds. */
    get bend(): number;
    initialize(): boolean;
    updatePrimal(body: Rigid, alpha: number, sys: BodySystem): void;
    updateDual(alpha: number): void;
}
/** Standard spring between two anchors; rest < 0 takes the current distance. */
export declare class Spring extends Force {
    readonly rA: V3;
    readonly rB: V3;
    rest: number;
    stiffness: number;
    constructor(solver: Solver, bodyA: Rigid, bodyB: Rigid, rA: ArrayLike<number>, rB: ArrayLike<number>, stiffness: number, rest?: number);
    initialize(): boolean;
    updatePrimal(body: Rigid, _alpha: number, sys: BodySystem): void;
    updateDual(): void;
}
/** No physical effect; stops the broadphase creating a contact manifold for the pair. */
export declare class IgnoreCollision extends Force {
    initialize(): boolean;
    updatePrimal(): void;
    updateDual(): void;
}
//# sourceMappingURL=forces.d.ts.map