import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, TRACKS, PHOTOS, Photo } from './data';

export interface NoteBlock {
  type: 'text' | 'image';
  value: string;
}
export interface Note {
  id: string;
  notebook: string;
  title: string;
  blocks: NoteBlock[];
  updated: number;
  color: string;
  pinned?: boolean;
}
export interface Notebook {
  id: string;
  name: string;
  color: string;
}
export interface SecureItem {
  id: string;
  uri: string;
  type: 'photo' | 'video' | 'file';
  name: string;
  added: number;
}
export interface TrashItem {
  id: string;
  uri: string;
  kind: 'photo' | 'video' | 'note' | 'doc';
  name: string;
  deleted: number;
}

const DEFAULT_NOTEBOOKS: Notebook[] = [
  { id: 'nb1', name: 'يوميات', color: '#5A4CF0' },
  { id: 'nb2', name: 'العمل', color: '#00C2A8' },
  { id: 'nb3', name: 'أفكار', color: '#F5A623' },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'n1',
    notebook: 'nb3',
    title: 'أفكار لتطبيق Sano',
    color: '#F5A623',
    pinned: true,
    updated: Date.now() - 3600_000,
    blocks: [
      { type: 'text', value: 'تحسين محرر الصور بالذكاء الاصطناعي المحلي.\n- إزالة الشوائب تلقائياً\n- تحسين الإضاءة بضغطة واحدة\n- رفع الدقة (Upscaling)' },
      { type: 'image', value: 'https://picsum.photos/seed/sano-note-1/600/360' },
      { type: 'text', value: 'إضافة قوالب جاهزة للمجلد الآمن 🔒' },
    ],
  },
  {
    id: 'n2',
    notebook: 'nb1',
    title: 'قائمة التسوق',
    color: '#5A4CF0',
    updated: Date.now() - 86400_000,
    blocks: [{ type: 'text', value: '• حليب\n• خبز\n• فواكه موسمية\n• قهوة مختصة\n• زيت زيتون' }],
  },
  {
    id: 'n3',
    notebook: 'nb2',
    title: 'ملخص اجتماع الإثنين',
    color: '#00C2A8',
    updated: Date.now() - 2 * 86400_000,
    blocks: [{ type: 'text', value: 'مراجعة خطة الربع الأخير، تحديد الأولويات، وتوزيع المهام على الفريق.' }],
  },
];

