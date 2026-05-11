import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography = {
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDark,
  } satisfies TextStyle,
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  } satisfies TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.primaryDark,
  } satisfies TextStyle,
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
  } satisfies TextStyle,
  bigNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  } satisfies TextStyle,
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  } satisfies TextStyle,
} as const;
