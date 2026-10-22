import { useEffect } from "react";

import { observeAuth } from "@/services/firebase/authService";
import { useAppDispatch } from "@/store/hooks";
import { authChanged } from "@/store/slices/authSlice";

export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = observeAuth((user) => {
      dispatch(
        authChanged(
          user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                isAnonymous: user.isAnonymous,
              }
            : null,
        ),
      );
    });

    return unsubscribe;
  }, [dispatch]);
}
