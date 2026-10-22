import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppSelector } from "@/store/hooks";

export function useThemeSync() {
  const theme = useAppSelector((state) => state.settings.theme);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);
}
