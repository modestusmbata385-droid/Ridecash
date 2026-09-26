import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { api } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import { watchDriverLocation } from '../services/location';
import KycScreen from './KycScreen';
import SafetyReportModal from './SafetyReportModal';

export default function DriverScreen() {
  const [online, setOnline] = useState(false);
  const [available, setAvailable] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const mine = await api('/rides/mine');
      const active = mine.find((r: any) => ['ACCEPTED', 'STARTED'].includes(r.status));
      setActiveRide(active || null);
      if (online && !active) setAvailable(await api('/rides/available'));
      else setAvailable([]);
    } catch (e: any) {
      // silent - keep last known state on transient errors
    } finally {
      setRefreshing(false);
    }
  }, [online]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 6000);
    return () => clearInterval(interval);
  }, [refresh]);

  const toggle = async () => {
    try {
      const next = !online;
      await api('/drivers/online', { method: 'POST', body: JSON.stringify({ online: next }) });
      setOnline(next);
      if (next) await watchDriverLocation();
      refresh();
    } catch (e: any) {
      Alert.alert('Driver', e.message);
    }
  };

  const accept = async (rideId: string) => {
    try {
      await api(`/rides/${rideId}/accept`, { method: 'POST' });
      refresh();
    } catch (e: any) {
      Alert.alert('Accept ride', e.message);
    }
  };

  const start = async () => {
    try {
      await api(`/rides/${activeRide.id}/start`, { method: 'POST' });
      refresh();
    } catch (e: any) {
      Alert.alert('Start ride', e.message);
    }
  };

  const complete = async () => {
    try {
      const r = await api(`/rides/${activeRide.id}/complete`, { method: 'POST' });
      Alert.alert('Ride completed', `Commission owed: TZS ${r.commission}`);
      setActiveRide(null);
      refresh();
    } catch (e: any) {
      Alert.alert('Complete ride', e.message);
    }
  };

  const requestSettlement = async () => {
    try {
      await api('/commission/payments', { method: 'POST', body: JSON.stringify({ amount: Number(payAmount), reference: payRef }) });
      Alert.alert('Commission', 'Payment submitted for admin approval.');
      setPayAmount(''); setPayRef('');
    } catch (e: any) {
      Alert.alert('Commission', e.message);
    }
  };

  return (
    <View style={s.c}>
      <Text style={s.h}>Driver</Text>
      <Text>Status: {online ? 'ONLINE' : 'OFFLINE'}</Text>
      <Text style={s.hint}>Passenger pays CASH. You owe 12% commission after completed rides.</Text>
      <PrimaryButton title={online ? 'Go Offline' : 'Go Online'} onPress={toggle} />

      <View style={s.rowButtons}>
        <PrimaryButton title="KYC documents" onPress={() => setShowKyc(true)} />
        <PrimaryButton title="Report safety issue" onPress={() => setShowSafety(true)} />
      </View>

      {activeRide ? (
        <View style={s.activeCard}>
          <Text style={s.rowTitle}>Active ride ({activeRide.status})</Text>
          <Text>To: {activeRide.destinationAddress || 'destination'}</Text>
          <Text>Fare: TZS {activeRide.fare}</Text>
          {activeRide.status === 'ACCEPTED' && <PrimaryButton title="Start trip (picked up passenger)" onPress={start} />}
          {activeRide.status === 'STARTED' && <PrimaryButton title="Complete trip" onPress={complete} />}
        </View>
      ) : (
        <>
          <Text style={s.sectionTitle}>{online ? 'Incoming ride requests' : 'Go online to see ride requests'}</Text>
          <FlatList
            data={available}
            keyExtractor={(r) => r.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            renderItem={({ item }) => (
              <View style={s.rideRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{item.destinationAddress || 'Destination'}</Text>
                  <Text>Fare: TZS {item.fare}</Text>
                </View>
                <PrimaryButton title="Accept" onPress={() => accept(item.id)} />
              </View>
            )}
          />
        </>
      )}

      <View style={s.settleCard}>
        <Text style={s.sectionTitle}>Settle commission debt</Text>
        <TextInput style={s.i} value={payAmount} onChangeText={setPayAmount} placeholder="Amount paid (TZS)" keyboardType="numeric" />
        <TextInput style={s.i} value={payRef} onChangeText={setPayRef} placeholder="Payment reference (optional)" />
        <PrimaryButton title="Submit settlement" onPress={requestSettlement} />
      </View>

      <KycScreen visible={showKyc} onClose={() => setShowKyc(false)} />
      <SafetyReportModal visible={showSafety} rideId={activeRide?.id || null} onClose={() => setShowSafety(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 20, paddingTop: 50 },
  h: { fontSize: 28, fontWeight: '800' },
  hint: { color: '#666', marginBottom: 10 },
  rowButtons: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 16, marginBottom: 6 },
  rideRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  rowTitle: { fontWeight: '700' },
  activeCard: { backgroundColor: '#f4f4f4', padding: 14, borderRadius: 10, marginTop: 10 },
  settleCard: { marginTop: 20, borderTopWidth: 1, borderColor: '#eee', paddingTop: 14 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 8 },
});
