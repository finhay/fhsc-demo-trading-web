import { SUB_ACCOUNT_PERMISSION, SUB_ACCOUNT_TYPE } from '@/constants/common';
import { PAPER_ACCOUNT_PREFIX, PAPER_ACCOUNT_TYPE_NAME } from '@/constants/paper-trading';
import type { SubAccount } from '@/types/accounts/profile';

export const buildPaperAccountId = (userId?: string | null): string =>
    userId ? `${PAPER_ACCOUNT_PREFIX}${userId}` : '';

/**
 * Tiểu khoản SIM không nằm trong `profile.sub_accounts` của API thật, nên ta dựng một
 * `SubAccount` tương đương rồi bơm vào `useAuthStore`. Nhờ vậy toàn bộ component đang đọc
 * `activeSubAccount?.sub_account_id` chạy đúng mà không phải sửa.
 *
 * Chỉ cấp TRADE + STOCK_HISTORY, KHÔNG cấp ALL — `hasSubAccountPermission` kiểm tra
 * `includes(ALL) || includes(permission)` nên cấp ALL sẽ bật lại các chức năng tiền đã bị gỡ.
 */
export const buildPaperSubAccount = (userId?: string | null): SubAccount | null => {
    const accountId = buildPaperAccountId(userId);
    if (!accountId) return null;

    return {
        sub_account_id: accountId,
        sub_account_ext: accountId,
        account_type: SUB_ACCOUNT_TYPE.NORMAL,
        account_type_name: PAPER_ACCOUNT_TYPE_NAME,
        account_type_as_text: PAPER_ACCOUNT_TYPE_NAME,
        product_type_name: PAPER_ACCOUNT_TYPE_NAME,
        fee_rate: 0,
        permissions: [SUB_ACCOUNT_PERMISSION.TRADE, SUB_ACCOUNT_PERMISSION.STOCK_HISTORY],
    };
};
