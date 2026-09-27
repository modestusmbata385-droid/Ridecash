export type DriverLocation = {
  driverId: string;
  lat: number;
  lng: number;
};

const locations = new Map<string, DriverLocation>();

export function updateDriverLocation(driverId: string, lat: number, lng: number) {
  locations.set(driverId, { driverId, lat, lng });
}

export function getDriverLocation(driverId: string) {
  return locations.get(driverId) ?? null;
}
