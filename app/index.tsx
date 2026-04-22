import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/UIComponents';
import { useCafeFlowStore } from '../store/cafeFlow';

/**
 * Role Selection Screen
 * First screen where user selects their role
 */
export default function RoleSelection() {
  const router = useRouter();
  const { setRole } = useCafeFlowStore();

  const handleSelectRole = (role: 'servant' | 'chef_a' | 'chef_b' | 'chef_c') => {
    setRole(role);

    if (role === 'servant') {
      router.push('/servant');
    } else {
      router.push(`/chef/${role}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>CafeFlow</Text>
          <Text style={styles.subtitle}>Order Management System</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.rolesContainer}>
          {/* Servant Role */}
          <View style={styles.roleCard}>
            <Text style={styles.roleEmoji}>👨‍💼</Text>
            <Text style={styles.roleTitle}>Servant / Waiter</Text>
            <Text style={styles.roleDescription}>Take orders from tables</Text>
            <Button
              title="Select Servant"
              onPress={() => handleSelectRole('servant')}
              variant="primary"
              size="large"
              style={styles.roleButton}
            />
          </View>

          {/* Chef A - Tea Maker */}
          <View style={styles.roleCard}>
            <Text style={styles.roleEmoji}>🫖</Text>
            <Text style={styles.roleTitle}>Chef A</Text>
            <Text style={styles.roleSubtitle}>Tea Maker</Text>
            <Text style={styles.roleDescription}>Prepare tea items</Text>
            <Button
              title="Select Chef A"
              onPress={() => handleSelectRole('chef_a')}
              variant="primary"
              size="large"
              style={styles.roleButton}
            />
          </View>

          {/* Chef B - Drinks & Snacks */}
          <View style={styles.roleCard}>
            <Text style={styles.roleEmoji}>🍛</Text>
            <Text style={styles.roleTitle}>Chef B</Text>
            <Text style={styles.roleSubtitle}>Drinks & Snacks</Text>
            <Text style={styles.roleDescription}>Prepare cold drinks & starters</Text>
            <Button
              title="Select Chef B"
              onPress={() => handleSelectRole('chef_b')}
              variant="primary"
              size="large"
              style={styles.roleButton}
            />
          </View>

          {/* Chef C - Wraps & Specials */}
          <View style={styles.roleCard}>
            <Text style={styles.roleEmoji}>🌯</Text>
            <Text style={styles.roleTitle}>Chef C</Text>
            <Text style={styles.roleSubtitle}>Wraps & Specials</Text>
            <Text style={styles.roleDescription}>Prepare wraps & specialties</Text>
            <Button
              title="Select Chef C"
              onPress={() => handleSelectRole('chef_c')}
              variant="primary"
              size="large"
              style={styles.roleButton}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontWeight: '500',
  },

  rolesContainer: {
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  roleButton: {
    width: '100%',
  },

  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
