import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, rtlText, ThemeMode } from '../lib/theme';
import { useStore } from '../lib/store';
import { ScreenHeader, IconBtn, Card } from '../components/ui';

export default function SettingsScreen({ navigation }: any) {
  const { c, mode, setMode } = useTheme();
  const { pinSet, notes, secureItems, trash } = useStore();

  const Row = ({ icon, label, value, onPress, color, last }: any) => (
    <Pressable onPress={onPress} style={{ flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: (color ?? c.primary) + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={color ?? c.primary} />
      </View>
      <Text style={[{ color: c.text, fontWeight: '600', fontSize: 15, flex: 1, marginHorizontal: 12 }, rtlText]}>{label}</Text>
      {value ? <Text style={{ color: c.textDim, fontSize: 13.5 }}>{value}</Text> : null}
      <Ionicons name="chevron-back" size={18} color={c.textFaint} style={{ marginRight: 6 }} />
    </Pressable>
  );

  const modes: { k: ThemeMode; l: string; i: string }[] = [
    { k: 'light', l: 'فاتح', i: 'sunny' },
    { k: 'dark', l: 'داكن', i: 'moon' },
    { k: 'system', l: 'النظام', i: 'phone-portrait' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="الإعدادات" right={<IconBtn name="chevron-forward" onPress={() => navigation.goBack()} />} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, maxWidth: 640, alignSelf: 'center', width: '100%' }}>
        {/* app identity */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="images" size={38} color="#fff" />
          </View>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>Sano Gallery</Text>
          <Text style={{ color: c.textDim, fontSize: 13, marginTop: 4 }}>الإصدار 1.0.0 • محلي وآمن</Text>
        </View>

        {/* theme */}
        <Text style={[{ color: c.textDim, fontWeight: '700', fontSize: 13, marginBottom: 10 }, rtlText]}>المظهر</Text>
        <View style={{ flexDirection: 'row-reverse', gap: 10, marginBottom: 22 }}>
          {modes.map((m) => (
            <Pressable key={m.k} onPress={() => setMode(m.k)} style={{ flex: 1, alignItems: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: mode === m.k ? c.primarySoft : c.card, borderWidth: 1.5, borderColor: mode === m.k ? c.primary : c.border }}>
              <Ionicons name={m.i as any} size={22} color={mode === m.k ? c.primary : c.textDim} />
              <Text style={{ color: mode === m.k ? c.primary : c.textDim, fontWeight: '700', fontSize: 13 }}>{m.l}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[{ color: c.textDim, fontWeight: '700', fontSize: 13, marginBottom: 10 }, rtlText]}>الأمان والخصوصية</Text>
        <Card style={{ marginBottom: 22 }}>
          <Row icon="shield-checkmark" label="المساحة المحمية" value={pinSet ? 'مُفعّل' : 'غير مُعد'} onPress={() => navigation.navigate('VaultGate')} />
          <Row icon="finger-print" label="فتح بالبصمة" value="مُفعّل" color={c.success} />
          <Row icon="lock-closed" label="التشفير المحلي الكامل" value="AES-256" color={c.accent} last />
        </Card>

        <Text style={[{ color: c.textDim, fontWeight: '700', fontSize: 13, marginBottom: 10 }, rtlText]}>التخزين</Text>
        <Card style={{ marginBottom: 22 }}>
          <Row icon="document-text" label="الملاحظات" value={`${notes.length}`} color={c.warning} />
          <Row icon="lock-closed" label="الملفات الآمنة" value={`${secureItems.length}`} color={c.primary} />
          <Row icon="trash" label="سلة المحذوفات" value={`${trash.length}`} color={c.danger} last />
        </Card>

        <Text style={[{ color: c.textDim, fontWeight: '700', fontSize: 13, marginBottom: 10 }, rtlText]}>عن التطبيق</Text>
        <Card>
          <Row icon="information-circle" label="سياسة الخصوصية" />
          <Row icon="star" label="قيّم التطبيق" color={c.warning} />
          <Row icon="help-circle" label="المساعدة والدعم" color={c.accent} last />
        </Card>

        <Text style={[{ color: c.textFaint, fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18 }]}>
          جميع بياناتك مُخزّنة ومشفّرة محلياً على جهازك.{'\n'}لا يمكن لأحد — حتى المطوّرين — الوصول إليها.
        </Text>
      </ScrollView>
    </View>
  );
}
