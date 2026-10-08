import * as THREE from 'three/webgpu';
import { type JointState } from '../avbd3d/gpu/joints.ts';
import { GpuSolver3D } from '../avbd3d/gpu/solver.ts';
import { type HullShape } from '../avbd3d/shapes.ts';
import { type Pushes } from './push.ts';
import { type Ray } from './raycast.ts';
export type Vec3 = [number, number, number];
/** A unit quaternion, x y z w (as THREE.Quaternion's toArray). */
export type Quat = [number, number, number, number];
export interface WorldOptions {
    /** Share the renderer's GPU device, so BodyMesh can draw the bodies with no copies. */
    renderer?: THREE.WebGPURenderer;
    /** Or a device of your own (headless: Node with Dawn, tests, workers). */
    device?: GPUDevice;
    /** Room for this many bodies at once (removed bodies' slots are reused). */
    maxBodies: number;
    /** m/s², y-up by default. */
    gravity?: Vec3;
    /** Seconds per step. */
    dt?: number;
    /** Solver iterations per step: more is stiffer and costs more. */
    iterations?: number;
    /** Contact events: pairs touching at once with a body that reports contacts (default 8192). */
    maxContactPairs?: number;
    /** Contact events kept between readbacks; more are dropped (default 4096). */
    maxContactEvents?: number;
}
/** A body's starting state: where it is, how it's turned, how it moves. */
export interface BodyState {
    position?: Vec3;
    rotation?: Quat;
    velocity?: Vec3;
    angularVelocity?: Vec3;
}
export interface BodyOptions extends BodyState {
    /** kg/m³ (a 1 m cube of density 1 weighs 1 kg). */
    density?: number;
    friction?: number;
    /** Never moves (the ground, walls): infinite mass. */
    fixed?: boolean;
    /**
     * Collision groups (bitmasks, 32 groups): the groups it's in, and the groups it collides with.
     * Two bodies collide when each is in a group the other collides with. Default: in group 1,
     * colliding with every group.
     */
    group?: number;
    collidesWith?: number;
    /** Report when it starts and stops touching other bodies (World.onContact). */
    reportContacts?: boolean;
}
export interface BoxOptions extends BodyOptions {
    /** Full widths along the box's own axes (m). */
    size: Vec3;
}
export interface SphereOptions extends BodyOptions {
    radius: number;
}
/**
 * A convex hull: of `points` (x, y, z each: a mesh's vertices, say), or a `shape` made once with
 * convexHull and shared by many bodies. `position` and `rotation` place the points' own frame (as
 * you'd place the mesh they came from); the body itself sits at the hull's centre of mass, turned
 * to its principal axes (its `position` and `rotation` from then on).
 */
