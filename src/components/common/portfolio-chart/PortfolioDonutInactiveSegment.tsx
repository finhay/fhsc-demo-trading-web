'use client';

import {
    PORTFOLIO_CHART,
    PORTFOLIO_FILL_TRANSITION,
    PORTFOLIO_INACTIVE_EDGE_CAP_DEG,
} from '@/constants/market';
import type {
    MarketPortfolioChartSegment,
    MarketPortfolioPaletteColors,
} from '@/types/pages/market';
import {
    describeDonutSegmentPath,
    polarToPoint,
    trimPortfolioSegmentSpan,
} from '@/utils/market/market-portfolio';

type Props = {
    segment: MarketPortfolioChartSegment;
    colors: MarketPortfolioPaletteColors;
    pieceKey?: string;
};

const { radiusInactive, widthInactive } = PORTFOLIO_CHART;
const rOuter = radiusInactive + widthInactive / 2;
const rInner = radiusInactive - widthInactive / 2;

export const PortfolioDonutInactiveSegment = ({ segment, colors, pieceKey }: Props) => {
    const gradientId = pieceKey ?? segment.symbol;
    const [start, end] = trimPortfolioSegmentSpan(segment);
    const capDeg = Math.min(PORTFOLIO_INACTIVE_EDGE_CAP_DEG, (end - start) * 0.15);
    const caps = [
        { key: 'start', edgeAngle: start, coreAngle: start + capDeg },
        { key: 'end', edgeAngle: end, coreAngle: end - capDeg },
    ];

    return (
        <g>
            <defs>
                {caps.map(({ key, edgeAngle, coreAngle }) => {
                    const [x1, y1] = polarToPoint(radiusInactive, edgeAngle);
                    const [x2, y2] = polarToPoint(radiusInactive, coreAngle);
                    return (
                        <linearGradient
                            key={key}
                            id={`pdc-inactive-${gradientId}-${key}`}
                            gradientUnits="userSpaceOnUse"
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                        >
                            <stop offset="0" stopColor={colors.inactiveEdge} />
                            <stop offset="0.5" stopColor={colors.inactiveBody} />
                            <stop offset="1" stopColor={colors.inactiveCore} />
                        </linearGradient>
                    );
                })}
            </defs>
            <path
                d={describeDonutSegmentPath(rOuter, rInner, start, end)}
                fill={colors.inactiveCore}
                style={PORTFOLIO_FILL_TRANSITION}
            />
            {caps.map(({ key, edgeAngle, coreAngle }) => (
                <path
                    key={key}
                    d={describeDonutSegmentPath(
                        rOuter,
                        rInner,
                        Math.min(edgeAngle, coreAngle),
                        Math.max(edgeAngle, coreAngle),
                    )}
                    fill={`url(#pdc-inactive-${gradientId}-${key})`}
                    style={PORTFOLIO_FILL_TRANSITION}
                />
            ))}
        </g>
    );
};
