import { StyleSheet } from 'react-native';
import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    width: 56,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLORS.BRAND_MID,
    flexDirection: 'row',
  },
});