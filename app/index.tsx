import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../src/store/cafeFlow';

const PEACH = '#F2D5B8';
const INK = '#2A1B13';
const GOLD = '#B78321';
const SWIPE_THRESHOLD = 48;
const INDICATOR_STEP = 54;
const { width } = Dimensions.get('window');

type LoginRole = 'teaMaker' | 'servant' | 'chef';

const loginScreens = {
  teaMaker: {
    source: require('../assets/illustrations/teamakerlogin.png'),
    accessibilityLabel: 'Login as Tea Maker',
  },
  servant: {
    source: require('../assets/illustrations/servantlogin.png'),
    accessibilityLabel: 'Login as Servant',
  },
  chef: {
    source: require('../assets/illustrations/cheflogin.png'),
    accessibilityLabel: 'Login as Chef',
  },
};

const roleOrder: LoginRole[] = ['teaMaker', 'servant', 'chef'];
const animatedImage = Animated.createAnimatedComponent(ImageBackground);
const AnimatedImageBackground = animatedImage;

export default function LoginScreen() {
  const router = useRouter();
  const { setRole } = useCafeFlowStore();
  const [loginRole, setLoginRole] = useState<LoginRole>('teaMaker');
  const [previousLoginRole, setPreviousLoginRole] = useState<LoginRole | null>(null);
  const transition = useRef(new Animated.Value(1)).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const iconPop = useRef(new Animated.Value(1)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const direction = useRef(1);

  const resetSwipe = () => {
    Animated.spring(dragX, {
      toValue: 0,
      damping: 13,
      stiffness: 130,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const switchLoginRole = (nextRole: LoginRole) => {
    if (nextRole === loginRole) return;

    const nextIndex = roleOrder.indexOf(nextRole);
    const currentIndex = roleOrder.indexOf(loginRole);
    direction.current = nextIndex > currentIndex ? -1 : 1;

    setPreviousLoginRole(loginRole);
    setLoginRole(nextRole);
    transition.setValue(0);
    iconPop.setValue(0.72);
    dragX.setValue(0);

    Animated.parallel([
      Animated.spring(transition, {
        toValue: 1,
        damping: 16,
        stiffness: 120,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorPosition, {
        toValue: nextIndex,
        damping: 14,
        stiffness: 145,
        mass: 0.75,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(iconPop, {
          toValue: 1.18,
          damping: 8,
          stiffness: 210,
          mass: 0.55,
          useNativeDriver: true,
        }),
        Animated.spring(iconPop, {
          toValue: 1,
          damping: 9,
          stiffness: 170,
          mass: 0.55,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setPreviousLoginRole(null));
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onMoveShouldSetPanResponderCapture: (_, gestureState) =>
      Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onShouldBlockNativeResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const clampedDx = Math.max(Math.min(gestureState.dx, width * 0.32), -width * 0.32);
      dragX.setValue(clampedDx);
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentIndex = roleOrder.indexOf(loginRole);

      if (gestureState.dx > SWIPE_THRESHOLD) {
        const nextIndex = Math.max(currentIndex - 1, 0);
        if (nextIndex === currentIndex) resetSwipe();
        else switchLoginRole(roleOrder[nextIndex]);
        return;
      }

      if (gestureState.dx < -SWIPE_THRESHOLD) {
        const nextIndex = Math.min(currentIndex + 1, roleOrder.length - 1);
        if (nextIndex === currentIndex) resetSwipe();
        else switchLoginRole(roleOrder[nextIndex]);
        return;
      }

      resetSwipe();
    },
    onPanResponderTerminate: () => {
      resetSwipe();
    },
  });

  const loginAsRole = (role: LoginRole) => {
    if (role === 'servant') {
      setRole('servant');
      router.push('/servant');
      return;
    }

    if (role === 'chef') {
      setRole('chef_b');
      router.push('/chef/chef_b');
      return;
    }

    setRole('chef_a');
    router.push('/chef/chef_a');
  };

  const handleLogin = () => {
    loginAsRole(loginRole);
  };

  const currentScreen = loginScreens[loginRole];
  const previousScreen = previousLoginRole ? loginScreens[previousLoginRole] : null;
  const incomingTranslateX = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [direction.current * width * 0.18, 0],
  });
  const incomingScale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });
  const incomingOpacity = transition.interpolate({
    inputRange: [0, 0.42, 1],
    outputRange: [0.22, 0.72, 1],
  });
  const incomingRotate = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [`${direction.current * 2.8}deg`, '0deg'],
  });
  const outgoingTranslateX = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -direction.current * width * 0.26],
  });
  const outgoingOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.08],
  });
  const outgoingScale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const outgoingRotate = transition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${-direction.current * 4}deg`],
  });
  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, INDICATOR_STEP, INDICATOR_STEP * 2],
  });
  const swipeTranslateX = dragX.interpolate({
    inputRange: [-width * 0.32, width * 0.32],
    outputRange: [-width * 0.075, width * 0.075],
    extrapolate: 'clamp',
  });
  const swipeScale = dragX.interpolate({
    inputRange: [-width * 0.32, 0, width * 0.32],
    outputRange: [0.985, 1, 0.985],
    extrapolate: 'clamp',
  });
  const swipeRotate = dragX.interpolate({
    inputRange: [-width * 0.32, width * 0.32],
    outputRange: ['-2.4deg', '2.4deg'],
    extrapolate: 'clamp',
  });
  const leftGlowOpacity = dragX.interpolate({
    inputRange: [0, width * 0.32],
    outputRange: [0, 0.42],
    extrapolate: 'clamp',
  });
  const rightGlowOpacity = dragX.interpolate({
    inputRange: [-width * 0.32, 0],
    outputRange: [0.42, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {previousScreen ? (
        <AnimatedImageBackground
          source={previousScreen.source}
          style={[
            styles.backgroundImage,
            styles.layeredImage,
            {
              opacity: outgoingOpacity,
              transform: [
                { translateX: outgoingTranslateX },
                { scale: outgoingScale },
                { rotate: outgoingRotate },
              ],
            },
          ]}
          resizeMode="cover"
        />
      ) : null}

      <AnimatedImageBackground
        source={currentScreen.source}
        style={[
          styles.backgroundImage,
          styles.layeredImage,
          {
            opacity: previousScreen ? incomingOpacity : 1,
            transform: [
              { translateX: previousScreen ? incomingTranslateX : swipeTranslateX },
              { scale: previousScreen ? incomingScale : swipeScale },
              { rotate: previousScreen ? incomingRotate : swipeRotate },
            ],
          },
        ]}
        resizeMode="cover"
      />

      <Animated.View pointerEvents="none" style={[styles.leftSwipeGlow, { opacity: leftGlowOpacity }]} />
      <Animated.View pointerEvents="none" style={[styles.rightSwipeGlow, { opacity: rightGlowOpacity }]} />

      <View style={styles.roleIndicator}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeRoleHighlight,
            { transform: [{ translateX: indicatorTranslateX }, { scale: iconPop }] },
          ]}
        />
        {roleOrder.map((role) => (
          <TouchableOpacity
            key={role}
            accessibilityRole="button"
            accessibilityLabel={`Show ${loginScreens[role].accessibilityLabel}`}
            activeOpacity={0.78}
            onPress={() => switchLoginRole(role)}
            style={styles.roleMarker}
          >
            {role === 'teaMaker' ? <TeaCupIcon /> : role === 'servant' ? <TrayIcon /> : <ChefCapIcon />}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={currentScreen.accessibilityLabel}
        activeOpacity={0.88}
        onPress={handleLogin}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

function TeaCupIcon() {
  return (
    <View style={styles.iconWrap}>
      <View style={styles.cupSteam} />
      <View style={styles.cupBody} />
      <View style={styles.cupHandle} />
      <View style={styles.cupSaucer} />
    </View>
  );
}

function TrayIcon() {
  return (
    <View style={styles.iconWrap}>
      <View style={styles.trayCupLeft} />
      <View style={styles.trayCupRight} />
      <View style={styles.trayTop} />
      <View style={styles.trayBase} />
    </View>
  );
}

function ChefCapIcon() {
  return (
    <View style={styles.iconWrap}>
      <View style={styles.capTop} />
      <View style={styles.capCrown} />
      <View style={styles.capBand} />
      <View style={styles.capVisor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: PEACH,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  layeredImage: {
    backgroundColor: PEACH,
  },
  leftSwipeGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 86,
    backgroundColor: 'rgba(255, 226, 173, 0.7)',
    borderTopRightRadius: 120,
    borderBottomRightRadius: 120,
  },
  rightSwipeGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 86,
    backgroundColor: 'rgba(255, 226, 173, 0.7)',
    borderTopLeftRadius: 120,
    borderBottomLeftRadius: 120,
  },
  roleIndicator: {
    position: 'absolute',
    left: '50%',
    top: '5.25%',
    width: 172,
    height: 42,
    marginLeft: -86,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 12, 7, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 244, 229, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  activeRoleHighlight: {
    position: 'absolute',
    left: 13,
    top: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5D8B7',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: INK,
    shadowOpacity: 0.26,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  roleMarker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loginButton: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    bottom: '5.4%',
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 20, 13, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255, 244, 229, 0.82)',
  },
  loginButtonText: {
    color: '#FFF2E1',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  iconWrap: {
    width: 24,
    height: 24,
  },
  cupSteam: {
    position: 'absolute',
    top: 2,
    left: 10,
    width: 5,
    height: 8,
    borderLeftWidth: 1.6,
    borderColor: GOLD,
    borderRadius: 5,
    transform: [{ rotate: '18deg' }],
  },
  cupBody: {
    position: 'absolute',
    left: 5,
    bottom: 7,
    width: 13,
    height: 9,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: INK,
  },
  cupHandle: {
    position: 'absolute',
    right: 2,
    bottom: 9,
    width: 7,
    height: 7,
    borderWidth: 1.8,
    borderColor: INK,
    borderRadius: 7,
  },
  cupSaucer: {
    position: 'absolute',
    left: 3,
    bottom: 5,
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  trayCupLeft: {
    position: 'absolute',
    left: 6,
    bottom: 11,
    width: 5,
    height: 7,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  trayCupRight: {
    position: 'absolute',
    right: 6,
    bottom: 11,
    width: 5,
    height: 7,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  trayTop: {
    position: 'absolute',
    left: 4,
    bottom: 9,
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: INK,
  },
  trayBase: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    width: 20,
    height: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: INK,
  },
  capTop: {
    position: 'absolute',
    left: 7,
    top: 4,
    width: 10,
    height: 7,
    borderRadius: 6,
    backgroundColor: GOLD,
  },
  capCrown: {
    position: 'absolute',
    left: 4,
    top: 8,
    width: 16,
    height: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: INK,
  },
  capBand: {
    position: 'absolute',
    left: 5,
    top: 14,
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK,
  },
  capVisor: {
    position: 'absolute',
    left: 8,
    top: 17,
    width: 13,
    height: 4,
    borderBottomRightRadius: 9,
    backgroundColor: GOLD,
  },
});
