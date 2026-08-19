import { MACRO_CELL_RANK_COLORS, MACRO_CELL_RANK_THRESHOLDS } from '@/constants/market';
import type { MacroPoint } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';

const pickMacroRankColor = (topPercent: number): string => {
    const index = MACRO_CELL_RANK_THRESHOLDS.findIndex((threshold) => topPercent <= threshold);
    return MACRO_CELL_RANK_COLORS[index === -1 ? MACRO_CELL_RANK_COLORS.length - 1 : index];
};

export const buildMacroCellColorMap = (
    values: Record<string, number | null>,
    isCpi: boolean,
): Record<string, string> => {
    const entries = Object.entries(values).filter(
        (entry): entry is [string, number] => entry[1] !== null,
    );
    const colorMap: Record<string, string> = {};
    const count = entries.length;
    if (count === 0) return colorMap;
    const sorted = [...entries].sort((a, b) => (isCpi ? a[1] - b[1] : b[1] - a[1]));
    sorted.forEach(([month], index) => {
        colorMap[month] = pickMacroRankColor((index + 1) / count);
    });
    return colorMap;
};

export const getLastMacroValue = (points: MacroPoint[]): number | undefined =>
    [...points].sort((a, b) => (a.date || a.month).localeCompare(b.date || b.month)).at(-1)?.value;

export const formatMacroPercent = (value: number | null | undefined): string =>
    value == null ? '--' : `${formatNumberVN(value, { trimTrailingZeros: true })}%`;
