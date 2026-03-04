var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
export function createTimeoutScheduler() {
    var pending = new Set();
    var scheduled = false;
    return function (reaction) {
        pending.add(reaction);
        if (!scheduled) {
            scheduled = true;
            setTimeout(function () {
                var e_1, _a;
                scheduled = false;
                var toRun = Array.from(pending);
                pending.clear();
                try {
                    for (var toRun_1 = __values(toRun), toRun_1_1 = toRun_1.next(); !toRun_1_1.done; toRun_1_1 = toRun_1.next()) {
                        var r = toRun_1_1.value;
                        r.runReaction_();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (toRun_1_1 && !toRun_1_1.done && (_a = toRun_1.return)) _a.call(toRun_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }, 0);
        }
    };
}
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
export function createRAFScheduler() {
    var pending = new Set();
    var scheduled = false;
    return function (reaction) {
        pending.add(reaction);
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(function () {
                var e_2, _a;
                scheduled = false;
                var toRun = Array.from(pending);
                pending.clear();
                try {
                    for (var toRun_2 = __values(toRun), toRun_2_1 = toRun_2.next(); !toRun_2_1.done; toRun_2_1 = toRun_2.next()) {
                        var r = toRun_2_1.value;
                        r.runReaction_();
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (toRun_2_1 && !toRun_2_1.done && (_a = toRun_2.return)) _a.call(toRun_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            });
        }
    };
}
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
export function createIdleScheduler(options) {
    var pending = new Set();
    var scheduled = false;
    // Use requestIdleCallback if available, fallback to setTimeout
    var hasIdleCallback = typeof requestIdleCallback === "function";
    return function (reaction) {
        pending.add(reaction);
        if (!scheduled) {
            scheduled = true;
            var runPending = function () {
                var e_3, _a;
                scheduled = false;
                var toRun = Array.from(pending);
                pending.clear();
                try {
                    for (var toRun_3 = __values(toRun), toRun_3_1 = toRun_3.next(); !toRun_3_1.done; toRun_3_1 = toRun_3.next()) {
                        var r = toRun_3_1.value;
                        r.runReaction_();
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (toRun_3_1 && !toRun_3_1.done && (_a = toRun_3.return)) _a.call(toRun_3);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            };
            if (hasIdleCallback) {
                ;
                requestIdleCallback(runPending, (options === null || options === void 0 ? void 0 : options.timeout) ? { timeout: options.timeout } : undefined);
            }
            else {
                setTimeout(runPending, 1);
            }
        }
    };
}
//# sourceMappingURL=schedulers.js.map