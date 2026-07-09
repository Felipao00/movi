export const themes = {
  light: {
    name: 'Claro',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#666666',
    textMuted: '#999999',
    accent: '#111111',
    border: '#E5E5E5',
  },
  dark: {
    name: 'Escuro',
    background: '#080808',
    surface: '#0D0D0D',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    accent: '#FFFFFF',
    border: '#1F1F1F',
  },
};

export type ThemeName = keyof typeof themes;