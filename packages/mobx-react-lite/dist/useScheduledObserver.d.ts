import { ReactionScheduler } from "mobx";
/**
 * A React hook that creates a scheduled observer using ScheduledReaction.
 * Unlike `useObserver`, this defers reaction execution to the provided scheduler,
 * allowing expensive computed recalculations to happen outside the critical rendering path.
 *
 * @param render - The render function that accesses MobX observables
 * @param scheduler - A ReactionScheduler that controls when the reaction runs
 * @param baseComponentName - Optional component name for debugging
 *
 * @example
 * ```tsx
 * // Create a scheduler that defers to next frame
 * const rafScheduler = createRAFScheduler()
 *
 * function MyComponent() {
 *   return useScheduledObserver(() => (
 *     <div>{store.expensiveComputedValue}</div>
 *   ), rafScheduler)
 * }
 * ```
 */
export declare function useScheduledObserver<T>(render: () => T, scheduler: ReactionScheduler, baseComponentName?: string): T;
