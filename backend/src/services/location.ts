import { api } from '../api/client';
import { socket } from './socket';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw Error('Location permission denied');
}

export async function getCurrentLocation() {
  await requestLocationPermission();
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

export async function watchDriverLocation(getActiveRideId: () => string | null) {
  await requestLocationPermission();

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 5000,
    },
    (p) => {
      const lat = p.coords.latitude;
      const lng = p.coords.longitude;

      api('/drivers/location', {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      }).catch(() => {});

      const rideId = getActiveRideId();
      if (rideId && socket.connected) {
        socket.emit('ride:location', { rideId, lat, lng });
      }
    }
  );
}
