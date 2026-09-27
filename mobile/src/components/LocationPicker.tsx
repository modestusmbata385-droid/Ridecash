import React from 'react';
import { Modal, View, Text } from 'react-native';

export default function LocationPicker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Location Picker</Text>
        <Text onPress={onClose}>Funga</Text>
      </View>
    </Modal>
  );
}
