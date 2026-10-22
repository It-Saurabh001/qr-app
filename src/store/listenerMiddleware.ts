import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";

export const listenerMiddleware = createListenerMiddleware({
  // Listener effects receive the typed Redux state and dispatch.
});

export type AppStartListening = typeof listenerMiddleware.startListening;

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
