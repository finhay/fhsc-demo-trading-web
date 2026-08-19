import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { FundStockChart } from '@/components/quan-ly-quy/portfolio/FundStockChart';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchStocksMetadataBySymbolsV4 } from '@/services/api/datafeed/stock-info';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type { FundOwnerRow, FundStockDetailMetricProps } from '@/types/pages/fund';
import { isSuccessApi } from '@/utils/common';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import type { StockSummary } from '@/utils/fund/fund';

type Props = {
    stock: StockSummary | null;
};

export const FundStockDetail = ({ stock }: Props) => {
    const trans = useTranslate();
    const { holdings, investors } = useFundDataStore();
    const [meta, setMeta] = useState<StocksInfoItem | null>(null);

    useEffect(() => {
        if (!stock) return;
        let alive = true;
        const fetchMeta = async () => {
            try {
                const { result, error_code } = await fetchStocksMetadataBySymbolsV4(stock.ma_ck);
                if (!alive) return;
                if (isSuccessApi(error_code)) {
                    setMeta(result[0] ?? null);
                }
            } catch {
                if (!alive) return;
                setMeta(null);
            }
        };
        fetchMeta();
        return () => {
            alive = false;
        };
    }, [stock?.ma_ck]);

    if (!stock) {
        return <EmptyState />;
    }

    const invMap = new Map(investors.map((i) => [i.ma_ndt, i]));

    const ownerList = holdings.filter((h) => h.ma_ck === stock.ma_ck);
    const ownerTotal =
        stock.total_kl > 0 ? stock.total_kl : ownerList.reduce((s, h) => s + h.khoi_luong, 0);
    const ownerRows: FundOwnerRow[] = ownerList
        .map((h) => {
            const inv = invMap.get(h.ma_ndt);
            const matchThesis = inv?.thesis.find((th) => th.sector === h.nganh);
            const sector = matchThesis?.sector ?? h.nganh;
            const pct = ownerTotal > 0 ? (h.khoi_luong / ownerTotal) * 100 : 0;
            return {
                ma_ndt: h.ma_ndt,
                ho_ten: inv?.ho_ten ?? h.ma_ndt,
                sector,
                pct,
                khoi_luong: h.khoi_luong,
            };
        })
        .sort((a, b) => b.khoi_luong - a.khoi_luong);

    const displayPrice = meta?.price ?? stock.current_price;
    const priceChange = meta?.price_change ?? stock.current_price - stock.weighted_avg_cost;
    const priceChangePct =
        meta?.price_change_percent ??
        (stock.weighted_avg_cost > 0
            ? ((stock.current_price - stock.weighted_avg_cost) / stock.weighted_avg_cost) * 100
            : 0);
    const companyName = meta?.name?.trim() || stock.nganh;

    const priceFmt = `${formatNumberVN(Math.round(displayPrice))}đ`;
    const changeAbs = `${priceChange >= 0 ? '+' : '-'}${formatNumberVN(Math.round(Math.abs(priceChange)))}đ`;
    const changeCls = priceChange >= 0 ? 'text-green' : 'text-red';

    return (
        <article className="scrollbar flex min-h-0 flex-col gap-2 overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b border-tertiary pb-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="font-heading-4 text-primary">{stock.ma_ck}</h3>
                    <p className="truncate font-body-3 text-secondary">{companyName}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-tertiary/50 p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <p className={`font-heading-4 ${changeCls}`}>{priceFmt}</p>
                        <p className={`font-body-3-highlight ${changeCls}`}>
                            {changeAbs} ({priceChangePct >= 0 ? '+' : ''}
                            {formatNumberVN(priceChangePct)}%)
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-1 text-center">
                    <FundStockChart symbol={stock.ma_ck} />
                    <div className="flex justify-between font-caption text-tertiary">
                        <span>{trans.fund.portfolio.detail.chart_from}</span>
                        <span>{trans.fund.portfolio.detail.chart_to}</span>
                    </div>
                </div>
                <dl className="flex flex-wrap gap-2 [&>*]:w-[calc(50%-0.25rem)]">
                    <Metric
                        label={trans.fund.portfolio.detail.metric_kl}
                        value={`${formatNumberVN(stock.total_kl, { decimals: 0 })} ${trans.fund.portfolio.detail.unit_shares}`}
                    />
                    <Metric
                        label={trans.fund.portfolio.detail.metric_value}
                        value={formatNumberVNWithUnit(stock.current_value)}
                    />
                    <Metric
                        label={trans.fund.portfolio.detail.metric_avg_cost}
                        value={`${formatNumberVN(Math.round(stock.weighted_avg_cost))}đ`}
                        valueClassName="text-orange"
                    />
                    <Metric
                        label={trans.fund.portfolio.detail.metric_pnl}
                        value={`${stock.pnl >= 0 ? '+' : ''}${formatNumberVNWithUnit(stock.pnl)}`}
                        valueClassName={stock.pnl >= 0 ? 'text-green' : 'text-red'}
                    />
                </dl>
            </div>
            <div className="rounded-xl bg-secondary">
                <div className="border-b border-tertiary px-4 py-2">
                    <span className="inline-block border-b-2 border-highlight pb-1 font-body-3-highlight text-highlight">
                        {trans.fund.portfolio.detail.allocation_title}
                    </span>
                </div>
                <div className="scrollbar max-h-52 overflow-auto p-2">
                    {ownerRows.length === 0 ? (
                        <div className="flex min-h-48 items-center justify-center">
                            <EmptyState />
                        </div>
                    ) : (
                        <table
                            className="w-full min-w-80"
                            aria-label={trans.fund.portfolio.detail.allocation_title}
                        >
                            <thead>
                                <tr className="border-b border-tertiary font-caption-highlight text-tertiary">
                                    <th scope="col" className="p-2 text-left">
                                        {trans.fund.portfolio.detail.allocation_columns.investor}
                                    </th>
                                    <th scope="col" className="p-2 text-center">
                                        {trans.fund.portfolio.detail.allocation_columns.thesis}
                                    </th>
                                    <th scope="col" className="p-2 text-right">
                                        {trans.fund.portfolio.detail.allocation_columns.ratio}
                                    </th>
                                    <th scope="col" className="p-2 text-right">
                                        {trans.fund.portfolio.detail.allocation_columns.quantity}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownerRows.map((r) => (
                                    <tr
                                        key={r.ma_ndt}
                                        className="border-b border-tertiary last:border-0"
                                    >
                                        <td className="p-2">
                                            <p className="font-body-3-highlight text-primary">
                                                {r.ho_ten}
                                            </p>
                                            <p className="font-tiny text-tertiary">{r.ma_ndt}</p>
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className="inline-flex overflow-hidden rounded-full font-caption-highlight">
                                                <span className="bg-blue/15 px-2 py-1 text-blue">
                                                    {r.sector}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-body-3 text-primary">
                                            {formatNumberVN(r.pct, { decimals: 0 })}%
                                        </td>
                                        <td className="p-2 text-right font-body-3 text-primary">
                                            {formatNumberVN(r.khoi_luong, { decimals: 0 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </article>
    );
};

const Metric = ({ label, value, valueClassName = 'text-primary' }: FundStockDetailMetricProps) => (
    <div className="flex flex-col gap-1 rounded-xl bg-quaternary/40 px-3 py-2">
        <dt className="font-caption text-tertiary">{label}</dt>
        <dd className={`font-body-3-highlight ${valueClassName}`}>{value}</dd>
    </div>
);
