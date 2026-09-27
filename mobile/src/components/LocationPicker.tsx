import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapView, {
  Marker,
  MapPressEvent,
  Region,
} from 'react-native-maps';

type LatLng = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  visible: boolean;
  title: string;
  initialRegion: LatLng;
  onConfirm: (location: LatLng) => void;
  onClose: () => void;
};

export default function LocationPicker({
  visible,
  title,
  initialRegion,
  onConfirm,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<LatLng>({
    lat: initialRegion.lat,
    lng: initialRegion.lng,
  });

  const region: Region = {
    latitude: selected.lat,
    longitude: selected.lng,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } =
      event.nativeEvent.coordinate;

    setSelected({
      lat: latitude,
      lng: longitude,
      address: 'Sehemu iliyochaguliwa',
    });
  };

  const confirm = () => {
    onConfirm(selected);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Funga</Text>
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={{
              latitude: selected.lat,
              longitude: selected.lng,
            }}
            title="Sehemu uliyochagua"
          />
        </MapView>

        <View style={styles.bottom}>
          <Text style={styles.info}>
            Lat: {selected.lat.toFixed(6)}
          </Text>

          <Text style={styles.info}>
            Lng: {selected.lng.toFixed(6)}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={confirm}
          >
            <Text style={styles.buttonText}>
              Thibitisha Sehemu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 70,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
  },

  close: {
    fontSize: 16,
    fontWeight: '700',
  },

  map: {
    flex: 1,
  },

  bottom: {
    padding: 18,
    backgroundColor: '#fff',
  },

  info: {
    fontSize: 14,
    marginBottom: 4,
  },

  button: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#111',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
