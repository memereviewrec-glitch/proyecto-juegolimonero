// Las tareas diferidas pertenecen a un intento: al reiniciarlo, ninguna puede
// aplicar una recompensa, transición o animación en el intento siguiente.
export function createAttemptTaskScope<TimerId>(
  setTimer: (callback: () => void, delay: number) => TimerId,
  clearTimer: (id: TimerId) => void,
) {
  let generation = 0;
  const timers = new Set<TimerId>();

  function guard(callback: () => void) {
    const scheduledGeneration = generation;
    return () => {
      if (scheduledGeneration === generation) callback();
    };
  }

  function schedule(callback: () => void, delay: number): TimerId {
    let id: TimerId;
    const run = guard(() => {
      timers.delete(id);
      callback();
    });
    id = setTimer(run, delay);
    timers.add(id);
    return id;
  }

  function reset() {
    generation += 1;
    for (const id of timers) clearTimer(id);
    timers.clear();
  }

  return { schedule, guard, reset };
}
