import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  rowUser:  { justifyContent: 'flex-end' },
  rowAI:    { justifyContent: 'flex-start' },
  avatar:   {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 14 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  bubbleAI: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.fg,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  text:     { fontSize: 13, lineHeight: 21, fontWeight: '500' },
  textUser: { color: Colors.white },
  textAI:   { color: Colors.fg },
});
