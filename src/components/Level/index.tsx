import { Text, View } from 'react-native';
import { useEffect } from "react"
import { Pressable, PressableProps } from "react-native"
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { THEME } from '../../styles/theme';
import { styles } from './styles';

const TYPE_COLORS = {
  EASY: THEME.COLORS.BRAND_LIGHT,
  HARD: THEME.COLORS.DANGER_LIGHT,
  MEDIUM: THEME.COLORS.WARNING_LIGHT,
}

const PressableAnimated = Animated.createAnimatedComponent(Pressable)

type Props = PressableProps & {
  title: string;
  isChecked?: boolean;
  type?: keyof typeof TYPE_COLORS;
}

export function Level({ title, type = 'EASY', isChecked = false, ...rest }: Props) {

  const scale = useSharedValue(1);
  const checked = useSharedValue(1);

  const COLOR = TYPE_COLORS[type];

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(checked.value, [0, 1], ["transparent", COLOR]),
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(checked.value, [0, 1], [COLOR, THEME.COLORS.GREY_100]),
    }
  })

  function onPressIn() {
    scale.value = withTiming(1.5, { easing: Easing.ease, duration: 600 })
  }

  function onPressOut() {
    scale.value = withTiming(1.0, { easing: Easing.ease, duration: 450 })
  }

  useEffect(() => {
    checked.value = withTiming(isChecked ? 1 : 0, { duration: 600 })
  }, [checked, isChecked])

  return (
    <PressableAnimated 
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={
        [
          styles.container,
          animatedContainerStyle,
          { borderColor: COLOR, 
            backgroundColor: interpolateColor(checked.value, [0, 1], ["transparent", COLOR]),
          }
        ]
      }
      {...rest}
    >
      
        <Animated.Text style={
          [
            styles.title,
            animatedTextStyle
          ]}>
          {title}
        </Animated.Text>

    </PressableAnimated>
  );
}