export interface HullOptions extends BodyOptions {
    points?: ArrayLike<number>;
    shape?: HullShape;
}
/** Where a ray first meets a body. */
export interface RayHit {
    /** The body hit (null if it was removed while the cast was on its way back). */
    body: Body | null;
    /** How far along the ray (m): 0 when it starts inside the body. */
    distance: number;
    point: Vec3;
    /** The surface's outward normal there (against the ray when it starts inside). */
    normal: Vec3;
}
export interface RaycastOptions {
    /** Default: as far as it goes. */
    maxDistance?: number;
    /** Bodies it passes through (at most 16: the caster's own, say). */
    ignore?: Body[];
    /** Only bodies in these collision groups (a bitmask). Default: all. */
    collidesWith?: number;
}
export interface JointOptions {
    /** Where the joint holds, in each body's own frame (m). */
    anchorA?: Vec3;
    anchorB?: Vec3;
    /**
     * 'fixed' (the default): the bodies hold together as one. 'ball': they hold together at the
     * anchors but turn freely about them (ball and socket).
     */
    type?: 'fixed' | 'ball';
    /**
     * The force that breaks the joint, at least 0: it limits the angular force of its angle lock
     * (the number `Joint.force.angular` says: the torque over its torque arm), as in the paper, or
     * with `breakOnPull` its pull too. None: it never breaks.
     *
     * On a joint that yields (`yieldForce`) a breakForce above the yield only catches a sudden jump
     * of its torque: a joint that gives is cut back to its yield every iteration, so a load that
     * keeps bending it never asks more than that, and a joint set up so (finite `breakForce` above
     * `yieldForce`, no `breakOnPull`, no `breakBend`) warns once. To have a sustained overload tear
     * a plastic joint, use `breakBend` (how far it has bent) or `breakOnPull`.
     */
    breakForce?: number;
    /**
     * Also break on the joint's pull: `breakForce` then limits |λ_lin| as well, the force holding
     * its two anchors together, in **newtons** (a 1 kg box hanging from it pulls 9.81). It is one
     * number for both: choose it for the pull (a joint carrying a weight is what this is for), and
     * the angular force then breaks the joint at that same value.
     */
    breakOnPull?: boolean;
    /**
     * The turn a fixed joint holds between its bodies: b's orientation in a's frame (x, y, z, w),
     * so it holds b = a·rest, whatever frames the bodies have. Default: none, the bodies'
     * rotations held equal (which twists two bodies placed turned apart until they match).
     *
     * 'current' takes the turn the bodies have as the world knows it: their rotations as of the
     * last readback (`await world.read()`), or as set since (when added, `Body.set`). It does not
     * look at the GPU, so **the bodies must not have moved since that readback**: after steps
     * they may have fallen and turned, and the joint would hold the turn they had at the readback.
     * Read first, or add the joint before the bodies move.
     */
    rest?: Quat | 'current';
    /**
     * A fixed joint that bends: past this angular force (measured as `breakForce` is, so below it)
     * the joint gives, carries no more than this, and keeps the bend: a hinge that stays bent once
     * the load is gone, a beam that sags under a weight for good. None: it never yields. A joint
     * that gives is cut back every iteration, so `breakForce` on its torque seldom sees more than
     * this: to have a heavy load tear it too, add `breakBend` or `breakOnPull`.
     */
    yieldForce?: number;
    /**
     * How far a plastic joint may bend before it breaks (rad, 0 to π): the turn from the rest it
     * was made with to the one it holds now, which `Joint.bend` says. It is how a sustained
     * overload tears a joint that yields, which `breakForce` can't (see there): a load that keeps
     * bending it takes it past the limit, and it breaks then (a lighter one bends it less, and it
     * holds). A bend is at most π, so a larger limit could never be reached and `addJoint` throws
     * for it. Needs `yieldForce`: a joint that can't give can't bend. None (or Infinity): it never
     * breaks on its bend.
     */
    breakBend?: number;
}
export interface SpringOptions {
    /** Where the spring is fixed on each body, in its own frame (m). */
    anchorA?: Vec3;
    anchorB?: Vec3;
    /** N/m. */
    stiffness: number;
    /** Its length at rest (m). Default: how far apart the anchors are when it's added. */
    rest?: number;
}
/**
 * Two bodies starting or stopping touching, one of them reporting contacts. A begin says where
 * (the contact points' average), the normal (from b towards a) and how hard: the normal impulse
 * of the step they met in (N·s; a landing's is about its mass times its speed).
 */
