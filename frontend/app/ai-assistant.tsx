import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `Tu es un assistant agricole expert pour les agriculteurs de Côte d'Ivoire.
Tu réponds en français, de façon concise et pratique.
Tu connais les cultures locales (maïs, manioc, cacao, café, tomate, igname, banane, coton),
l'élevage (volaille, bovin, porcin), les prix du marché en FCFA, les saisons agricoles ivoiriennes,
les engrais, les maladies des plantes et les bonnes pratiques agricoles.
Si la question n'est pas liée à l'agriculture, réponds poliment que tu es spécialisé en agriculture.`;

const SUGGESTIONS = [
  'Prix des tomates ?',
  'Comment cultiver le manioc ?',
  'Conseils engrais NPK',
  'Calendrier agricole CI',
];

async function askGroq(history: Msg[], userText: string): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.text })),
    { role: 'user', content: userText },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? 'Erreur API Groq');
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Pas de réponse.';
}

export default function AIAssistant() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    { id: '0', role: 'assistant', text: '👋 Bonjour ! Je suis votre assistant agricole IA. Posez-moi vos questions sur les cultures, l\'élevage ou les prix en Côte d\'Ivoire.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setTyping(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const answer = await askGroq(messages, text.trim());
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', text: answer }]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'e',
        role: 'assistant',
        text: `❌ Erreur : ${e.message}. Vérifiez votre clé API Groq.`,
      }]);
    } finally {
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.title}>🤖 Assistant Agricole</Text>
            <Text style={s.subtitle}>Propulsé par Groq · Llama 3.1</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.aiBubble]}>
              <Text style={[s.bubbleText, item.role === 'user' && { color: '#fff' }]}>
                {item.text}
              </Text>
            </View>
          )}
          ListFooterComponent={
            typing ? (
              <View style={[s.bubble, s.aiBubble, { paddingVertical: 14 }]}>
                <ActivityIndicator color="#2d6a4f" size="small" />
              </View>
            ) : null
          }
        />

        {/* Suggestions */}
        <View style={s.suggestions}>
          {SUGGESTIONS.map(sg => (
            <TouchableOpacity key={sg} style={s.suggChip} onPress={() => send(sg)}>
              <Text style={s.suggText}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Posez votre question..."
            placeholderTextColor="#aaa"
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            editable={!typing}
          />
          <TouchableOpacity style={[s.sendBtn, typing && { opacity: 0.5 }]} onPress={() => send(input)} disabled={typing}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f5f0' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e8e0d0',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#2d6a4f', fontWeight: '700' },
  headerCenter: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', color: '#1a3a2a' },
  subtitle: { fontSize: 11, color: '#aaa' },

  bubble: { maxWidth: '82%', padding: 12, borderRadius: 18 },
  userBubble: { backgroundColor: '#2d6a4f', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: {
    backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#e8e0d0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bubbleText: { fontSize: 14, color: '#1a3a2a', lineHeight: 21 },

  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  suggChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#b7dfc4' },
  suggText: { fontSize: 12, color: '#2d6a4f', fontWeight: '600' },

  inputRow: {
    flexDirection: 'row', padding: 12, gap: 8,
    backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e8e0d0',
  },
  input: {
    flex: 1, backgroundColor: '#f7f5f0', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a3a2a',
    borderWidth: 1, borderColor: '#e0dbd0',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center',
  },
});
