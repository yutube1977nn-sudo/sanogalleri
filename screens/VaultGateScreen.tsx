import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';
import { useStore } from '../lib/store';
import { IconBtn } from '../components/ui';

export default function VaultGateScreen({ navigation }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { pinSet, pin, setPin } = useStore();

  // stages: 'enter' (login) | 'new' (create) | 'confirm'
  const [stage, setStage] = useState<'enter' | 'new' | 'confirm'>(pinSet ? 'enter' : 'new');
  const [input, setInput] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const press = (d: string) => {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    setError('');
    if (next.length === 4) setTimeout(() => submit(next), 150);
  };
  const back = () => setInput((s) => s.slice(0, -1));

  const submit = (val: string) => {
    if (stage === 'enter') {
      if (val === pin) { setInput(''); navigation.replace('Vault'); }
      else { setError('رمز غير صحيح، حاول مجدداً'); setInput(''); }
    } else if (stage === 'new') {
      setFirstPin(val); setInput(''); setStage('confirm');
    } else {
      if (val === firstPin) { setPin(val); setInput(''); navigation.replace('Vault'); }
      else { setError('الرمزان غير متطابقين'); setInput(''); setStage('new'); setFirstPin(''); }
    }
  };

  const title = stage === 'enter' ? 'أدخل رمز الأمان' : stage === 'new' ? 'أنشئ رمز الأمان' : 'أكّد رمز الأمان';
  const sub = stage === 'enter' ? 'مساحتك المشفّرة محمية بالكامل' : stage === 'new' ? 'اختر رمزاً من 4 أرقام لحماية ملفاتك' : 'أعد إدخال نفس الرمز للتأكيد';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, flexDirection: 'row-reverse' }}>
        <IconBtn name="chevron-forward" onPress={() => navigation.goBack()} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Ionicons name="shield-checkmark" size={40} color={c.primary} />
        </View>
        <Text style={[{ color: c.text, fontSize: 22, fontWeight: '800' }]}>{title}</Text>
        <Text style={[{ color: c.textDim, fontSize: 14, marginTop: 8, textAlign: 'center' }]}>{sub}</Text>

        {/* dots */}
        <View style={{ flexDirection: 'row-reverse', gap: 16, marginTop: 34, height: 20 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: input.length > i ? c.primary : c.cardAlt, borderWidth: 1.5, borderColor: input.length > i ? c.primary : c.border }} />
          ))}
        </View>

        <Text style={{ color: c.danger, height: 20, marginTop: 14, fontWeight: '600', fontSize: 13 }}>{error}</Text>

        {/* keypad */}
        <View style={{ width: 260, marginTop: 10 }}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['bio', '0', 'del']].map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              {row.map((k) => {
                if (k === 'bio') {
                  return stage === 'enter' ? (
                    <Pressable key={k} onPress={() => navigation.replace('Vault')} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="finger-print" size={30} color={c.primary} />
                    </Pressable>
                  ) : <View key={k} style={{ width: 70 }} />;
                }
                if (k === 'del') {
                  return (
                    <Pressable key={k} onPress={back} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="backspace-outline" size={28} color={c.text} />
                    </Pressable>
                  );
                }
                return (
                  <Pressable key={k} onPress={() => press(k)} style={({ pressed }) => ({ width: 70, height: 70, borderRadius: 35, backgroundColor: pressed ? c.primarySoft : c.card, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' })}>
                    <Text style={{ color: c.text, fontSize: 26, fontWeight: '700' }}>{k}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Ionicons name="lock-closed" size={13} color={c.textFaint} />
          <Text style={[{ color: c.textFaint, fontSize: 12 }, rtlText]}>تشفير محلي كامل — لا يمكن لأحد الوصول لملفاتك</Text>
        </View>
      </View>
    </View>
  );
}
