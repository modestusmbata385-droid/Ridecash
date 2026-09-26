import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { api } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import SafetyReportModal from './SafetyReportModal';

export default function PassengerScreen() {
  const [fare, setFare] = useState('5000');
  const [destination, setDestination] = useState('');
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [showSafety, setShowSafety] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const mine = await api('/rides/mine');
      const active = mine.find((r: any) => ['REQUESTED', 'ACCEPTED', 'ARRIVING', 'STARTED'].includes(r.status));
      setActiveRide(active || null);
    } catch { /* ignore transient errors */ }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const requestRide = async () => {
    try {
      const r = await api('/rides', {
        method: 'POST',
        body: JSON.stringify({
          pickupLat: -6.8, pickupLng: 39.28,
          destinationLat: -6.81, destinationLng: 39.29,
          pickupAddress: 'Current location',
          destinationAddress: destination,
          fare: Number(fare),
        }),
      });
      setActiveRide(r);
    } catch (e: any) {
      Alert.alert('Ride', e.message);
    }
  };

  const cancelRide = async () => {
    try {
      await api(`/rides/${activeRide.id}/cancel`, { method: 'POST' });
      setActiveRide(null);
    } catch (e: any) {
      Alert.alert('Ride', e.message);
    }
  };

  if (activeRide) {
    return (
      <View style={s.c}>
        <Text style={s.h}>Your ride</Text>
        <View style={s.card}>
          <Text style={s.status}>{activeRide.status}</Text>
          <Text>To: {activeRide.destinationAddress}</Text>
          <Text>Fare: TZS {activeRide.fare} (cash)</Text>
          {activeRide.driver && <Text>Driver: {activeRide.driver.user?.name} · {activeRide.driver.user?.phone}</Text>}
        </View>
        {['REQUESTED', 'ACCEPTED'].includes(activeRide.status) && (
          <PrimaryButton title="Cancel ride" onPress={cancelRide} />
        )}
        <PrimaryButton title="Report safety issue" onPress={() => setShowSafety(true)} />
        <SafetyReportModal visible={showSafety} rideId={activeRide.id} onClose={() => setShowSafety(false)} />
      </View>
    );
  }

  return (
    <View style={s.c}>
      <Text style={s.h}>Request a ride</Text>
      <Text style={s.hint}>Payment: CASH</Text>
      <TextInput style={s.i} value={destination} onChangeText={setDestination} placeholder="Destination" />
      <TextInput style={s.i} value={fare} onChangeText={setFare} keyboardType="numeric" placeholder="Fare" />
      <PrimaryButton title="Request Ride" onPress={requestRide} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 24, justifyContent: 'center' },
  h: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  hint: { color: '#666', marginBottom: 8 },
  i: { borderWidth: 1, padding: 14, marginVertical: 8, borderRadius: 8 },
  card: { backgroundColor: '#f4f4f4', padding: 16, borderRadius: 10, marginBottom: 16 },
  status: { fontWeight: '800', fontSize: 18, marginBottom: 6 },
});
