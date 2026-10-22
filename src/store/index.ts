import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/store/slices/uiSlice";
import { listenerMiddleware } from "@/store/listenerMiddleware";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

import authReducer from "@/store/slices/authSlice";
import historyReducer from "@/store/slices/historySlice";
import settingsReducer from "@/store/slices/settingsSlice";
import localGuestReducer from "@/store/slices/localGuestSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  localGuest: localGuestReducer,
  history: historyReducer,
  settings: settingsReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: "qr-studio",
  version: 1,
  storage: AsyncStorage,
  whitelist: ["settings", "history"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
