# FHSC Demo Trading

Web application giao dịch chứng khoán — Next.js 16 (App Router), TypeScript, Zustand, Tailwind CSS.

Bản demo chỉ gồm 4 trang: **Thị trường** (`/`), **Bảng giá** (`/bang-gia`), **Giao dịch** (`/giao-dich`), **Tài sản** (`/tai-san`), cùng modal đăng nhập / đăng ký / quên mật khẩu. App chỉ phục vụ tiếng Việt — **không có tầng i18n**, chuỗi hiển thị viết thẳng trong component.

Đây là bản **demo** — **không** có SEO (OG/Twitter/canonical/robots/sitemap) và **không** có analytics/tracking (GA, GTM, dataLayer). Mỗi route chỉ khai báo `title` + `description` cơ bản theo tên page qua `export const metadata`. Không thêm lại các tầng này.

---

## Stack chính

| Mảng      | Thư viện                                                         |
| --------- | ---------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5     |
| State     | Zustand 5                                                        |
| Data      | Axios (qua `services/interceptor`) — **không** dùng React Query  |
| Form      | @tanstack/react-form — **không** dùng react-hook-form / Zod      |
| Table     | @tanstack/react-table + @tanstack/react-virtual                  |
| Chart     | ECharts 6 (qua hook `hooks/chart/useECharts*`)                   |
| Realtime  | MQTT + protobufjs (`src/proto/stock.ts`)                         |
| Styling   | Tailwind CSS 3 + Design System tokens — **không** dùng shadcn/ui |
| Icons     | react-icons                                                      |

---

## Skills

| File                                                        | Phạm vi                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| [project-structure.md](.claude/skills/project-structure.md) | Cấu trúc page mới — layers: page / component / service / store |
| [coding-standards.md](.claude/skills/coding-standards.md)   | Naming, API pattern, Zustand, TanStack form/table, MQTT, toast |
| [design-system.md](.claude/skills/design-system.md)         | Typography, background, text, border (Tailwind tokens)         |

---

## Request Headers

```
Authorization: Bearer {access_token}
device-type: WEB
device-id: {uuid}
x-device-type: WEB
x-device-id: {uuid}
x-channel: ONLINE
x-access-key: {access_key}
Accept-Language: vi
```

Interceptor (`src/services/interceptor.ts`) tự gắn toàn bộ header trên và tự refresh token
khi gặp 401 — service function không cần set thủ công.

---

## Golden Rules

1. **Design System** cho color/typography — **Tailwind** cho spacing/layout
2. **kebab-case** file/folder — **PascalCase** component/type
3. **API calls** qua `services/api/`, không gọi trực tiếp trong component
4. Folder không nested quá 3 cấp
5. Text tiếng Việt viết trực tiếp trong component — không thêm lại tầng i18n
6. `type` thay cho `interface`; import qua alias `@/`, không dùng relative path
7. `app/**/page.tsx` là **Server Component** (chỉ `metadata` + compose) — UI có hook/browser API để ở `components/{feature}/*View.tsx` với `'use client'`
8. Không import `services/`, `stores/`, `hooks/lib/useToast` vào `page.tsx` / `layout.tsx` — token nằm ở `localStorage`, chạy trên server sẽ throw

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
