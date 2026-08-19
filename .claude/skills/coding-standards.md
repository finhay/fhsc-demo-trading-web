# Coding Standards

Quy tắc code cho FHSC Demo Trading — bám theo các page và component đang active.

---

## Thư viện ưu tiên

| Mục đích         | Thư viện                                               |
| ---------------- | ------------------------------------------------------ |
| State Management | zustand                                                |
| HTTP             | axios qua `vnscService` (`@/services/interceptor`)     |
| Form             | @tanstack/react-form                                   |
| Table            | @tanstack/react-table + @tanstack/react-virtual        |
| Debounce         | @tanstack/react-pacer (`useDebouncer`)                 |
| Hotkeys          | internal hook (`@/hooks/lib/useHotkeys`)               |
| Date/Time        | dayjs                                                  |
| Charts           | echarts (qua `@/hooks/chart/useECharts*`)              |
| Realtime         | mqtt + protobufjs (`@/hooks/useMQTT`, `@/proto/stock`) |
| Icons            | react-icons (`fa6`, `fa`, `fi`, `fc`)                  |
| Toast            | internal (`@/hooks/lib/useToast`)                      |
| Styling          | Tailwind CSS + Design System                           |

Thư viện chuyên dụng, chỉ dùng đúng chỗ: `swiper` (carousel chỉ số), `react-qr-code` +
`react-otp-input` (xác thực lệnh & đăng nhập), `@dnd-kit` (kéo thả watchlist),
`react-google-recaptcha` (OTP), `react-pdf` (hợp đồng).

> **Không có trong dự án**: React Query, react-hook-form, Zod, shadcn/ui, lodash, highcharts,
> next-seo, nprogress, và mọi thư viện SEO / analytics / tracking (GA, GTM).
> Cần helper nhỏ thì dùng **Native JavaScript**.

---

## Naming Conventions

| Loại              | Convention                                     | Ví dụ                                  |
| ----------------- | ---------------------------------------------- | -------------------------------------- |
| Folders           | kebab-case                                     | `bang-gia/`, `tai-san/`                |
| Component files   | PascalCase                                     | `TradePanel.tsx`, `IBoardTable.tsx`    |
| Hook files        | camelCase                                      | `useDebounce.ts`, `useClickOutside.ts` |
| Other files       | camelCase                                      | `useAssetStore.ts`, `assets.ts`        |
| Components        | PascalCase                                     | `TradePanel`, `AssetPortfolioTable`    |
| Hooks             | `use` + PascalCase                             | `useDebounce`, `useAuthStore`          |
| Types/Models      | PascalCase                                     | `PortfolioItem`, `StocksInfoItem`      |
| Props type        | `Props` (trong file) hoặc `ComponentNameProps` | `type Props = {...}`                   |
| Constants         | UPPER_SNAKE_CASE                               | `TRADE_PAGE_META`, `ACCOUNT_TYPE`      |
| Boolean variables | `is` prefix                                    | `isLoading`, `isVisible`               |

### type vs interface

Code mới luôn dùng `type`, không dùng `interface`:

```typescript
// ✅
type User = { id: string; name: string };

// ❌
interface User {
    id: string;
    name: string;
}
```

> Còn 8 chỗ `interface` cũ (`types/datafeed/stock-event.ts`, `proto/stock.ts`,
> `hooks/lib/useToast.ts`, `components/common/feature/PDFViewer.tsx`) — đổi dần khi sửa tới,
> đừng thêm mới.

### Export

**Page** (`app/**/page.tsx`) → `export default function` + `export const metadata`:

```typescript
export const metadata: Metadata = { title: 'Giao dịch', description: 'Giao dịch' };

export default function Page() {
    return <TradeView />;
}
```

**Component** → `export const` với `type Props`:

```typescript
type Props = {
    symbol: string;
    onSelect?: (id: string) => void;
};

export const TradeSymbolInfo = ({ symbol, onSelect }: Props) => {
    return <div>...</div>;
};
```

**CSR Component** → `'use client'` ở đầu file, **không dùng `next/dynamic`**:

```typescript
// ❌
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('./Chart'), { ssr: false });

// ✅
'use client';
export const Chart = ({ data }: Props) => <div />;
```

### Import paths

Luôn dùng `@` alias — không dùng relative paths:

```typescript
// ✅
import { useDebounce } from '@/hooks/useDebounce';

// ❌
import { useDebounce } from '../../../hooks/useDebounce';
```

Prettier (`@trivago/prettier-plugin-sort-imports`) tự sắp xếp và nhóm import — đừng sắp tay,
cũng đừng chèn comment giữa các dòng import.

---

## Component Structure

Thứ tự nhất quán trong một component:

1. **Props type**
2. **State & Hooks** — local state → store → ref
3. **Derived variables** — tính từ state/props
4. **Handler functions** — API handlers → logic handlers → UI handlers
5. **useEffect**
6. **return JSX**

