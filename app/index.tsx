import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../src/store/cafeFlow';
import { COLORS } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');
const PANEL_HEIGHT = Math.min(Math.max(height * 0.2, 166), 188);
const PANEL_OVERLAP = 42;
const INK = '#1B1A17';
const MUTED = '#837E78';
const PAPER = '#FFFFFF';

export default function LoginScreen() {
  const router = useRouter();
  const { setRole } = useCafeFlowStore();
  const t = COLORS.light;

  const handleLogin = () => {
    setRole('servant');
    router.push('/servant');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.screen}>
        <Image
          source={require('../assets/the-black-tea-login.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.panel}>
          <View style={styles.panelFill} />
          <View style={styles.panelCurve} />
          <Text style={styles.title}>WELCOME</Text>
          <Text style={styles.subtitle}>Find your next space, feel at home</Text>
          <Text style={styles.subtitle}>Where comfort meets convenience</Text>

          <TouchableOpacity activeOpacity={0.86} onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  heroImage: {
    width: width + 8,
    height: height - PANEL_HEIGHT + PANEL_OVERLAP,
  },
  panel: {
    height: PANEL_HEIGHT,
    alignItems: 'center',
    marginTop: -PANEL_OVERLAP,
    paddingHorizontal: 30,
    paddingTop: 40,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    zIndex: 2,
  },
  panelFill: {
    position: 'absolute',
    top: 38,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PAPER,
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
  },
  panelCurve: {
    position: 'absolute',
    top: -34,
    left: -width * 0.18,
    width: width * 1.36,
    height: 88,
    borderRadius: width * 0.68,
    backgroundColor: PAPER,
  },
  title: {
    color: '#4B4A48',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: 0,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next Condensed' : 'sans-serif-condensed',
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  loginButton: {
    width: Math.min(width - 128, 216),
    minHeight: 38,
    borderRadius: 22,
    marginTop: 18,
    backgroundColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: PAPER,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
});
