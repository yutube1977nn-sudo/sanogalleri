import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, useWindowDimensions, RefreshControl, TextInput } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { PHOTOS, ALBUMS, Photo } from '../lib/data';
import { ScreenHeader, IconBtn, Chip, EmptyState } from '../components/ui';

type Tab = 'all' | 'albums' | 'fav';

export default function PhotosScreen({ navigation }: any) {
  const { c } = useTheme();
  const { favorites } = useStore();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const gap = 3;
  const cols = 3;
  const size = (Math.min(width, 640) - gap * (cols - 1)) / cols;

  const favPhotos = useMemo(() => PHOTOS.filter((p) => favorites.includes(p.id)), [favorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const openPhoto = (p: Photo, list: Photo[]) =>
    navigation.navigate('PhotoViewer', { id: p.id, ids: list.map((x) => x.id) });

  const renderPhoto = ({ item }: { item: Photo }) => (
    <Pressable onPress={() => openPhoto(item, tab === 'fav' ? favPhotos : PHOTOS)} style={{ margin: gap / 2 }}>
      <Image source={{ uri: item.uri }} style={{ width: size - gap, height: size - gap, borderRadius: 6, backgroundColor: c.cardAlt }} contentFit="cover" transition={200} />
      {favorites.includes(item.id) && (
        <View style={{ position: 'absolute', top: 6, right: 6 }}>
          <Ionicons name="heart" size={15} color="#fff" />
        </View>
      )}
    </Pressable>
  );

  const filtered = useMemo(() => {
    const base = tab === 'fav' ? favPhotos : PHOTOS;
    if (!search) return base;
    return base.filter((p) => {
      const al = ALBUMS.find((a) => a.key === p.album);
      return (al?.name ?? '').includes(search) || p.date.includes(search);
    });
  }, [tab, favPhotos, search]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader
        title="الصور"
        subtitle={`${PHOTOS.length} صورة • ${favorites.length} مفضلة`}
        large
        right={
          <>
            <IconBtn name="settings-outline" onPress={() => navigation.navigate('Settings')} />
            <IconBtn name="search" onPress={() => setShowSearch((s) => !s)} />
            <IconBtn name="lock-closed" bg={c.primary} color="#fff" onPress={() => navigation.navigate('VaultGate')} />
          </>
        }
      />

      {showSearch && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border }}>
            <Ionicons name="search" size={18} color={c.textFaint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="ابحث في الصور والمجلدات..."
              placeholderTextColor={c.textFaint}
              style={[{ flex: 1, color: c.text, paddingVertical: 12, paddingHorizontal: 10, fontSize: 15 }, rtlText]}
            />
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 20, paddingVertical: 10 }}>
        <Chip label="الكل" icon="images" active={tab === 'all'} onPress={() => setTab('all')} />
        <Chip label="المجلدات" icon="folder" active={tab === 'albums'} onPress={() => setTab('albums')} />
        <Chip label="المفضلة" icon="heart" active={tab === 'fav'} onPress={() => setTab('fav')} />
      </View>

      {tab === 'albums' ? (
        <FlatList
          data={ALBUMS}
          keyExtractor={(a) => a.key}
          numColumns={2}
          contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
          renderItem={({ item }) => {
            const ph = PHOTOS.filter((p) => p.album === item.key);
            const count = item.key === 'favorites' ? favPhotos.length : ph.length;
            const cover = (item.key === 'favorites' ? favPhotos : ph)[0];
            return (
              <Pressable
                onPress={() => {
                  const list = item.key === 'favorites' ? favPhotos : ph;
                  if (list[0]) openPhoto(list[0], list);
                }}
                style={{ flex: 1 }}
              >
                <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: c.cardAlt, aspectRatio: 1 }}>
                  {cover ? (
                    <Image source={{ uri: cover.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={item.icon as any} size={34} color={c.textFaint} />
                    </View>
                  )}
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 58, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                  <View style={{ position: 'absolute', bottom: 10, right: 12, left: 12 }}>
                    <Text style={[{ color: '#fff', fontWeight: '800', fontSize: 15 }, rtlText]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }, rtlText]}>{count} عنصر</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={tab === 'fav' ? 'heart-outline' : 'images-outline'} title={tab === 'fav' ? 'لا توجد صور مفضلة' : 'لا توجد نتائج'} sub={tab === 'fav' ? 'اضغط على القلب في أي صورة لإضافتها هنا' : 'جرّب كلمة بحث أخرى'} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          numColumns={cols}
          renderItem={renderPhoto}
          contentContainerStyle={{ paddingHorizontal: gap / 2, paddingBottom: 120, alignSelf: 'center', maxWidth: 640 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
          ListHeaderComponent={
            <Text style={[{ color: c.textDim, fontSize: 13, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 10 }, rtlText]}>
              {tab === 'fav' ? 'صورك المفضلة' : 'كل الصور'}
            </Text>
          }
        />
      )}
    </View>
  );
}