export interface ContactEvent {
    type: 'begin' | 'end';
    a: Body;
    b: Body;
    point: Vec3;
    normal: Vec3;
    impulse: number;
    /** The step it happened in (World.stepCount). */
    step: number;
}
export declare class Body {
    readonly world: World;
    /** The body's slot in the GPU buffer (for custom shaders): stable for its life. */
    readonly index: number;
    readonly shape: 'box' | 'sphere' | 'hull';
    /** A hull body's shape (its vertices and faces in the body's own frame). */
    readonly hull: HullShape | null;
    /** Full widths (a sphere's: its diameter on every axis; a hull's: its bounds on its principal axes). */
    readonly size: Vec3;
    readonly density: number;
    readonly friction: number;
    /** @internal */
    state: Required<BodyState>;
    /** @internal The world's write count when this body was last written. */
    written: number;
    /** @internal The first step it's in. */
    addedAt: number;
    private reports;
    private groups;
    private mask;
    private isFixed;
    private isAlive;
    /** @internal Made by World.addBox / addSphere. */
    constructor(world: World, index: number, shape: 'box' | 'sphere' | 'hull', size: Vec3, options: BodyOptions, hullShape?: HullShape | null);
    get fixed(): boolean;
    /** Its collision groups, and the groups it collides with (bitmasks). */
    get group(): number;
    get collidesWith(): number;
    /** Put it in other collision groups (from the next step). */
    setCollisionGroups(group: number, collidesWith?: number): void;
    /** Whether it reports its contacts (World.onContact), from the next step. */
    get reportContacts(): boolean;
    set reportContacts(on: boolean);
    get alive(): boolean;
    /** As of the last readback (World.read), or as last set if set since. */
    get position(): Vec3;
    get rotation(): Quat;
    get velocity(): Vec3;
    get angularVelocity(): Vec3;
    /**
     * Move it, turn it or set it moving (from the next step). What's left out keeps its value
     * as of the last readback. Its contacts start afresh.
     */
    set(state: BodyState): void;
    /**
     * Move a fixed body (a platform, a door, a hand) to a new pose over the next update's steps:
     * it slides there, pushing and carrying what it touches (call it every frame to animate it).
     * A moving body is set there instead (set: its contacts start afresh). For a fixed body that
     * keeps moving (a conveyor, a turntable), set its velocity: set({ velocity, angularVelocity }).
     */
    moveTo(position: Vec3, rotation?: Quat): void;
    /** @internal Where a moved fixed body is going (World.flush turns it into a velocity). */
    target: {
        position: Vec3;
        rotation: Quat;
    } | null;
    /** Pin it where it is (fixed) or let it go. */
    setFixed(fixed: boolean): void;
    /** A push (N·s) at a point in the world (none: through its centre of mass), at the next step. */
    applyImpulse(impulse: Vec3, point?: Vec3): void;
    /** A twist (N·m·s, about world axes through its centre of mass), at the next step. */
    applyAngularImpulse(impulse: Vec3): void;
    /** A force (N) at a point in the world (none: through its centre of mass), every step until clearForces. */
    applyForce(force: Vec3, point?: Vec3): void;
    /** A torque (N·m, about world axes through its centre of mass), every step until clearForces. */
    applyTorque(torque: Vec3): void;
    /** Stop the forces and torques applied to it. */
    clearForces(): void;
    /** Take it out of the world, with its joints. Its slot is reused by later adds. */
    remove(): void;
}
/** What World makes a Joint from: a joint's options (with its rest turn worked out), or a spring's. */
interface JointInit {
    spring?: boolean;
    anchorA?: Vec3;
    anchorB?: Vec3;
    type?: 'fixed' | 'ball';
    breakForce?: number;
    breakOnPull?: boolean;
    restRotation?: Quat;
    yieldForce?: number;
    breakBend?: number;
    stiffness?: number;
    /** A spring's rest length. */
    restLength?: number;
}
export declare class Joint {
    readonly world: World;
    readonly a: Body;
    readonly b: Body;
    readonly type: 'fixed' | 'ball' | 'spring';
    readonly anchorA: Vec3;
    readonly anchorB: Vec3;
    readonly breakForce: number;
    readonly breakOnPull: boolean;
    /** The turn a fixed joint holds when added (JointOptions.rest): b = a·restRotation. null: none. */
    readonly restRotation: Quat | null;
    /** The angular force past which a fixed joint yields (JointOptions.yieldForce). */
    readonly yieldForce: number;
    /** How far (rad) a plastic joint bends before it breaks (JointOptions.breakBend). */
    readonly breakBend: number;
    /** A spring's stiffness (N/m) and rest length (m). */
    readonly stiffness: number;
    readonly rest: number;
    /** @internal The solver's joint slot (-1 until the next step adds it). */
    slot: number;
    /**
     * @internal The order it was placed in the solver in (World.flush): 1 for the first joint. A
     * readback speaks only for the joints placed before it began: a later joint may sit in the slot
     * of one removed since, where the readback holds that joint's record.
     */
    placed: number;
    private state;
    private pull;
    private torque;
    private bent;
    /** @internal Made by World.addJoint and addSpring. */
    constructor(world: World, a: Body, b: Body, options: JointInit);
    /**
     * What the joint carries, as of the last readback that read joints (World.readJoints; World.read
     * does when any joint can break or yield): `linear`, the force (N) holding its anchors together,
     * and `angular`, the angular force of a fixed joint, the number `breakForce` and `yieldForce`
     * limit. Zero before the first such readback, once it breaks, and for ball joints and springs
     * (a ball joint has no angle lock; a spring's force is its stiffness times its stretch).
     */
    get force(): {
        linear: number;
        angular: number;
    };
    /**
     * How far a plastic joint has bent for good (rad): the turn between the rest it holds now and
     * the one it started with, as of the last readback that read joints (the number `breakBend`
     * limits). Zero for a joint that never yielded.
     */
    get bend(): number;
    /** @internal It can break by itself, so a readback looks for it. */
    get breakable(): boolean;
    /** @internal The decoded record of a readback. */
    update(state: JointState): void;
    /** It broke (seen at a readback: World.read). */
    get broken(): boolean;
    /** Still holding. */
    get holding(): boolean;
    /** Let go of the two bodies (they collide with each other again). */
    remove(): void;
    /** @internal Seen broken at a readback. */
    markBroken(): void;
}
/**
 * The device limits the solver makes use of, as high as this machine's GPU goes: pass them to
 * the renderer (new WebGPURenderer({ requiredLimits: await recommendedLimits() })) so hulls
 * collide as hulls and big worlds fit. Empty without WebGPU.
 */
