import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { AI_SUGGESTIONS, getAIResponse } from '@/data/mockData';
import ChatBubble from '@/components/ChatBubble';
import type { Message } from '@/constants/index';

const INITIAL: Message[] = [
  {
    id: '0', role: 'assistant',
    text: "Bonjour ! Je suis votre assistant agricole. Posez-moi une question sur vos cultures, votre élevage ou la gestion de votre exploitation. 🌱",
  },
];

export default function AIAssistantScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const listRef  = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input,    setInput]    = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const send = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: getAIResponse(text) };
      setMessages(prev => [...prev, aiMsg]);
    }, 1400);
  };

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>

        {/* ── Header ── */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Feather name="arrow-left" size={18} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.agentInfo}>
                <View style={styles.agentIcon}>
                  <Text style={{ fontSize: 18 }}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.agentName}>Assistant AgroIA</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusTxt}>En ligne · Répond instantanément</Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            messages.length === 1 ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>Questions fréquentes</Text>
                {AI_SUGGESTIONS.map(s => (
                  <TouchableOpacity key={s} style={styles.suggestionBtn} onPress={() => send(s)}>
                    <Text style={{ fontSize: 16 }}>💡</Text>
                    <Text style={styles.suggestionTxt}>{s}</Text>
                    <Feather name="chevron-right" size={14} color={Colors.mutedFg} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ChatBubble role={item.role} text={item.text} />
          )}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.typingAvatar}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
                <View style={styles.typingBubble}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Input ── */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.inputHint}>💡 Posez votre question agricole</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Quel engrais pour le maïs ?"
              placeholderTextColor={Colors.mutedFg}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={() => send(input)}
              disabled={!input.trim() || isTyping}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={input.trim() && !isTyping ? [Colors.primaryLight, Colors.primary] : [Colors.muted, Colors.muted]}
                style={styles.sendGrad}
              >
                <Feather name="send" size={18} color={input.trim() && !isTyping ? Colors.white : Colors.mutedFg} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:    { paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 },
  agentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentIcon: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  agentName:  { fontSize: 16, fontWeight: '800', color: Colors.white },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' },
  statusTxt:  { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  list:       { padding: 16, paddingBottom: 24 },
  suggestions:{ marginBottom: 16 },
  suggestionsTitle: {
    fontSize: 12, fontWeight: '700', color: Colors.mutedFg,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8,
  },
  suggestionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 6,
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  suggestionTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.fg },
  typingRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  typingAvatar: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.white, borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  inputBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingTop: 10,
  },
  inputHint:       { fontSize: 11, color: Colors.mutedFg, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  inputRow:        { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: Colors.bg,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, color: Colors.fg, fontWeight: '500',
  },
  sendBtn:         { borderRadius: 14, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.7 },
  sendGrad:        { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
