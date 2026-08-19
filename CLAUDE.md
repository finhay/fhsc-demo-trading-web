# FHSC Demo Trading

Web application giao dịch chứng khoán — Next.js 14 (Page Router), TypeScript, Zustand, Tailwind CSS.

---

## Stack chính

Next.js 14 · TypeScript · Zustand · Tailwind CSS + shadcn/ui · Axios · React Query · react-hook-form + Zod · MQTT

---

## Skills

| File                                                        | Phạm vi                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| [project-structure.md](.claude/skills/project-structure.md) | Cấu trúc page mới — layers: page / component / service / store / i18n |
| [coding-standards.md](.claude/skills/coding-standards.md)   | Naming, API pattern, Zustand, React Query, form                       |
| [design-system.md](.claude/skills/design-system.md)         | Typography, background, text, border (Tailwind tokens)                |

---

## Request Headers

```
Authorization: Bearer {access_token}
device-type: WEB
device-id: {uuid}
x-channel: ONLINE
x-access-key: {access_key}
Accept-Language: vi|en
```

---

## Golden Rules

1. **Design System** cho color/typography — **Tailwind** cho spacing/layout
2. **kebab-case** file/folder — **PascalCase** component/type
3. **API calls** qua `services/api/`, không gọi trực tiếp trong component
4. Folder không nested quá 3 cấp
