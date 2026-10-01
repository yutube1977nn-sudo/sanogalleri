import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemeProvider, useTheme } from './lib/theme';
import { StoreProvider } from './lib/store';
import MiniPlayer from './components/MiniPlayer';

import PhotosScreen from './screens/PhotosScreen';
import PhotoViewerScreen from './screens/PhotoViewerScreen';
import VideosScreen from './screens/VideosScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import MusicScreen from './screens/MusicScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';
import DocsScreen from './screens/DocsScreen';
import PdfReaderScreen from './screens/PdfReaderScreen';
import NotesScreen from './screens/NotesScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import VaultGateScreen from './screens/VaultGateScreen';
import VaultScreen from './screens/VaultScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS: Record<string, [string, string]> = {
  Photos: ['images', 'images-outline'],
  Videos: ['play-circle', 'play-circle-outline'],
  Music: ['musical-notes', 'musical-notes-outline'],
  Docs: ['document-text', 'document-text-outline'],
  Notes: ['create', 'create-outline'],
};
const LABELS: Record<string, string> = {
  Photos: 'الصور',
  Videos: 'الفيديو',
  Music: 'الموسيقى',
  Docs: 'المستندات',
  Notes: 'الملاحظات',
};

function Tabs() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.textFaint,
          tabBarStyle: {
            backgroundColor: c.tabBar,
            borderTopColor: c.border,
            borderTopWidth: 1,
            height: 58 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          tabBarLabel: LABELS[route.name],
          tabBarIcon: ({ focused, color, size }) => {
            const [on, off] = ICONS[route.name];
            return <Ionicons name={(focused ? on : off) as any} size={size - 1} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Photos" component={PhotosScreen} />
        <Tab.Screen name="Videos" component={VideosScreen} />
        <Tab.Screen name="Music" component={MusicScreen} />
        <Tab.Screen name="Docs" component={DocsScreen} />
        <Tab.Screen name="Notes" component={NotesScreen} />
      </Tab.Navigator>
      <MiniPlayer bottom={58 + insets.bottom + 8} />
    </View>
  );
}

function Root() {
  const { c } = useTheme();
  const navTheme = c.isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.bg, card: c.bgElevated, primary: c.primary, text: c.text, border: c.border } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: c.bg, card: c.bgElevated, primary: c.primary, text: c.text, border: c.border } };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={c.isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="PhotoViewer" component={PhotoViewerScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="NowPlaying" component={NowPlayingScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="PdfReader" component={PdfReaderScreen} />
        <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="VaultGate" component={VaultGateScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Vault" component={VaultScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <Root />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
