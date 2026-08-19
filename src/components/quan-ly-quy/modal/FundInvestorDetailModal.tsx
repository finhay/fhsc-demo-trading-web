import { FaCaretDown, FaCaretUp } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import { formatDateOrRaw } from '@/utils/format';

export const FundInvestorDetailModal = () => {
    const trans = useTranslate();
    const {
        selectedInvestor,
        isDetailOpen,
        selectInvestor,
        investorRows,
        holdings: allHoldings,
        transactions: allTransactions,
        prices,
    } = useFundDataStore();

    if (!isDetailOpen || !selectedInvestor) return null;

    const investor = selectedInvestor;
    const row = investorRows.find((r) => r.ma_ndt === investor.ma_ndt);
    const holdings = allHoldings.filter((h) => h.ma_ndt === investor.ma_ndt);
    const transactions = allTransactions
        .filter((t) => t.ma_ndt === investor.ma_ndt)
        .slice(-50)
        .reverse();

    const totalAum = investorRows.reduce((s, r) => s + r.nav, 0);
    const nav = row?.nav ?? 0;
    const pnlVsCapital = nav - investor.von_uy_thac_vnd;
    const returnPct = row?.return_pct ?? 0;
    const aumSharePct = totalAum > 0 ? (nav / totalAum) * 100 : 0;

    const thesisCapitalRows = investor.thesis.map((th) => ({
        sector: th.sector,
        pct: th.pct,
        amount: investor.von_uy_thac_vnd * (th.pct / 100),
    }));

    const startDateDisp = formatDateOrRaw(investor.ngay_uy_thac);

    return (
        <Dialog
            maxWidth="max-w-3xl"
            maxHeight="max-h-[70vh]"
            title={trans.fund.investor.detail.info.title}
            onClose={() => selectInvestor(null)}
        >
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-4 rounded-xl bg-secondary p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <h2 className="font-heading-4 text-primary">{investor.ho_ten}</h2>
                            <p className="font-caption text-secondary">
                                {trans.fund.investor.detail.subtitle_line_fn(
                                    investor.ma_ndt,
                                    startDateDisp,
                                )}
                            </p>
                        </div>
                        <span
                            className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2 py-1 font-tiny-highlight ${investor.trang_thai === 'active' ? 'bg-success text-green' : 'bg-tertiary text-secondary'}`}
                        >
                            {trans.fund.investor.status[investor.trang_thai]}
                        </span>
                    </div>
                    <hr className="border-tertiary" />
                    <div className="flex flex-wrap gap-2 [&>*]:w-full sm:[&>*]:w-[calc(50%-0.25rem)]">
                        <div className="flex flex-col gap-1">
                            <p className="font-caption text-secondary">
                                {trans.fund.investor.detail.nav}
                            </p>
                            <p className="font-heading-4 text-primary tabular-nums">
                                {formatNumberVNWithUnit(nav)}
                            </p>
                            <p
                                className={`inline-flex items-center gap-1 font-body-3-highlight tabular-nums ${
                                    pnlVsCapital >= 0 ? 'text-green' : 'text-red'
                                }`}
                            >
                                {pnlVsCapital >= 0 ? (
                                    <FaCaretUp size={14} aria-hidden="true" />
                                ) : (
                                    <FaCaretDown size={14} aria-hidden="true" />
                                )}
                                {formatNumberVNWithUnit(Math.abs(pnlVsCapital))}{' '}
                                <span className="font-body-3">
                                    ({returnPct >= 0 ? '+' : ''}
                                    {formatNumberVN(returnPct)}%)
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:text-right">
                            <p className="font-caption text-secondary">
                                {trans.fund.investor.detail.capital}
                            </p>
                            <p className="font-heading-4 text-primary tabular-nums">
                                {formatNumberVNWithUnit(investor.von_uy_thac_vnd)}
                            </p>
                            <p className="font-caption text-secondary">
                                {trans.fund.investor.detail.aum_share_suffix_fn(
                                    formatNumberVN(aumSharePct),
                                )}
                            </p>
                        </div>
                    </div>
                    <hr className="border-tertiary" />
                    <div className="flex flex-col gap-2">
                        <p className="font-caption text-secondary">
                            {trans.fund.investor.detail.thesis_and_weight}
                        </p>
                        {thesisCapitalRows.length === 0 ? (
                            <p className="font-body-3 text-tertiary">—</p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {thesisCapitalRows.map(({ sector, pct, amount }) => (
                                    <li
                                        key={`${investor.ma_ndt}-cap-${sector}`}
                                        className="flex min-w-0 items-center justify-between gap-2"
                                    >
                                        <span className="inline-flex min-w-0 max-w-xs overflow-hidden rounded-full">
                                            <span className="min-w-0 truncate bg-tertiary px-2 py-1 font-tiny text-secondary">
                                                {sector}
                                            </span>
                                            <span className="whitespace-nowrap border-l border-tertiary bg-quaternary px-2 py-1 font-tiny-highlight text-primary">
                                                {pct}%
                                            </span>
                                        </span>
                                        <span className="shrink-0 font-body-3-highlight text-primary tabular-nums">
                                            {formatNumberVNWithUnit(amount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <dl className="flex flex-wrap overflow-hidden rounded-xl bg-secondary [&>*]:w-1/2">
                    {(
                        [
                            [trans.fund.investor.detail.info.phone, investor.so_dien_thoai],
                            [trans.fund.investor.detail.info.rm, investor.rm_phu_trach],
                            [trans.fund.investor.detail.info.start_date, startDateDisp],
                            [
                                trans.fund.investor.detail.info.status,
                                trans.fund.investor.status[investor.trang_thai],
                            ],
                        ] as [string, string][]
                    ).map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-1 p-3">
                            <dt className="font-caption text-tertiary">{label}</dt>
                            <dd className="font-body-3-highlight text-primary">{value}</dd>
                        </div>
                    ))}
                </dl>
                {holdings.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h4 className="font-body-2-highlight text-primary">
                            {trans.fund.investor.detail.holdings.title}
                        </h4>
                        <div className="overflow-x-auto">
                            <table
                                className="w-full min-w-[520px]"
                                aria-label={trans.fund.investor.detail.holdings.title}
                            >
                                <thead>
                                    <tr className="border-b border-tertiary">
                                        {Object.values(
                                            trans.fund.investor.detail.holdings.columns,
                                        ).map((col) => (
                                            <th
                                                key={col}
                                                scope="col"
                                                className="pb-2 text-right font-tiny text-tertiary first:text-left"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map((h) => {
                                        const price = prices[h.ma_ck] ?? h.avg_cost;
                                        const value = h.khoi_luong * price;
                                        const cost = h.khoi_luong * h.avg_cost;
                                        const pnl = value - cost;
                                        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                                        return (
                                            <tr
                                                key={h.ma_ck}
                                                className="border-b border-tertiary last:border-0"
                                            >
                                                <td className="py-2 font-body-3-highlight text-primary">
                                                    {h.ma_ck}
                                                </td>
                                                <td className="py-2 text-right font-caption text-secondary">
                                                    {h.nganh}
                                                </td>
                                                <td className="py-2 text-right font-body-3 text-primary">
                                                    {formatNumberVN(h.khoi_luong, { decimals: 0 })}
                                                </td>
                                                <td className="py-2 text-right font-body-3 text-primary">
                                                    {formatNumberVN(h.avg_cost)}
                                                </td>
                                                <td className="py-2 text-right font-body-3 text-primary">
                                                    {formatNumberVN(price)}
                                                </td>
                                                <td className="py-2 text-right font-body-3 text-primary">
                                                    {formatNumberVNWithUnit(value)}
                                                </td>
                                                <td
                                                    className={`py-2 text-right font-body-3 ${pnl >= 0 ? 'text-green' : 'text-red'}`}
                                                >
                                                    {pnl >= 0 ? '+' : ''}
                                                    {formatNumberVNWithUnit(pnl)}
                                                </td>
                                                <td
                                                    className={`py-2 text-right font-body-3 ${pnlPct >= 0 ? 'text-green' : 'text-red'}`}
                                                >
                                                    {pnlPct >= 0 ? '+' : ''}
                                                    {formatNumberVN(pnlPct)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {transactions.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h4 className="font-body-2-highlight text-primary">
                            {trans.fund.investor.detail.transactions.title}
                        </h4>
                        <div className="overflow-x-auto">
                            <table
                                className="w-full min-w-[480px]"
                                aria-label={trans.fund.investor.detail.transactions.title}
                            >
                                <thead>
                                    <tr className="border-b border-tertiary font-tiny text-tertiary">
                                        <th scope="col" className="pb-2 text-left">
                                            {trans.fund.investor.detail.transactions.columns.date}
                                        </th>
                                        <th scope="col" className="pb-2 text-left">
                                            {trans.fund.investor.detail.transactions.columns.symbol}
                                        </th>
                                        <th scope="col" className="pb-2 text-left">
                                            {trans.fund.investor.detail.transactions.columns.type}
                                        </th>
                                        <th scope="col" className="pb-2 text-right">
                                            {
                                                trans.fund.investor.detail.transactions.columns
                                                    .quantity
                                            }
                                        </th>
                                        <th scope="col" className="pb-2 text-right">
                                            {trans.fund.investor.detail.transactions.columns.price}
                                        </th>
                                        <th scope="col" className="pb-2 text-right">
                                            {trans.fund.investor.detail.transactions.columns.amount}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr
                                            key={tx.ma_gd}
                                            className="border-b border-tertiary last:border-0"
                                        >
                                            <td className="py-2 font-caption text-secondary">
                                                {tx.ngay_khop}
                                            </td>
                                            <td className="py-2 font-body-3-highlight text-primary">
                                                {tx.ma_ck || '—'}
                                            </td>
                                            <td className="py-2 font-caption text-primary">
                                                {trans.fund.investor.detail.transactions.types[
                                                    tx.loai_lenh
                                                ] ?? tx.loai_lenh}
                                            </td>
                                            <td className="py-2 text-right font-body-3 text-primary">
                                                {tx.khoi_luong > 0
                                                    ? formatNumberVN(tx.khoi_luong, { decimals: 0 })
                                                    : '—'}
                                            </td>
                                            <td className="py-2 text-right font-body-3 text-primary">
                                                {tx.gia_khop > 0
                                                    ? formatNumberVN(tx.gia_khop)
                                                    : '—'}
                                            </td>
                                            <td
                                                className={`py-2 text-right font-body-3 ${tx.tong_tien >= 0 ? 'text-green' : 'text-red'}`}
                                            >
                                                {tx.tong_tien >= 0 ? '+' : ''}
                                                {formatNumberVNWithUnit(tx.tong_tien)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};
