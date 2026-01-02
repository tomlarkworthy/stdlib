import {that} from "../that.js";

export function observe(initialize) {
  let stale = false;
  let value;
  let resolve;
  let reject;
  const dispose = initialize(change);

  if (dispose != null && typeof dispose !== "function") {
    throw new Error(typeof dispose.then === "function"
        ? "async initializers are not supported"
        : "initializer returned something, but not a dispose function");
  }

  function change(x) {
    if (resolve) resolve(x), resolve = reject = null;
    else stale = true;
    return value = x;
  }

  function next() {
    return {done: false, value: stale
        ? (stale = false, Promise.resolve(value))
        : new Promise((res, rej) => (resolve = res, reject = rej))};
  }

  return {
    [Symbol.iterator]: that,
    throw: () => ({done: true}),
    return: () => {
      dispose != null && dispose();
      // Reject pending promises
      if (reject) reject(new Error("Generator returned")), resolve = reject = null;
      return {done: true};
    },
    next
  };
}
