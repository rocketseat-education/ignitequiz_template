import { Check } from 'phosphor-react-native';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

type Props = TouchableOpacityProps & {
  onPress: () => void;
}

export function ConfirmButton({ ...rest }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      {...rest}
    >
      <Check
        color={THEME.COLORS.WHITE}
        weight="bold"
        size={24}
      />
    </TouchableOpacity>
  );
}