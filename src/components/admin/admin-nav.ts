import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setAdminNavOpen(value: boolean) {
  if (open === value) return;
  open = value;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAdminNavOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
