import { $mobx, IDerivation, IDerivationState_, IObservable, Lambda, TraceMode, GenericAbortSignal } from "../internal";
/**
 * Reactions are a special kind of derivations. Several things distinguishes them from normal reactive computations
 *
 * 1) They will always run, whether they are used by other computations or not.
 * This means that they are very suitable for triggering side effects like logging, updating the DOM and making network requests.
 * 2) They are not observable themselves
 * 3) They will always run after any 'normal' derivations
 * 4) They are allowed to change the state and thereby triggering themselves again, as long as they make sure the state propagates to a stable state in a reasonable amount of iterations.
 *
 * The state machine of a Reaction is as follows:
 *
 * 1) after creating, the reaction should be started by calling `runReaction` or by scheduling it (see also `autorun`)
 * 2) the `onInvalidate` handler should somehow result in a call to `this.track(someFunction)`
 * 3) all observables accessed in `someFunction` will be observed by this reaction.
 * 4) as soon as some of the dependencies has changed the Reaction will be rescheduled for another run (after the current mutation or transaction). `isScheduled` will yield true once a dependency is stale and during this period
 * 5) `onInvalidate` will be called, and we are back at step 1.
 *
 */
export interface IReactionPublic {
    dispose(): void;
    trace(enterBreakPoint?: boolean): void;
}
export interface IReactionDisposer {
    (): void;
    [$mobx]: Reaction;
}
export declare class Reaction implements IDerivation, IReactionPublic {
    name_: string;
    private onInvalidate_;
    private errorHandler_?;
    requiresObservable_?: any;
    observing_: IObservable[];
    newObserving_: IObservable[];
    dependenciesState_: IDerivationState_;
    runId_: number;
    unboundDepsCount_: number;
    private static readonly isDisposedMask_;
    private static readonly isScheduledMask_;
    private static readonly isTrackPendingMask_;
    private static readonly isRunningMask_;
    private static readonly diffValueMask_;
    private flags_;
    isTracing_: TraceMode;
    constructor(name_: string | undefined, onInvalidate_: () => void, errorHandler_?: ((error: any, derivation: IDerivation) => void) | undefined, requiresObservable_?: any);
    get isDisposed(): boolean;
    set isDisposed(newValue: boolean);
    get isScheduled(): boolean;
    set isScheduled(newValue: boolean);
    get isTrackPending(): boolean;
    set isTrackPending(newValue: boolean);
    get isRunning(): boolean;
    set isRunning(newValue: boolean);
    get diffValue(): 0 | 1;
    set diffValue(newValue: 0 | 1);
    onBecomeStale_(): void;
    schedule_(): void;
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    runReaction_(): void;
    track(fn: () => void): void;
    reportExceptionInDerivation_(error: any): void;
    dispose(): void;
    getDisposer_(abortSignal?: GenericAbortSignal): IReactionDisposer;
    toString(): string;
    trace(enterBreakPoint?: boolean): void;
}
export declare function onReactionError(handler: (error: any, derivation: IDerivation) => void): Lambda;
/**
 * A scheduler function that receives a ScheduledReaction when it becomes stale.
 * The scheduler is responsible for deciding when to call `reaction.runReaction_()`.
 */
export type ReactionScheduler = (reaction: ScheduledReaction) => void;
/**
 * A ScheduledReaction is a Reaction that uses a custom scheduler instead of
 * the global `pendingReactions` queue. When this reaction becomes stale,
 * instead of being added to `globalState.pendingReactions`, it is passed
 * to the provided scheduler function.
 *
 * This allows for custom batching strategies, such as deferring reactions
 * to the next task (setTimeout(0)) or animation frame (requestAnimationFrame).
 *
 * @example
 * ```ts
 * const pending: ScheduledReaction[] = []
 * let scheduled = false
 *
 * function nextTaskScheduler(reaction: ScheduledReaction) {
 *     pending.push(reaction)
 *     if (!scheduled) {
 *         scheduled = true
 *         setTimeout(() => {
 *             scheduled = false
 *             const toRun = pending.splice(0)
 *             toRun.forEach(r => r.runReaction_())
 *         }, 0)
 *     }
 * }
 *
 * const reaction = new ScheduledReaction(
 *     "myReaction",
 *     function() { this.track(() => console.log(state.value)) },
 *     nextTaskScheduler
 * )
 * reaction.schedule_()
 * ```
 *
 * ## Note
 *
 * - Be careful when updating mobx. `runReaction_()` is not a public API and is not guaranteed to be stable.
 * - Be careful about the guarantees that are lost using a custom scheduler (see `runReactionsHelper`) below for
 *   some ideas about how to restore them.
 * - Deferred reactions still cause cascading changes to dependency graph and reactions. That is,
 *   if a deferred reaction modifies state, it will trigger other reactions that are observing that state.
 */
export declare class ScheduledReaction extends Reaction {
    private scheduler_;
    constructor(name: string, onInvalidate: () => void, scheduler_: ReactionScheduler, errorHandler?: (error: any, derivation: IDerivation) => void, requiresObservable?: boolean);
    /**
     * Override schedule_ to use custom scheduler instead of global pendingReactions queue.
     * When the reaction becomes stale, the scheduler is called with this reaction.
     * The scheduler is responsible for calling `runReaction_()` at the appropriate time.
     */
    schedule_(): void;
}
export declare function runReactions(): void;
export declare const isReaction: (x: any) => x is Reaction;
export declare const isScheduledReaction: (x: any) => x is ScheduledReaction;
export declare function setReactionScheduler(fn: (f: () => void) => void): void;
export declare function setReactionStaleHook(fn: (r: Reaction) => void): void;
