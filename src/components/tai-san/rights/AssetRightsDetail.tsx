'use client';

import dayjs from 'dayjs';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { AssetRightsRow } from '@/components/tai-san/rights/AssetRightsRow';
import { RIGHT_EVENT_TYPE_LABELS, RIGHT_STATUS_COLOR_BY_LABEL } from '@/constants/assets';
import type { PaperRightItem } from '@/types/paper-trading/rights';
import { formatDateOrDash, formatNumberVN } from '@/utils/format';

type Props = {
    right: PaperRightItem | null;
};

const formatReceivedAt = (value: string | null): string => {
    if (!value) return '--';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '--';
};

export const AssetRightsDetail = ({ right }: Props) => {
    if (!right) {
        return (
            <div className="flex h-full items-center justify-center">
                <EmptyState />
            </div>
        );
    }

    const eventTypeLabel = RIGHT_EVENT_TYPE_LABELS[right.event_type] ?? right.event_type;
    const statusColor = RIGHT_STATUS_COLOR_BY_LABEL[right.status] ?? 'text-secondary';
    const isCashDividend = right.event_type === 'CASH_DIVIDEND';
    const isRightsOffering = right.event_type === 'RIGHTS_OFFERING';

    return (
        <section className="flex h-full flex-1 flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
                <AssetRightsRow label={'Loại sự kiện'} value={eventTypeLabel} />
                <div className="flex items-center justify-between gap-2">
                    <span className="body-4 text-secondary">{'Trạng thái'}</span>
                    <span className={`body-4 ${statusColor}`}>{right.status}</span>
                </div>
                <AssetRightsRow label={'Tỷ lệ'} value={right.ratio || '--'} />
                <AssetRightsRow
                    label={'Số lượng cổ phiếu sở hữu'}
                    value={`${formatNumberVN(right.owned_quantity, { decimals: 0 })} CP`}
                />
                {!isCashDividend && (
                    <AssetRightsRow
                        label={'Số lượng được nhận'}
                        value={`${formatNumberVN(right.entitled_quantity, { decimals: 0 })} CP`}
                    />
                )}
                {isCashDividend && (
                    <AssetRightsRow
                        label={'Cổ tức bằng tiền (sau thuế)'}
                        value={`${formatNumberVN(right.dividend_amount, { trimTrailingZeros: true })}đ`}
                    />
                )}
                {isRightsOffering && right.exercise_amount > 0 && (
                    <AssetRightsRow
                        label={'Tiền thực hiện quyền mua'}
                        value={`${formatNumberVN(right.exercise_amount, { trimTrailingZeros: true })}đ`}
                    />
                )}
            </div>
            <div className="flex flex-col gap-2 border-t border-tertiary pt-4">
                <AssetRightsRow
                    label={'Ngày giao dịch không hưởng quyền'}
                    value={formatDateOrDash(right.ex_date)}
                />
                <AssetRightsRow
                    label={'Ngày đăng ký cuối cùng'}
                    value={formatDateOrDash(right.record_date)}
                />
                <AssetRightsRow
                    label={'Ngày dự kiến về'}
                    value={formatDateOrDash(right.deliver_at)}
                />
                <AssetRightsRow label={'Thời điểm nhận'} value={formatReceivedAt(right.received_at)} />
            </div>
        </section>
    );
};
