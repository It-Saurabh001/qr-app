import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type LocalGuestState = {
  active: boolean;
  initialized: boolean;
};

const initialState: LocalGuestState = {
  active: false,
  initialized: false,
};

const localGuestSlice = createSlice({
  name: "localGuest",
  initialState,
  reducers: {
    guestSessionRestored(state, action: PayloadAction<boolean>) {
      state.active = action.payload;
      state.initialized = true;
    },
    guestSessionStarted(state) {
      state.active = true;
      state.initialized = true;
    },
    guestSessionEnded(state) {
      state.active = false;
      state.initialized = true;
    },
  },
});

export const { guestSessionRestored, guestSessionStarted, guestSessionEnded } =
  localGuestSlice.actions;

export default localGuestSlice.reducer;
