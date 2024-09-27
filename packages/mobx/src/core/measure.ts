import { globalState } from "./globalstate"

export const globalObjectRegistry = new WeakSet()

globalObjectRegistry.add(globalState)

globalThis["mobxGlobalObjRegistry"] = globalObjectRegistry
