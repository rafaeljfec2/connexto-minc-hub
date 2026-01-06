import React, { useEffect, useRef } from 'react'
import { Animated, ViewStyle, StyleProp } from 'react-native'

interface FadeInViewProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  duration?: number
  delay?: number
}

export function FadeInView({ children, style, duration = 500, delay = 0 }: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, translateY, duration, delay])

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
