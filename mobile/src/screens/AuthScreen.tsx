import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';
import { saveSession } from '../store/auth';

export default function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('255700000001');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [roleChoice, setRoleChoice] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');

  const login = async () => {
    try {
      await saveSession(await api('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }));
      onLogin();
    } catch (e: any) {
      Alert.alert('Login', e.message);
    }
  };

  const register = async () => {
    try {
      await saveSession(
        await api('/auth/register', { method: 'POST', body: JSON.stringify({ phone, name, password, role: roleChoice }) })
      );
      onLogin();
    } catch (e: any) {
      Alert.alert('Register', e.message);
    }
  };

  return (
    <View style={s.c}>
      <Text style={s.h}>RideCash</Text>
      <View style={s.tabs}>
        <Pressable onPress={() => setMode('login')} style={[s.tab, mode === 'login' && s.tabActive]}>
          <Text style={mode === 'login' ? s.tabTextActive : s.tabText}>Login</Text>
        </Pressable>
        <Pressable onPress={() => setMode('register')} style={[s.tab, mode === 'register' && s.tabActive]}>
          <Text style={mode === 'register' ? s.tabTextActive : s.tabText}>Register</Text>
        </Pressable>
      </View>

      {mode === 'register' && (
        <TextInput style={s.i} value={name} onChangeText={setName} placeholder="Full name" />
      )}
      <TextInput style={s.i} value={phone} onChangeText={setPhone} placeholder="Phone (2557XXXXXXXX)" keyboardType="phone-pad" />
      <TextInput style={s.i} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

      {mode === 'register' && (
        <View style={s.tabs}>
          <Pressable onPress={() => setRoleChoice('PASSENGER')} style={[s.tab, roleChoice === 'PASSENGER' && s.tabActive]}>
            <Text style={roleChoice === 'PASSENGER' ? s.tabTextActive : s.tabText}>I'm a Passenger</Text>
          </Pressable>
          <Pressable onPress={() => setRoleChoice('DRIVER')} style={[s.tab, roleChoice === 'DRIVER' && s.tabActive]}>
            <Text style={roleChoice === 'DRIVER' ? s.tabTextActive : s.tabText}>I'm a Driver</Text>
          </Pressable>
        </View>
      )}

      <PrimaryButton title={mode === 'login' ? 'Login' : 'Create account'} onPress={mode === 'login' ? login : register} />
      {mode === 'register' && roleChoice === 'DRIVER' && (
        <Text style={s.hint}>After registering, submit your KYC documents and wait for admin approval before you can go online.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24 },
  h: { fontSize: 34, fontWeight: '800', marginBottom: 20 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 8, marginBottom: 10 },
  tabs: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
  tabActive: { backgroundColor: '#111' },
  tabText: { color: '#333', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  hint: { marginTop: 10, color: '#666', fontSize: 12 },
});
