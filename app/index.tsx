import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../src/store/cafeFlow';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';
const SWIPE_THRESHOLD = 48;

type LoginRole = 'teaMaker' | 'servant' | 'chef';

const roleOrder: LoginRole[] = ['teaMaker', 'servant', 'chef'];
const roleContent = {
  teaMaker: {
    title: 'Tea Maker',
    subtitle: 'fresh cups, calm hands',
    loginLabel: 'Login as Tea Maker',
  },
  servant: {
    title: 'Servant',
    subtitle: 'orders moving cleanly',
    loginLabel: 'Login as Servant',
  },
  chef: {
    title: 'Kitchen',
    subtitle: 'tickets, prep, ready shelf',
    loginLabel: 'Login as Chef',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const { setRole } = useCafeFlowStore();
  const [loginRole, setLoginRole] = useState<LoginRole>('teaMaker');
  const roleMotion = useRef(new Animated.Value(0)).current;

  const switchLoginRole = (nextRole: LoginRole) => {
    if (nextRole === loginRole) return;

    setLoginRole(nextRole);
    roleMotion.setValue(0.82);
    Animated.spring(roleMotion, {
      toValue: 1,
      damping: 11,
      stiffness: 150,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderRelease: (_, gestureState) => {
      const currentIndex = roleOrder.indexOf(loginRole);

      if (gestureState.dx > SWIPE_THRESHOLD) {
        switchLoginRole(roleOrder[Math.max(currentIndex - 1, 0)]);
      }

      if (gestureState.dx < -SWIPE_THRESHOLD) {
        switchLoginRole(roleOrder[Math.min(currentIndex + 1, roleOrder.length - 1)]);
      }
    },
  });

  const loginAsRole = () => {
    if (loginRole === 'servant') {
      setRole('servant');
      router.push('/servant');
      return;
    }

    if (loginRole === 'chef') {
      setRole('chef_b');
      router.push('/chef/chef_b');
      return;
    }

    setRole('chef_a');
    router.push('/chef/chef_a');
  };

  const role = roleContent[loginRole];

  return (
    <View style={styles.screen} {...panResponder.panHandlers}>
      <View style={styles.frame}>
        <View style={styles.heroBlock}>
          <Text style={styles.brand}>The Black Tea</Text>
          <Text style={styles.brandSub}>select your station</Text>
        </View>

        <View style={styles.tabs}>
          {roleOrder.map((item) => {
            const active = item === loginRole;
            return (
              <TouchableOpacity
                key={item}
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={() => switchLoginRole(item)}
                style={[styles.tab, active && styles.activeTab]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>{roleContent[item].title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          <Animated.View style={[styles.roleMark, { transform: [{ scale: roleMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) }] }]}>
            {loginRole === 'teaMaker' ? <TeaCupMark /> : loginRole === 'servant' ? <TrayMark /> : <ChefCapMark />}
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
          </Animated.View>

          <View style={styles.rulesBlock}>
            <View style={styles.rule} />
            <View style={[styles.rule, styles.shortRule]} />
            <View style={styles.rule} />
          </View>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel={role.loginLabel} activeOpacity={0.85} onPress={loginAsRole} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>{role.loginLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function TeaCupMark() {
  return (
    <View style={styles.markWrap}>
      <View style={styles.cupSteam} />
      <View style={styles.cupBody} />
      <View style={styles.cupHandle} />
      <View style={styles.cupSaucer} />
    </View>
  );
}

function TrayMark() {
  return (
    <View style={styles.markWrap}>
      <View style={styles.trayCupLeft} />
      <View style={styles.trayCupRight} />
      <View style={styles.trayTop} />
      <View style={styles.trayBase} />
    </View>
  );
}

function ChefCapMark() {
  return (
    <View style={styles.markWrap}>
      <View style={styles.capTop} />
      <View style={styles.capCrown} />
      <View style={styles.capBand} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAPER,
  },
  frame: {
    flex: 1,
    backgroundColor: PAPER,
    borderWidth: 1.4,
    borderColor: INK,
    overflow: 'hidden',
  },
  heroBlock: {
    height: 136,
    backgroundColor: TEA_BROWN,
    borderBottomWidth: 1.2,
    borderColor: INK,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    color: PAPER,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSub: {
    marginTop: 6,
    color: 'rgba(247, 233, 207, 0.72)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 14,
    marginBottom: -1.2,
    zIndex: 2,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    marginRight: 6,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#F1DFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    minHeight: 52,
    backgroundColor: TEA_BROWN,
  },
  tabText: {
    color: INK,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: PAPER,
  },
  content: {
    flex: 1,
    borderTopWidth: 1.2,
    borderColor: INK,
    padding: 24,
  },
  roleMark: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    marginTop: 20,
    color: INK,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  roleSubtitle: {
    marginTop: 5,
    color: INK,
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.56,
    letterSpacing: 0.6,
  },
  rulesBlock: {
    marginBottom: 24,
  },
  rule: {
    height: 1.2,
    backgroundColor: INK,
    opacity: 0.58,
    marginBottom: 22,
  },
  shortRule: {
    width: '72%',
  },
  loginButton: {
    minHeight: 58,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: PAPER,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  markWrap: {
    width: 112,
    height: 92,
  },
  cupSteam: {
    position: 'absolute',
    top: 0,
    left: 50,
    width: 14,
    height: 28,
    borderLeftWidth: 2,
    borderColor: TEA_BROWN,
    borderRadius: 12,
    transform: [{ rotate: '16deg' }],
    opacity: 0.62,
  },
  cupBody: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 72,
    height: 42,
    borderWidth: 2,
    borderColor: TEA_BROWN,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cupHandle: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: TEA_BROWN,
    borderRadius: 14,
  },
  cupSaucer: {
    position: 'absolute',
    left: 15,
    bottom: 12,
    width: 82,
    height: 2,
    backgroundColor: TEA_BROWN,
  },
  trayCupLeft: {
    position: 'absolute',
    top: 6,
    left: 30,
    width: 18,
    height: 30,
    borderWidth: 2,
    borderColor: TEA_BROWN,
  },
  trayCupRight: {
    position: 'absolute',
    top: 6,
    right: 30,
    width: 18,
    height: 30,
    borderWidth: 2,
    borderColor: TEA_BROWN,
  },
  trayTop: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 34,
    height: 2,
    backgroundColor: TEA_BROWN,
  },
  trayBase: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 16,
    height: 18,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: TEA_BROWN,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  capTop: {
    position: 'absolute',
    top: 10,
    left: 38,
    width: 36,
    height: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: TEA_BROWN,
    borderBottomWidth: 0,
  },
  capCrown: {
    position: 'absolute',
    top: 32,
    left: 15,
    width: 82,
    height: 38,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    borderWidth: 2,
    borderColor: TEA_BROWN,
    borderBottomWidth: 0,
  },
  capBand: {
    position: 'absolute',
    left: 12,
    bottom: 16,
    width: 88,
    height: 14,
    borderWidth: 2,
    borderColor: TEA_BROWN,
  },
});
