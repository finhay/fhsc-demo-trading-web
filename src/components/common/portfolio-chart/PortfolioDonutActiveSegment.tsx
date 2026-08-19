'use client';

import { useEffect, useState } from 'react';

import {
    PORTFOLIO_ACTIVE_RING,
    PORTFOLIO_CHART,
    PORTFOLIO_FILL_3D_TRANSITION,
} from '@/constants/market';
import type {
    MarketPortfolioChartSegment,
    MarketPortfolioPaletteColors,
} from '@/types/pages/market';
import {
    describeDonutSegmentPath,
    describePortfolioEndWallPath,
    describePortfolioInnerWallPath,
    getPortfolioEndWallGradientAxis,
    getPortfolioRaiseOffset,
    getPortfolioWallRadialStops,
    trimPortfolioSegmentSpan,
} from '@/utils/market/market-portfolio';

type Props = {
    segment: MarketPortfolioChartSegment;
    colors: MarketPortfolioPaletteColors;
    bodyGradientId: string;
    specularGradientId: string;
    shadeGradientId: string;
    pieceKey?: string;
};

const { center } = PORTFOLIO_CHART;
const { rOuter, rInner, depthPx, wallRampFromTop } = PORTFOLIO_ACTIVE_RING;

const innerWallStops = getPortfolioWallRadialStops(rInner);

export const PortfolioDonutActiveSegment = ({
    segment,
    colors,
    bodyGradientId,
    specularGradientId,
    shadeGradientId,
    pieceKey,
}: Props) => {
    const [isRaised, setIsRaised] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsRaised(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const [start, end] = trimPortfolioSegmentSpan(segment);
    const topFacePath = describeDonutSegmentPath(rOuter, rInner, start, end);
    const [raiseX, raiseY] = getPortfolioRaiseOffset(segment.mid, depthPx);
    const gradientKey = pieceKey ?? segment.symbol;
    const innerWallGradientId = `pdc-wall-inner-${gradientKey}`;
    const startCapGradientId = `pdc-cap-start-${gradientKey}`;
    const endCapGradientId = `pdc-cap-end-${gradientKey}`;
    const wallRampUp = [colors.wallBottom, colors.wallMid, colors.wallUpper, colors.wallTop];
    const startCapAxis = getPortfolioEndWallGradientAxis(start, raiseX, raiseY);
    const endCapAxis = getPortfolioEndWallGradientAxis(end, raiseX, raiseY);
    const depthStyle = {
        ...PORTFOLIO_FILL_3D_TRANSITION,
        opacity: isRaised ? 1 : 0,
    };

    return (
        <g>
            <defs>
                <radialGradient
                    id={innerWallGradientId}
                    gradientUnits="userSpaceOnUse"
                    cx={center}
                    cy={center}
                    r={rInner + depthPx}
                >
                    {innerWallStops.map((offset, i) => (
                        <stop key={offset} offset={offset} stopColor={wallRampUp[i]} />
                    ))}
                </radialGradient>
                <linearGradient
                    id={startCapGradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={startCapAxis[0]}
                    y1={startCapAxis[1]}
                    x2={startCapAxis[2]}
                    y2={startCapAxis[3]}
                >
                    {wallRampFromTop.map((offset, i) => (
                        <stop
                            key={offset}
                            offset={offset}
                            stopColor={wallRampUp[wallRampUp.length - 1 - i]}
                        />
                    ))}
                </linearGradient>
                <linearGradient
                    id={endCapGradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={endCapAxis[0]}
                    y1={endCapAxis[1]}
                    x2={endCapAxis[2]}
                    y2={endCapAxis[3]}
                >
                    {wallRampFromTop.map((offset, i) => (
                        <stop
                            key={offset}
                            offset={offset}
                            stopColor={wallRampUp[wallRampUp.length - 1 - i]}
                        />
                    ))}
                </linearGradient>
            </defs>

            <path
                d={describeDonutSegmentPath(rOuter + 10, Math.max(rInner - 10, 0), start, end)}
                fill={colors.glow}
                filter="url(#pdc-arc-glow)"
                style={{
                    ...PORTFOLIO_FILL_3D_TRANSITION,
                    opacity: isRaised ? colors.glowOpacity : 0,
                }}
            />
            <path
                d={describePortfolioInnerWallPath(start, end, raiseX, raiseY)}
                fill={`url(#${innerWallGradientId})`}
                style={depthStyle}
            />
            <path
                d={describePortfolioEndWallPath(start, raiseX, raiseY)}
                fill={`url(#${startCapGradientId})`}
                style={depthStyle}
            />
            <path
                d={describePortfolioEndWallPath(end, raiseX, raiseY)}
                fill={`url(#${endCapGradientId})`}
                style={depthStyle}
            />

            <g transform={`translate(${raiseX} ${raiseY})`}>
                <path d={topFacePath} fill={`url(#${bodyGradientId})`} />
                <path d={topFacePath} fill={`url(#${shadeGradientId})`} />
                <path d={topFacePath} fill={`url(#${specularGradientId})`} />
            </g>
        </g>
    );
};
