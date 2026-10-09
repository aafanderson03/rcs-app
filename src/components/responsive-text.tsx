import { forwardRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  useWindowDimensions,
  type TextInputProps,
  type TextProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';

function scaleStyle(style: StyleProp<TextStyle>, width: number): StyleProp<TextStyle> {
  const flattenedStyle = StyleSheet.flatten(style);
  const fontSize = flattenedStyle?.fontSize;
  if (Platform.OS !== 'web' || typeof fontSize !== 'number') return style;
  const scale = getResponsiveScale(width);
  return [
    style,
    {
      fontSize: fontSize * scale,
      lineHeight: typeof flattenedStyle.lineHeight === 'number' ? flattenedStyle.lineHeight * scale : undefined,
      letterSpacing: typeof flattenedStyle.letterSpacing === 'number' ? flattenedStyle.letterSpacing * scale : undefined,
    },
  ];
}

function getResponsiveScale(width: number) {
  if (width <= 320) return 0.95;
  if (width < 390) return 0.95 + ((width - 320) / 70) * 0.05;
  if (width < 1280) return 1 + ((width - 390) / 890) * 0.12;
  return 1.12;
}

export const ResponsiveText = forwardRef<NativeText, TextProps>(function ResponsiveText(
  { style, ...props },
  ref,
) {
  const { width } = useWindowDimensions();
  return <NativeText ref={ref} {...props} style={scaleStyle(style, width)} />;
});

export const ResponsiveTextInput = forwardRef<NativeTextInput, TextInputProps>(
  function ResponsiveTextInput({ style, ...props }, ref) {
    const { width } = useWindowDimensions();
    return <NativeTextInput ref={ref} {...props} style={scaleStyle(style, width)} />;
  },
);