export declare function recommendedLimits(): Promise<Record<string, number>>;
export declare class World {
    /** The solver underneath (three-avbd/advanced): its parameters, buffers and counters. */
    readonly solver: GpuSolver3D;
    readonly device: GPUDevice;
    /** The bodies' buffer as a Three.js attribute (with a renderer): what BodyMesh draws from. */
    readonly bodyAttribute: THREE.StorageInstancedBufferAttribute | null;
    readonly maxBodies: number;
    /** The most fixed steps `update` runs in one call (time owed past them is dropped: no spiral). */
    maxSubsteps: number;
    /** Keep a readback going every this many steps (0: only on request, World.read). */
    readbackEvery: number;
    private readonly slots;
    private readonly free;
    private appends;
    private readonly rewrites;
    private pendingJoints;
    private readonly joints;
    /** Joints placed in the solver so far (Joint.placed). */
    private placements;
    /** The kinds of warning already given (warnOnce). */
    private readonly warned;
    private readonly scratch;
    private readonly breakListeners;
    private readonly contactListeners;
    private contactWatch;
    private readonly rewatches;
    private readonly reporting;
    /** The pass ran last step (so it runs once more when the last reporting body goes, for the ends). */
    private contactsLive;
    private droppedEvents;
    /** Each slot's last removed body (an event may come back after its slot was reused). */
    private readonly gone;
    private readonly contactOptions;
    /** Bodies whose collision groups go to the GPU at the next step (every new body, so a reused slot's are reset). */
    private readonly refilters;
    /** Fixed bodies moved (moveTo) since the last step, and those still sliding there (steps left). */
    private readonly moves;
    private readonly sliding;
    /** Steps the current update is running (moveTo spreads a move over them). */
    private stepsThisUpdate;
    /** Impulses for the next step, and forces for every step (per body, summed). */
    private readonly impulses;
    private readonly forces;
    private readonly pusher;
    private raycaster;
    /** The last readback of each body's record, and the write count it was issued at (-1: never read). */
    private readonly snapshot;
    private readonly readAt;
    /** Which bodies the automatic readback reads (World.track; null: all). */
    private tracked;
    private writes;
    private steps;
    private owed;
    private reading;
    /** The next read reads the joints (readJoints). */
    private jointsWanted;
    private adapting;
    private liveVersion;
    /** Make a world: `World.create` (async, it may need the renderer's device). */
    private constructor();
    static create(options: WorldOptions): Promise<World>;
    /** m/s² (the solver keeps it as up and a size: GpuParams3D.up, gravity). */
    get gravity(): Vec3;
    set gravity(g: Vec3);
    get dt(): number;
    set dt(dt: number);
    get iterations(): number;
    set iterations(n: number);
    /** Add a box; null when the world is full (maxBodies). */
    addBox(options: BoxOptions): Body | null;
    /** Add a sphere; null when the world is full (maxBodies). */
    addSphere(options: SphereOptions): Body | null;
    /**
     * Add a convex hull (of points, or a shape from convexHull); null when the world is full. It
     * collides as a hull where the device allows (World.hullsEnabled), else as its bounding box.
     */
    addHull(options: HullOptions): Body | null;
    /** Whether hulls collide as hulls (the device allows a ninth storage buffer per shader stage). */
    get hullsEnabled(): boolean;
    private add;
    /** The bodies in the world, in slot order. */
    get bodies(): Body[];
    /** Bumped whenever bodies come or go (BodyMesh redraws its list then). */
    get version(): number;
    /** @internal Body.set / setFixed: rewrite it at the next step. */
    write(body: Body): void;
    /** @internal Body.remove: its joints go, and it's parked out of the way. */
    removeBody(body: Body): void;
    /**
     * Join two bodies at their anchors, rigidly or (type 'ball') free to turn, until (optionally) it
     * breaks. A rigid joint holds the bodies' rotations equal unless told another turn to hold
     * (`rest`), and can bend for good under load (`yieldForce`), and break once it has bent too far
     * (`breakBend`).
     */
    addJoint(a: Body, b: Body, options?: JointOptions): Joint;
    /** A spring between two bodies' anchors, pulling (or pushing) them towards its rest length. */
    addSpring(a: Body, b: Body, options: SpringOptions): Joint;
    /** Warn about how joints are set up, once per world however many joints are (a scene adds hundreds). */
    private warnOnce;
    private checkPair;
    /** Called with each joint seen broken (at a readback). Returns a function that unsubscribes. */
    onBreak(listener: (joint: Joint) => void): () => void;
    /**
     * Called with each contact event (bodies starting or stopping touching, one of them with
     * reportContacts), in step order, when a readback lands (World.read or readbackEvery).
     * Returns a function that unsubscribes.
     */
    onContact(listener: (event: ContactEvent) => void): () => void;
    /** Contact events lost since the world began, for want of room between readbacks (maxContactEvents). */
    get droppedContactEvents(): number;
    /** @internal Body.reportContacts. */
    rewatch(body: Body): void;
    /** @internal Joint.remove. */
    removeJoint(joint: Joint): void;
    /** Steps taken so far. */
    get stepCount(): number;
    /** Run the fixed steps `seconds` of time owes (at most maxSubsteps). Returns how many ran. */
    update(seconds: number): number;
    /** One fixed step (dt). */
    step(): void;
    /** @internal A body's pushes: this step's impulses, or its standing forces. */
    pushesOf(body: Body, standing: boolean): Pushes;
    /** @internal Body.moveTo on a fixed body. */
    move(body: Body, position: Vec3, rotation: Quat): void;
    /** @internal Body.setCollisionGroups. */
    refilter(body: Body): void;
    /** @internal Body.clearForces. */
    clearForces(body: Body): void;
    /** This step's impulses and a step's worth of the forces, onto the bodies' velocities. */
    private push;
    /** Send what bodies and joints were added, changed or removed since the last step. */
    private flush;
    /**
     * Fixed bodies moved with moveTo: a velocity that takes each from where it is to its target
     * over this update's steps (the solver moves a fixed body by its velocity, so what it touches
     * sees it slide); stopped again once there.
     */
    private slide;
    /** A body as the solver takes it (built in a scratch reference solver, then let go). */
    private rigid;
    /**
     * The first body along a ray, where the GPU has the bodies now (after the steps taken so far):
     * null if it hits nothing. Async, like a readback: it resolves a frame or two later.
     */
    raycast(origin: Vec3, direction: Vec3, options?: RaycastOptions): Promise<RayHit | null>;
    /** Many rays at once (one GPU pass for all: up to 65,535). */
    raycasts(rays: Ray[], options?: {
        ignore?: Body[];
        collidesWith?: number;
    }): Promise<(RayHit | null)[]>;
    /**
     * Read the bodies' poses and velocities back from the GPU (and see which joints broke): after
     * it resolves, Body.position and the rest are as of now. `bodies`: only these (a body's record
     * is 160 bytes; all of them, at 100k bodies, 16 MB), the rest keeping their last readback. One
     * read at a time: a call while one is running waits for it. The joints are read too, when any
     * can break or yield: then Joint.force and Joint.bend are fresh (else, readJoints).
     */
    read(bodies?: Body[]): Promise<void>;
    /**
     * Read the joints back from the GPU, so Joint.force and Joint.bend are as of now (and any that
     * broke are seen, as in `read`): the bodies aren't read. `read` does this itself when any joint
     * can break or yield; this is for watching how hard the others work.
     */
    readJoints(): Promise<void>;
    /** Which bodies the automatic readback (readbackEvery) reads: these only, or (null) all. */
    track(bodies: Body[] | null): void;
    /** Bodies' records into the snapshot: all of them, or runs of these copied out one by one. */
    private readBodies;
    /** @internal A body's state: from the last readback, unless it was written since. */
    stateOf(body: Body, offset: number, n: number): number[];
    /** Free the GPU buffers (the world can't be used after). */
    destroy(): void;
}
export {};
//# sourceMappingURL=world.d.ts.map