```typescript
type Props = { userId: string };

export const OrderList = ({ userId }: Props) => {
    // 2. State & Hooks
    const [searchTerm, setSearchTerm] = useState('');
    const { orders, fetchOrders } = useOrderStore();
    const tableRef = useRef<HTMLDivElement>(null);

    // 3. Derived
    const filteredOrders = orders.filter((o) => o.name.includes(searchTerm));

    // 4. Handlers
    const handleRefresh = async () => { await fetchOrders(userId); };
    const handleSearch = (value: string) => { setSearchTerm(value); };

    // 5. Effects
    useEffect(() => {
        fetchOrders(userId);
    }, [userId]);

    // 6. JSX
    return <div ref={tableRef}>...</div>;
};
```

### JSX compact — không có dòng trống giữa elements

```tsx
// ❌
return (
    <div>
        <Header />

        <Content />
    </div>
);

// ✅
return (
    <div>
        <Header />
        <Content />
    </div>
);
```

---

## useEffect

Gộp các `useEffect` có cùng dependency:

```typescript
// ❌
useEffect(() => {
    fetchUserData();
}, [userId]);
useEffect(() => {
    fetchUserOrders();
}, [userId]);

// ✅
useEffect(() => {
    fetchUserData();
    fetchUserOrders();
}, [userId]);
```

---

## State Management — Zustand

Dùng Zustand khi state cần chia sẻ giữa nhiều component hoặc cần load/reset theo lifecycle trang.
Page đơn giản dùng `useState` + gọi API trực tiếp là đủ.

### Thứ tự trong store

```
state variables → API functions → logic functions → reset
```

```typescript
import { create } from 'zustand';

import { toast } from '@/hooks/lib/useToast';
import { getOrders } from '@/services/api/trade/orders';
import { isSuccessApi } from '@/utils/common';

type State = {
    orders: Order[];
    isLoading: boolean;
};

type Actions = {
    fetchOrders: (userId: string) => Promise<void>;
    reset: () => void;
};

const initialState: State = { orders: [], isLoading: false };

export const useOrderStore = create<State & Actions>((set) => ({
    ...initialState,

    fetchOrders: async (userId) => {
        set({ isLoading: true });
        try {
            const { data, error_code, message } = await getOrders(userId);
            if (isSuccessApi(error_code)) {
                set({ orders: data });
            } else {
                toast.error(message);
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => set(initialState),
}));
```

---

## API Call Pattern

Không gọi axios trực tiếp trong component — gói trong `services/api/`.

Hai instance trong `@/services/interceptor`:

| Instance              | Base URL                   | Dùng cho                                      |
| --------------------- | -------------------------- | --------------------------------------------- |
| `vnscService`         | `NEXT_PUBLIC_API_URL`      | accounts, auth, trade, payments — có Bearer   |
| `vnscServiceDatafeed` | `NEXT_PUBLIC_DATAFEED_URL` | dữ liệu thị trường (`services/api/datafeed/`) |

Interceptor tự gắn `Authorization`, `device-id`, `x-access-key`, `Accept-Language: vi`
và tự refresh token khi 401 — service function không tự set các header này.

### Gọi API đơn giản (không cần store)

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
    setIsLoading(true);
    try {
        const { error_code, message } = await postSomething(payload);
        if (isSuccessApi(error_code)) {
            toast.success('Thành công');
        } else {
            toast.error(message);
        }
    } catch {
        toast.error('Có lỗi xảy ra');
    } finally {
        setIsLoading(false);
    }
};
```

### Gọi API trong component (load theo lifecycle)

```typescript
const fetchData = async () => {
    setIsLoading(true);
    try {
        const { data, error_code } = await getSomething();
        if (isSuccessApi(error_code)) setData(data);
    } catch {
        // ignore hoặc log
    } finally {
        setIsLoading(false);
    }
};

useEffect(() => {
    fetchData();
}, []);
```

---

## Form — TanStack Form

Dùng `@tanstack/react-form`. Xem giá trị field realtime qua `useStore(form.store, ...)`.

```typescript
import { useForm, useStore } from '@tanstack/react-form';

import { toast } from '@/hooks/lib/useToast';

const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
        await handleLogin(value);
    },
});

// Watch field value
const username = useStore(form.store, (state) => state.values.username);
const canSubmit = useStore(
    form.store,
    (state) => state.canSubmit && !state.isSubmitting && !!username,
);
```

JSX:

```tsx
<form
    onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    }}
>
    <form.Field
        name="username"
        validators={{
            onChange: ({ value }) => (!value ? 'Bắt buộc' : undefined),
        }}
    >
        {(field) => (
            <InputField
                value={field.state.value}
                error={field.state.meta.errors?.[0]}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
            />
        )}
    </form.Field>
    <button type="submit" disabled={!canSubmit}>
        Đăng nhập
    </button>
</form>
```

---

## Table — TanStack Table + Virtual

```typescript
import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
});

