import { useAppTheme } from "@/contexts/theme-context";

export function useTheme() {
  const { palette } = useAppTheme();
  return {
    text: palette.text,
    background: palette.background,
    backgroundElement: palette.grayLight,
    backgroundSelected: palette.yellowLight,
    textSecondary: palette.mutedText,
  };
}
