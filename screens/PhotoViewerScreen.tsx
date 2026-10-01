import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { PHOTOS } from '../lib/data';
import { IconBtn } from '../components/ui';

interface Adjust {
  brightness: number; // -100..100
  contrast: number;
  saturation: number;
  warmth: number;
}
const DEFAULT: Adjust = { brightness: 0, contrast: 0, saturation: 0, warmth: 0 };

const FILTERS = [
  { name: 'أصلي', overlay: 'transparent', op: 0 },
  { name: 'دافئ', overlay: '#FF8A3D', op: 0.16 },
  { name: 'بارد', overlay: '#3D8BFF', op: 0.16 },
  { name: 'كلاسيك', overlay: '#5A3E1B', op: 0.22 },
  { name: 'أبيض وأسود', overlay: '#000000', op: 0.0, mono: true },
  { name: 'حيوي', overlay: '#FF3DAE', op: 0.1 },
];

const AI_TOOLS = [
  { key: 'auto', label: 'تحسين تلقائي', icon: 'sparkles' },
  { key: 'denoise', label: 'إزالة الشوائب', icon: 'water' },
  { key: 'upscale', label: 'رفع الدقة', icon: 'expand' },
  { key: 'face', label: 'تنعيم الوجه', icon: 'happy' },
  { key: 'brows', label: 'تعديل الحواجب', icon: 'eye' },
];

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const trackW = Math.min(width, 640) - 40;
  const pct = (value + 100) / 200;
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={[{ color: '#fff', fontWeight: '700', fontSize: 14 }, rtlText]}>{label}</Text>
        <Text style={{ color: c.primary, fontWeight: '800', fontSize: 14 }}>{value > 0 ? `+${value}` : value}</Text>
      </View>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <View style={{ position: 'absolute', right: 0, height: 4, borderRadius: 2, width: `${pct * 100}%`, backgroundColor: c.primary }} />
        <View
          style={{ position: 'absolute', right: `${pct * 100}%`, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', marginRight: -10, borderWidth: 3, borderColor: c.primary }}
        />
      </View>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10 }}>
        {[-100, -50, 0, 50, 100].map((v) => (
          <Pressable key={v} onPress={() => onChange(v)} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: value === v ? c.primary : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function PhotoViewerScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { favorites, toggleFav, addSecure, moveToTrash } = useStore();

  const ids: string[] = route.params?.ids ?? PHOTOS.map((p) => p.id);
  const [idx, setIdx] = useState(Math.max(0, ids.indexOf(route.params?.id)));
  const photo = PHOTOS.find((p) => p.id === ids[idx]) ?? PHOTOS[0];

  const [editing, setEditing] = useState(false);
  const [adjust, setAdjust] = useState<Adjust>(DEFAULT);
  const [filter, setFilter] = useState(0);
  const [aiActive, setAiActive] = useState<string[]>([]);
  const [tab, setTab] = useState<'filters' | 'adjust' | 'ai'>('ai');
  const toast = useRef(new Animated.Value(0)).current;
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (m: string) => {
    setToastMsg(m);
    Animated.sequence([
      Animated.timing(toast, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toast, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const imgSize = Math.min(width, 640);
  const f = FILTERS[filter];
  const isFav = favorites.includes(photo.id);

  // simulate brightness via opacity, saturation/warmth via overlays
  const brightnessOpacity = 1 + adjust.brightness / 250;
  const warmOverlay = adjust.warmth > 0 ? '#FF8A3D' : '#3D8BFF';
  const warmOp = Math.abs(adjust.warmth) / 400;
  const contrastOp = Math.abs(adjust.contrast) / 350;

  const toggleAi = (k: string) => {
    setAiActive((prev) => {
      const on = prev.includes(k);
      const next = on ? prev.filter((x) => x !== k) : [...prev, k];
      if (!on) {
        const tool = AI_TOOLS.find((t) => t.key === k);
        showToast(`تم تطبيق: ${tool?.label} ✨`);
        if (k === 'auto') setAdjust({ brightness: 18, contrast: 22, saturation: 16, warmth: 10 });
      }
      return next;
    });
  };

  const goSecure = () => {
    addSecure([{ id: 'sec' + Date.now(), uri: photo.uri, type: 'photo', name: 'صورة محمية', added: Date.now() }]);
    showToast('تم النقل إلى المجلد الآمن 🔒');
    setTimeout(() => navigation.goBack(), 700);
  };
  const del = () => {
    moveToTrash({ id: 'tr' + Date.now(), uri: photo.uri, kind: 'photo', name: 'صورة', deleted: Date.now() });
    showToast('تم النقل إلى سلة المحذوفات');
    setTimeout(() => navigation.goBack(), 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* top bar */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 }}>
        <IconBtn name="chevron-forward" bg="rgba(255,255,255,0.12)" color="#fff" onPress={() => navigation.goBack()} />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{idx + 1} / {ids.length}</Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
          {!editing && (
            <IconBtn name={isFav ? 'heart' : 'heart-outline'} bg="rgba(255,255,255,0.12)" color={isFav ? c.danger : '#fff'} onPress={() => toggleFav(photo.id)} />
          )}
        </View>
      </View>

      {/* image */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: imgSize, height: imgSize, position: 'relative' }}>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: '100%', height: '100%', opacity: brightnessOpacity > 1 ? 1 : brightnessOpacity }}
            contentFit="contain"
            transition={200}
          />
          {/* brightness boost overlay */}
          {brightnessOpacity > 1 && (
            <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', opacity: (brightnessOpacity - 1) }} />
          )}
          {/* filter overlay */}
          {f.op > 0 && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: f.overlay, opacity: f.op }} />}
          {(f as any).mono && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: '#808080', opacity: 0.55 }} />}
          {/* warmth */}
          {warmOp > 0 && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: warmOverlay, opacity: warmOp }} />}
          {/* contrast */}
          {contrastOp > 0 && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: adjust.contrast > 0 ? '#000' : '#fff', opacity: contrastOp }} />}
          {aiActive.includes('upscale') && (
            <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: c.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>4K محسّن</Text>
            </View>
          )}
        </View>
      </View>

      {/* bottom controls */}
      {!editing ? (
        <View style={{ paddingBottom: insets.bottom + 16, paddingHorizontal: 20, flexDirection: 'row-reverse', justifyContent: 'space-around' }}>
          {[
            { icon: 'color-wand', label: 'تعديل', onPress: () => setEditing(true) },
            { icon: 'lock-closed', label: 'آمن', onPress: goSecure },
            { icon: 'share-social', label: 'مشاركة', onPress: () => showToast('جاري تجهيز المشاركة...') },
            { icon: 'trash', label: 'حذف', onPress: del },
          ].map((b) => (
            <Pressable key={b.label} onPress={b.onPress} style={{ alignItems: 'center', gap: 6 }}>
              <Ionicons name={b.icon as any} size={24} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ backgroundColor: '#111219', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: insets.bottom + 14 }}>
          {/* editor tab switch */}
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, marginBottom: 14, paddingHorizontal: 20 }}>
            {([['ai', 'ذكاء اصطناعي', 'sparkles'], ['filters', 'فلاتر', 'color-filter'], ['adjust', 'تعديلات', 'options']] as const).map(([k, lbl, ic]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: tab === k ? c.primary : 'rgba(255,255,255,0.08)' }}>
                <Ionicons name={ic as any} size={15} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{lbl}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ paddingHorizontal: 20, minHeight: 190 }}>
            {tab === 'adjust' && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 230 }}>
                <Slider label="السطوع" value={adjust.brightness} onChange={(v) => setAdjust({ ...adjust, brightness: v })} />
                <Slider label="التباين" value={adjust.contrast} onChange={(v) => setAdjust({ ...adjust, contrast: v })} />
                <Slider label="التشبع" value={adjust.saturation} onChange={(v) => setAdjust({ ...adjust, saturation: v })} />
                <Slider label="الدفء" value={adjust.warmth} onChange={(v) => setAdjust({ ...adjust, warmth: v })} />
              </ScrollView>
            )}
            {tab === 'filters' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ direction: 'rtl' } as any}>
                <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                  {FILTERS.map((ff, i) => (
                    <Pressable key={ff.name} onPress={() => setFilter(i)} style={{ alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: filter === i ? c.primary : 'transparent' }}>
                        <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        {ff.op > 0 && <View style={{ position: 'absolute', inset: 0, backgroundColor: ff.overlay, opacity: ff.op }} />}
                        {(ff as any).mono && <View style={{ position: 'absolute', inset: 0, backgroundColor: '#808080', opacity: 0.55 }} />}
                      </View>
                      <Text style={{ color: filter === i ? c.primary : '#fff', fontSize: 12, fontWeight: '700' }}>{ff.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
            {tab === 'ai' && (
              <View>
                <Text style={[{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginBottom: 14, lineHeight: 18 }, rtlText]}>
                  معالجة محلية بالكامل على جهازك — دون اتصال بالإنترنت ودون رفع صورك لأي خادم.
                </Text>
                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 }}>
                  {AI_TOOLS.map((t) => {
                    const on = aiActive.includes(t.key);
                    return (
                      <Pressable key={t.key} onPress={() => toggleAi(t.key)} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, backgroundColor: on ? c.primary : 'rgba(255,255,255,0.08)' }}>
                        <Ionicons name={t.icon as any} size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
                        {on && <Ionicons name="checkmark-circle" size={15} color="#fff" />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* editor actions */}
          <View style={{ flexDirection: 'row-reverse', gap: 12, paddingHorizontal: 20, marginTop: 18 }}>
            <Pressable onPress={() => { setAdjust(DEFAULT); setFilter(0); setAiActive([]); }} style={{ paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>إعادة ضبط</Text>
            </Pressable>
            <Pressable onPress={() => { showToast('تم حفظ التعديلات ✓'); setTimeout(() => setEditing(false), 600); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 14, backgroundColor: c.primary }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>حفظ التعديلات</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* toast */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 60, alignSelf: 'center', opacity: toast, transform: [{ translateY: toast.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }}>
        <View style={{ backgroundColor: c.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 24 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13.5 }}>{toastMsg}</Text>
        </View>
      </Animated.View>
    </View>
  );
}
