import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../src/store/cafeFlow';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { COLORS } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

const ROLES = [
  { id: 'servant', title: 'Kuttappi', subtitle: 'Servant · Order Taker', emoji: '👨‍💼' },
  { id: 'chef_a', title: 'Shigin', subtitle: 'Tea Maker', emoji: '🫖' },
  { id: 'chef_b', title: 'Swadiq', subtitle: 'Drinks & Snacks', emoji: '🥤' },
  { id: 'chef_c', title: 'Jaslin', subtitle: 'Wraps, Momos & Specials', emoji: '🌯' },
  { id: 'admin', title: 'Admin / Manager', subtitle: 'Operations Dashboard', emoji: '🔐' },
];

export default function RoleSelection() {
  const router = useRouter();
  const { setRole, theme, setTheme } = useCafeFlowStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = COLORS[theme];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    // Admin requires password
    if (selectedRole.id === 'admin') {
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError(false);
      return;
    }

    setRole(selectedRole.id as any);
    if (selectedRole.id === 'servant') {
      router.push('/servant');
    } else {
      router.push(`/chef/${selectedRole.id}`);
    }
  };

  const handleAdminLogin = () => {
    if (password === 'javad123') {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError(false);
      setRole('admin' as any);
      router.push('/admin');
    } else {
      setPasswordError(true);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header Controls */}
      <View style={styles.topHeader}>
        {/* Settings Gear */}
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: t.card, borderColor: t.border }]} 
          onPress={() => setShowSettings(true)}
        >
          <View style={styles.gearContainer}>
            <View style={[styles.gearCore, { backgroundColor: t.text }]} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <View 
                key={deg} 
                style={[
                  styles.gearTooth, 
                  { 
                    backgroundColor: t.text, 
                    transform: [{ rotate: `${deg}deg` }, { translateY: -10 }] 
                  }
                ]} 
              />
            ))}
            <View style={[styles.gearHole, { backgroundColor: t.card }]} />
          </View>
        </TouchableOpacity>

        {/* Logo in Top Right */}
        <View style={[styles.topLogoContainer, { backgroundColor: t.card, borderColor: t.border }]}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.topLogo} 
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Decorative background elements */}
      <View style={[styles.circle, { top: -100, right: -50, backgroundColor: theme === 'dark' ? '#1E1B4B' : '#D1FAE5' }]} />
      <View style={[styles.circle, { bottom: -80, left: -60, backgroundColor: theme === 'dark' ? '#1E1B4B' : '#FEF3C7', width: 200, height: 200 }]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContent}>
          {/* Dynamic Image/Visual Area */}
          <View style={styles.visualContainer}>
            <View style={[styles.imagePlaceholder, { backgroundColor: t.card, borderColor: t.border, shadowColor: t.accent }]}>
              <Text style={styles.bigEmoji}>{selectedRole.emoji}</Text>
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeLabel, { color: t.muted }]}>Welcome back,</Text>
              <Text style={[styles.welcomeTitle, { color: t.accent }]}>{selectedRole.title}</Text>
              <Text style={[styles.welcomeSubRole, { color: t.muted }]}>{selectedRole.subtitle}</Text>
            </View>
          </View>

          {/* Dropdown and Button Container */}
          <View style={styles.actionContainer}>
            <Text style={[styles.inputLabel, { color: t.muted }]}>Login as</Text>
            
            {/* Custom Dropdown */}
            <View style={[styles.dropdownWrapper, { zIndex: 1000 }]}>
              <TouchableOpacity 
                activeOpacity={0.9}
                style={[styles.dropdownHeader, { backgroundColor: t.card, borderColor: isOpen ? t.accent : t.border }]}
                onPress={() => setIsOpen(true)}
              >
                <View style={styles.dropdownSelectedValue}>
                  <Text style={styles.dropdownEmoji}>{selectedRole.emoji}</Text>
                  <View>
                    <Text style={[styles.dropdownText, { color: t.text }]}>{selectedRole.title}</Text>
                    <Text style={[styles.dropdownSubtext, { color: t.muted }]}>{selectedRole.subtitle}</Text>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: t.muted }, isOpen && styles.chevronUp]}>▼</Text>
              </TouchableOpacity>

              {/* Role Selection Modal */}
              <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
              >
                <TouchableOpacity 
                  style={styles.modalOverlay} 
                  activeOpacity={1} 
                  onPress={() => setIsOpen(false)}
                >
                  <View style={[styles.roleModalContent, { backgroundColor: t.card }]}>
                    <View style={styles.modalIndicator} />
                    <Text style={[styles.modalTitle, { color: t.text, marginBottom: 15 }]}>Switch Role</Text>
                    
                    <ScrollView 
                      style={{ maxHeight: 400 }}
                      showsVerticalScrollIndicator={true}
                    >
                      {ROLES.map((role) => (
                        <TouchableOpacity
                          key={role.id}
                          style={[
                            styles.roleModalItem,
                            selectedRole.id === role.id && { backgroundColor: t.surface, borderColor: t.accent, borderWidth: 1 }
                          ]}
                          onPress={() => {
                            setSelectedRole(role);
                            setIsOpen(false);
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <Text style={styles.dropdownItemEmoji}>{role.emoji}</Text>
                            <View>
                              <Text style={[styles.dropdownItemTitle, { color: t.text }]}>{role.title}</Text>
                              <Text style={[styles.dropdownItemSubtitle, { color: t.muted }]}>{role.subtitle}</Text>
                            </View>
                          </View>
                          {selectedRole.id === role.id && (
                            <View style={styles.checkIcon}>
                              <Text style={{ color: t.accent, fontWeight: 'bold' }}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    
                    <TouchableOpacity 
                      style={[styles.closeModalBtn, { backgroundColor: t.surface }]}
                      onPress={() => setIsOpen(false)}
                    >
                      <Text style={[styles.closeModalBtnText, { color: t.text }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[
                styles.loginButton,
                selectedRole.id === 'admin' && [styles.adminLoginButton, { backgroundColor: t.card, borderColor: t.accent }],
                { backgroundColor: selectedRole.id === 'admin' ? t.card : t.accent }
              ]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: selectedRole.id === 'admin' ? t.accent : '#FFF' }]}>
                {selectedRole.id === 'admin' ? 'Unlock Admin' : 'Login'}
              </Text>
              <View style={styles.arrowIcon}>
                <Text style={{ color: selectedRole.id === 'admin' ? t.accent : '#FFF', fontSize: 18 }}>
                  {selectedRole.id === 'admin' ? '🔑' : '→'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.muted }]}>Secure Entry • Version 1.2</Text>
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowSettings(false)} 
          />
          <View style={[styles.settingsModal, { backgroundColor: t.card }]}>
            <View style={styles.modalIndicator} />
            <Text style={[styles.modalTitle, { color: t.text }]}>Settings</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: t.text }]}>Appearance</Text>
                <Text style={[styles.settingDesc, { color: t.muted }]}>Choose your preferred app theme</Text>
              </View>
              
              <View style={[styles.themeToggleContainer, { backgroundColor: t.surface }]}>
                <TouchableOpacity 
                  onPress={() => setTheme('light')}
                  style={[styles.themeOption, theme === 'light' && styles.themeOptionActive]}
                >
                  <Text style={{ fontSize: 16 }}>☀️</Text>
                  <Text style={[styles.themeOptionText, theme === 'light' && styles.themeOptionTextActive]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTheme('dark')}
                  style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive]}
                >
                  <Text style={{ fontSize: 16 }}>🌙</Text>
                  <Text style={[styles.themeOptionText, theme === 'dark' && styles.themeOptionTextActive]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.unlockButton, { backgroundColor: t.accent }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={[styles.unlockButtonText, { color: '#FFF' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Admin Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowPasswordModal(false)} 
          />
          <View style={styles.passwordModal}>
            <View style={styles.modalIndicator} />
            
            {/* Lock Icon */}
            <View style={styles.lockIconContainer}>
              <Text style={styles.lockEmoji}>🔐</Text>
            </View>

            <Text style={styles.modalTitle}>Admin Access</Text>
            <Text style={styles.modalSubtitle}>Enter manager password to continue</Text>

            <View style={[
              styles.passwordInputContainer,
              passwordError && styles.passwordInputError,
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(false);
                }}
                autoFocus
                onSubmitEditing={handleAdminLogin}
              />
            </View>

            {passwordError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Wrong password. Try again.</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.unlockButton}
              onPress={handleAdminLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2000,
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  topLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  topLogo: {
    width: 35,
    height: 35,
  },
  gearContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  gearHole: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  gearTooth: {
    width: 4,
    height: 6,
    borderRadius: 1,
    position: 'absolute',
    top: '50%',
    marginTop: -3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
    minHeight: height - 100,
  },
  circle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 220,
    height: 220,
    marginTop: 20,
  },
  visualContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 100,
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5A47E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 126, 0.2)',
  },
  bigEmoji: {
    fontSize: 70,
  },
  welcomeTextContainer: {
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 16,
    color: '#A8A29E',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#C5A47E',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  welcomeSubRole: {
    fontSize: 14,
    color: '#A8A29E',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  actionContainer: {
    marginBottom: 30,
    zIndex: 1000,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78716C',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  dropdownWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1C',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownHeaderOpen: {
    borderColor: '#C5A47E',
  },
  dropdownSelectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F5F5',
  },
  dropdownSubtext: {
    fontSize: 11,
    color: '#A8A29E',
    fontWeight: '500',
    marginTop: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#A8A29E',
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  roleModalContent: {
    width: '100%',
    borderRadius: 35,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 126, 0.15)',
  },
  roleModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  closeModalBtn: {
    marginTop: 15,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(197, 164, 126, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  dropdownItemTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdownItemEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#C5A47E',
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5A47E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  adminLoginButton: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#C5A47E',
  },
  loginButtonText: {
    color: '#121212',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  arrowIcon: {
    position: 'absolute',
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#A8A29E',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Password Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  passwordModal: {
    backgroundColor: '#FFF',
    borderRadius: 35,
    paddingVertical: 35,
    paddingHorizontal: 30,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 25,
  },
  lockIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1C1917',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#78716C',
    fontWeight: '500',
    marginTop: 6,
    marginBottom: 25,
  },
  passwordInputContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  passwordInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  passwordInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
    paddingVertical: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
  },
  unlockButton: {
    width: '100%',
    backgroundColor: '#1E1B4B',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#78716C',
    fontWeight: '700',
  },

  // Settings Modal Styles
  settingsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingVertical: 35,
    paddingHorizontal: 30,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    width: 160,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  themeOptionActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    color: '#78716C',
  },
  themeOptionTextActive: {
    color: '#1C1917',
  },
});
