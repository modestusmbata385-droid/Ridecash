import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.b} onPress={onPress}>
      <Text style={s.t}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  b: {
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginVertical: 8,
  },
  t: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
