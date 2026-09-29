'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { AssetRightsRow } from '@/components/tai-san/rights/AssetRightsRow';
import { RIGHT_EVENT_TYPE_LABELS, RIGHT_STATUS_COLOR_BY_LABEL } from '@/constants/assets';
import type { PaperRightItem } from '@/types/paper-trading/rights';
import { formatDateOrDash, formatNumberVN } from '@/utils/format';

type Props = {
    right: PaperRightItem | null;
};

const formatExercisePrice = (value: number | null): string => {
    if (value == null || value === 0) return '--';
    return `${formatNumberVN(value, { trimTrailingZeros: true })}đ`;
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
    const isRightsOffering = right.event_type === 'RIGHTS_OFFERING';
    const isCashDividend = right.event_type === 'CASH_DIVIDEND';

    return (
        <section className="flex h-full flex-1 flex-col gap-4 overflow-y-auto">
            <AssetRightsRow label={'Loại sự kiện'} value={eventTypeLabel} />
            <div className="flex items-center justify-between gap-2">
                <span className="body-4 text-secondary">{'Trạng thái'}</span>
                <span className={`body-4 ${statusColor}`}>{right.status}</span>
            </div>
            <AssetRightsRow
                label={'Ngày đăng ký cuối cùng'}
                value={formatDateOrDash(right.record_date)}
            />
            <AssetRightsRow
                label={'Ngày giao dịch không hưởng quyền'}
                value={formatDateOrDash(right.ex_date)}
            />
            {isRightsOffering ? (
                <>
                    <AssetRightsRow
                        label={'Tỷ lệ sở hữu/quyền'}
                        value={right.ownership_to_right_ratio || '--'}
                    />
                    {right.right_to_share_ratio && (
                        <AssetRightsRow
                            label={'Tỷ lệ quyền/được mua'}
                            value={right.right_to_share_ratio}
                        />
                    )}
                    <AssetRightsRow
                        label={'Giá mua'}
                        value={formatExercisePrice(right.exercise_price)}
                    />
                </>
            ) : (
                <AssetRightsRow label={'Tỷ lệ'} value={right.ownership_to_right_ratio || '--'} />
            )}
            <div className="h-px w-full shrink-0 base-tertiary" />
            <AssetRightsRow
                label={'Số lượng sở hữu'}
                value={formatNumberVN(right.owned_quantity, { decimals: 0 })}
            />
            {isCashDividend ? (
                <AssetRightsRow
                    label={'Cổ tức bằng tiền (sau thuế)'}
                    value={`${formatNumberVN(right.dividend_amount, { trimTrailingZeros: true })}đ`}
                />
            ) : (
                <AssetRightsRow
                    label={isRightsOffering ? 'Số lượng được mua' : 'Số lượng được nhận'}
                    value={formatNumberVN(right.entitled_quantity, { decimals: 0 })}
                />
            )}
            <AssetRightsRow
                label={'Ngày nhận dự kiến'}
                value={formatDateOrDash(right.deliver_at)}
            />
        </section>
    );
};
