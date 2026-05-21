import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { formatCurrency } from '../../src/utils/helpers';

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
  const { allOrders, markOrderAsServed, selectTable } = useCafeFlowStore();

  const openOrders = allOrders.filter((order) => order.status !== 'served');
  const readyOrders = openOrders.filter((order) => order.items.every((item) => item.status === 'ready'));
  const billTables = TABLES.map((table) => {
    const orders = allOrders.filter((order) => order.tableNumber === table.id && order.status === 'served');
    const total = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    return { ...table, orders, total };
  }).filter((table) => table.orders.length > 0);
  const getTableStatus = (tableId: number) => {
    if (billTables.some((table) => table.id === tableId)) return 'Bill ready';
    if (openOrders.some((order) => order.tableNumber === tableId)) return 'Eating';
    return 'Free';
  };
  const sortedTables = [...TABLES].sort((a, b) => {
    const statusWeight = { Eating: 0, 'Bill ready': 1, Free: 2 };
    return statusWeight[getTableStatus(a.id)] - statusWeight[getTableStatus(b.id)];
  });

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId);
    router.push('/servant/menu');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.phoneFrame}>
        <View style={styles.heroBlock}>
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
          <Text style={styles.heroTitle}>Choose Table</Text>
          <Text style={styles.heroSubtitle}>Pick a table to begin a fresh order</Text>
        </View>
        <ScrollView contentContainerStyle={styles.tableGrid} showsVerticalScrollIndicator={false}>
          <View style={styles.statusStrip}>
            <View style={styles.statusPill}>
              <Text style={styles.statusNumber}>{TABLES.filter((table) => getTableStatus(table.id) === 'Free').length}</Text>
              <Text style={styles.statusText}>Free</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusNumber}>{TABLES.filter((table) => getTableStatus(table.id) === 'Eating').length}</Text>
              <Text style={styles.statusText}>Eating</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusNumber}>{billTables.length}</Text>
              <Text style={styles.statusText}>Bills</Text>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Ready orders for pickup</Text>
            {readyOrders.length === 0 ? (
              <Text style={styles.emptySectionText}>No ready orders right now</Text>
            ) : (
              readyOrders.map((order) => (
                <View key={order.id} style={styles.readyRow}>
                  <View style={styles.readyInfo}>
                    <Text style={styles.readyTitle}>Table ({TABLES.find((table) => table.id === order.tableNumber)?.name ?? order.tableNumber})</Text>
                    <Text style={styles.readySubtitle}>{order.items.length} items ready</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.78} onPress={() => markOrderAsServed(order.id)} style={styles.smallActionButton}>
                    <Text style={styles.smallActionText}>Served</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {billTables.length > 0 ? (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Bills to take</Text>
              {billTables.map((table) => (
                <View key={table.id} style={styles.readyRow}>
                  <View style={styles.readyInfo}>
                    <Text style={styles.readyTitle}>Table ({table.name})</Text>
                    <Text style={styles.readySubtitle}>{formatCurrency(table.total)}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={() => router.push({ pathname: '/servant/bill', params: { tableId: String(table.id) } })}
                    style={styles.smallActionButton}
                  >
                    <Text style={styles.smallActionText}>Bill</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {sortedTables.map((table) => {
            const tableStatus = getTableStatus(table.id);

            return (
            <TouchableOpacity
              key={table.id}
              accessibilityRole="button"
              accessibilityLabel={`Open menu for ${table.name}`}
              activeOpacity={0.76}
              onPress={() => handleSelectTable(table.id)}
              style={styles.tableCard}
            >
              <View style={styles.tableCardCorner} />
              <Text style={[styles.tableStatus, tableStatus === 'Free' && styles.freeTableStatus]}>{tableStatus}</Text>
              <TableIllustration />
              <Text style={styles.tableName}>{table.name}</Text>
              {tableStatus === 'Bill ready' ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.78}
                  onPress={(event) => {
                    event.stopPropagation();
                    router.push({ pathname: '/servant/bill', params: { tableId: String(table.id) } });
                  }}
                  style={styles.tableBillButton}
                >
                  <Text style={styles.tableBillButtonText}>Take bill</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
            );
          })}
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
  userButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 38,
    height: 38,
    borderWidth: 1.2,
    borderColor: 'rgba(247, 233, 207, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 233, 207, 0.16)',
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: PAPER,
  },
  userBody: {
    width: 21,
    height: 11,
    marginTop: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: PAPER,
  },
  heroBlock: {
    height: 108,
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statusStrip: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statusPill: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusNumber: {
    color: TEA_BROWN,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  statusText: {
    color: INK,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    opacity: 0.62,
  },
  sectionBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: PAPER,
    padding: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  emptySectionText: {
    color: INK,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.48,
  },
  readyRow: {
    minHeight: 48,
    borderTopWidth: 1,
    borderColor: 'rgba(23, 18, 13, 0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  readyInfo: {
    flex: 1,
    paddingRight: 12,
  },
  readyTitle: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
  },
  readySubtitle: {
    marginTop: 2,
    color: INK,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.55,
  },
  smallActionButton: {
    minWidth: 68,
    minHeight: 32,
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  smallActionText: {
    color: PAPER,
    fontSize: 11,
    fontWeight: '900',
  },
  tableCard: {
    width: '46.5%',
    aspectRatio: 1.22,
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tableCardCorner: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 1,
    backgroundColor: INK,
    opacity: 0.42,
  },
  tableStatus: {
    position: 'absolute',
    top: 7,
    right: 8,
    color: TEA_BROWN,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  freeTableStatus: {
    opacity: 0.48,
  },
  tableBillButton: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    minHeight: 24,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableBillButtonText: {
    color: PAPER,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  tableName: {
    marginTop: 9,
    color: INK,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  tableIllustration: {
    width: 62,
    height: 44,
  },
  tableCup: {
    position: 'absolute',
    top: 2,
    left: 23,
    width: 15,
    height: 13,
    borderWidth: 1.4,
    borderColor: TEA_BROWN,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  tableCupHandle: {
    position: 'absolute',
    top: 6,
    left: 36,
    width: 8,
    height: 8,
    borderWidth: 1.2,
    borderColor: TEA_BROWN,
    borderRadius: 6,
  },
  tableTop: {
    position: 'absolute',
    top: 21,
    left: 6,
    right: 6,
    height: 7,
    borderWidth: 1.6,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  tableLegLeft: {
    position: 'absolute',
    top: 27,
    left: 16,
    width: 2,
    height: 17,
    backgroundColor: INK,
    transform: [{ rotate: '8deg' }],
  },
  tableLegRight: {
    position: 'absolute',
    top: 27,
    right: 16,
    width: 2,
    height: 17,
    backgroundColor: INK,
    transform: [{ rotate: '-8deg' }],
  },
});
