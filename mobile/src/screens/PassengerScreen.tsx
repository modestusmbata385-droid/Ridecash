import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { api } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import SafetyReportModal from './SafetyReportModal';
import LocationPicker from '../components/LocationPicker';
import RideMap from '../components/RideMap';
import { getCurrentLocation } from '../services/location';
import { socket } from '../services/socket';
import { colors, radius } from '../theme';

type LatLng = { lat: number; lng: number; address?: string };

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
}

export default function PassengerScreen() {
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [fare, setFare] = useState('5000');
  const [pickerFor, setPickerFor] =
    useState<'pickup' | 'destination' | null>(null);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const joinedRideId = useRef<string | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then((loc) =>
        setPickup({ ...loc, address: 'Eneo lako la sasa' })
      )
      .catch(() =>
        setPickup({
          lat: -6.8,
          lng: 39.28,
          address: 'Dar es Salaam',
        })
      );
  }, []);

  useEffect(() => {
    if (pickup && destination) {
      const km = haversineKm(pickup, destination);
      setFare(String(Math.round(1000 + km * 800)));
    }
  }, [pickup, destination]);

  const refresh = useCallback(async () => {
    try {
      const mine = await api('/rides/mine');
      const active = mine.find((r: any) =>
        ['REQUESTED', 'ACCEPTED', 'ARRIVING', 'STARTED'].includes(
          r.status
        )
      );
      setActiveRide(active || null);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (activeRide && joinedRideId.current !== activeRide.id) {
      joinedRideId.current = activeRide.id;
      if (!socket.connected) socket.connect();
      socket.emit('ride:join', activeRide.id);
    }
    if (!activeRide) {
      joinedRideId.current = null;
      setDriverPos(null);
    }
  }, [activeRide]);

  useEffect(() => {
    function onLocation(p: any) {
      if (activeRide && p.rideId === activeRide.id) {
        setDriverPos({ lat: p.lat, lng: p.lng });
      }
    }
    socket.on('ride:location', onLocation);
    return () => socket.off('ride:location', onLocation);
  }, [activeRide]);
  const requestRide = async () => {
    if (!pickup || !destination) {
      Alert.alert('Ride', 'Chagua sehemu ya kuanzia na unakoenda kwanza.');
      return;
    }

    try {
      const r = await api('/rides', {
        method: 'POST',
        body: JSON.stringify({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          pickupAddress: pickup.address,
          destinationAddress: destination.address,
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
        <RideMap pickup={pickup} destination={destination} driver={driverPos} />

        <View style={s.sheet}>
          <Text style={s.status}>{activeRide.status}</Text>
          <Text>Kwenda: {activeRide.destinationAddress}</Text>
          <Text>Nauli: TZS {activeRide.fare} (Cash)</Text>

          {activeRide.driver && (
            <Text>
              Dereva: {activeRide.driver.user?.name} ·{' '}
              {activeRide.driver.user?.phone}
            </Text>
          )}

          {['REQUESTED', 'ACCEPTED'].includes(activeRide.status) && (
            <PrimaryButton title="Ghairi Ride" onPress={cancelRide} />
          )}

          <PrimaryButton
            title="Ripoti Tatizo la Usalama"
            onPress={() => setShowSafety(true)}
          />
        </View>

        <SafetyReportModal
          visible={showSafety}
          rideId={activeRide.id}
          onClose={() => setShowSafety(false)}
        />
      </View>
    );
  }

  return (
    <View style={s.c}>
      <Text style={s.h}>Omba Ride</Text>

      <TouchableOpacity
        style={s.locRow}
        onPress={() => setPickerFor('pickup')}
      >
        <Text style={s.locDot}>🟢</Text>
        <Text style={s.locText} numberOfLines={1}>
          {pickup?.address || 'Chagua sehemu ya kuanzia'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.locRow}
        onPress={() => setPickerFor('destination')}
      >
        <Text style={s.locDot}>⚫</Text>
        <Text style={s.locText} numberOfLines={1}>
          {destination?.address || 'Unakoenda?'}
        </Text>
      </TouchableOpacity>

      <Text style={s.fare}>Nauli: TZS {fare}</Text>

      <PrimaryButton title="Omba Ride (Cash)" onPress={requestRide} />

      <LocationPicker
        visible={pickerFor === 'pickup'}
        title="Chagua sehemu ya kuanzia"
        initialRegion={pickup || { lat: -6.8, lng: 39.28 }}
        onConfirm={(loc) => {
          setPickup(loc);
          setPickerFor(null);
        }}
        onClose={() => setPickerFor(null)}
      />

      <LocationPicker
        visible={pickerFor === 'destination'}
        title="Unakoenda wapi?"
        initialRegion={destination || pickup || { lat: -6.8, lng: 39.28 }}
        onConfirm={(loc) => {
          setDestination(loc);
          setPickerFor(null);
        }}
        onClose={() => setPickerFor(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
    paddingTop: 60,
  },
  h: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    color: colors.text,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  locDot: {
    marginRight: 10,
    fontSize: 16,
  },
  locText: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
  },
  fare: {
    marginVertical: 12,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sheet: {
    backgroundColor: colors.card,
    padding: 16,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  status: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 6,
    color: colors.primaryDark,
  },
i: {
  borderWidth: 1,
  borderColor: colors.border,
  padding: 14,
  marginBottom: 16,
  borderRadius: radius.md,
  backgroundColor: colors.card,
},
});
