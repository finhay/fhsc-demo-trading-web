This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

NodeJS version v18.13.0

Add file .env.local to root directory

```bash
FINHAY_ACCOUNT_GATEWAY = https://stg.finhay.app/gw
VNSC_SERVICE = https://dev-api.vinasecurities.com
CLIENT_ID_VIETQR = 80a4e500-767f-4b96-8649-cfebe39881c7
API_KEY_VIETQR = cacb486e-b53a-4a5d-a553-7bfe546287e4
VNSC_DATAFEED_SERVICE = https://dev-api.vinasecurities.com/datafeed/
MQTT_BASE_URL = mqtts://emqx.vinasecurities.com:8883
MQTT_BASE_URL_WSS = wss://emqx.vinasecurities.com:8443/mqtt
MQTT_BASE_URL_WSS_2 = wss://emqx02.vinasecurities.com:8443/mqtt
```

```bash
npm install
# or
yarn install

npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
