import { useState } from 'react';

import { FaArrowDown, FaLock, FaTrash, FaXmark } from 'react-icons/fa6';
import { RiDownloadLine, RiSave3Line } from 'react-icons/ri';

import { FundResetModal } from '@/components/quan-ly-quy/modal/FundResetModal';
import { FundVaultLockButton } from '@/components/quan-ly-quy/vault/FundVaultLockButton';
import {
    FUND_EXPORT_STAGGER_DELAY_MS,
    FUND_SUB_NAV_TABS,
    FUND_TAB,
    FUND_TEMPLATE_DOWNLOAD_URL,
} from '@/constants/fund';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import type { FundTab } from '@/types/pages/fund';
import {
    downloadBlob,
    downloadCsv,
    serializeInvestorsToCsv,
    serializeTransactionsToCsv,
} from '@/utils/fund/fund';
import { exportVaultBackup } from '@/utils/fund/fund-backup';

export const FundNavigation = () => {
    const trans = useTranslate();
    const {
        activeTab,
        setActiveTab,
        selectInvestor,
        investorRows,
        investors,
        transactions,
        clearAllData,
    } = useFundDataStore();
    const { resetStore } = useFundTradeStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const [isLocalDataNoticeVisible, setLocalDataNoticeVisible] = useState(true);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const hasData = investorRows.length > 0;

    const changeTab = (tab: FundTab) => {
        if (activeTab === FUND_TAB.CLIENTS && tab !== FUND_TAB.CLIENTS) selectInvestor(null);
        if (tab === FUND_TAB.IMPORT && activeTab !== FUND_TAB.IMPORT) resetStore();
        setActiveTab(tab);
    };

    const downloadTemplate = async () => {
        const { url, filename } = FUND_TEMPLATE_DOWNLOAD_URL;
        const safeUrl = encodeURI(url);
        startLoading();
        try {
            const response = await fetch(safeUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch {
            window.open(safeUrl, '_blank', 'noopener,noreferrer');
        } finally {
            stopLoading();
        }
    };

    const exportAllFiles = () => {
        downloadCsv(`template-giao-dich.csv`, serializeTransactionsToCsv(transactions));
        setTimeout(() => {
            downloadCsv(`template-khach-hang.csv`, serializeInvestorsToCsv(investors));
        }, FUND_EXPORT_STAGGER_DELAY_MS);
    };

    const exportBackup = async () => {
        try {
            const blob = await exportVaultBackup();
            downloadBlob(`fund-vault-backup-${new Date().toISOString().slice(0, 10)}.enc`, blob);
            toast.success(trans.fund.vault.backup.export_done);
        } catch {
            toast.error(trans.fund.common.messages.import_error);
        }
    };

    const confirmReset = async () => {
        try {
            await clearAllData();
            resetStore();
            setActiveTab(FUND_TAB.DASHBOARD);
            setIsResetModalOpen(false);
            toast.success(trans.fund.common.messages.data_cleared);
        } catch {
            toast.error(trans.fund.common.messages.import_error);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <nav
                    className="flex items-center gap-2 overflow-x-auto"
                    role="tablist"
                    aria-label={trans.fund.common.title}
                >
                    {FUND_SUB_NAV_TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => changeTab(tab.key)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-6 py-2 font-body-3 transition-colors ${
                                    isActive
                                        ? 'bg-success text-highlight'
                                        : 'bg-tertiary text-secondary'
                                }`}
                            >
                                {trans.fund.common.nav[tab.labelKey]}
                            </button>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => hasData && setIsResetModalOpen(true)}
                        disabled={!hasData}
                        className={`flex items-center gap-2 rounded-full py-2 px-4 font-caption-highlight 
                            ${
                                !hasData
                                    ? 'text-disabled bg-disabled cursor-not-allowed'
                                    : 'text-red bg-red/20 cursor-pointer'
                            }`}
                    >
                        <FaTrash size={12} aria-hidden="true" />
                        <span>{trans.fund.common.reset_data}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => hasData && exportAllFiles()}
                        disabled={!hasData}
                        className={`flex items-center gap-2 rounded-full py-2 px-4 font-caption-highlight 
                            ${
                                !hasData
                                    ? 'text-disabled bg-disabled cursor-not-allowed'
                                    : 'text-green bg-green/20 cursor-pointer'
                            }`}
                    >
                        <FaArrowDown size={12} aria-hidden="true" />
                        <span>{trans.fund.common.export_csv}</span>
                    </button>
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 rounded-full py-2 px-4 font-caption-highlight bg-success text-highlight"
                    >
                        <RiDownloadLine size={12} aria-hidden="true" />
                        <span>{trans.fund.common.download_template}</span>
                    </button>
                    <button
                        type="button"
                        onClick={exportBackup}
                        className="flex items-center gap-2 rounded-full bg-blue/20 px-4 py-2 font-caption-highlight text-blue"
                    >
                        <RiSave3Line size={12} aria-hidden="true" />
                        <span>{trans.fund.vault.backup.export}</span>
                    </button>
                    <FundVaultLockButton />
                </div>
            </div>
            {isLocalDataNoticeVisible && (
                <aside className="flex items-start gap-2 rounded-xl border border-quaternary/80 bg-blue/10 px-4 py-2">
                    <FaLock size={14} className="shrink-0 text-blue" aria-hidden="true" />
                    <p className="min-w-0 flex-1 font-caption leading-snug">
                        <span className="font-caption-highlight text-primary">
                            {trans.fund.common.local_data_notice_title}
                        </span>{' '}
                        <span className="text-secondary">
                            {trans.fund.common.local_data_notice_body}
                        </span>
                    </p>
                    <button
                        type="button"
                        onClick={() => setLocalDataNoticeVisible(false)}
                        aria-label={trans.fund.common.local_data_notice_close_aria}
                        className="shrink-0 rounded-xl p-1 text-secondary"
                    >
                        <FaXmark size={16} aria-hidden="true" />
                    </button>
                </aside>
            )}
            {isResetModalOpen && (
                <FundResetModal
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirmReset={confirmReset}
                />
            )}
        </div>
    );
};
