import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { TRACKS, Track, fmtTime } from '../lib/data';
import { ScreenHeader, IconBtn } from '../components/ui';

export default function MusicScreen({ navigation }: any) {
  const { c } = useTheme();
  const { current, isPlaying, playTrack, playlists } = useStore();
  const [view, setView] = useState<'songs' | 'playlists'>('songs');

  const Row = ({ item, index }: { item: Track; index: number }) => {
    const active = current?.id === item.id;
    return (
      <Pressable onPress={() => { playTrack(item, TRACKS); navigation.navigate('NowPlaying'); }} style={{ flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20, gap: 12 }}>
        <Image source={{ uri: item.cover }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: c.cardAlt }} contentFit="cover" transition={150} />
        <View style={{ flex: 1 }}>
          <Text style={[{ color: active ? c.primary : c.text, fontWeight: '700', fontSize: 15 }, rtlText]} numberOfLines={1}>{item.title}</Text>
          <Text style={[{ color: c.textDim, fontSize: 12.5, marginTop: 2 }, rtlText]} numberOfLines={1}>{item.artist} • {item.album}</Text>
        </View>
        {active && isPlaying ? (
          <Ionicons name="musical-notes" size={18} color={c.primary} />
        ) : (
          <Text style={{ color: c.textFaint, fontSize: 12.5 }}>{fmtTime(item.duration)}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="الموسيقى" subtitle={`${TRACKS.length} أغنية`} large right={<><IconBtn name="search" /><IconBtn name="shuffle" bg={c.primary} color="#fff" onPress={() => { playTrack(TRACKS[Math.floor(Math.random() * TRACKS.length)], TRACKS); navigation.navigate('NowPlaying'); }} /></>} />

      <View style={{ flexDirection: 'row-reverse', gap: 24, paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}>
        {([['songs', 'الأغاني'], ['playlists', 'قوائم التشغيل']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setView(k)} style={{ paddingBottom: 8 }}>
            <Text style={{ color: view === k ? c.text : c.textFaint, fontWeight: '800', fontSize: 16 }}>{l}</Text>
            {view === k && <View style={{ height: 3, borderRadius: 2, backgroundColor: c.primary, marginTop: 6 }} />}
          </Pressable>
        ))}
      </View>

      {view === 'songs' ? (
        <FlatList
          data={TRACKS}
          keyExtractor={(t) => t.id}
          renderItem={Row}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 170, maxWidth: 640, alignSelf: 'center', width: '100%' }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 170, maxWidth: 640, alignSelf: 'center', width: '100%' }}>
          {playlists.map((pl) => {
            const tracks = TRACKS.filter((t) => pl.trackIds.includes(t.id));
            return (
              <Pressable key={pl.id} onPress={() => { if (tracks[0]) { playTrack(tracks[0], tracks); navigation.navigate('NowPlaying'); } }} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12, marginBottom: 12 }}>
                <View style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', backgroundColor: c.primarySoft, flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
                  {tracks.slice(0, 4).map((t) => (
                    <Image key={t.id} source={{ uri: t.cover }} style={{ width: 32, height: 32 }} contentFit="cover" />
                  ))}
                  {tracks.length === 0 && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="musical-notes" size={24} color={c.primary} /></View>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: c.text, fontWeight: '800', fontSize: 16 }, rtlText]}>{pl.name}</Text>
                  <Text style={[{ color: c.textDim, fontSize: 13, marginTop: 3 }, rtlText]}>{tracks.length} أغنية</Text>
                </View>
                <Ionicons name="play-circle" size={34} color={c.primary} />
              </Pressable>
            );
          })}
          <Pressable onPress={() => {}} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.border, paddingVertical: 16, marginTop: 4 }}>
            <Ionicons name="add" size={20} color={c.textDim} />
            <Text style={{ color: c.textDim, fontWeight: '700' }}>إنشاء قائمة تشغيل</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
