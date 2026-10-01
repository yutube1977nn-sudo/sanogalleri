import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { VIDEOS, fmtTime } from '../lib/data';
import { IconBtn } from '../components/ui';

export default function VideoPlayerScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const video = VIDEOS.find((v) => v.id === route.params?.id) ?? VIDEOS[0];

  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);
  const [rate, setRate] = useState(1);
  const [controls, setControls] = useState(true);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setPos((p) => (p + rate >= video.seconds ? video.seconds : p + rate));
      }, 1000);
    }
    return () => timer.current && clearInterval(timer.current);
  }, [playing, rate, video.seconds]);

  const pct = pos / video.seconds;
  const barW = Math.min(width, 640) - 40;

  const seekTo = (fraction: number) => setPos(Math.max(0, Math.min(video.seconds, Math.round(video.seconds * fraction))));

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Pressable style={{ flex: 1 }} onPress={() => setControls((s) => !s)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: video.thumb }} style={{ width: Math.min(width, 640), aspectRatio: 16 / 9 }} contentFit="contain" />
          {playing && <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />}
        </View>

        {controls && (
          <>
            {/* top */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <IconBtn name="chevron-forward" bg="rgba(255,255,255,0.15)" color="#fff" onPress={() => navigation.goBack()} />
              <Text style={[{ color: '#fff', fontWeight: '700', fontSize: 15, flex: 1, marginHorizontal: 12 }, rtlText]} numberOfLines={1}>{video.title}</Text>
              <IconBtn name="ellipsis-vertical" bg="rgba(255,255,255,0.15)" color="#fff" />
            </View>

            {/* center controls */}
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
              <Pressable onPress={() => seekTo(Math.max(0, pct - 0.1))}>
                <Ionicons name="play-back" size={34} color="#fff" />
              </Pressable>
              <Pressable onPress={() => setPlaying((p) => !p)} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={playing ? 'pause' : 'play'} size={36} color="#fff" style={{ marginLeft: playing ? 0 : 4 }} />
              </Pressable>
              <Pressable onPress={() => seekTo(Math.min(1, pct + 0.1))}>
                <Ionicons name="play-forward" size={34} color="#fff" />
              </Pressable>
            </View>

            {/* bottom */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: insets.bottom + 16, paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{fmtTime(pos)}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>{fmtTime(video.seconds)}</Text>
              </View>
              {/* progress */}
              <View style={{ height: 24, justifyContent: 'center' }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', flexDirection: 'row-reverse' }}>
                  <View style={{ width: `${pct * 100}%`, backgroundColor: c.primary, borderRadius: 2 }} />
                </View>
                <View style={{ position: 'absolute', right: `${pct * 100}%`, width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', marginRight: -7 }} />
                {/* tap zones */}
                <View style={{ position: 'absolute', inset: 0, flexDirection: 'row-reverse' }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Pressable key={i} style={{ flex: 1 }} onPress={() => seekTo((i + 0.5) / 10)} />
                  ))}
                </View>
              </View>
              {/* options */}
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 12 }}>
                <Pressable onPress={() => setRate((r) => (r >= 2 ? 0.5 : r + 0.5))} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="speedometer-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{rate}x</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="volume-high" size={18} color="#fff" />
                </Pressable>
                <Pressable style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="scan-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>ملء الشاشة</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}
