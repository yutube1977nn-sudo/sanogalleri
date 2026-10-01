import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText } from '../lib/theme';
import { VIDEOS, VideoItem } from '../lib/data';
import { ScreenHeader, IconBtn, Chip } from '../components/ui';

export default function VideosScreen({ navigation }: any) {
  const { c } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const folders = ['الكل', ...Array.from(new Set(VIDEOS.map((v) => v.folder)))];
  const [folder, setFolder] = useState('الكل');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const data = folder === 'الكل' ? VIDEOS : VIDEOS.filter((v) => v.folder === folder);

  const render = ({ item }: { item: VideoItem }) => (
    <Pressable onPress={() => navigation.navigate('VideoPlayer', { id: item.id })} style={{ marginBottom: 14 }}>
      <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: item.thumb }} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: c.cardAlt }} contentFit="cover" transition={200} />
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="play" size={26} color="#fff" style={{ marginLeft: 3 }} />
            </View>
          </View>
          <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{item.duration}</Text>
          </View>
        </View>
        <View style={{ padding: 14 }}>
          <Text style={[{ color: c.text, fontWeight: '700', fontSize: 15.5 }, rtlText]} numberOfLines={1}>{item.title}</Text>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Ionicons name="folder-outline" size={13} color={c.textFaint} />
            <Text style={[{ color: c.textDim, fontSize: 12.5 }, rtlText]}>{item.folder} • {item.size}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="الفيديوهات" subtitle={`${VIDEOS.length} فيديو`} large right={<IconBtn name="search" />} />
      <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        <FlatList
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          data={folders}
          keyExtractor={(x) => x}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => <Chip label={item} active={folder === item} onPress={() => setFolder(item)} />}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(v) => v.id}
        renderItem={render}
        contentContainerStyle={{ padding: 20, paddingBottom: 120, maxWidth: 640, alignSelf: 'center', width: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
      />
    </View>
  );
}
