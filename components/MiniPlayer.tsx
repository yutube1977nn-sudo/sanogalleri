import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';

export default function MiniPlayer({ bottom }: { bottom: number }) {
  const { c } = useTheme();
  const nav: any = useNavigation();
  const { current, isPlaying, togglePlay, next, position } = useStore();
  if (!current) return null;
  const pct = position / current.duration;

  return (
    <Pressable
      onPress={() => nav.navigate('NowPlaying')}
      style={{ position: 'absolute', left: 10, right: 10, bottom, borderRadius: 16, overflow: 'hidden', backgroundColor: c.bgElevated, borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
    >
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', padding: 8, gap: 10 }}>
        <Image source={{ uri: current.cover }} style={{ width: 44, height: 44, borderRadius: 10 }} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]} numberOfLines={1}>{current.title}</Text>
          <Text style={[{ color: c.textDim, fontSize: 12 }, rtlText]} numberOfLines={1}>{current.artist}</Text>
        </View>
        <Pressable onPress={togglePlay} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={c.text} />
        </Pressable>
        <Pressable onPress={next} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="play-skip-forward" size={22} color={c.text} />
        </Pressable>
      </View>
      <View style={{ height: 2.5, backgroundColor: c.cardAlt, flexDirection: 'row-reverse' }}>
        <View style={{ width: `${pct * 100}%`, backgroundColor: c.primary }} />
      </View>
    </Pressable>
  );
}
