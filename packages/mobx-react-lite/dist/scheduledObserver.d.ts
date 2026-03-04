import { ReactionScheduler } from "mobx";
/**
 * Creates a scheduled observer HOC that uses ScheduledReaction to defer
 * reaction execution. This can improve UI responsiveness when observing
 * expensive computed values.
 *
 * @param scheduler - A ReactionScheduler that controls when reactions run
 * @returns An observer HOC that uses the provided scheduler
 *
 * @example
 * ```tsx
 * // Create a scheduler that defers to next animation frame
 * function createRAFScheduler(): ReactionScheduler {
 *   const pending = new Set<ScheduledReaction>()
 *   let scheduled = false
 *
 *   return (reaction) => {
 *     pending.add(reaction)
 *     if (!scheduled) {
 *       scheduled = true
 *       requestAnimationFrame(() => {
 *         scheduled = false
 *         const toRun = Array.from(pending)
 *         pending.clear()
 *         toRun.forEach(r => r.runReaction_())
 *       })
 *     }
 *   }
 * }
 *
 * const deferredObserver = scheduledObserver(createRAFScheduler())
 *
 * const MyComponent = deferredObserver(function MyComponent() {
 *   return <div>{store.expensiveComputedValue}</div>
 * })
 * ```
 */
export declare function scheduledObserver(scheduler: ReactionScheduler): {
    <P extends object>(baseComponent: React.FunctionComponent<P>): React.FunctionComponent<P>;
    <P extends object, TRef = {}>(baseComponent: React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<TRef>>): React.MemoExoticComponent<React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<TRef>>>;
};
