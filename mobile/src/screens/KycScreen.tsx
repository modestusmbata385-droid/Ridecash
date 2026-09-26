import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';

export default function KycScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [type, setType] = useState('NATIONAL_ID');
  const [url, setUrl] = useState('');
  const [docs, setDocs] = useState<any[]>([]);

  const load = async () => {
    try { setDocs(await api('/kyc/documents/me')); } catch { /* ignore on first load */ }
  };

  useEffect(() => { if (visible) load(); }, [visible]);

  const submit = async () => {
    if (!url) { Alert.alert('KYC', 'Paste a document URL (photo link) first.'); return; }
    try {
      await api('/kyc/documents', { method: 'POST', body: JSON.stringify({ type, url }) });
      setUrl('');
      load();
      Alert.alert('KYC', 'Document submitted for review.');
    } catch (e: any) {
      Alert.alert('KYC', e.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={s.c}>
        <Text style={s.h}>KYC documents</Text>
        <Text style={s.hint}>Upload a photo of your ID and driving license to a hosting service, then paste its link here.</Text>
        <TextInput style={s.i} value={type} onChangeText={setType} placeholder="Type (e.g. NATIONAL_ID, DRIVING_LICENSE)" />
        <TextInput style={s.i} value={url} onChangeText={setUrl} placeholder="Document URL" />
        <PrimaryButton title="Submit document" onPress={submit} />
        <FlatList
          data={docs}
          keyExtractor={(d) => d.id}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Text style={s.rowTitle}>{item.type}</Text>
              <Text style={s[`status_${item.status}` as 'status_PENDING']}>{item.status}</Text>
            </View>
          )}
        />
        <PrimaryButton title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 24, paddingTop: 60 },
  h: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  hint: { color: '#666', marginBottom: 14 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  rowTitle: { fontWeight: '600' },
  status_PENDING: { color: '#a67c00' },
  status_APPROVED: { color: '#0a7a2a' },
  status_REJECTED: { color: '#b00020' },
});
