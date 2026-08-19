'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { BankDividend } from '@/components/common/stock-info/finance/analysis/bank/BankDividend';
import { BankEfficiency } from '@/components/common/stock-info/finance/analysis/bank/BankEfficiency';
import { BankGrowth } from '@/components/common/stock-info/finance/analysis/bank/BankGrowth';
import { BankLiquidity } from '@/components/common/stock-info/finance/analysis/bank/BankLiquidity';
import { BankProfitability } from '@/components/common/stock-info/finance/analysis/bank/BankProfitability';
import { BankQuality } from '@/components/common/stock-info/finance/analysis/bank/BankQuality';
import { InsuranceDividend } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceDividend';
import { InsuranceEffectiveness } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceEffectiveness';
import { InsuranceGrowth } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceGrowth';
import { InsuranceHealth } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceHealth';
import { InsuranceProfit } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceProfit';
import { InsuranceProfitability } from '@/components/common/stock-info/finance/analysis/insurance/InsuranceProfitability';
import { NonFinancialCashflow } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialCashflow';
import { NonFinancialDebt } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialDebt';
import { NonFinancialDividend } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialDividend';
import { NonFinancialEfficiency } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialEfficiency';
import { NonFinancialGrowth } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialGrowth';
import { NonFinancialMargin } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialMargin';
import { NonFinancialProfitability } from '@/components/common/stock-info/finance/analysis/non-financial/NonFinancialProfitability';
import { SecuritiesDividend } from '@/components/common/stock-info/finance/analysis/securities/SecuritiesDividend';
import { SecuritiesGrowth } from '@/components/common/stock-info/finance/analysis/securities/SecuritiesGrowth';
import { SecuritiesLeverage } from '@/components/common/stock-info/finance/analysis/securities/SecuritiesLeverage';
import { SecuritiesProfitability } from '@/components/common/stock-info/finance/analysis/securities/SecuritiesProfitability';
import { Spinner } from '@/components/common/ui/Spinner';
import { COMPANY_TYPE } from '@/constants/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { FinancialStatementRow } from '@/types/datafeed/finance';

type AnalysisPanelProps = {
    isLoading: boolean;
    dataAnnual: any;
    dataQuarterly: any;
    incomeData: FinancialStatementRow[];
    cashFlowData: FinancialStatementRow[];
};

export const AnalysisPanel = ({
    isLoading,
    dataAnnual,
    dataQuarterly,
    incomeData,
    cashFlowData,
}: AnalysisPanelProps) => {
    const { selectedStock } = useStockInfoStore();

    return (
        <section className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto">
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : dataAnnual.length > 0 && dataQuarterly.length > 0 ? (
                <>
                    {selectedStock?.companyType === COMPANY_TYPE.NON_FINANCIAL && (
                        <div className="flex flex-col gap-9">
                            <div className="flex items-stretch gap-3">
                                <NonFinancialGrowth
                                    dataAnnual={dataAnnual}
                                    dataQuarterly={dataQuarterly}
                                />
                                <NonFinancialMargin
                                    dataQuarterly={dataQuarterly}
                                    incomeData={incomeData}
                                />
                            </div>
                            <div className="flex items-stretch gap-3">
                                <NonFinancialProfitability dataAnnual={dataAnnual} />
                                <NonFinancialDividend dataAnnual={dataAnnual} />
                            </div>
                            <NonFinancialCashflow
                                dataQuarterly={dataQuarterly}
                                cashFlowData={cashFlowData}
                            />
                            <div className="flex items-stretch gap-3">
                                <NonFinancialEfficiency
                                    dataAnnual={dataAnnual}
                                    dataQuarterly={dataQuarterly}
                                />
                                <NonFinancialDebt dataAnnual={dataAnnual} />
                            </div>
                        </div>
                    )}
                    {selectedStock?.companyType === COMPANY_TYPE.BANK && (
                        <div className="flex flex-col gap-9">
                            <BankGrowth dataAnnual={dataAnnual} dataQuarterly={dataQuarterly} />
                            <BankEfficiency dataAnnual={dataAnnual} />
                            <div className="flex items-stretch gap-3">
                                <BankProfitability dataAnnual={dataAnnual} />
                                <BankDividend dataAnnual={dataAnnual} />
                            </div>
                            <div className="flex items-stretch gap-3">
                                <BankQuality dataQuarterly={dataQuarterly} />
                                <BankLiquidity dataAnnual={dataAnnual} />
                            </div>
                        </div>
                    )}
                    {selectedStock?.companyType === COMPANY_TYPE.SECURITIES && (
                        <div className="flex flex-col gap-9">
                            <SecuritiesGrowth
                                dataAnnual={dataAnnual}
                                dataQuarterly={dataQuarterly}
                            />
                            <div className="flex items-stretch gap-3">
                                <SecuritiesProfitability dataAnnual={dataAnnual} />
                                <SecuritiesDividend dataAnnual={dataAnnual} />
                            </div>
                            <SecuritiesLeverage dataQuarterly={dataQuarterly} />
                        </div>
                    )}
                    {selectedStock?.companyType === COMPANY_TYPE.INSURANCE && (
                        <div className="flex flex-col gap-9">
                            <InsuranceGrowth
                                dataAnnual={dataAnnual}
                                dataQuarterly={dataQuarterly}
                            />
                            <InsuranceProfit dataQuarterly={dataQuarterly} />
                            <InsuranceEffectiveness dataQuarterly={dataQuarterly} />
                            <div className="flex items-stretch gap-3">
                                <InsuranceProfitability dataAnnual={dataAnnual} />
                                <InsuranceDividend dataAnnual={dataAnnual} />
                            </div>
                            <InsuranceHealth dataQuarterly={dataQuarterly} />
                        </div>
                    )}
                </>
            ) : (
                <EmptyState />
            )}
        </section>
    );
};
