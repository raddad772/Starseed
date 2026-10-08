/** A joint as of a readback (the last iteration of the last step). */
export interface JointState {
    /** |λ_lin|: the force (N) its linear rows carry, holding the two anchors together. */
    linear: number;
    /**
     * |λ_ang|: the angular force its rigid angle lock carries, the number `fracture` and `yield`
     * limit (0 for a ball joint, which has no angle lock). The torque it makes is the joint's torque
     * arm, |size_a + size_b|², times this.
     */
    angular: number;
    /**
     * It broke (or was switched off): its stiffness is zeroed, at J_PEN_LIN + 3 and J_PEN_ANG + 3.
     * A ball joint's angle lock has none from the start, so only both being zero says it broke.
     */
    broken: boolean;
    /** The relative rotation its angle lock holds now: rotB = rotA·rest (x, y, z, w). A plastic joint moves it. */
    rest: [number, number, number, number];
    /**
     * How far it has bent (rad, 0 to π): the turn from the rest it started with to the one it holds
     * now. Exactly 0 for a joint that never yielded; the number `breakBend` limits.
     */
    bend: number;
}
/** How far the joint in slot `slot` of a `readJoints()` result has bent (rad): see JointState.bend. */
export declare function jointBend(joints: ArrayLike<number>, slot: number): number;
/**
 * Slot `slot` of a `readJoints()` result as a JointState (written into `into`, if given: decoding
 * a whole readback allocates nothing that way).
 */
export declare function decodeJoint(joints: ArrayLike<number>, slot: number, into?: JointState): JointState;
//# sourceMappingURL=joints.d.ts.map