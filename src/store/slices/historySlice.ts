import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type QRHistoryItem = {
  id: string;
  content: string;
  format: string;
  type: "scan" | "create";
  title?: string;
  isFavorite: boolean;
  createdAt: string;
  foregroundColor?: string;
  backgroundColor?: string;
  ecl?: "L" | "M" | "Q" | "H";
};

const historyAdapter = createEntityAdapter<QRHistoryItem>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const initialState = historyAdapter.getInitialState({
  status: "idle" as "idle" | "loading" | "failed",
  error: null as { code: string; message: string } | null,
});

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addHistoryItem(state, action: PayloadAction<QRHistoryItem>) {
      historyAdapter.upsertOne(state, action.payload);
    },
    removeHistoryItem(state, action: PayloadAction<string>) {
      historyAdapter.removeOne(state, action.payload);
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const item = state.entities[action.payload];

      if (item) {
        item.isFavorite = !item.isFavorite;
      }
    },
    clearHistory(state) {
      historyAdapter.removeAll(state);
    },
    setHistoryLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setHistoryError(
      state,
      action: PayloadAction<{ code: string; message: string }>,
    ) {
      state.status = "failed";
      state.error = action.payload;
    },
    mergeHistoryItems(state, action: PayloadAction<QRHistoryItem[]>) {
      historyAdapter.upsertMany(state, action.payload);
    },
  },
});

export const {
  addHistoryItem,
  removeHistoryItem,
  toggleFavorite,
  clearHistory,
  setHistoryLoading,
  setHistoryError,
  mergeHistoryItems,
} = historySlice.actions;

export const historySelectors = historyAdapter.getSelectors();

export default historySlice.reducer;
