import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { PHOTOS } from '../lib/data';
import { IconBtn, EmptyState } from '../components/ui';

export default function VaultScreen({ navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { secureItems, addSecure, removeSecure, trash, restoreTrash, purgeTrash, moveToTrash } = useStore();
  const [tab, setTab] = useState<'secure' | 'trash'>('secure');
  const [picker, setPicker] = useState(false);

  const cols = 3;
  const gap = 4;
  const size = (Math.min(width, 640) - 40 - gap * (cols - 1)) / cols;

  const importPhotos = (uris: string[]) => {
    addSecure(uris.map((u, i) => ({ id: 'sec' + Date.now() + i, uri: u, type: 'photo' as const, name: 'صورة محمية', added: Date.now() })));
    setPicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 6, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconBtn name="chevron-forward" onPress={() => navigation.navigate('Tabs')} />
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Ionicons name="shield-checkmark" size={20} color={c.primary} />
          <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>المساحة المحمية</Text>
        </View>
        {tab === 'secure' ? <IconBtn name="add" bg={c.primary} color="#fff" onPress={() => setPicker(true)} /> : <View style={{ width: 40 }} />}
      </View>

      {/* segmented */}
      <View style={{ flexDirection: 'row-reverse', margin: 20, marginTop: 10, backgroundColor: c.cardAlt, borderRadius: 14, padding: 4 }}>
        {([['secure', 'المجلد الآمن', 'lock-closed'], ['trash', 'سلة المحذوفات', 'trash']] as const).map(([k, l, ic]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 11, borderRadius: 11, backgroundColor: tab === k ? c.bgElevated : 'transparent' }}>
            <Ionicons name={ic as any} size={16} color={tab === k ? c.primary : c.textDim} />
            <Text style={{ color: tab === k ? c.text : c.textDim, fontWeight: '700', fontSize: 14 }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'secure' ? (
        secureItems.length === 0 ? (
          <EmptyState icon="lock-closed-outline" title="المجلد الآمن فارغ" sub="أضف صورك وفيديوهاتك الخاصة هنا — مشفّرة محلياً بالكامل" />
        ) : (
          <FlatList
            data={secureItems}
            keyExtractor={(i) => i.id}
            numColumns={cols}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, maxWidth: 640, alignSelf: 'center', width: '100%' }}
            columnWrapperStyle={{ gap }}
            ItemSeparatorComponent={() => <View style={{ height: gap }} />}
            renderItem={({ item }) => (
              <Pressable
                onLongPress={() => { moveToTrash({ id: 'tr' + Date.now(), uri: item.uri, kind: 'photo', name: item.name, deleted: Date.now() }); removeSecure(item.id); }}
                style={{ width: size, height: size }}
              >
                <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: c.cardAlt }} contentFit="cover" transition={150} />
                <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.55)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="lock-closed" size={11} color="#fff" />
                </View>
              </Pressable>
            )}
            ListHeaderComponent={<Text style={[{ color: c.textDim, fontSize: 12.5, marginBottom: 12 }, rtlText]}>اضغط مطولاً على أي عنصر لنقله إلى سلة المحذوفات.</Text>}
          />
        )
      ) : trash.length === 0 ? (
        <EmptyState icon="trash-outline" title="سلة المحذوفات فارغة" sub="العناصر المحذوفة تبقى هنا 30 يوماً قبل الحذف النهائي" />
      ) : (
        <FlatList
          data={trash}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, maxWidth: 640, alignSelf: 'center', width: '100%' }}
          ListHeaderComponent={
            <Pressable onPress={() => purgeTrash()} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: c.danger }}>
              <Ionicons name="trash" size={16} color={c.danger} />
              <Text style={{ color: c.danger, fontWeight: '700' }}>إفراغ السلة نهائياً</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 10, marginBottom: 10 }}>
              <Image source={{ uri: item.uri }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: c.cardAlt }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]}>{item.name}</Text>
                <Text style={[{ color: c.textFaint, fontSize: 12, marginTop: 3 }, rtlText]}>حُذف {new Date(item.deleted).toLocaleDateString('ar')}</Text>
              </View>
              <Pressable onPress={() => restoreTrash(item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: c.primarySoft }}>
                <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>استرجاع</Text>
              </Pressable>
              <Pressable onPress={() => purgeTrash(item.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={c.textFaint} />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* import picker */}
      <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }} onPress={() => setPicker(false)}>
          <Pressable style={{ backgroundColor: c.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20 }} onPress={() => {}}>
            <Text style={[{ color: c.text, fontWeight: '800', fontSize: 17, marginBottom: 14 }, rtlText]}>اختر صوراً لنقلها إلى المجلد الآمن</Text>
            <FlatList
              data={PHOTOS.slice(0, 12)}
              keyExtractor={(p) => p.id}
              numColumns={4}
              columnWrapperStyle={{ gap: 6 }}
              ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
              renderItem={({ item }) => (
                <Pressable onPress={() => importPhotos([item.uri])} style={{ flex: 1 }}>
                  <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }} contentFit="cover" />
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
