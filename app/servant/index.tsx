import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../../src/store/cafeFlow';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const TABLES = [
  { id: 1, name: 'bc' },
  { id: 2, name: 'tc' },
  { id: 3, name: 'cntr' },
  { id: 4, name: 'lc' },
  { id: 5, name: 'mj(majlis)' },
  { id: 6, name: 'dw-r' },
  { id: 7, name: 'dw-l' },
  { id: 8, name: 'dw-c' },
];

export default function ServantPanel() {
  const router = useRouter();
  const { selectTable } = useCafeFlowStore();

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId);
    router.push('/servant/menu');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.phoneFrame}>
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            activeOpacity={0.72}
            onPress={() => router.push('/servant/profile')}
            style={styles.userButton}
          >
            <View style={styles.userHead} />
            <View style={styles.userBody} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Choose Table</Text>
          <Text style={styles.heroSubtitle}>Pick a table to begin a fresh order</Text>
        </View>
        <ScrollView contentContainerStyle={styles.tableGrid} showsVerticalScrollIndicator={false}>
          {TABLES.map((table) => (
            <TouchableOpacity
              key={table.id}
              accessibilityRole="button"
              accessibilityLabel={`Open menu for ${table.name}`}
              activeOpacity={0.76}
              onPress={() => handleSelectTable(table.id)}
              style={styles.tableCard}
            >
              <TableIllustration />
              <Text style={styles.tableName}>{table.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function TableIllustration() {
  return (
    <View style={styles.tableIllustration}>
      <View style={styles.tableCup} />
      <View style={styles.tableCupHandle} />
      <View style={styles.tableTop} />
      <View style={styles.tableLegLeft} />
      <View style={styles.tableLegRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAPER,
    padding: 0,
  },
  phoneFrame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: PAPER,
    borderWidth: 1.4,
    borderColor: INK,
  },
  topBar: {
    height: 78,
    borderBottomWidth: 1.2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userButton: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    width: 38,
    height: 38,
    borderWidth: 1.2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAPER,
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: INK,
  },
  userBody: {
    width: 21,
    height: 11,
    marginTop: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: INK,
  },
  heroBlock: {
    height: 118,
    backgroundColor: TEA_BROWN,
    borderBottomWidth: 1.2,
    borderColor: INK,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    color: PAPER,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroSubtitle: {
    marginTop: 5,
    color: 'rgba(247, 233, 207, 0.72)',
    fontSize: 11,
    fontWeight: '800',
  },
  tableGrid: {
    padding: 24,
    paddingBottom: 34,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  tableCard: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: '#FFF2D8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  tableName: {
    marginTop: 14,
    color: INK,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  tableIllustration: {
    width: 76,
    height: 56,
  },
  tableCup: {
    position: 'absolute',
    top: 2,
    left: 28,
    width: 18,
    height: 16,
    borderWidth: 1.6,
    borderColor: TEA_BROWN,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  tableCupHandle: {
    position: 'absolute',
    top: 6,
    left: 43,
    width: 9,
    height: 9,
    borderWidth: 1.4,
    borderColor: TEA_BROWN,
    borderRadius: 6,
  },
  tableTop: {
    position: 'absolute',
    top: 25,
    left: 8,
    right: 8,
    height: 8,
    borderWidth: 1.8,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  tableLegLeft: {
    position: 'absolute',
    top: 32,
    left: 20,
    width: 2,
    height: 22,
    backgroundColor: INK,
    transform: [{ rotate: '8deg' }],
  },
  tableLegRight: {
    position: 'absolute',
    top: 32,
    right: 20,
    width: 2,
    height: 22,
    backgroundColor: INK,
    transform: [{ rotate: '-8deg' }],
  },
});
