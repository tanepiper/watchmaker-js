/**
 * Create a countdown emitter that emits a promise that resolves when a countdown finishes or
 * is cancelled, and emits to the passed emitter every tick
 *
 * It can be cancelled by calling the cancel method, which causes the promise to end early, containing
 * the result if it was cancelled
 *
 * @param time The time in seconds to count down from
 * @param emitter The function to emit the time left to
 * @param perTick The tick time, default is 1s
 *
 * @returns An object containing a start promise and cancel function
 */
export function createCountdown(time: number, emitter: (left: number) => void, perTick: number): {
  start: Promise<boolean>,
  cancel: () => void;
} {
  perTick = perTick || 1;
  const totalTicks = time / perTick;
  let interval;
  let tickResolver;
  const promise = new Promise<boolean>(resolve => {
    tickResolver = resolve;
    let currentTick = 1;
    interval = setInterval(() => {
      if (currentTick === totalTicks) {
        tickResolver(false);
        return clearInterval(interval);
      }
      emitter(time - (currentTick * perTick));
      currentTick++;
    }, perTick * 1000);
    // First emit
    emitter(time);
  });
  return {
    start: promise,
    cancel: () => {
      clearInterval(interval);
      tickResolver(true);
    }
  };
}

/**
 * Create a count up emitter that emits a promise that resolves when a count up finishes or
 * is cancelled, and emits to the passed emitter every tick
 *
 * It can be cancelled by calling the cancel method, which causes the promise to end early, containing
 * the result if it was cancelled
 *
 * @param time The time in seconds to count up to
 * @param emitter The function to emit the count up time
 * @param perTick The tick time, default is 1s
 *
 * @returns An object containing a start promise and cancel function
 */
export function createCountUp(time: number, emitter: (current: number) => void, perTick: number) {
  perTick = perTick || 1;
  const totalTicks = time / perTick;
  let interval;
  let tickResolver;
  const promise = new Promise<boolean>(resolve => {
    tickResolver = resolve;
    let currentTick = 1;
    interval = setInterval(() => {
      if (currentTick === totalTicks) {
        tickResolver(false);
        return clearInterval(interval);
      }
      emitter(currentTick * perTick);
      currentTick++;
    }, perTick * 1000);
    // First emit
    emitter(0);
  });
  return {
    start: promise,
    cancel: () => {
      clearInterval(interval);
      tickResolver(true);
    }
  };
}
