import { Colors } from "@/constants/theme";
import { useAppTheme } from "@/contexts/theme-context";

export function useTheme() {
  const { colorScheme } = useAppTheme();
  return Colors[colorScheme];
}