interface StoreCtx {
  // notes
  notes: Note[];
  notebooks: Notebook[];
  saveNote: (n: Note) => void;
  deleteNote: (id: string) => void;
  addNotebook: (name: string, color: string) => void;
  // photos favorites
  favorites: string[];
  toggleFav: (id: string) => void;
  // secure
  pinSet: boolean;
  pin: string;
  setPin: (p: string) => void;
  secureItems: SecureItem[];
  addSecure: (items: SecureItem[]) => void;
  removeSecure: (id: string) => void;
  // trash
  trash: TrashItem[];
  moveToTrash: (t: TrashItem) => void;
  restoreTrash: (id: string) => void;
  purgeTrash: (id?: string) => void;
  // music
  current: Track | null;
  isPlaying: boolean;
  position: number;
  queue: Track[];
  playlists: { id: string; name: string; trackIds: string[] }[];
  playTrack: (t: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (s: number) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (plId: string, trackId: string) => void;
}

const Ctx = createContext<StoreCtx>({} as StoreCtx);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [notebooks, setNotebooks] = useState<Notebook[]>(DEFAULT_NOTEBOOKS);
  const [favorites, setFavorites] = useState<string[]>(PHOTOS.filter((p) => p.fav).map((p) => p.id));
  const [pin, setPinState] = useState('');
  const [secureItems, setSecureItems] = useState<SecureItem[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [playlists, setPlaylists] = useState<{ id: string; name: string; trackIds: string[] }[]>([
    { id: 'pl1', name: 'المفضلة', trackIds: ['t1', 't3', 't5'] },
    { id: 'pl2', name: 'تركيز', trackIds: ['t3', 't7'] },
  ]);

  // music state
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const timer = useRef<any>(null);

  // load persisted
  useEffect(() => {
    (async () => {
      const [n, nb, fav, p, sec, tr, pl] = await Promise.all([
        AsyncStorage.getItem('sano_notes'),
        AsyncStorage.getItem('sano_notebooks'),
        AsyncStorage.getItem('sano_fav'),
        AsyncStorage.getItem('sano_pin'),
        AsyncStorage.getItem('sano_secure'),
        AsyncStorage.getItem('sano_trash'),
        AsyncStorage.getItem('sano_playlists'),
      ]);
      if (n) setNotes(JSON.parse(n));
      if (nb) setNotebooks(JSON.parse(nb));
      if (fav) setFavorites(JSON.parse(fav));
      if (p) setPinState(p);
      if (sec) setSecureItems(JSON.parse(sec));
      if (tr) setTrash(JSON.parse(tr));
      if (pl) setPlaylists(JSON.parse(pl));
    })();
  }, []);

  const persist = (k: string, v: any) => AsyncStorage.setItem(k, JSON.stringify(v));

  // playback timer with auto-advance to the next track
  useEffect(() => {
    if (isPlaying && current) {
      timer.current = setInterval(() => {
        setPosition((pos) => {
          if (pos + 1 >= current.duration) {
            // track finished -> advance to next in queue
            setCurrent((cur) => {
              if (!cur) return cur;
              const idx = queue.findIndex((x) => x.id === cur.id);
              return queue[(idx + 1) % queue.length];
            });
            return 0;
          }
          return pos + 1;
        });
      }, 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => timer.current && clearInterval(timer.current);
  }, [isPlaying, current, queue]);

  const saveNote = useCallback((n: Note) => {
    setNotes((prev) => {
      const exists = prev.find((x) => x.id === n.id);
      const next = exists ? prev.map((x) => (x.id === n.id ? n : x)) : [n, ...prev];
      persist('sano_notes', next);
      return next;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persist('sano_notes', next);
      return next;
    });
  }, []);

  const addNotebook = useCallback((name: string, color: string) => {
    setNotebooks((prev) => {
      const next = [...prev, { id: 'nb' + Date.now(), name, color }];
      persist('sano_notebooks', next);
      return next;
    });
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persist('sano_fav', next);
      return next;
    });
  }, []);

  const setPin = useCallback((p: string) => {
    setPinState(p);
    AsyncStorage.setItem('sano_pin', p);
  }, []);

  const addSecure = useCallback((items: SecureItem[]) => {
    setSecureItems((prev) => {
      const next = [...items, ...prev];
      persist('sano_secure', next);
      return next;
    });
  }, []);

  const removeSecure = useCallback((id: string) => {
    setSecureItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persist('sano_secure', next);
      return next;
    });
  }, []);

  const moveToTrash = useCallback((t: TrashItem) => {
    setTrash((prev) => {
      const next = [t, ...prev];
      persist('sano_trash', next);
      return next;
    });
  }, []);

  const restoreTrash = useCallback((id: string) => {
    setTrash((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persist('sano_trash', next);
      return next;
    });
  }, []);

  const purgeTrash = useCallback((id?: string) => {
    setTrash((prev) => {
      const next = id ? prev.filter((x) => x.id !== id) : [];
      persist('sano_trash', next);
      return next;
    });
  }, []);

  const playTrack = useCallback((t: Track, q?: Track[]) => {
    setCurrent(t);
    if (q) setQueue(q);
    setPosition(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    setCurrent((cur) => {
      if (!cur) return cur;
      const idx = queue.findIndex((x) => x.id === cur.id);
      const nx = queue[(idx + 1) % queue.length];
      setPosition(0);
      setIsPlaying(true);
      return nx;
    });
  }, [queue]);

  const prev = useCallback(() => {
    setCurrent((cur) => {
      if (!cur) return cur;
      const idx = queue.findIndex((x) => x.id === cur.id);
      const pv = queue[(idx - 1 + queue.length) % queue.length];
      setPosition(0);
      setIsPlaying(true);
      return pv;
    });
  }, [queue]);

  const seek = useCallback((s: number) => setPosition(s), []);

  const createPlaylist = useCallback((name: string) => {
    setPlaylists((prev) => {
      const next = [...prev, { id: 'pl' + Date.now(), name, trackIds: [] }];
      persist('sano_playlists', next);
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((plId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((pl) =>
        pl.id === plId && !pl.trackIds.includes(trackId) ? { ...pl, trackIds: [...pl.trackIds, trackId] } : pl
      );
      persist('sano_playlists', next);
      return next;
    });
  }, []);

  const value = useMemo<StoreCtx>(
    () => ({
      notes, notebooks, saveNote, deleteNote, addNotebook,
      favorites, toggleFav,
      pinSet: pin.length > 0, pin, setPin,
      secureItems, addSecure, removeSecure,
      trash, moveToTrash, restoreTrash, purgeTrash,
      current, isPlaying, position, queue, playlists,
      playTrack, togglePlay, next, prev, seek, createPlaylist, addToPlaylist,
    }),
    [notes, notebooks, favorites, pin, secureItems, trash, current, isPlaying, position, queue, playlists,
     saveNote, deleteNote, addNotebook, toggleFav, setPin, addSecure, removeSecure, moveToTrash, restoreTrash,
     purgeTrash, playTrack, togglePlay, next, prev, seek, createPlaylist, addToPlaylist]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => useContext(Ctx);
