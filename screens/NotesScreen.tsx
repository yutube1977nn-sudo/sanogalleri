import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText } from '../lib/theme';
import { useStore, Note } from '../lib/store';
import { ScreenHeader, IconBtn, EmptyState, Chip } from '../components/ui';

const NB_COLORS = ['#5A4CF0', '#00C2A8', '#F5A623', '#F0434F', '#17B978', '#7C6FFF'];

export default function NotesScreen({ navigation }: any) {
  const { c } = useTheme();
  const { notes, notebooks, addNotebook } = useStore();
  const [active, setActive] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [nbModal, setNbModal] = useState(false);
  const [nbName, setNbName] = useState('');
  const [nbColor, setNbColor] = useState(NB_COLORS[0]);

  const filtered = useMemo(() => {
    let list = active === 'all' ? notes : notes.filter((n) => n.notebook === active);
    if (search) list = list.filter((n) => n.title.includes(search) || n.blocks.some((b) => b.type === 'text' && b.value.includes(search)));
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
  }, [notes, active, search]);

  const preview = (n: Note) => {
    const t = n.blocks.find((b) => b.type === 'text');
    return t?.value ?? '';
  };
  const firstImg = (n: Note) => n.blocks.find((b) => b.type === 'image')?.value;

  const renderNote = ({ item }: { item: Note }) => {
    const img = firstImg(item);
    return (
      <Pressable onPress={() => navigation.navigate('NoteEditor', { id: item.id })} style={{ flex: 1, margin: 6 }}>
        <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
          <View style={{ height: 4, backgroundColor: item.color }} />
          {img && <Image source={{ uri: img }} style={{ width: '100%', height: 96, backgroundColor: c.cardAlt }} contentFit="cover" transition={150} />}
          <View style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
              {item.pinned && <Ionicons name="pin" size={13} color={item.color} />}
              <Text style={[{ color: c.text, fontWeight: '800', fontSize: 15, flex: 1 }, rtlText]} numberOfLines={1}>{item.title}</Text>
            </View>
            <Text style={[{ color: c.textDim, fontSize: 13, marginTop: 6, lineHeight: 19 }, rtlText]} numberOfLines={4}>{preview(item)}</Text>
            <Text style={[{ color: c.textFaint, fontSize: 11, marginTop: 10 }, rtlText]}>{new Date(item.updated).toLocaleDateString('ar')}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="الملاحظات" subtitle={`${notes.length} ملاحظة • ${notebooks.length} دفتر`} large right={<IconBtn name="create" bg={c.primary} color="#fff" onPress={() => navigation.navigate('NoteEditor', {})} />} />

      <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border }}>
          <Ionicons name="search" size={18} color={c.textFaint} />
          <TextInput value={search} onChangeText={setSearch} placeholder="ابحث في الملاحظات..." placeholderTextColor={c.textFaint} style={[{ flex: 1, color: c.text, paddingVertical: 11, paddingHorizontal: 10, fontSize: 14.5 }, rtlText]} />
        </View>
      </View>

      <View style={{ paddingVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row-reverse' }}>
          <Chip label="الكل" icon="albums" active={active === 'all'} onPress={() => setActive('all')} />
          {notebooks.map((nb) => (
            <Chip key={nb.id} label={nb.name} active={active === nb.id} onPress={() => setActive(nb.id)} />
          ))}
          <Pressable onPress={() => setNbModal(true)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={20} color={c.textDim} />
          </Pressable>
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="document-text-outline" title="لا توجد ملاحظات" sub="اضغط على زر الكتابة لإنشاء ملاحظتك الأولى" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => n.id}
          numColumns={2}
          renderItem={renderNote}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 170, maxWidth: 680, alignSelf: 'center', width: '100%' }}
        />
      )}

      <Modal visible={nbModal} transparent animationType="fade" onRequestClose={() => setNbModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'center', padding: 28 }} onPress={() => setNbModal(false)}>
          <Pressable style={{ backgroundColor: c.bgElevated, borderRadius: 22, padding: 22 }} onPress={() => {}}>
            <Text style={[{ color: c.text, fontWeight: '800', fontSize: 18, marginBottom: 16 }, rtlText]}>دفتر ملاحظات جديد</Text>
            <TextInput value={nbName} onChangeText={setNbName} placeholder="اسم الدفتر" placeholderTextColor={c.textFaint} style={[{ backgroundColor: c.cardAlt, borderRadius: 12, padding: 14, color: c.text, fontSize: 15, marginBottom: 16 }, rtlText]} />
            <View style={{ flexDirection: 'row-reverse', gap: 10, marginBottom: 20 }}>
              {NB_COLORS.map((col) => (
                <Pressable key={col} onPress={() => setNbColor(col)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: col, borderWidth: 3, borderColor: nbColor === col ? c.text : 'transparent' }} />
              ))}
            </View>
            <Pressable
              onPress={() => { if (nbName.trim()) { addNotebook(nbName.trim(), nbColor); setNbName(''); setNbModal(false); } }}
              style={{ backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>إنشاء الدفتر</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