const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 5,
});
```

---

## Chart — ECharts

Không import `echarts` trực tiếp trong component — dùng hook trong `@/hooks/chart/`:

| Hook                        | Dùng khi                                                      |
| --------------------------- | ------------------------------------------------------------- |
| `useEChartsInstance`        | 1 chart / component — trả `chartInstanceRef`                  |
| `useEChartsInstances`       | Nhiều chart động trong cùng component (quản lý theo `Map`)    |
| `useEChartsOption`          | `setOption` lại khi deps đổi (đã bọc `requestAnimationFrame`) |
| `useEChartsTooltipAutoHide` | Tự ẩn tooltip khi con trỏ rời chart                           |

```typescript
const chartRef = useRef<HTMLDivElement>(null);
const chartInstanceRef = useEChartsInstance(chartRef);

useEChartsOption(chartInstanceRef, () => createSomeChartOptions(data), { deps: [data] });

return <div ref={chartRef} className="h-44 w-full shrink-0" />;
```

Hàm dựng `EChartsOption` dùng lại nhiều nơi đặt trong `src/config/market/*.ts`
(ví dụ `market-flow.ts`, `market-heatmap.ts`). Component chỉ truyền data vào.

---

## Debounce — TanStack Pacer

Dùng `useDebouncer` từ `@tanstack/react-pacer`. Gọi `.maybeExecute(value)` để trigger.

```typescript
import { type ReactDebouncerOptions, useDebouncer } from '@tanstack/react-pacer';

const searchDebouncer = useDebouncer(
    async (keyword: string) => {
        const { result, error_code } = await searchStocks(keyword);
        if (isSuccessApi(error_code)) setResults(result);
    },
    { wait: 300 } as unknown as ReactDebouncerOptions<(k: string) => Promise<void>>,
);

const handleChange = (value: string) => {
    setKeyword(value);
    searchDebouncer.maybeExecute(value);
};
```

---

## Hotkeys — Internal Hook

Dùng `useHotkeys` — mỗi call bind một phím:

```typescript
import { useHotkeys } from '@/hooks/lib/useHotkeys';

// Đóng modal khi nhấn Escape
useHotkeys('Escape', () => onClose());

// Điều hướng dropdown khi input đang focus
useHotkeys('ArrowDown', () => setFocusedIndex((prev) => prev + 1), {
    enabled: isInputFocused,
    ignoreInputs: false,
});
```

Options:

```typescript
type Options = {
    enabled?: boolean; // default: true
    ignoreInputs?: boolean; // default: true — bỏ qua khi focus vào INPUT/TEXTAREA/SELECT
};
```

---

## Realtime — MQTT

```typescript
import { useMQTT } from '@/hooks/useMQTT';

// Signature: useMQTT(topic, handler, enabled?)
useMQTT(
    `stock/${symbol}/price`,
    (topic, message) => {
        const decoded = StockPriceMessage.decode(message);
        setPrice(decoded.price);
    },
    !!symbol,
);

// Nhiều topic
useMQTT(['stock/VIC/price', 'stock/VHM/price'], (topic, message) => {
    /* handle */
});
```

---

## Number & Date Formatting

```typescript
import dayjs from 'dayjs';

import { formatNumberVN } from '@/utils/format';

formatNumberVN(1234567); // "1.234.567"
formatNumberVN(1234.56); // "1.234,56"

dayjs(date).format('DD/MM/YYYY'); // "12/03/2026"
dayjs(date).format('DD/MM/YYYY HH:mm');
```

---

## Icons

Prettier sắp xếp lại import nên đừng đặt comment giữa các dòng `import`:

```typescript
import { FaArrowDown, FaXmark } from 'react-icons/fa6';
// Font Awesome 6 — ưu tiên
import { FcOk } from 'react-icons/fc';
// Flat Color Icons
import { FiSearch } from 'react-icons/fi';

// Feather Icons
```

---

## Toast

Project dùng **internal toast** — không dùng `react-toastify`.

**Import:**

```typescript
import { toast } from '@/hooks/lib/useToast';
```

**Sử dụng:**

```typescript
toast.success('Thành công');
toast.error(message);
toast.warning('Cảnh báo');
toast.error('Có lỗi xảy ra'); // fallback khi catch
```

**Tùy chọn duration (ms, mặc định 4000):**

```typescript
toast.success('Lưu thành công', { duration: 2000 });
toast.error('Lỗi nghiêm trọng', { duration: -1 }); // không tự đóng
toast.error('Đặt lệnh thất bại', { description: 'Số dư không đủ' });
```

**Render `ToastContainer` trong `_app.tsx`** (đã có sẵn, không cần thêm):

```tsx
import { ToastContainer } from '@/components/common/ui/Toast';

// trong _app.tsx
<ToastContainer />;
```

> `toast` gọi được ở bất kỳ đâu — trong component, store, service — vì dùng `useToastStore.getState()` nên không cần React context.

---

## Native JS — không thêm utility library

Dự án **không có lodash**. Đừng cài thêm; dùng API sẵn có của JS:

```typescript
const copy = structuredClone(obj);
const isEmpty = arr.length === 0;
const names = items.map((item) => item.name);
const active = items.filter((item) => item.active);
const bySymbol = Object.groupBy(items, (item) => item.symbol);
```
