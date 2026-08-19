# Project structure — tạo page mới

Hướng dẫn cấu trúc chuẩn khi thêm route/page, bám theo các page hiện có trong repo (thị trường, bảng giá, giao dịch, tài sản).

Design System (màu, typography, v.v.) xem [design-system.md](design-system.md). Quy ước code chi tiết xem [coding-standards.md](coding-standards.md).

---

## Luồng tổng quát

```
src/app/{route}/page.tsx          # Server Component — metadata + compose
    → components/{feature}/{Feature}View.tsx   # 'use client' — toàn bộ UI/hook
        → components/{feature}/… hoặc components/common/…
        → (tuỳ chọn) stores/{feature}/use*Store.ts
        → services/api/… (axios qua vnscService)
        → types/… + utils/… + constants/…
```

`DefaultLayout` (header + `<main>`), `Providers`, `AuthGuard`, `ToastContainer`, `AuthFlow`,
`GlobalSpinner` đã nằm sẵn ở `src/app/layout.tsx` — page **không** tự bọc lại.

- **API**: không gọi axios trực tiếp trong JSX; gói trong `src/services/api/`.
- **Phản hồi API**: thường kiểm tra `error_code` với `isSuccessApi` từ `@/utils/common` (khi endpoint trả về chuẩn đó).

---

## 1. Routes & page file

| Quy tắc       | Chi tiết                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Thư mục route | **kebab-case**, khớp URL: `bang-gia`, `giao-dich`, `tai-san`; dynamic dùng `[param]`                        |
| Entry         | `src/app/{route}/page.tsx` — **Server Component**, không có `'use client'`                                  |
| Metadata      | `export const metadata: Metadata = { title, description }` — chỉ tên page cơ bản, **không** OG/canonical/SEO |
| View          | UI thật đặt ở `src/components/{feature}/{Feature}View.tsx` với `'use client'`                               |
| Loading       | Không cần tạo — `src/app/loading.tsx` (root) đã phủ mọi route con                                            |
| Text          | Viết thẳng chuỗi tiếng Việt trong component; map/label động đặt trong `const` cùng file hoặc `constants/`   |

Vì sao tách `*View`: `page.tsx` phải là Server Component để `export const metadata`, còn UI cần
hook / browser API nên phải `'use client'`. `page.tsx` giữ **mỏng** — chỉ metadata + render view.

```tsx
// src/app/bang-gia/page.tsx
import type { Metadata } from 'next';

import { IBoardView } from '@/components/bang-gia/IBoardView';

export const metadata: Metadata = { title: 'Bảng giá', description: 'Bảng giá' };

export default function Page() {
    return <IBoardView />;
}
```

**Đọc query param**: dùng `useSearchParams()` từ `next/navigation` trong `*View.tsx`, và bọc view
bằng `<Suspense>` trong `page.tsx` (xem `src/app/giao-dich/page.tsx`). App Router **không có**
shallow routing — muốn sync URL mà không điều hướng thì dùng `window.history.replaceState(...)`.

