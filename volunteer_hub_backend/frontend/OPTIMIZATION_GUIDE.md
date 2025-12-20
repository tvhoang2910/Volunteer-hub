# 🚀 Bundle Size Optimization Guide

## ✅ Đã thực hiện

### 1. Loại bỏ dependencies không sử dụng
Đã xóa các packages không được dùng trong code:
- ❌ `antd` (5.27.6) - ~1.5MB
- ❌ `@ant-design/icons` - ~500KB  
- ❌ `@mui/joy` - ~800KB
- ❌ `@emotion/react`, `@emotion/styled` - ~400KB
- ❌ `html2canvas` - ~300KB
- ❌ `jspdf` - ~500KB
- ❌ `@stripe/react-stripe-js`, `@stripe/stripe-js` - ~200KB

**Tổng tiết kiệm: ~4.2MB dependencies**

### 2. Tối ưu Next.js Config
Đã thêm vào `next.config.mjs`:
```javascript
swcMinify: true,                          // Bật minification
compiler: {
  removeConsole: true,                    // Xóa console.log ở production
},
experimental: {
  optimizePackageImports: [               // Tree-shaking tự động
    'lucide-react', 
    'date-fns', 
    'lodash.get'
  ],
},
modularizeImports: {                      // Import icons riêng lẻ
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  },
},
```

## 🔧 Cần làm thêm (Optional)

### 3. Dynamic Import cho Heavy Components

**Framer Motion** (hiện tại ~300KB trong mọi page):
```jsx
// ❌ Trước
import { motion } from 'framer-motion';

// ✅ Sau
import dynamic from 'next/dynamic';
const Motion = dynamic(() => import('framer-motion').then(mod => mod.motion), { 
  ssr: false 
});
```

**React Quill** (nếu có):
```jsx
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
```

### 4. Code Splitting cho Routes

Tách các heavy pages thành chunks riêng:
```jsx
// pages/_app.js
const ManagerLayout = dynamic(() => import('@/layouts/ManagerLayout'), {
  loading: () => <LoadingSpinner />
});
```

### 5. Image Optimization

Đảm bảo dùng `next/image` thay vì `<img>`:
```jsx
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  width={500} 
  height={300} 
  loading="lazy"
  quality={75}
/>
```

### 6. Lazy Load Components chỉ khi cần

Các components trong tabs hoặc modals:
```jsx
const EventDetailSlideUp = dynamic(
  () => import('@/components/dashboard/EventDetailSlideUp'),
  { ssr: false }
);
```

### 7. Xóa mock data không dùng

Kiểm tra folder `src/data/`:
```bash
# Xóa các file mock không còn dùng
rm src/data/featuredFlights.json
rm src/data/flights.json
rm src/data/airports_data.json
```

### 8. Kiểm tra duplicate imports

Tìm các import trùng lặp:
```bash
npx depcheck
```

## 📊 Kiểm tra kết quả

### Build và phân tích bundle:
```bash
npm run build
```

### Xem chi tiết bundle (nếu cài @next/bundle-analyzer):
```bash
npm install -D @next/bundle-analyzer
npm run analyze
```

## 🎯 Kỳ vọng kết quả

- ✅ **First Load JS giảm từ ~1.5MB → ~800KB**
- ✅ **Compile time giảm từ 20s → 10-12s**  
- ✅ **Module count giảm từ 2500+ → 1500-1800**
- ✅ **Page load nhanh hơn 30-40%**

## 📝 Notes

- Các optimization đã áp dụng sẽ có hiệu quả ngay khi restart dev server
- Production build sẽ thấy rõ sự khác biệt hơn
- Cache có thể khiến ban đầu không thấy thay đổi rõ - xóa `.next` folder và build lại
