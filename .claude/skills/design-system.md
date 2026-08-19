# Design System

Quy tắc Design System cho FHSC Demo Trading — đồng bộ với `tailwind.config.js`. Chỉ gồm **Typography**, **Background**, **Text**, **Border**.

---

## Typography

Plugin Tailwind tạo class `font-{token}`. Breakpoint desktop: **`min-width: 768px`** (mobile trước, desktop sau).

Mỗi ô: **fontSize / lineHeight / fontWeight**.

| Class                    | Mobile            | Desktop (768px+)   |
| ------------------------ | ----------------- | ------------------ |
| `font-display-1`         | 36px / 56px / 500 | 76px / 160px / 500 |
| `font-display-2`         | 32px / 48px / 500 | 60px / 92px / 500  |
| `font-display-3`         | 26px / 44px / 500 | 36px / 76px / 500  |
| `font-heading-1`         | 24px / 34px / 500 | 32px / 44px / 500  |
| `font-heading-2`         | 22px / 30px / 500 | 28px / 40px / 500  |
| `font-heading-3`         | 20px / 28px / 500 | 24px / 36px / 500  |
| `font-heading-4`         | 18px / 26px / 500 | 20px / 32px / 500  |
| `font-body-1`            | 16px / 22px / 400 | 18px / 30px / 400  |
| `font-body-1-highlight`  | 16px / 22px / 500 | 18px / 30px / 500  |
| `font-body-2`            | 14px / 20px / 400 | 16px / 24px / 400  |
| `font-body-2-highlight`  | 14px / 20px / 500 | 16px / 24px / 500  |
| `font-body-3`            | 12px / 18px / 400 | 14px / 24px / 400  |
| `font-body-3-highlight`  | 12px / 18px / 500 | 14px / 24px / 500  |
| `font-caption`           | 10px / 14px / 400 | 12px / 20px / 400  |
| `font-caption-highlight` | 10px / 14px / 500 | 12px / 20px / 500  |
| `font-tiny`              | 9px / 12px / 400  | 11px / 16px / 400  |
| `font-tiny-highlight`    | 9px / 12px / 500  | 11px / 16px / 500  |

```tsx
<h1 className="font-heading-1 text-primary">Tiêu đề</h1>
<p className="font-body-2 text-secondary">Nội dung</p>
```

---

## Background

### `theme.extend.backgroundColor`

| Class           | Hex       |
| --------------- | --------- |
| `bg-primary`    | `#0d0e10` |
| `bg-secondary`  | `#171719` |
| `bg-tertiary`   | `#28292b` |
| `bg-quaternary` | `#313235` |
| `bg-quinary`    | `#ffffff` |
| `bg-disabled`   | `#2c2c2e` |

### `theme.extend.colors` (thêm `bg-*` accent / semantic)

`colors` sinh đủ bộ `bg-*`, `text-*`, `border-*` cho cùng một token.

| Class          | Hex         |
| -------------- | ----------- |
| `bg-highlight` | `#49d82f`   |
| `bg-blue`      | `#2994ff`   |
| `bg-green`     | `#3ac45c`   |
| `bg-yellow`    | `#e9cb36`   |
| `bg-orange`    | `#e98e00`   |
| `bg-red`       | `#eb4337`   |
| `bg-purple`    | `#b354e3`   |
| `bg-gray`      | `#999999`   |
| `bg-overlay`   | `#252525E5` |
| `bg-success`   | `#18311f`   |
| `bg-error`     | `#381C1C`   |
| `bg-warning`   | `#38371C`   |

```tsx
<div className="bg-primary" />
<div className="bg-secondary" />
<div className="bg-green" />
```

---

## Text

### `theme.extend.textColor`

| Class             | Hex       |
| ----------------- | --------- |
| `text-primary`    | `#f8f8f8` |
| `text-secondary`  | `#999999` |
| `text-tertiary`   | `#666666` |
| `text-quaternary` | `#0d0e10` |
| `text-disabled`   | `#666666` |

### `theme.extend.colors` (thêm `text-*` accent / semantic)

| Class            | Hex         |
| ---------------- | ----------- |
| `text-highlight` | `#49d82f`   |
| `text-blue`      | `#2994ff`   |
| `text-green`     | `#3ac45c`   |
| `text-yellow`    | `#e9cb36`   |
| `text-orange`    | `#e98e00`   |
| `text-red`       | `#eb4337`   |
| `text-purple`    | `#b354e3`   |
| `text-gray`      | `#999999`   |
| `text-overlay`   | `#252525E5` |
| `text-success`   | `#18311f`   |
| `text-error`     | `#381C1C`   |
| `text-warning`   | `#38371C`   |

```tsx
<p className="font-body-2 text-primary" />
<span className="text-red">-2.5%</span>
<span className="text-green">+1.8%</span>
```

---

## Border

`theme.extend.borderColor` — dùng với `border`, `border-t`, `ring`, v.v.

| Class               | Hex       |
| ------------------- | --------- |
| `border-primary`    | `#0d0e10` |
| `border-secondary`  | `#999999` |
| `border-tertiary`   | `#28292b` |
| `border-quaternary` | `#313235` |
| `border-quinary`    | `#ffffff` |

Cùng bảng `colors` trong config còn sinh `border-highlight`, `border-green`, … khi cần viền theo màu chứng khoán.

```tsx
<div className="border border-tertiary" />
<input className="border border-quaternary focus:border-highlight" />
```

---

## Animation

`theme.extend.animation` — dùng qua class `animate-{token}`.

| Class                  | Dùng cho                                |
| ---------------------- | --------------------------------------- |
| `animate-marquee`      | Ticker chỉ số chạy ngang (25s, lặp)     |
| `animate-fadeIn`       | Hiện modal / dropdown (0.3s)            |
| `animate-fadeOut`      | Ẩn modal / toast (0.5s)                 |
| `animate-slideInLeft`  | Panel trượt vào từ trái (0.5s)          |
| `animate-slideOutLeft` | Panel trượt ra (0.5s)                   |
| `animate-shimmer`      | Skeleton loading (2s, lặp)              |
| `animate-prixClipFix`  | Vòng loading của `Spinner` (2s, lặp)    |
| `animate-bubbleIn`     | Bubble chỉ số thị trường xuất hiện (1s) |

```tsx
<div className="animate-fadeIn" />
<div className="animate-shimmer bg-tertiary" />
```
