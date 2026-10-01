import React, { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { fmtTime } from '../lib/data';
import { IconBtn } from '../components/ui';

export default function NowPlayingScreen({ navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { current, isPlaying, position, togglePlay, next, prev, seek } = useStore();
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!current) {
    navigation.goBack();
    return null;
  }

  const pct = position / current.duration;
  const art = Math.min(width - 80, 360);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* backdrop */}
      <Image source={{ uri: current.cover }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }} contentFit="cover" blurRadius={60} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420, backgroundColor: c.isDark ? 'rgba(12,13,18,0.82)' : 'rgba(244,245,249,0.78)' }} />

      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconBtn name="chevron-down" bg={c.card} onPress={() => navigation.goBack()} />
        <Text style={[{ color: c.textDim, fontWeight: '700', fontSize: 13 }]}>قيد التشغيل الآن</Text>
        <IconBtn name="ellipsis-horizontal" bg={c.card} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Image source={{ uri: current.cover }} style={{ width: art, height: art, borderRadius: 24, backgroundColor: c.cardAlt }} contentFit="cover" transition={250} />

        <View style={{ width: '100%', marginTop: 36 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: c.text, fontSize: 24, fontWeight: '800' }, rtlText]} numberOfLines={1}>{current.title}</Text>
              <Text style={[{ color: c.textDim, fontSize: 15, marginTop: 4 }, rtlText]} numberOfLines={1}>{current.artist}</Text>
            </View>
            <IconBtn name={liked ? 'heart' : 'heart-outline'} color={liked ? c.danger : c.text} bg={c.card} onPress={() => setLiked((l) => !l)} />
          </View>

          {/* progress */}
          <View style={{ marginTop: 26 }}>
            <View style={{ height: 22, justifyContent: 'center' }}>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: c.cardAlt, flexDirection: 'row-reverse' }}>
                <View style={{ width: `${pct * 100}%`, backgroundColor: c.primary, borderRadius: 3 }} />
              </View>
              <View style={{ position: 'absolute', right: `${pct * 100}%`, width: 16, height: 16, borderRadius: 8, backgroundColor: c.primary, marginRight: -8 }} />
              <View style={{ position: 'absolute', inset: 0, flexDirection: 'row-reverse' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Pressable key={i} style={{ flex: 1 }} onPress={() => seek(Math.round(((i + 0.5) / 12) * current.duration))} />
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: c.textDim, fontSize: 12 }}>{fmtTime(position)}</Text>
              <Text style={{ color: c.textDim, fontSize: 12 }}>{fmtTime(current.duration)}</Text>
            </View>
          </View>

          {/* controls */}
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
            <Pressable onPress={() => setShuffle((s) => !s)}>
              <Ionicons name="shuffle" size={24} color={shuffle ? c.primary : c.textDim} />
            </Pressable>
            <Pressable onPress={prev}>
              <Ionicons name="play-skip-back" size={34} color={c.text} />
            </Pressable>
            <Pressable onPress={togglePlay} style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
            </Pressable>
            <Pressable onPress={next}>
              <Ionicons name="play-skip-forward" size={34} color={c.text} />
            </Pressable>
            <Pressable onPress={() => setRepeat((r) => !r)}>
              <Ionicons name="repeat" size={24} color={repeat ? c.primary : c.textDim} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row-reverse', justifyContent: 'center', gap: 28, marginTop: 28, paddingBottom: insets.bottom + 10 }}>
            <Pressable style={{ alignItems: 'center', gap: 5 }}>
              <Ionicons name="list" size={22} color={c.textDim} />
              <Text style={{ color: c.textDim, fontSize: 11.5, fontWeight: '600' }}>قائمة الانتظار</Text>
            </Pressable>
            <Pressable style={{ alignItems: 'center', gap: 5 }}>
              <Ionicons name="phone-portrait-outline" size={22} color={c.textDim} />
              <Text style={{ color: c.textDim, fontSize: 11.5, fontWeight: '600' }}>شاشة القفل</Text>
            </Pressable>
            <Pressable style={{ alignItems: 'center', gap: 5 }}>
              <Ionicons name="timer-outline" size={22} color={c.textDim} />
              <Text style={{ color: c.textDim, fontSize: 11.5, fontWeight: '600' }}>مؤقت النوم</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
