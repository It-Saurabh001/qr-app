import { useEffect } from "react";

import { verifyWithCloudflareWorker } from "@/services/api/workerAuthService";
import { observeAuth } from "@/services/firebase/authService";
import { useAppDispatch } from "@/store/hooks";
import { authChanged } from "@/store/slices/authSlice";

export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = observeAuth(async (user) => {
      dispatch(
        authChanged(
          user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL ?? null,
              }
            : null,
        ),
      );

      if (user?.getIdToken) {
        try {
          const idToken = await user.getIdToken();
          if (idToken) {
            await verifyWithCloudflareWorker(idToken);
          }
        } catch (workerErr) {
          console.warn("[AuthListener] Worker sync warning on auth state change:", workerErr);
        }
      }
    });

    return unsubscribe;
  }, [dispatch]);
}
