import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
};

type UIState = {
  isOnline: boolean;
  toasts: ToastMessage[];
};

const initialState: UIState = {
  isOnline: true,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIsOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    showToast(state, action: PayloadAction<ToastMessage>) {
      state.toasts.push(action.payload);
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload,
      );
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { setIsOnline, showToast, dismissToast, clearToasts } =
  uiSlice.actions;

export default uiSlice.reducer;
