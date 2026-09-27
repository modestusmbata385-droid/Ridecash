import React from 'react';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

type LatLng = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  pickup?: LatLng | null;
  destination?: LatLng | null;
  driver?: LatLng | null;
};

export default function RideMap({
  pickup,
  destination,
  driver,
}: Props) {
  const center = pickup || destination || driver;

  const region: Region = {
    latitude: center?.lat ?? -6.8,
    longitude: center?.lng ?? 39.28,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const route = [];

  if (pickup) {
    route.push({
      latitude: pickup.lat,
      longitude: pickup.lng,
    });
  }

  if (destination) {
    route.push({
      latitude: destination.lat,
      longitude: destination.lng,
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.lat,
              longitude: pickup.lng,
            }}
            title="Sehemu ya kuanzia"
            description={pickup.address}
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title="Unakoenda"
            description={destination.address}
          />
        )}

        {driver && (
          <Marker
            coordinate={{
              latitude: driver.lat,
              longitude: driver.lng,
            }}
            title="Dereva"
            description="Dereva yupo hapa"
          />
        )}

        {route.length >= 2 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
