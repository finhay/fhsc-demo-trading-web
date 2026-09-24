# Design System

Quy tắc Design System cho FHSC Demo Trading — nguồn từ
[`@finhay-pro/leaf-design-system`](https://www.npmjs.com/package/@finhay-pro/leaf-design-system)
(import trong [`src/styles/globals.css`](../../src/styles/globals.css)). Tailwind v4
(CSS-first, không còn `tailwind.config.js`). Spacing/layout vẫn dùng utility Tailwind.

---

## Typography

Class Leaf **không** có prefix `font-`. Chỉ set `font-size` / `line-height` / `font-weight`
(token Desktop; chưa có responsive type set riêng).

| Class | size | line-height | weight |
| ----- | ---- | ----------- | ------ |
| `display-1` | 122px | 134px | 700 |
| `display-2` | 76px | 88px | 600 |
| `display-3` | 60px | 72px | 600 |
| `heading-1` | 36px | 48px | 600 |
| `heading-2` | 28px | 36px | 600 |
| `heading-3` | 24px | 32px | 600 |
| `body-1` / `body-1-highlight` | 20px | 30px | 400 / 600 |
| `body-2` / `body-2-highlight` | 18px | 28px | 400 / 600 |
| `body-3` / `body-3-highlight` | 16px | 24px | 400 / 600 |
| `body-4` / `body-4-highlight` | 14px | 20px | 400 / 600 |
| `body-5` / `body-5-highlight` | 12px | 16px | 400 / 600 |

Không còn `caption` / `tiny` / `heading-4` — dùng `body-5` / `body-1-highlight` thay thế.

Interactive (`button` / `a[href]` / `[role=button]`) có `cursor: pointer` qua `@layer base` trong
[`globals.css`](../../src/styles/globals.css); `disabled` / `aria-disabled` → `not-allowed`.
Drag dùng `cursor-grab` (utility thắng base). Element clickable khác (`tr`, `role=option`…) gắn
`cursor-pointer` trên className.

```tsx
<h1 className="heading-1 text-primary">Tiêu đề</h1>
<p className="body-3 text-secondary">Nội dung</p>
```

---

## Background

### Leaf `base-*` (surface + system)

| Class | Token |
| ----- | ----- |
| `base-primary` … `base-quinary` | `--base-*` |
| `base-highlight` | brand |
| `base-blue` / `green` / `yellow` / `orange` / `red` / `purple` | `--system-*` |

```tsx
<div className="base-secondary" />
<div className="base-green" />
```

Variant hover nền (Leaf class không có `hover:`) → arbitrary var:

```tsx
<button className="base-tertiary hover:bg-(--base-quaternary)" />
```

**Opacity / tint:** Leaf `base-*` chỉ solid — không có `base-green/20`. Dùng Tailwind
`bg-green/20`, `bg-red/10`, `bg-orange/70`… (bridge `--color-*` trong `globals.css`).

### App-only (`@theme` trong `globals.css`) — vẫn dùng `bg-*`

| Class | Hex |
| ----- | --- |
| `bg-disabled` | `#2c2c2e` |
| `bg-gray` | `#999999` |
| `bg-overlay` | `#252525E5` |
| `bg-success` | `#18311f` |
| `bg-error` | `#381C1C` |
| `bg-warning` | `#38371C` |

---

## Text

### Leaf `text-*`

| Class |
| ----- |
| `text-primary` / `secondary` / `tertiary` / `quaternary` / `highlight` |
| `text-blue` / `green` / `yellow` / `orange` / `red` / `purple` |

### App-only

| Class | Ghi chú |
| ----- | ------- |
| `text-disabled` | `@theme --color-disabled` |
| `text-gray` | `@theme --color-gray` |

```tsx
<p className="body-3 text-primary" />
<span className="text-red">-2.5%</span>
```

---

## Border

Leaf `border-*` (viền lấy thang base / system):

| Class |
| ----- |
| `border-primary` … `border-quinary` |
| `border-highlight` |
| `border-blue` / `green` / `yellow` / `orange` / `red` / `purple` |

```tsx
<div className="border border-tertiary" />
<input className="border border-quaternary focus:border-highlight" />
```

## Radius

Bo góc do **app** sở hữu qua utility Tailwind (`rounded-xl`…). Scale `--radius-*`
được pin mặc định Tailwind trong `@theme` **và** lại trên `:root` trong
[`globals.css`](../../src/styles/globals.css) (`--radius-xl: 0.75rem` = 12px).

Chỉ pin `@theme` không đủ trên build prod: Leaf ≥0.1.2 khai báo
`--radius-xl: var(--spacing-xl)` (=24px) trên `:root` và đứng sau `@theme` trong
CSS emit → cascade thua. Block `:root` của app phải đứng sau import Leaf.

---

## Animation

Khai báo `@theme --animate-*` + `@keyframes` trong `globals.css`.

| Class | Dùng cho |
| ----- | -------- |
| `animate-marquee` | Ticker chỉ số chạy ngang (25s, lặp) |
| `animate-fadeIn` | Hiện modal / dropdown (0.3s) |
| `animate-fadeOut` | Ẩn modal / toast (0.5s) |
| `animate-slideInLeft` | Panel trượt vào từ trái (0.5s) |
| `animate-slideOutLeft` | Panel trượt ra (0.5s) |
| `animate-shimmer` | Skeleton loading (2s, lặp) |
| `animate-prixClipFix` | Vòng loading của `Spinner` (2s, lặp) |
| `animate-bubbleIn` | Bubble chỉ số thị trường xuất hiện (1s) |

```tsx
<div className="animate-fadeIn" />
<div className="animate-shimmer base-tertiary" />
```
