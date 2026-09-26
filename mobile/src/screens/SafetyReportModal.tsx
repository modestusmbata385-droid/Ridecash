import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';

export default function SafetyReportModal({ visible, rideId, onClose }: { visible: boolean; rideId: string | null; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const submit = async () => {
    if (!rideId) { Alert.alert('Safety', 'No active ride to report.'); return; }
    try {
      await api('/safety/reports', { method: 'POST', body: JSON.stringify({ rideId, reason, details }) });
      Alert.alert('Safety', 'Report submitted. Our team will review it.');
      setReason(''); setDetails(''); onClose();
    } catch (e: any) {
      Alert.alert('Safety', e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.h}>Report a safety concern</Text>
          <TextInput style={s.i} value={reason} onChangeText={setReason} placeholder="Reason (e.g. unsafe driving)" />
          <TextInput style={[s.i, { height: 80 }]} value={details} onChangeText={setDetails} placeholder="Details (optional)" multiline />
          <PrimaryButton title="Submit report" onPress={submit} />
          <PrimaryButton title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  h: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
});
