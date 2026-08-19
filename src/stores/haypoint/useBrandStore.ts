import { create } from 'zustand';

import { DEFAULT_PARAMS } from '@/constants/haypoint';
import { fetchRewardBrandList, fetchRewardCategoryList } from '@/services/api/reward';
import { registerResettableStore } from '@/stores/reset-registry';
import { BrandItem, CategoryItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';

type BrandState = {
    categories: CategoryItem[];
    isLoadingCategories: boolean;
    selectedCategory: string;
    brands: BrandItem[];
    isLoadingBrands: boolean;
    recommendBrands: BrandItem[];
    isLoadingRecommendBrands: boolean;
    currentPage: number;
    totalPage: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    searchKeyword: string;
};

type BrandActions = {
    selectCategory: (categoryId: string) => void;
    searchBrands: (keyword: string) => void;
    fetchCategories: () => Promise<void>;
    fetchBrands: (categoryId?: string, keyword?: string) => Promise<void>;
    fetchRecommendedBrands: () => Promise<void>;
    loadMoreBrands: () => Promise<void>;
    resetStore: () => void;
};

const initialState: BrandState = {
    categories: [],
    isLoadingCategories: true,
    selectedCategory: '',
    brands: [],
    isLoadingBrands: true,
    recommendBrands: [],
    isLoadingRecommendBrands: true,
    currentPage: DEFAULT_PARAMS.PAGE,
    totalPage: 0,
    hasMore: false,
    isLoadingMore: false,
    searchKeyword: '',
};

export const useBrandStore = create<BrandState & BrandActions>((set, get) => ({
    ...initialState,

    selectCategory: (categoryId: string) => {
        set({ selectedCategory: categoryId, searchKeyword: '' });
        get().fetchBrands(categoryId);
    },

    searchBrands: (keyword: string) => {
        const { selectedCategory } = get();
        get().fetchBrands(selectedCategory, keyword);
    },

    fetchCategories: async () => {
        set({ isLoadingCategories: true });
        try {
            const { data, error_code } = await fetchRewardCategoryList(DEFAULT_PARAMS.PAGE);
            if (isSuccessApi(error_code)) {
                const categories = data.content;
                set({ categories });

                if (categories?.length) {
                    const firstCategoryId = categories[0].id;
                    set({ selectedCategory: firstCategoryId });
                    get().fetchBrands(firstCategoryId);
                }
            } else {
                set({ categories: [] });
            }
        } catch (error: any) {
            set({ categories: [] });
        } finally {
            set({ isLoadingCategories: false });
        }
    },

    fetchBrands: async (categoryId?: string, keyword?: string) => {
        const { selectedCategory } = get();
        const targetCategory = categoryId || selectedCategory;

        set({
            isLoadingBrands: true,
            searchKeyword: keyword || '',
            currentPage: DEFAULT_PARAMS.PAGE,
        });
        try {
            const { data, error_code } = await fetchRewardBrandList(
                DEFAULT_PARAMS.PAGE,
                targetCategory,
                keyword,
            );
            if (isSuccessApi(error_code)) {
                set({
                    brands: data.content,
                    totalPage: data.total_page,
                    hasMore: data.page < data.total_page,
                });
            } else {
                set({ brands: [], totalPage: 0, hasMore: false });
            }
        } catch {
            set({ brands: [], totalPage: 0, hasMore: false });
        } finally {
            set({ isLoadingBrands: false });
        }
    },

    fetchRecommendedBrands: async () => {
        set({ isLoadingRecommendBrands: true });
        try {
            const { data, error_code } = await fetchRewardBrandList(DEFAULT_PARAMS.PAGE);
            if (isSuccessApi(error_code)) {
                set({ recommendBrands: data.content });
            } else {
                set({ recommendBrands: [] });
            }
        } catch {
            set({ recommendBrands: [] });
        } finally {
            set({ isLoadingRecommendBrands: false });
        }
    },

    loadMoreBrands: async () => {
        const { isLoadingMore, hasMore, currentPage, totalPage, selectedCategory, searchKeyword } =
            get();
        if (isLoadingMore || !hasMore) return;

        const nextPage = currentPage + 1;
        if (nextPage > totalPage) return;

        set({ isLoadingMore: true });
        try {
            const { data, error_code, message } = await fetchRewardBrandList(
                nextPage,
                selectedCategory,
                searchKeyword,
            );
            if (isSuccessApi(error_code)) {
                set((state) => ({
                    brands: [...state.brands, ...data.content],
                    currentPage: nextPage,
                    hasMore: nextPage < data.total_page,
                }));
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            set({ isLoadingMore: false });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useBrandStore);
