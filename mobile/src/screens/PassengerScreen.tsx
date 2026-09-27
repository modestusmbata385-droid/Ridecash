import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
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
