import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText } from '../lib/theme';
import { DOCS, Doc } from '../lib/data';
import { ScreenHeader, IconBtn, Chip } from '../components/ui';

export default function DocsScreen({ navigation }: any) {
  const { c } = useTheme();
  const [sort, setSort] = useState<'recent' | 'name' | 'size'>('recent');

  const data = [...DOCS].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title);
    if (sort === 'size') return b.pages - a.pages;
    return 0;
  });

  const render = ({ item }: { item: Doc }) => (
    <Pressable onPress={() => navigation.navigate('PdfReader', { id: item.id })} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <View style={{ width: 48, height: 58, borderRadius: 10, backgroundColor: item.color + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="document-text" size={26} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[{ color: c.text, fontWeight: '700', fontSize: 15 }, rtlText]} numberOfLines={2}>{item.title}</Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 6 }}>
          <Text style={[{ color: c.textDim, fontSize: 12.5 }, rtlText]}>{item.pages} صفحة</Text>
          <Text style={{ color: c.textFaint }}>•</Text>
          <Text style={[{ color: c.textDim, fontSize: 12.5 }, rtlText]}>{item.size}</Text>
          <Text style={{ color: c.textFaint }}>•</Text>
          <Text style={[{ color: c.textDim, fontSize: 12.5 }, rtlText]}>{item.date}</Text>
        </View>
      </View>
      <IconBtn name="ellipsis-vertical" dim={34} size={18} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="المستندات" subtitle={`${DOCS.length} ملف PDF`} large right={<><IconBtn name="search" /><IconBtn name="add" bg={c.primary} color="#fff" /></>} />
      <View style={{ flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 20, paddingVertical: 10 }}>
        <Chip label="الأحدث" active={sort === 'recent'} onPress={() => setSort('recent')} />
        <Chip label="الاسم" active={sort === 'name'} onPress={() => setSort('name')} />
        <Chip label="الحجم" active={sort === 'size'} onPress={() => setSort('size')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(d) => d.id}
        renderItem={render}
        contentContainerStyle={{ padding: 20, paddingBottom: 170, maxWidth: 640, alignSelf: 'center', width: '100%' }}
      />
    </View>
  );
}
