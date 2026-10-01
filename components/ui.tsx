import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, rtlText } from '../lib/theme';

export const ScreenHeader: React.FC<{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  large?: boolean;
}> = ({ title, subtitle, right, large }) => {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, backgroundColor: c.bg, paddingHorizontal: 20, paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={[{ color: c.text, fontSize: large ? 30 : 24, fontWeight: '800' }, rtlText]}>{title}</Text>
          {subtitle ? (
            <Text style={[{ color: c.textDim, fontSize: 13, marginTop: 2 }, rtlText]}>{subtitle}</Text>
          ) : null}
        </View>
        {right ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
};

export const IconBtn: React.FC<{
  name: any;
  onPress?: () => void;
  color?: string;
  bg?: string;
  size?: number;
  dim?: number;
}> = ({ name, onPress, color, bg, size = 20, dim = 40 }) => {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: bg ?? c.cardAlt,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ionicons name={name} size={size} color={color ?? c.text} />
    </Pressable>
  );
};

export const EmptyState: React.FC<{ icon: any; title: string; sub?: string }> = ({ icon, title, sub }) => {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
      <View
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: c.cardAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <Ionicons name={icon} size={40} color={c.textFaint} />
      </View>
      <Text style={[{ color: c.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }]}>{title}</Text>
      {sub ? (
        <Text style={[{ color: c.textDim, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 }]}>{sub}</Text>
      ) : null}
    </View>
  );
};

export const Chip: React.FC<{ label: string; active?: boolean; onPress?: () => void; icon?: any }> = ({
  label,
  active,
  onPress,
  icon,
}) => {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 15,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: active ? c.primary : c.card,
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
      }}
    >
      {icon ? <Ionicons name={icon} size={15} color={active ? '#fff' : c.textDim} /> : null}
      <Text style={{ color: active ? '#fff' : c.textDim, fontWeight: '700', fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle; onPress?: () => void }> = ({
  children,
  style,
  onPress,
}) => {
  const { c } = useTheme();
  const content = (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>{content}</Pressable>;
  return content;
};

export const ARText: React.FC<{ children: React.ReactNode; style?: TextStyle | TextStyle[]; numberOfLines?: number }> = ({
  children,
  style,
  numberOfLines,
}) => {
  return (
    <Text numberOfLines={numberOfLines} style={[rtlText, style]}>
      {children}
    </Text>
  );
};
