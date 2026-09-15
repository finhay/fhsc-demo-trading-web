'use client';

import { useEffect, useState } from 'react';

import { FaChevronDown, FaChevronUp, FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

import { FormWatchlistModal } from '@/components/common/modal/FormWatchlistModal';
import { toast } from '@/hooks/lib/useToast';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { isOwnedWatchlist, useWatchlistStore } from '@/stores/common/useWatchlistStore';

type Props = {
    align?: 'left' | 'right';
    buttonWidthClass?: string;
    buttonClass?: string;
    showCreateButton?: boolean;
    showOwnedOption?: boolean;
    isOwnedActive?: boolean;
    onSelectOwned?: () => void;
};

export const DropdownWatchlist = ({
    align = 'left',
    buttonWidthClass = 'w-40',
    buttonClass = 'base-secondary',
    showCreateButton = true,
    showOwnedOption = false,
    isOwnedActive = false,
    onSelectOwned,
}: Props = {}) => {
    const { profile, isInitialized } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const {
        watchlists,
        currentWatchList,
        setCurrentWatchList,
        fetchWatchlists,
        setWatchlists,
        deleteWatchlist,
    } = useWatchlistStore();

    const hasOptions = watchlists.length > 0 || showOwnedOption;
    const selectedWatchlist = isOwnedWatchlist(currentWatchList) ? null : currentWatchList;
    const currentWatchListName = isOwnedActive ? 'Đang sở hữu' : selectedWatchlist?.name;
    const isAnyOptionSelected = Boolean(selectedWatchlist) || isOwnedActive;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const handleDeleteWatchlist = async (watchlistId: number) => {
        startLoading();
        try {
            const { success, message } = await deleteWatchlist(watchlistId);
            if (success) {
                toast.success('Xoá danh mục thành công');

                const updatedWatchlists = watchlists.filter((w) => w.id !== watchlistId);
                setWatchlists(updatedWatchlists);

                if (currentWatchList?.id === watchlistId) {
                    setCurrentWatchList(updatedWatchlists[0] || null);
                }
            } else {
                toast.error(message || 'Lỗi xoá danh mục');
            }
            setIsDropdownOpen(false);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (!isInitialized) return;
        fetchWatchlists();
    }, [isInitialized, profile, fetchWatchlists]);

    return (
        <div className="flex items-center">
            {showCreateButton && (
                <button
                    type="button"
                    aria-label={'Tạo danh mục'}
                    onClick={() => {
                        setModalMode('create');
                        setIsModalOpen(true);
                    }}
                    className="flex shrink-0 items-center justify-center rounded-full text-secondary p-2"
                >
                    <FaPlus size={16} />
                </button>
            )}
            <div
                className="relative shrink-0"
                onMouseEnter={() => {
                    if (hasOptions) setIsDropdownOpen(true);
                }}
                onMouseLeave={() => setIsDropdownOpen(false)}
            >
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen && hasOptions}
                    aria-label={`${'Danh mục đang chọn: '}${
                        currentWatchListName || (hasOptions ? 'Chọn danh mục' : 'Chưa có danh mục')
                    }`}
                    className={`${buttonClass} flex ${buttonWidthClass} min-w-0 shrink-0 items-center gap-2 rounded-full px-4 py-1.5`}
                >
                    <span
                        className={`min-w-0 flex-1 truncate body-4-highlight ${
                            isAnyOptionSelected ? 'text-highlight' : 'text-secondary'
                        }`}
                    >
                        {currentWatchListName ||
                            (hasOptions ? 'Chọn danh mục' : 'Chưa có danh mục')}
                    </span>
                    {hasOptions && (
                        <>
                            {isDropdownOpen ? (
                                <FaChevronUp
                                    aria-hidden="true"
                                    size={12}
                                    className="shrink-0 text-secondary"
                                />
                            ) : (
                                <FaChevronDown
                                    aria-hidden="true"
                                    size={12}
                                    className="shrink-0 text-secondary"
                                />
                            )}
                        </>
                    )}
                </button>

                {isDropdownOpen && hasOptions && (
                    <div
                        className={`absolute ${
                            align === 'right' ? 'right-0' : 'left-0'
                        } top-full z-50 w-max min-w-full pt-1`}
                    >
                        <ul
                            role="listbox"
                            aria-label={'Chọn danh mục theo dõi'}
                            className="w-full list-none overflow-hidden rounded-xl base-tertiary p-0 m-0 shadow-lg"
                        >
                            {showOwnedOption && (
                                <li
                                    role="option"
                                    aria-selected={isOwnedActive}
                                    onClick={() => {
                                        onSelectOwned?.();
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex gap-6 items-center justify-between p-2 body-4 cursor-pointer transition-colors ${
                                        isOwnedActive
                                            ? 'text-highlight'
                                            : 'text-secondary hover:text-primary'
                                    }`}
                                >
                                    <span>{'Đang sở hữu'}</span>
                                </li>
                            )}
                            {watchlists.map((watchlist) => (
                                <li
                                    key={watchlist.id}
                                    role="option"
                                    aria-selected={watchlist.id === selectedWatchlist?.id}
                                    onClick={() => {
                                        setCurrentWatchList(watchlist);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex gap-6 items-center justify-between p-2 body-4 cursor-pointer transition-colors ${
                                        watchlist.id === selectedWatchlist?.id
                                            ? 'text-highlight'
                                            : 'text-secondary hover:text-primary'
                                    }`}
                                >
                                    <span className="min-w-0 truncate">{watchlist.name}</span>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentWatchList(watchlist);
                                                setModalMode('edit');
                                                setIsDropdownOpen(false);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-secondary hover:text-highlight transition-colors"
                                            aria-label={`${'Chỉnh sửa danh mục '}${watchlist.name}`}
                                        >
                                            <FaPen size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWatchlist(watchlist.id);
                                            }}
                                            className="text-red hover:text-red/80 transition-colors"
                                            aria-label={`${'Xóa danh mục '}${watchlist.name}`}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <FormWatchlistModal
                open={isModalOpen}
                mode={modalMode}
                watchlist={selectedWatchlist}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
