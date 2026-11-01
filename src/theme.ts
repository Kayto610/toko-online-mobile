// Design token disalin dari kelas Tailwind yang dipakai toko-online-web,
// supaya tampilan mobile konsisten dengan versi web.
export const colors = {
  primary: '#2563eb', // blue-600  (tombol utama, harga, logo "Toko")
  primaryPressed: '#1d4ed8', // blue-700  (hover/pressed)
  primarySoft: '#eff6ff', // blue-50
  primaryBorder: '#bfdbfe', // blue-200
  focus: '#3b82f6', // blue-500  (focus ring input)

  bg: '#f9fafb', // gray-50   (latar halaman)
  card: '#ffffff',
  surface: '#f3f4f6', // gray-100  (kotak foto, badge stok, tombol sekunder)
  surfacePressed: '#e5e7eb', // gray-200
  border: '#e5e7eb', // gray-200  (border kartu & navbar)
  borderStrong: '#d1d5db', // gray-300  (border input)

  text: '#111827', // gray-900
  textSecondary: '#374151', // gray-700
  textBody: '#4b5563', // gray-600
  muted: '#6b7280', // gray-500
  faint: '#9ca3af', // gray-400

  danger: '#dc2626', // red-600
  dangerText: '#ef4444', // red-500  (teks "Hapus")
  dangerSoft: '#fef2f2', // red-50
  dangerSoftPressed: '#fee2e2', // red-100
  dangerBorder: '#fecaca', // red-200

  success: '#15803d', // green-700
  successSoft: '#dcfce7', // green-100
  successIcon: '#16a34a', // green-600
  warning: '#a16207', // yellow-700
  warningSoft: '#fef9c3', // yellow-100
  info: '#1d4ed8', // blue-700
  infoSoft: '#dbeafe', // blue-100

  toast: '#111827',
  white: '#ffffff',
} as const;

export const radius = {
  md: 6,
  lg: 8, // rounded-lg  (tombol, input)
  xl: 12, // rounded-xl  (kartu)
  '2xl': 16, // rounded-2xl (modal)
  full: 999,
} as const;

export const shadow = {
  // shadow-sm
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  // shadow-md
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

export const spacing = {
  page: 16,
} as const;
