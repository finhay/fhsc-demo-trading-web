# FHSC Demo Trading

Web application giao dịch chứng khoán — Next.js 14 (Page Router), TypeScript, Zustand, Tailwind CSS.

Bản demo chỉ gồm 4 trang: **Thị trường** (`/`), **Bảng giá** (`/bang-gia`), **Giao dịch** (`/giao-dich`), **Tài sản** (`/tai-san`), cùng modal đăng nhập / đăng ký / quên mật khẩu. App chỉ phục vụ tiếng Việt — **không có tầng i18n**, chuỗi hiển thị viết thẳng trong component.

---

## Stack chính

| Mảng      | Thư viện                                                         |
| --------- | ---------------------------------------------------------------- |
| Framework | Next.js 14 (Page Router) · React 18 · TypeScript 5               |
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
