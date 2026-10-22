import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AppTheme = "system" | "light" | "dark";

export type SettingsState = {
  theme: AppTheme;
  autoSaveScans: boolean;
  vibrateOnScan: boolean;
  soundOnScan: boolean;
};

const initialState: SettingsState = {
  theme: "system",
  autoSaveScans: true,
  vibrateOnScan: true,
  soundOnScan: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<AppTheme>) {
      state.theme = action.payload;
    },
    setAutoSaveScans(state, action: PayloadAction<boolean>) {
      state.autoSaveScans = action.payload;
    },
    setVibrateOnScan(state, action: PayloadAction<boolean>) {
      state.vibrateOnScan = action.payload;
    },
    setSoundOnScan(state, action: PayloadAction<boolean>) {
      state.soundOnScan = action.payload;
    },
    resetSettings() {
      return initialState;
    },
  },
});

export const {
  setTheme,
  setAutoSaveScans,
  setVibrateOnScan,
  setSoundOnScan,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state: { settings: SettingsState }) =>
  state.settings;

export default settingsSlice.reducer;