**Điều hướng**: `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `redirect`) —
**không** dùng `next/router`. `router.push` chỉ nhận string: `router.push(\`/giao-dich?symbol=${symbol}\`)`.

⚠️ **Không** import `services/`, `stores/`, `hooks/lib/useToast` vào `page.tsx` / `layout.tsx`:
access token nằm ở `localStorage`, các getter không guard `typeof window` nên sẽ throw trên server.

---

## 2. Components

- Feature: `src/components/{feature}/` — trùng tên route: `thi-truong`, `bang-gia`, `giao-dich`, `tai-san`.
- Entry view của mỗi route: `{Feature}View.tsx` ngay dưới folder feature (`MarketView`, `IBoardView`, `TradeView`, `AssetView`).
- Dùng chung: `src/components/common/` (`ui/`, `header/`, `modal/`, `feature/`, …).
- File component: **PascalCase**, tên file = tên export (`TradePanel.tsx` → `TradePanel`).
- Không dùng `index.tsx` làm barrel cho component feature (import trực tiếp file).

---

## 3. Services (`src/services/api/`)

- Tổ chức theo **domain**: `accounts/`, `auth/`, `datafeed/`, `trade/`, …
- Mỗi file export các hàm async; dùng `vnscService` từ `@/services/interceptor`.
- Kiểu trả về gắn với types trong `src/types/`.

```typescript
import { vnscService } from '@/services/interceptor';
import type { SomeResponse } from '@/types/…';

export const getSomething = (): Promise<SomeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/path')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
```

---

## 4. Stores (Zustand) — khi nào cần

- Đặt tại `src/stores/{feature}/use{Name}Store.ts` hoặc `src/stores/common/` nếu dùng chung nhiều page.
- Dùng khi: state chia sẻ giữa nhiều component trên cùng page/flow, cần `load` / `reset` theo lifecycle trang (ví dụ `useTradingStore`, `useAssetStore`).
- Page chỉ dùng `useState` + API là đủ thì **không** bắt buộc tạo store.
- Store cần dọn khi logout thì đăng ký vào `src/stores/reset-registry.ts`.

Chi tiết pattern store (toast, `isSuccessApi`, …) tham chiếu [coding-standards.md](coding-standards.md) và store cùng feature trong repo.

---

## 5. Types (`src/types/`)

- File **kebab-case**, nhóm theo domain: `types/accounts/…`, `types/auth/…`, `types/trade/…`, `types/datafeed/…`, `types/pages/…`.
- Response/request API nên có type riêng; page import type từ đây thay vì `any`.

---

## 6. Constants & utils

- `src/constants/common.ts` — dùng chung; `src/constants/{domain}.ts` — theo nghiệp vụ (`trading.ts`, `assets.ts`, `market.ts`, `iboard.ts`, `stock-info.ts`, `auth.ts`). Tên file có thể **không** trùng tên folder `pages` (trang `tai-san` dùng `constants/assets`, trang `bang-gia` dùng `constants/iboard`).
- `src/utils/common.ts` — helper dùng chung; thêm `utils/{domain}.ts` khi logic chỉ phục vụ một mảng (`utils/iboard.ts`, `utils/trading/…`, `utils/market/…`).
- `src/utils/format.ts` — format số/ngày (`formatNumberVN`, …); đừng viết lại.

---

## 7. Text hiển thị

Repo **không dùng i18n** — app chỉ phục vụ tiếng Việt.

- Chuỗi tĩnh: viết thẳng trong JSX.
- Nhãn tra cứu động (`map[key]`): khai báo `const` SCREAMING_SNAKE_CASE ở đầu file, hoặc `src/constants/` nếu nhiều file dùng chung.
- Chuỗi có tham số: dùng template literal tại chỗ.

---

## 8. Tuỳ chọn theo feature

| Khi nào                            | Đặt ở đâu                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| Validator cho form                 | `src/utils/{domain}.ts` (xem `utils/auth.ts`)              |
| Cấu hình chart ECharts tái sử dụng | `src/config/{name}.ts`, chart thị trường: `config/market/` |
| Topic / decode MQTT                | `src/hooks/useMQTT.ts` + `src/proto/stock.ts`              |

Chỉ thêm khi thật sự cần; không bắt buộc mọi page.

---

## Checklist — page / feature mới

Áp theo độ phức tạp, tick những mục thực sự dùng:

- [ ] `src/app/{route}/page.tsx` (Server + `metadata`)
- [ ] `src/components/{feature}/{Feature}View.tsx` — `'use client'`, chứa UI của route
- [ ] `src/components/{feature}/…` (và/hoặc tái sử dụng `components/common/…`)
- [ ] `src/services/api/…` — hàm gọi API mới nếu có
- [ ] `src/types/…` — type cho request/response/UI
- [ ] `src/constants/…` hoặc mở rộng `constants/common.ts`
- [ ] `src/utils/…` nếu có helper riêng feature
- [ ] `src/stores/{feature}/use…Store.ts` nếu cần state chia sẻ / lifecycle load-reset
- [ ] `src/config/…` nếu có cấu hình chart/options dùng lại

---

## Cấu trúc `src/` (tham chiếu nhanh)

```
src/
├── app/             # Next.js App Router — layout/page/loading/not-found + api/
├── components/      # UI theo feature + common/ (gồm {Feature}View.tsx của mỗi route)
├── layouts/         # DefaultLayout — dùng ở app/layout.tsx
├── hooks/
├── stores/          # Zustand
├── services/        # interceptor, api/, mqtt
├── provider/        # Providers bọc app (auth, MQTT, market index)
├── proto/           # protobuf decode message realtime
├── types/
├── utils/
├── constants/
├── config/          # cấu hình chart ECharts dùng lại
└── styles/
```
