import { create } from 'zustand';

import { FLEXIBLE_BUY_FLOW_STEPS, FLEXIBLE_SELL_FLOW_STEPS } from '@/constants/haybond';
import { registerResettableStore } from '@/stores/reset-registry';
import type { HaybondCashFlowItem, HaybondSellAgreementItem } from '@/types/bond-enterprise/orders';
import type { HaybondAgreementItem } from '@/types/bond-enterprise/packages';
import type {
    HaybondFlexibleBuyFlowStep,
    HaybondFlexibleSellFlowStep,
} from '@/types/pages/haybond';

type PackageDynamic = {
    id: number;
    name: string;
    interest_rate: number;
};

type BuyPriceDynamic = {
    bondId: number;
    bondSymbol: string;
    buyPrice: number;
};

type EstimateInfo = {
    estimated_quantity: number;
    total_amount: number;
    estimated_profit: number;
    execute_at: string;
    fee: number;
};

type DataPreview = {
    estimateInfo: EstimateInfo;
    agreementData: HaybondAgreementItem[];
    has_accepted_tc: boolean;
    contract: {
        path_file: string;
        title: string;
    };
    symbol: string;
    start: string;
};

type DataSellPreview = {
    agreementData: HaybondSellAgreementItem[];
    receive_sell_amount: number;
    sell_amount: number;
    fee_sell_amount: string;
    tax_sell_amount: string;
    avg_sell_price: number;
    total_quantity: number;
    is_selling_all: boolean;
    total_coupon_received: number | null;
};

type DataBuyingSuccess = {
    interest_rate: number;
    saving_amount: number;
    end_date: string;
    icon_url: string;
    order_id: number;
    id: number;
    status: string;
    quantity: number;
};

type State = {
    packageDynamic: PackageDynamic;
    buyPriceDynamic: BuyPriceDynamic;
    bondDynamicAmount: number;
    bondDynamicSellAmount: number;
    maxSellAmount: number;
    isOverlayLoading: boolean;
    acceptTC: boolean;
    dataPreview: DataPreview;
    dataSellPreview: DataSellPreview;
    dataBuyingSuccess: DataBuyingSuccess;
    warningSell: boolean;
    warningMessage: string;
    dataCashFlow: {
        cashFlows: HaybondCashFlowItem[];
        receiveSellAmountDisplay: string;
    };
    isBuyOpen: boolean;
    buyStep: HaybondFlexibleBuyFlowStep;
    buyPackageId: number;
    isSellOpen: boolean;
    sellStep: HaybondFlexibleSellFlowStep;
};

type Actions = {
    setPackage: (value: PackageDynamic) => void;
    setBuyPrice: (value: BuyPriceDynamic) => void;
    setBondDynamicAmount: (value: number) => void;
    setBondDynamicSellAmount: (value: number) => void;
    setMaxSellAmount: (value: number) => void;
    setIsOverlayLoading: (value: boolean) => void;
    setAcceptTC: (value: boolean) => void;
    setDataPreview: (value: Partial<DataPreview>) => void;
    setSellData: (value: Partial<DataSellPreview>) => void;
    setDataBuyingSuccess: (value: DataBuyingSuccess) => void;
    setWarningSell: (value: { warningSell: boolean; warningMessage: string }) => void;
    setDataCashFlow: (value: State['dataCashFlow']) => void;
    openBuy: (packageId: number) => void;
    setBuyStep: (step: HaybondFlexibleBuyFlowStep) => void;
    resetBuyFlow: () => void;
    openSell: () => void;
    setSellStep: (step: HaybondFlexibleSellFlowStep) => void;
    resetSellFlow: () => void;
    resetForm: () => void;
    resetStore: () => void;
};

const initialEstimateInfo: EstimateInfo = {
    estimated_quantity: 0,
    total_amount: 0,
    estimated_profit: 0,
    execute_at: '',
    fee: 0,
};

