# Project structure — tạo page mới

Hướng dẫn cấu trúc chuẩn khi thêm route/page, bám theo các page hiện có trong repo (kể cả Haybond).

Design System (màu, typography, v.v.) xem [design-system.md](design-system.md). Quy ước code chi tiết xem [coding-standards.md](coding-standards.md).

---

## Luồng tổng quát

```
src/pages/{route}/index.tsx
    → DefaultLayout + useTranslate
    → components/{feature}/… hoặc components/common/…
    → (tuỳ chọn) stores/{feature}/use*Store.ts
    → services/api/… (axios qua vnscService)
    → types/… + utils/… + constants/…
    → language/vi/*.ts + language/en/*.ts
```

- **API**: không gọi axios trực tiếp trong JSX; gói trong `src/services/api/`.
- **Phản hồi API**: thường kiểm tra `error_code` với `isSuccessApi` từ `@/utils/common` (khi endpoint trả về chuẩn đó).

---

## 1. Routes & page file

| Quy tắc       | Chi tiết                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Thư mục route | **kebab-case**, khớp URL: `bang-gia`, `giao-dich`, `quan-ly-api`, `ma-chung-khoan/[symbol]`                |
| Entry         | `index.tsx`; dynamic route dùng `[param]/index.tsx`                                                        |
| Layout        | Bọc nội dung trong `DefaultLayout` từ `@/layouts/DefaultLayout`, truyền `title` và `metaDescription`       |
| i18n          | `const trans = useTranslate()` — chuỗi lấy từ `trans.{namespace}` (namespace trùng file trong `language/`) |
| Client        | Thêm `'use client'` ở đầu file khi cần hook chỉ chạy client hoặc tương tác browser                         |

Trang có thể **mỏng** (chỉ compose component + layout) hoặc **chứa fetch / useEffect** (ví dụ gọi API khởi tạo, reset store khi unmount) tùy feature.

Trang `/` (`src/pages/index.tsx`) có thể import component từ namespace khác — không bắt buộc tên folder `pages` trùng tên folder `components`.

---

## 2. Components

- Feature: `src/components/{feature}/` — cùng “tên gọi nhớ” với product (thường gần với route: `ipo`, `giao-dich`, `bang-gia`, …).
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

- Đặt tại `src/stores/{feature}/use{Name}Store.ts` hoặc `src/stores/common/` nếu dùng chọn nhiều page.
- Dùng khi: state chia sẻ giữa nhiều component trên cùng page/flow, cần `load` / `reset` theo lifecycle trang (ví dụ IPO, Haypoint, trading).
- Page chỉ dùng `useState` + API là đủ thì **không** bắt buộc tạo store (ví dụ một số trang quản lý đơn giản).

Chi tiết pattern store (toast, `isSuccessApi`, …) tham chiếu [coding-standards.md](coding-standards.md) và store cùng feature trong repo.

---

## 5. Types (`src/types/`)

- File **kebab-case**, nhóm theo domain: `types/accounts/assets.ts`, `types/auth/openapi.ts`, `types/pages/…`, v.v.
- Response/request API nên có type riêng; page import type từ đây thay vì `any`.

---

## 6. Constants & utils

- `src/constants/common.ts` — dùng chung; `src/constants/{domain}.ts` — theo nghiệp vụ (`trading.ts`, `assets.ts`, `openapi.ts`, …). Tên file có thể **không** trùng tên folder `pages` nếu domain đã ổn định (ví dụ trang `tai-san` dùng `constants/assets`).
- `src/utils/common.ts` — helper dùng chộng; thêm `utils/{domain}.ts` khi logic chỉ phục vụ một mảng (ví dụ `utils/openapi.ts`).

---

## 7. i18n (`src/language/`)

- Thêm `vi/{namespace}.ts` và `en/{namespace}.ts` export object chuỗi.
- Đăng ký vào `src/language/vi.ts` và `src/language/en.ts` (import + spread vào object `vi` / `en`).
- Trên page: `trans.{namespace}` (ví dụ `trans.openapi.title`).

---

## 8. Tuỳ chọn theo feature

| Khi nào                                    | Đặt ở đâu                     |
| ------------------------------------------ | ----------------------------- |
| Form + validation Zod                      | `src/schema/{name}.schema.ts` |
| Cấu hình chart (Highcharts, …) tái sử dụng | `src/config/{name}.ts`        |

Chỉ thêm khi thật sự cần; không bắt buộc mọi page.

---

## Checklist — page / feature mới

Áp theo độ phức tạp, tick những mục thực sự dùng:

- [ ] `src/pages/{route}/index.tsx` (và `[param]/index.tsx` nếu có)
- [ ] `src/components/{feature}/…` (và/hoặc tái sử dụng `components/common/…`)
- [ ] `src/services/api/…` — hàm gọi API mới nếu có
- [ ] `src/types/…` — type cho request/response/UI
- [ ] `src/constants/…` hoặc mở rộng `constants/common.ts`
- [ ] `src/utils/…` nếu có helper riêng feature
- [ ] `src/stores/{feature}/use…Store.ts` nếu cần state chia sẻ / lifecycle load-reset
- [ ] `src/language/vi/{namespace}.ts` + `src/language/en/{namespace}.ts` + cập nhật `vi.ts` / `en.ts`
- [ ] `src/schema/…` nếu có form cần Zod
- [ ] `src/config/…` nếu có cấu hình chart/options dùng lại

---

## Cấu trúc `src/` (tham chiếu nhanh)

```
src/
├── pages/           # Next.js Page Router
├── components/      # UI theo feature + common/
├── layouts/
├── hooks/
├── stores/          # Zustand
├── services/        # interceptor, api/, …
├── schema/          # Zod (tuỳ chọn)
├── types/
├── utils/
├── constants/
├── language/        # vi.ts, en.ts + vi/*, en/*
├── styles/
├── config/          # chart / static config (tuỳ chọn)
└── …
```
