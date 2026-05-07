import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../src/store/cafeFlow';
import { COLORS } from '../src/constants/theme';

/**
 * Role Selection Screen
 * First screen where user selects their role
 */
export default function RoleSelection() {
  const router = useRouter();
  const { setRole, theme } = useCafeFlowStore();
  const t = COLORS[theme];

  const handleSelectRole = (role: 'servant' | 'chef_a' | 'chef_b' | 'chef_c') => {
    setRole(role);

    if (role === 'servant') {
      router.push('/servant');
    } else {
      router.push(`/chef/${role}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.textureOverlay} pointerEvents="none">
        <View style={[styles.glowBlock, { backgroundColor: t.accent }]} />
        <View style={[styles.gridLine, { backgroundColor: t.border, top: 116 }]} />
        <View style={[styles.gridLine, { backgroundColor: t.border, bottom: 156 }]} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: t.accent }]}>DINEFLOW OS</Text>
          <Text style={[styles.appName, { color: t.text }]}>The Black Tea</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>Choose a station and jump straight into service.</Text>
        </View>

        <View style={styles.rolesContainer}>
          {[
            {
              role: 'servant' as const,
              label: 'Waiter Desk',
              code: '01',
              station: 'Tables / Cart / Live Orders',
              description: 'Assign tables, build carts, and track each ticket from floor to kitchen.',
            },
            {
              role: 'chef_a' as const,
              label: 'Tea Station',
              code: 'A',
              station: 'Chef A',
              description: 'Owns tea, infusions, and hot beverage tickets.',
            },
            {
              role: 'chef_b' as const,
              label: 'Cold Bar',
              code: 'B',
              station: 'Chef B',
              description: 'Handles mojitos, lime, soda, fries, nuggets, and starters.',
            },
            {
              role: 'chef_c' as const,
              label: 'Wrap Line',
              code: 'C',
              station: 'Chef C',
              description: 'Prepares wraps, cones, momos, and specials.',
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.role}
              activeOpacity={0.82}
              onPress={() => handleSelectRole(item.role)}
              style={[styles.roleCard, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <View style={styles.roleCardTop}>
                <View style={[styles.stationMark, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <Text style={[styles.stationCode, { color: t.accent }]}>{item.code}</Text>
                </View>
                <View style={[styles.enterBadge, { backgroundColor: t.accent }]}>
                  <Text style={styles.enterBadgeText}>Enter</Text>
                </View>
              </View>
              <Text style={[styles.roleSubtitle, { color: t.accent }]}>{item.station}</Text>
              <Text style={[styles.roleTitle, { color: t.text }]}>{item.label}</Text>
              <Text style={[styles.roleDescription, { color: t.muted }]}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => router.push('/admin')}
          style={[styles.adminCard, { backgroundColor: t.surface, borderColor: t.border }]}
        >
          <View>
            <Text style={[styles.roleSubtitle, { color: t.accent }]}>Manager</Text>
            <Text style={[styles.adminTitle, { color: t.text }]}>Open admin dashboard</Text>
          </View>
          <Text style={[styles.adminArrow, { color: t.accent }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.footer, { borderTopColor: t.border }]}>
          <Text style={[styles.footerText, { color: t.muted }]}>SERVICE BUILD / 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  glowBlock: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    top: -70,
    right: -82,
    opacity: 0.14,
  },
  gridLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    opacity: 0.35,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  header: {
    marginTop: 18,
    marginBottom: 34,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 12,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
    lineHeight: 23,
    maxWidth: 320,
  },
  rolesContainer: {
    gap: 14,
    marginBottom: 16,
  },
  roleCard: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  stationMark: {
    width: 54,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stationCode: {
    fontSize: 20,
    fontWeight: '900',
  },
  enterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enterBadgeText: {
    color: '#211A14',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  roleTitle: {
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  roleSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  adminCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  adminArrow: {
    fontSize: 34,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