const initialState: State = {
    packageDynamic: {
        id: 0,
        name: '',
        interest_rate: 0,
    },
    buyPriceDynamic: {
        bondId: 0,
        bondSymbol: '',
        buyPrice: 0,
    },
    bondDynamicAmount: 0,
    bondDynamicSellAmount: 0,
    maxSellAmount: 0,
    isOverlayLoading: false,
    acceptTC: false,
    dataPreview: {
        estimateInfo: initialEstimateInfo,
        agreementData: [],
        has_accepted_tc: false,
        contract: {
            path_file: '',
            title: '',
        },
        symbol: '',
        start: '',
    },
    dataSellPreview: {
        agreementData: [],
        receive_sell_amount: 0,
        sell_amount: 0,
        fee_sell_amount: '0',
        tax_sell_amount: '0',
        avg_sell_price: 0,
        total_quantity: 0,
        is_selling_all: false,
        total_coupon_received: null,
    },
    dataBuyingSuccess: {
        interest_rate: 0,
        saving_amount: 0,
        end_date: '',
        icon_url: '',
        order_id: 0,
        id: 0,
        status: '',
        quantity: 0,
    },
    warningSell: false,
    warningMessage: '',
    dataCashFlow: {
        cashFlows: [],
        receiveSellAmountDisplay: '',
    },
    isBuyOpen: false,
    buyStep: FLEXIBLE_BUY_FLOW_STEPS.ORDER,
    buyPackageId: 0,
    isSellOpen: false,
    sellStep: FLEXIBLE_SELL_FLOW_STEPS.FORM,
};

export const useHaybondFlexStore = create<State & Actions>((set, get) => ({
    ...initialState,

    setPackage: (value) => set({ packageDynamic: value }),
    setBuyPrice: (value) => set({ buyPriceDynamic: value }),
    setBondDynamicAmount: (value) => set({ bondDynamicAmount: value }),
    setBondDynamicSellAmount: (value) => set({ bondDynamicSellAmount: value }),
    setMaxSellAmount: (value) => set({ maxSellAmount: value }),
    setIsOverlayLoading: (value) => set({ isOverlayLoading: value }),
    setAcceptTC: (value) => set({ acceptTC: value }),
    setDataPreview: (value) =>
        set((s) => ({
            dataPreview: { ...s.dataPreview, ...value },
        })),
    setSellData: (value) =>
        set((s) => ({
            dataSellPreview: { ...s.dataSellPreview, ...value },
        })),
    setDataBuyingSuccess: (value) => set({ dataBuyingSuccess: value }),
    setWarningSell: (value) =>
        set({
            warningSell: value.warningSell,
            warningMessage: value.warningMessage,
        }),
    setDataCashFlow: (value) => set({ dataCashFlow: value }),

    openBuy: (packageId) =>
        set({
            isBuyOpen: true,
            buyStep: FLEXIBLE_BUY_FLOW_STEPS.ORDER,
            buyPackageId: packageId,
        }),
    setBuyStep: (step) => set({ buyStep: step }),
    resetBuyFlow: () =>
        set({
            isBuyOpen: false,
            buyStep: FLEXIBLE_BUY_FLOW_STEPS.ORDER,
            buyPackageId: 0,
        }),

    openSell: () =>
        set({
            isSellOpen: true,
            sellStep: FLEXIBLE_SELL_FLOW_STEPS.FORM,
        }),
    setSellStep: (step) => set({ sellStep: step }),
    resetSellFlow: () =>
        set({
            isSellOpen: false,
            sellStep: FLEXIBLE_SELL_FLOW_STEPS.FORM,
        }),

    resetForm: () =>
        set({
            packageDynamic: initialState.packageDynamic,
            buyPriceDynamic: initialState.buyPriceDynamic,
            bondDynamicAmount: initialState.bondDynamicAmount,
            bondDynamicSellAmount: initialState.bondDynamicSellAmount,
            isOverlayLoading: initialState.isOverlayLoading,
            acceptTC: initialState.acceptTC,
            dataPreview: initialState.dataPreview,
            dataSellPreview: initialState.dataSellPreview,
            dataBuyingSuccess: initialState.dataBuyingSuccess,
            warningSell: initialState.warningSell,
            warningMessage: initialState.warningMessage,
            dataCashFlow: initialState.dataCashFlow,
            maxSellAmount: get().maxSellAmount,
        }),
    resetStore: () => set(initialState),
}));

registerResettableStore(useHaybondFlexStore);
