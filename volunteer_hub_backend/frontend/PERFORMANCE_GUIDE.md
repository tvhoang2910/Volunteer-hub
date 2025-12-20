# 📚 Frontend Performance Best Practices

## 🎯 Import Optimization

### ✅ DO (Tree-shakeable)
```javascript
// Named imports from barrel files
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';

// Direct imports from submodules
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';
```

### ❌ DON'T (Bundle bloat)
```javascript
// Default import của toàn bộ library
import * as Icons from 'lucide-react';
import DateFns from 'date-fns';
import MUI from '@mui/material';
```

## 🔄 Dynamic Imports

### Khi nào nên dùng?
1. **Heavy libraries** (>100KB): Quill, Charts, PDF generators
2. **Conditional features**: Admin panels, modals, tooltips
3. **Below-the-fold content**: Sections không hiển thị ngay

### Example:
```javascript
// Heavy editor chỉ load khi cần
const RichTextEditor = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <Skeleton className="h-40" />
});

// Modal chỉ load khi user click
const [showModal, setShowModal] = useState(false);
const EventModal = dynamic(() => import('./EventModal'));
```

## 🖼️ Image Optimization

### Always use next/image:
```javascript
import Image from 'next/image';

<Image
  src="/event-banner.jpg"
  alt="Event"
  width={800}
  height={400}
  loading="lazy"           // Lazy load
  quality={80}             // Compress 20%
  placeholder="blur"       // Show blur while loading
  blurDataURL="data:..."   // Tiny base64 preview
/>
```

### For external images:
```javascript
// next.config.mjs
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' }
  ],
  formats: ['image/avif', 'image/webp'], // Modern formats
}
```

## 📦 Component Organization

### Code Splitting by Route:
```
pages/
  user/
    dashboard.jsx         ← Chỉ load khi vào /user/dashboard
    history.jsx           ← Riêng biệt, không ảnh hưởng dashboard
  manager/
    events/
      index.jsx           ← Auto code-split
      [id]/
        edit.jsx          ← Nested route splitting
```

### Shared Components:
```javascript
// components/ui/button.jsx
export const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

// ✅ Import ở nhiều nơi nhưng chỉ bundle 1 lần
```

## 🎨 CSS Optimization

### Tailwind Purging:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  // Chỉ giữ classes được dùng → CSS nhỏ hơn 90%
}
```

## 🔧 Build Configuration

### Production optimizations:
```javascript
// next.config.mjs
const nextConfig = {
  swcMinify: true,                    // Fast minification
  reactStrictMode: true,              // Catch bugs early
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};
```

## 📊 Measuring Performance

### Analyze bundle:
```bash
# Install analyzer
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### Check metrics:
```bash
npm run build

# Look for:
# ○ First Load JS: < 100 KB (Good)
# ● First Load JS: > 200 KB (Needs optimization)
```

## 🚀 Runtime Performance

### Memoization:
```javascript
import { useMemo, useCallback, memo } from 'react';

// Expensive calculations
const filteredEvents = useMemo(() => 
  events.filter(e => e.status === 'active'),
  [events]
);

// Callbacks passed to children
const handleClick = useCallback((id) => {
  navigate(`/event/${id}`);
}, [navigate]);

// Component memoization
export default memo(EventCard);
```

### Virtualization for long lists:
```javascript
// Chỉ render items trong viewport
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

## 📝 Checklist

- [ ] No unused dependencies in package.json
- [ ] All images use next/image
- [ ] Heavy components use dynamic imports
- [ ] Tailwind classes are purged
- [ ] Build size < 1MB for main bundle
- [ ] No console.logs in production
- [ ] API calls are memoized/cached
- [ ] Lists > 100 items use virtualization
- [ ] Fonts are preloaded
- [ ] Critical CSS inlined

## 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Load JS | < 150 KB | ~800 KB → 🔴 |
| LCP (Largest Contentful Paint) | < 2.5s | ? |
| FID (First Input Delay) | < 100ms | ? |
| CLS (Cumulative Layout Shift) | < 0.1 | ? |
| TTI (Time to Interactive) | < 3.5s | ? |

Use Lighthouse or PageSpeed Insights to measure!
