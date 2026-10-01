import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { DOCS } from '../lib/data';
import { IconBtn } from '../components/ui';

const PAGE_TEXT = [
  'يُعد تطبيق Sano Gallery نموذجاً متكاملاً لإدارة الوسائط المحلية مع الحفاظ على الخصوصية التامة للمستخدم. يجمع التطبيق بين قوة أدوات التحرير الذكية وبساطة الواجهة.',
  'تعتمد جميع عمليات المعالجة على الذكاء الاصطناعي المحلي الذي يعمل بالكامل على جهازك دون الحاجة إلى اتصال بالإنترنت، مما يضمن بقاء بياناتك في مكانها الآمن.',
  'يوفر قارئ المستندات أدوات متقدمة لتعديل ألوان الصفحات بما يتناسب مع ظروف الإضاءة المحيطة بك، لتقليل إجهاد العين أثناء القراءة الطويلة.',
  'كما يدعم التطبيق تشفيراً محلياً كاملاً لجميع الملفات الحساسة، بحيث يستحيل الوصول إليها من أي جهة خارجية.',
];

type Mode = 'normal' | 'night' | 'sepia' | 'bluelight';
const MODES: { key: Mode; label: string; bg: string; text: string; icon: string }[] = [
  { key: 'normal', label: 'عادي', bg: '#FFFFFF', text: '#1A1A1A', icon: 'sunny' },
  { key: 'night', label: 'ليلي', bg: '#121212', text: '#D8D8D8', icon: 'moon' },
  { key: 'sepia', label: 'سيبيا', bg: '#F3E7CF', text: '#4A3B24', icon: 'book' },
  { key: 'bluelight', label: 'إضاءة دافئة', bg: '#FBEFD9', text: '#2C2418', icon: 'bulb' },
];

export default function PdfReaderScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const doc = DOCS.find((d) => d.id === route.params?.id) ?? DOCS[0];

  const [mode, setMode] = useState<Mode>('normal');
  const [showPanel, setShowPanel] = useState(false);
  const [page, setPage] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [sharpen, setSharpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const m = MODES.find((x) => x.key === mode)!;

  return (
    <View style={{ flex: 1, backgroundColor: c.isDark ? '#000' : '#333' }}>
      {/* top bar */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 12, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.bgElevated, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <IconBtn name="chevron-forward" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]} numberOfLines={1}>{doc.title}</Text>
          <Text style={[{ color: c.textDim, fontSize: 12 }, rtlText]}>صفحة {page} من {doc.pages}</Text>
        </View>
        <IconBtn name="search" />
        <View style={{ width: 8 }} />
        <IconBtn name="color-palette" bg={c.primary} color="#fff" onPress={() => setShowPanel((s) => !s)} />
      </View>

      {/* page */}
      <ScrollView
        contentContainerStyle={{ padding: 18, alignItems: 'center' }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setPage(Math.min(doc.pages, Math.max(1, Math.floor(y / 500) + 1)));
        }}
        scrollEventThrottle={16}
      >
        {[1, 2].map((pg) => (
          <View key={pg} style={{ width: '100%', maxWidth: 560, backgroundColor: m.bg, borderRadius: 6, padding: 26, marginBottom: 18, opacity: brightness, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, minHeight: 480 }}>
            <Text style={[{ color: m.text, fontSize: fontSize + 6, fontWeight: '800', marginBottom: 18, fontVariant: sharpen ? ['tabular-nums'] : undefined }, rtlText]}>
              {doc.title.replace('.pdf', '')}
            </Text>
            {PAGE_TEXT.map((t, i) => (
              <Text key={i} style={[{ color: m.text, fontSize, lineHeight: fontSize * 1.9, marginBottom: 14, fontWeight: sharpen ? '600' : '400' }, rtlText]}>
                {t}
              </Text>
            ))}
            <Text style={{ color: m.text, textAlign: 'center', marginTop: 20, opacity: 0.5, fontSize: 12 }}>— {pg} —</Text>
          </View>
        ))}
      </ScrollView>

      {/* color panel */}
      {showPanel && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 18, borderTopWidth: 1, borderColor: c.border }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[{ color: c.text, fontWeight: '800', fontSize: 17 }, rtlText]}>تعديل ألوان الصفحة</Text>
            <IconBtn name="close" dim={32} size={18} onPress={() => setShowPanel(false)} />
          </View>

          <Text style={[{ color: c.textDim, fontSize: 13, fontWeight: '700', marginBottom: 10 }, rtlText]}>وضع العرض</Text>
          <View style={{ flexDirection: 'row-reverse', gap: 10, marginBottom: 20 }}>
            {MODES.map((mm) => (
              <Pressable key={mm.key} onPress={() => setMode(mm.key)} style={{ flex: 1, alignItems: 'center', gap: 7, paddingVertical: 12, borderRadius: 14, backgroundColor: mode === mm.key ? c.primarySoft : c.cardAlt, borderWidth: 1.5, borderColor: mode === mm.key ? c.primary : 'transparent' }}>
                <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: mm.bg, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={mm.icon as any} size={15} color={mm.text} />
                </View>
                <Text style={{ color: mode === mm.key ? c.primary : c.textDim, fontSize: 11, fontWeight: '700' }}>{mm.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]}>السطوع</Text>
            <Text style={{ color: c.primary, fontWeight: '800' }}>{Math.round(brightness * 100)}%</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', gap: 8, marginBottom: 18 }}>
            {[0.5, 0.7, 0.85, 1].map((b) => (
              <Pressable key={b} onPress={() => setBrightness(b)} style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: brightness === b ? c.primary : c.cardAlt, alignItems: 'center' }}>
                <Text style={{ color: brightness === b ? '#fff' : c.textDim, fontWeight: '700', fontSize: 13 }}>{Math.round(b * 100)}%</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]}>حجم الخط</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', gap: 8, marginBottom: 18 }}>
            {[14, 16, 18, 22].map((fs) => (
              <Pressable key={fs} onPress={() => setFontSize(fs)} style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: fontSize === fs ? c.primary : c.cardAlt, alignItems: 'center' }}>
                <Text style={{ color: fontSize === fs ? '#fff' : c.textDim, fontWeight: '700', fontSize: 13 }}>{fs}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setSharpen((s) => !s)} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.cardAlt, borderRadius: 14, padding: 14 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <Ionicons name="text" size={18} color={c.text} />
              <Text style={[{ color: c.text, fontWeight: '700', fontSize: 14 }, rtlText]}>تحسين وضوح النصوص المستندة إلى الصور</Text>
            </View>
            <View style={{ width: 46, height: 28, borderRadius: 14, backgroundColor: sharpen ? c.primary : c.border, justifyContent: 'center', paddingHorizontal: 3 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignSelf: sharpen ? 'flex-start' : 'flex-end' }} />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
