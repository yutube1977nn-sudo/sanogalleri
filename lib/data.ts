// Sample seed data for Sano Gallery
export interface Photo {
  id: string;
  uri: string;
  album: string;
  date: string;
  fav?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  thumb: string;
  duration: string; // mm:ss
  seconds: number;
  size: string;
  folder: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number; // seconds
}

export interface Doc {
  id: string;
  title: string;
  pages: number;
  size: string;
  date: string;
  color: string;
}

const img = (seed: string, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const ALBUMS: { name: string; key: string; icon: string }[] = [
  { name: 'الكاميرا', key: 'camera', icon: 'camera' },
  { name: 'لقطات الشاشة', key: 'screenshots', icon: 'phone-portrait' },
  { name: 'التنزيلات', key: 'downloads', icon: 'download' },
  { name: 'المفضلة', key: 'favorites', icon: 'heart' },
  { name: 'السفر', key: 'travel', icon: 'airplane' },
  { name: 'الطعام', key: 'food', icon: 'restaurant' },
];

const albumKeys = ['camera', 'screenshots', 'downloads', 'travel', 'food', 'camera', 'travel', 'camera'];
const dates = ['اليوم', 'أمس', '12 سبتمبر', '12 سبتمبر', '3 أغسطس', '3 أغسطس', '21 يوليو', '21 يوليو'];

export const PHOTOS: Photo[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `p${i}`,
  uri: img(`sano-photo-${i}`, 500, 500),
  album: albumKeys[i % albumKeys.length],
  date: dates[i % dates.length],
  fav: i % 7 === 0,
}));

export const VIDEOS: VideoItem[] = [
  { id: 'v1', title: 'رحلة إلى الجبال الزرقاء', thumb: img('vid-mountain', 600, 340), duration: '03:42', seconds: 222, size: '84 MB', folder: 'الكاميرا' },
  { id: 'v2', title: 'غروب الشمس على الشاطئ', thumb: img('vid-beach', 600, 340), duration: '01:18', seconds: 78, size: '31 MB', folder: 'الكاميرا' },
  { id: 'v3', title: 'حفلة عيد الميلاد', thumb: img('vid-party', 600, 340), duration: '05:03', seconds: 303, size: '120 MB', folder: 'التنزيلات' },
  { id: 'v4', title: 'تمارين الصباح', thumb: img('vid-gym', 600, 340), duration: '12:30', seconds: 750, size: '340 MB', folder: 'التنزيلات' },
  { id: 'v5', title: 'شوارع المدينة ليلاً', thumb: img('vid-city', 600, 340), duration: '02:55', seconds: 175, size: '66 MB', folder: 'الكاميرا' },
  { id: 'v6', title: 'لقطة شاشة لعبة', thumb: img('vid-game', 600, 340), duration: '00:47', seconds: 47, size: '18 MB', folder: 'لقطات الشاشة' },
];

export const TRACKS: Track[] = [
  { id: 't1', title: 'Midnight Drive', artist: 'Lunar Waves', album: 'Neon Nights', cover: img('mus-1', 400, 400), duration: 214 },
  { id: 't2', title: 'أحلام الصحراء', artist: 'نجوم الشرق', album: 'رمال', cover: img('mus-2', 400, 400), duration: 188 },
  { id: 't3', title: 'Ocean Breeze', artist: 'Calm Collective', album: 'Serenity', cover: img('mus-3', 400, 400), duration: 243 },
  { id: 't4', title: 'Golden Hour', artist: 'Sunset Boulevard', album: 'Horizons', cover: img('mus-4', 400, 400), duration: 199 },
  { id: 't5', title: 'نسمات', artist: 'فيروز الليل', album: 'هدوء', cover: img('mus-5', 400, 400), duration: 231 },
  { id: 't6', title: 'City Lights', artist: 'Urban Echo', album: 'Metropolis', cover: img('mus-6', 400, 400), duration: 176 },
  { id: 't7', title: 'Starfall', artist: 'Aurora Sky', album: 'Cosmos', cover: img('mus-7', 400, 400), duration: 262 },
  { id: 't8', title: 'خطوات', artist: 'موجة', cover: img('mus-8', 400, 400), album: 'إيقاع', duration: 205 },
];

export const DOCS: Doc[] = [
  { id: 'd1', title: 'دليل المستخدم - Sano Gallery.pdf', pages: 24, size: '1.2 MB', date: 'اليوم', color: '#F0434F' },
  { id: 'd2', title: 'عقد الإيجار 2026.pdf', pages: 8, size: '640 KB', date: 'أمس', color: '#5A4CF0' },
  { id: 'd3', title: 'كتاب العادات الذرية.pdf', pages: 312, size: '14.8 MB', date: '2 سبتمبر', color: '#00C2A8' },
  { id: 'd4', title: 'فاتورة الكهرباء.pdf', pages: 2, size: '210 KB', date: '28 أغسطس', color: '#F5A623' },
  { id: 'd5', title: 'ملخص اجتماع الفريق.pdf', pages: 5, size: '480 KB', date: '15 أغسطس', color: '#17B978' },
  { id: 'd6', title: 'خطة المشروع الفصلية.pdf', pages: 18, size: '2.1 MB', date: '4 أغسطس', color: '#7C6FFF' },
];

export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};
