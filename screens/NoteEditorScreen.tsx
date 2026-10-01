import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { useStore, Note, NoteBlock } from '../lib/store';
import { IconBtn } from '../components/ui';

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/note-a/600/360',
  'https://picsum.photos/seed/note-b/600/360',
  'https://picsum.photos/seed/note-c/600/360',
  'https://picsum.photos/seed/note-d/600/360',
];
const COLORS = ['#5A4CF0', '#00C2A8', '#F5A623', '#F0434F', '#17B978', '#7C6FFF'];

export default function NoteEditorScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { notes, notebooks, saveNote, deleteNote } = useStore();
  const existing = notes.find((n) => n.id === route.params?.id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [blocks, setBlocks] = useState<NoteBlock[]>(existing?.blocks ?? [{ type: 'text', value: '' }]);
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const [notebook, setNotebook] = useState(existing?.notebook ?? notebooks[0]?.id ?? '');
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [imgPicker, setImgPicker] = useState(false);

  const updateBlock = (i: number, v: string) => setBlocks((b) => b.map((bl, idx) => (idx === i ? { ...bl, value: v } : bl)));
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));
  const addImage = (uri: string) => { setBlocks((b) => [...b, { type: 'image', value: uri }, { type: 'text', value: '' }]); setImgPicker(false); };

  const save = () => {
    const clean = blocks.filter((b) => (b.type === 'text' ? b.value.trim() : true));
    if (!title.trim() && clean.length === 0) { navigation.goBack(); return; }
    const note: Note = {
      id: existing?.id ?? 'n' + Date.now(),
      title: title.trim() || 'بدون عنوان',
      blocks: clean.length ? clean : [{ type: 'text', value: '' }],
      color,
      notebook,
      pinned,
      updated: Date.now(),
    };
    saveNote(note);
    navigation.goBack();
  };

  const del = () => { if (existing) deleteNote(existing.id); navigation.goBack(); };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ height: 4, backgroundColor: color }} />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconBtn name="chevron-forward" onPress={save} />
        <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
          <IconBtn name={pinned ? 'pin' : 'pin-outline'} color={pinned ? color : c.text} onPress={() => setPinned((p) => !p)} />
          {existing && <IconBtn name="trash-outline" color={c.danger} onPress={del} />}
          <IconBtn name="checkmark" bg={c.primary} color="#fff" onPress={save} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, maxWidth: 680, alignSelf: 'center', width: '100%' }}>
          {/* notebook selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row-reverse', marginBottom: 12 }}>
            {notebooks.map((nb) => (
              <Pressable key={nb.id} onPress={() => setNotebook(nb.id)} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: notebook === nb.id ? nb.color : c.card, borderWidth: 1, borderColor: notebook === nb.id ? nb.color : c.border }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: notebook === nb.id ? '#fff' : nb.color }} />
                <Text style={{ color: notebook === nb.id ? '#fff' : c.textDim, fontWeight: '700', fontSize: 13 }}>{nb.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="العنوان"
            placeholderTextColor={c.textFaint}
            style={[{ color: c.text, fontSize: 24, fontWeight: '800', marginBottom: 14 }, rtlText]}
          />

          {blocks.map((b, i) =>
            b.type === 'text' ? (
              <TextInput
                key={i}
                value={b.value}
                onChangeText={(v) => updateBlock(i, v)}
                placeholder={i === 0 ? 'ابدأ الكتابة هنا...' : 'أكمل الكتابة...'}
                placeholderTextColor={c.textFaint}
                multiline
                style={[{ color: c.text, fontSize: 16, lineHeight: 28, marginBottom: 12, minHeight: 60 }, rtlText]}
              />
            ) : (
              <View key={i} style={{ marginBottom: 14, borderRadius: 14, overflow: 'hidden' }}>
                <Image source={{ uri: b.value }} style={{ width: '100%', height: 200, backgroundColor: c.cardAlt }} contentFit="cover" transition={150} />
                <Pressable onPress={() => removeBlock(i)} style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="trash" size={16} color="#fff" />
                </Pressable>
              </View>
            )
          )}
        </ScrollView>

        {/* image picker tray */}
        {imgPicker && (
          <View style={{ backgroundColor: c.bgElevated, borderTopWidth: 1, borderColor: c.border, padding: 16 }}>
            <Text style={[{ color: c.textDim, fontWeight: '700', marginBottom: 10 }, rtlText]}>اختر صورة لإدراجها</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, flexDirection: 'row-reverse' }}>
              {SAMPLE_IMAGES.map((uri) => (
                <Pressable key={uri} onPress={() => addImage(uri)}>
                  <Image source={{ uri }} style={{ width: 90, height: 90, borderRadius: 12 }} contentFit="cover" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* toolbar */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 18, paddingHorizontal: 22, paddingVertical: 12, paddingBottom: insets.bottom + 10, backgroundColor: c.bgElevated, borderTopWidth: 1, borderColor: c.border }}>
          <Pressable onPress={() => setImgPicker((s) => !s)}><Ionicons name="image-outline" size={24} color={c.text} /></Pressable>
          <Pressable onPress={() => setBlocks((b) => [...b, { type: 'text', value: '• ' }])}><Ionicons name="list-outline" size={24} color={c.text} /></Pressable>
          <Pressable onPress={() => setBlocks((b) => [...b, { type: 'text', value: '☐ ' }])}><Ionicons name="checkbox-outline" size={24} color={c.text} /></Pressable>
          <View style={{ flex: 1 }} />
          {COLORS.map((col) => (
            <Pressable key={col} onPress={() => setColor(col)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: col, borderWidth: 2.5, borderColor: color === col ? c.text : 'transparent' }} />
          ))}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
