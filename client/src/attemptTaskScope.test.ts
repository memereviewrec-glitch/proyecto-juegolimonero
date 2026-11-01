import { afterEach, describe, expect, it, vi } from "vitest";
import { createAttemptTaskScope } from "./attemptTaskScope";

function makeScope() {
  return createAttemptTaskScope((callback, delay) => setTimeout(callback, delay), id => clearTimeout(id));
}

afterEach(() => vi.useRealTimers());

describe("tareas diferidas aisladas por intento", () => {
  it("ejecuta una tarea del intento vigente", () => {
    vi.useFakeTimers();
    const scope = makeScope();
    const collect = vi.fn();
    scope.schedule(collect, 1800);
    vi.advanceTimersByTime(1800);
    expect(collect).toHaveBeenCalledOnce();
  });

  it("cancela la recompensa del colibrí al repetir antes de terminar su salida", () => {
    vi.useFakeTimers();
    const scope = makeScope();
    const oldCollect = vi.fn();
    scope.schedule(oldCollect, 1800);
    vi.advanceTimersByTime(100);
    scope.reset();
    vi.advanceTimersByTime(2000);
    expect(oldCollect).not.toHaveBeenCalled();
  });

  it("impide que una flor pendiente del Amanecer aparezca en el nuevo intento", () => {
    vi.useFakeTimers();
    const scope = makeScope();
    const flower = vi.fn();
    const seed = vi.fn();
    scope.schedule(() => {
      flower();
      scope.schedule(seed, 1900);
    }, 2600);
    scope.reset();
    vi.advanceTimersByTime(5000);
    expect(flower).not.toHaveBeenCalled();
    expect(seed).not.toHaveBeenCalled();
  });

  it("cancela también la semilla si la flor ya se abrió antes de repetir", () => {
    vi.useFakeTimers();
    const scope = makeScope();
    const seed = vi.fn();
    scope.schedule(() => scope.schedule(seed, 1900), 2600);
    vi.advanceTimersByTime(2600);
    scope.reset();
    vi.advanceTimersByTime(1900);
    expect(seed).not.toHaveBeenCalled();
  });

  it("los callbacks de View Transitions quedan invalidados aunque no sean timers", () => {
    const scope = makeScope();
    const collect = vi.fn();
    const oldTransition = scope.guard(collect);
    scope.reset();
    oldTransition();
    expect(collect).not.toHaveBeenCalled();
    scope.guard(collect)();
    expect(collect).toHaveBeenCalledOnce();
  });

  it("el nuevo intento puede programar y completar su propia tarea", () => {
    vi.useFakeTimers();
    const scope = makeScope();
    const oldCollect = vi.fn();
    const newCollect = vi.fn();
    scope.schedule(oldCollect, 1800);
    scope.reset();
    scope.schedule(newCollect, 1800);
    vi.advanceTimersByTime(1800);
    expect(oldCollect).not.toHaveBeenCalled();
    expect(newCollect).toHaveBeenCalledOnce();
    scope.reset();
    expect(vi.getTimerCount()).toBe(0);
  });
});
