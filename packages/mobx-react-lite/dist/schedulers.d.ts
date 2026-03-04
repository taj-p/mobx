import { ReactionScheduler } from "mobx";
/**
 * Creates a scheduler that defers reactions to the next macrotask using setTimeout(0).
 * This allows the browser to process user interactions and render frames between batches.
 *
 * @example
 * ```tsx
 * const deferredObserver = scheduledObserver(createTimeoutScheduler())
 *
 * const MyComponent = deferredObserver(() => (
 *   <div>{store.expensiveValue}</div>
 * ))
 * ```
 */
export declare function createTimeoutScheduler(): ReactionScheduler;
/**
 * Creates a scheduler that defers reactions to the next animation frame.
 * Ideal for UI updates that should be synchronized with the browser's repaint cycle.
 *
 * @example
 * ```tsx
 * const deferredObserver = scheduledObserver(createRAFScheduler())
 *
 * const MyComponent = deferredObserver(() => (
 *   <div>{store.expensiveValue}</div>
 * ))
 * ```
 */
export declare function createRAFScheduler(): ReactionScheduler;
/**
 * Creates a scheduler that uses requestIdleCallback to run reactions when the browser is idle.
 * Best for low-priority updates that shouldn't interfere with critical user interactions.
 * Falls back to setTimeout if requestIdleCallback is not available.
 *
 * @param timeout - Optional timeout in ms after which the callback will be forced to run
 *
 * @example
 * ```tsx
 * const lowPriorityObserver = scheduledObserver(createIdleScheduler({ timeout: 1000 }))
 *
 * const MyComponent = lowPriorityObserver(() => (
 *   <div>{store.veryExpensiveValue}</div>
 * ))
 * ```
 */
export declare function createIdleScheduler(options?: {
    timeout?: number;
}): ReactionScheduler;
