import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RideMap({ pickup, destination, driver }: any) {
  return (
    <View style={s.box}>
      <Text style={s.title}>Ramani ya Ride</Text>

      {pickup && (
        <Text>📍 Pickup: {pickup.lat}, {pickup.lng}</Text>
      )}

      {destination && (
        <Text>🏁 Destination: {destination.lat}, {destination.lng}</Text>
      )}

      {driver && (
        <Text>🚗 Driver: {driver.lat}, {driver.lng}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
