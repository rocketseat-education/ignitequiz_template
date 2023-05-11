import { useNavigation, useRoute } from "@react-navigation/native"
// import { Audio } from "expo-av"
// import * as Haptics from "expo-haptics"
import { useEffect, useState } from "react"
import { Alert, BackHandler, Text, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated"

import { THEME } from "../../styles/theme"
import { styles } from "./styles"

import { QUIZ } from "../../data/quiz"
import { historyAdd } from "../../storage/quizHistoryStorage"

import { ConfirmButton } from "../../components/ConfirmButton"
import { Loading } from "../../components/Loading"
import { OutlineButton } from "../../components/OutlineButton"
// import { OverlayFeedback } from "../../components/OverlayFeedback"
import { ProgressBar } from "../../components/ProgressBar"
import { Question } from "../../components/Question"
import { QuizHeader } from "../../components/QuizHeader"

interface Params {
  id: string
}

type QuizProps = (typeof QUIZ)[0]

const CARD_INCLINATION = 10
const CARD_SKIP_AREA = -200

export function Quiz() {
  const [points, setPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps)
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null)

  const [statusReply, setStatusReply] = useState(0)

  const shake = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const cardPosition = useSharedValue(0)

  const { navigate } = useNavigation()

  const route = useRoute()
  const { id } = route.params as Params

  // async function playSound(isCorrect: boolean) {
  //   const file = isCorrect
  //     ? require("../../assets/correct.mp3")
  //     : require("../../assets/wrong.mp3")

  //   const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true })

  //   await sound.setPositionAsync(0)
  //   await sound.playAsync()
  // }

  function handleSkipConfirm() {
    Alert.alert("Pular", "Deseja realmente pular a questão?", [
      { text: "Sim", onPress: () => handleNextQuestion() },
      { text: "Não", onPress: () => {} },
    ])
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length,
    })

    navigate("finish", {
      points: String(points),
      total: String(quiz.questions.length),
    })
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished()
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm()
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      // await playSound(true)

      setStatusReply(1)
      setPoints(prevState => prevState + 1)
      handleNextQuestion()
    } else {
      // playSound(false)
      setStatusReply(2)
      shakeAnimation()
    }

    setAlternativeSelected(null)
  }

  function handleStop() {
    Alert.alert("Parar", "Deseja parar agora?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => navigate("home"),
      },
    ])

    return true
  }

  async function shakeAnimation() {
    // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

    shake.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0, undefined, finished => {
        "worklet"
        if (finished) {
          runOnJS(handleNextQuestion)()
        }
      })
    )
  }

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shake.value,
            [0, 0.5, 1, 1.5, 2, 2.5, 0],
            [0, -15, 0, 15, 0, -15, 0]
          ),
        },
      ],
    }
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y
    },
  })

  const fixedProgressBarStyles = useAnimatedStyle(() => {
    return {
      position: "absolute",
      paddingTop: 50,
      zIndex: 1,
      backgroundColor: THEME.COLORS.GREY_500,
      width: "110%",
      left: "-5%",
      opacity: interpolate(scrollY.value, [50, 90], [0, 10], Extrapolate.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollY.value, [50, 100], [-40, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  const headerStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [60, 90], [1, 0], Extrapolate.CLAMP),
    }
  })

  const onPan = Gesture.Pan()
    .activateAfterLongPress(200)
    .onUpdate(event => {
      const moveToLeft = event.translationX < 0

      if (moveToLeft) {
        cardPosition.value = event.translationX
      }
    })
    .onEnd(event => {
      if (event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)()
      }

      cardPosition.value = withTiming(0)
    })

  const dragStyles = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION
    return {
      transform: [{ translateX: cardPosition.value }, { rotateZ: `${rotateZ}deg` }],
    }
  })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0]
    setQuiz(quizSelected)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleStop)

    return () => backHandler.remove()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      {/* <OverlayFeedback status={statusReply} /> */}

      <Animated.View style={fixedProgressBarStyles}>
        <Text style={styles.title}>{quiz.title}</Text>
        <ProgressBar total={quiz.questions.length} current={currentQuestion + 1} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector gesture={onPan}>
          <Animated.View style={[shakeStyleAnimated, dragStyles]}>
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
              onUnmount={() => setStatusReply(0)}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title='Parar' onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View>
  )
}