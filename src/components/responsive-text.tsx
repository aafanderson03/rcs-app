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

function scaleStyle(
  style: StyleProp<TextStyle>,
  width: number,
  minimumFontSize = 0,
): StyleProp<TextStyle> {
  const flattenedStyle = StyleSheet.flatten(style);
  const fontSize = flattenedStyle?.fontSize;
  if (typeof fontSize !== 'number' || (Platform.OS !== 'web' && width >= 600)) return style;
  const scale = getResponsiveScale(width);
  return [
    style,
    {
      fontSize: Math.max(fontSize * scale, minimumFontSize),
      lineHeight: typeof flattenedStyle.lineHeight === 'number' ? flattenedStyle.lineHeight * scale : undefined,
      letterSpacing: typeof flattenedStyle.letterSpacing === 'number' ? flattenedStyle.letterSpacing * scale : undefined,
    },
  ];
}

function getResponsiveScale(width: number) {
  if (width <= 600) return 1.12;
  if (width < 960) return 1.12 - ((width - 600) / 360) * 0.04315;
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
    const minimumFontSize = Platform.OS === 'web' && width < 600 ? 16 : 0;
    return <NativeTextInput ref={ref} {...props} style={scaleStyle(style, width, minimumFontSize)} />;
  },
);
