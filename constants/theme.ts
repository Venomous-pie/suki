import { Platform } from 'react-native';

const tintColorLight = '#0A192F'; // Deep Navy
const tintColorDark = '#D4AF37'; // Gold

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FAFAFA',
    tint: tintColorLight,
    icon: '#4B5563',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    primary: '#0A192F',
    secondary: '#1E4620', // Forest Green
    accent: '#D4AF37', // Gold
    surface: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    primary: '#D4AF37',
    secondary: '#4ADE80',
    accent: '#0A192F',
    surface: '#1E293B',
    border: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
