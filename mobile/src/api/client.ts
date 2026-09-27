import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function api(
  path: string,
  options: RequestInit = {}
) {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as any).message ||
      (data as any).error ||
      'Request failed'
    );
  }

  return data;
}
