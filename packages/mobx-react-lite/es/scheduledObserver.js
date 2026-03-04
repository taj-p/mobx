var _a, _b;
import { forwardRef, memo } from "react";
import { isUsingStaticRendering } from "./staticRendering";
import { useScheduledObserver } from "./useScheduledObserver";
var hasSymbol = typeof Symbol === "function" && Symbol.for;
var isFunctionNameConfigurable = (_b = (_a = Object.getOwnPropertyDescriptor(function () { }, "name")) === null || _a === void 0 ? void 0 : _a.configurable) !== null && _b !== void 0 ? _b : false;
// Using react-is had some issues (and operates on elements, not on types), see #608 / #609
var ReactForwardRefSymbol = hasSymbol
    ? Symbol.for("react.forward_ref")
    : typeof forwardRef === "function" && forwardRef(function (props) { return null; })["$$typeof"];
var ReactMemoSymbol = hasSymbol
    ? Symbol.for("react.memo")
    : typeof memo === "function" && memo(function (props) { return null; })["$$typeof"];
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
export function scheduledObserver(scheduler) {
    function observerWithScheduler(baseComponent) {
        if (ReactMemoSymbol && baseComponent["$$typeof"] === ReactMemoSymbol) {
            throw new Error("[mobx-react-lite] You are trying to use `scheduledObserver` on a function component wrapped in either another `observer` or `React.memo`. The observer already applies 'React.memo' for you.");
        }
        if (isUsingStaticRendering()) {
            return baseComponent;
        }
        var useForwardRef = false;
        var render = baseComponent;
        var baseComponentName = baseComponent.displayName || baseComponent.name;
        // If already wrapped with forwardRef, unwrap,
        // so we can patch render and apply memo
        if (ReactForwardRefSymbol && baseComponent["$$typeof"] === ReactForwardRefSymbol) {
            useForwardRef = true;
            render = baseComponent["render"];
            if (typeof render !== "function") {
                throw new Error("[mobx-react-lite] `render` property of ForwardRef was not a function");
            }
        }
        var observerComponent = function (props, ref) {
            return useScheduledObserver(function () { return render(props, ref); }, scheduler, baseComponentName);
        };
        observerComponent.displayName = baseComponent.displayName;
        if (isFunctionNameConfigurable) {
            Object.defineProperty(observerComponent, "name", {
                value: baseComponent.name,
                writable: true,
                configurable: true
            });
        }
        // Support legacy context: `contextTypes` must be applied before `memo`
        if (baseComponent.contextTypes) {
            ;
            observerComponent.contextTypes = baseComponent.contextTypes;
        }
        if (useForwardRef) {
            // `forwardRef` must be applied prior `memo`
            observerComponent = forwardRef(observerComponent);
        }
        // memo; we are not interested in deep updates
        // in props; we assume that if deep objects are changed,
        // this is in observables, which would have been tracked anyway
        observerComponent = memo(observerComponent);
        copyStaticProperties(baseComponent, observerComponent);
        return observerComponent;
    }
    return observerWithScheduler;
}
// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
var hoistBlackList = {
    $$typeof: true,
    render: true,
    compare: true,
    type: true,
    // Don't redefine `displayName`,
    // it's defined as getter-setter pair on `memo` (see #3192).
    displayName: true
};
function copyStaticProperties(base, target) {
    Object.keys(base).forEach(function (key) {
        if (!hoistBlackList[key]) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key));
        }
    });
}
//# sourceMappingURL=scheduledObserver.js.map