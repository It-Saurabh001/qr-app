import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  sendReset,
  signInEmail,
  signInGoogle,
  signOutUser,
  signUpEmail,
} from "@/services/firebase/authService";
import { getAppError, type AppError } from "@/utils/errors";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  opStatus: "idle" | "loading" | "failed";
  error: AppError | null;
};

const initialState: AuthState = {
  status: "initializing",
  user: null,
  opStatus: "idle",
  error: null,
};

export const signIn = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: AppError }
>("auth/signIn", async ({ email, password }, { rejectWithValue }) => {
  try {
    await signInEmail(email, password);
  } catch (error) {
    return rejectWithValue(getAppError(error));
  }
});

export const signUp = createAsyncThunk<
  void,
  { name: string; email: string; password: string },
  { rejectValue: AppError }
>("auth/signUp", async ({ name, email, password }, { rejectWithValue }) => {
  try {
    await signUpEmail(name, email, password);
  } catch (error) {
    return rejectWithValue(getAppError(error));
  }
});

export const signOut = createAsyncThunk<void, void, { rejectValue: AppError }>(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await signOutUser();
    } catch (error) {
      return rejectWithValue(getAppError(error));
    }
  },
);

export const resetPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: AppError }
>("auth/resetPassword", async ({ email }, { rejectWithValue }) => {
  try {
    await sendReset(email);
  } catch (error) {
    return rejectWithValue(getAppError(error));
  }
});

export const signInWithGoogle = createAsyncThunk<
  void,
  void,
  { rejectValue: AppError }
>("auth/signInWithGoogle", async (_, { rejectWithValue }) => {
  try {
    console.log("[Redux Auth] Dispatching signInWithGoogle thunk...");
    await signInGoogle();
    console.log("[Redux Auth] signInWithGoogle fulfilled.");
  } catch (error) {
    console.error("[Redux Auth] signInWithGoogle rejected with:", error);
    return rejectWithValue(getAppError(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authChanged(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.opStatus = "idle";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
      state.opStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    const requests = [
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithGoogle,
    ];

    for (const request of requests) {
      builder
        .addCase(request.pending, (state) => {
          state.opStatus = "loading";
          state.error = null;
        })
        .addCase(request.fulfilled, (state) => {
          state.opStatus = "idle";
          state.error = null;
        })
        .addCase(request.rejected, (state, action) => {
          state.opStatus = "failed";
          state.error = action.payload ?? {
            code: "auth/unknown",
            message: action.error.message ?? "Something went wrong.",
          };
        });
    }
  },
});

export const { authChanged, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
