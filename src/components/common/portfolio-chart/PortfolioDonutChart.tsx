'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { PortfolioDonutActiveSegment } from '@/components/common/portfolio-chart/PortfolioDonutActiveSegment';
import { PortfolioDonutInactiveSegment } from '@/components/common/portfolio-chart/PortfolioDonutInactiveSegment';
import {
    PORTFOLIO_ACTIVE_RING,
    PORTFOLIO_CHART,
    PORTFOLIO_CHART_PALETTE,
    PORTFOLIO_CHART_SHIFT_MS,
} from '@/constants/market';
import type {
    MarketPortfolioChartItem,
    MarketPortfolioChartSegment,
    MarketPortfolioTheme,
} from '@/types/pages/market';
import {
    buildPortfolioChartSegments,
    describeArcPath,
    easePortfolioChartShift,
    getPortfolioActiveShift,
    polarToPoint,
    shiftPortfolioSegments,
    shortestArcDelta,
} from '@/utils/market/market-portfolio';

type Props = {
    items: MarketPortfolioChartItem[];
    activeSymbol: string;
    theme: MarketPortfolioTheme;
    onSelect: (symbol: string) => void;
};

const { size, center, radiusActive, widthActive, displayWidth, displayHeight, arcSpanDeg } =
    PORTFOLIO_CHART;
const {
    rOuter,
    bandStops,
    lightOffsetDeg,
    lightRadiusScale,
    specularSpreadScale,
    shadeSpreadScale,
} = PORTFOLIO_ACTIVE_RING;

const getPieceKey = (
    segment: MarketPortfolioChartSegment,
    segments: MarketPortfolioChartSegment[],
) => {
    const parts = segments.filter((item) => item.symbol === segment.symbol);
    return `${segment.symbol}-${parts.indexOf(segment)}`;
};

export const PortfolioDonutChart = ({ items, activeSymbol, theme, onSelect }: Props) => {
    const baseSegments = useMemo(() => buildPortfolioChartSegments(items), [items]);
    const targetShift = useMemo(
        () => getPortfolioActiveShift(baseSegments, activeSymbol),
        [baseSegments, activeSymbol],
    );
    const targetShiftRef = useRef(targetShift);
    targetShiftRef.current = targetShift;

    const [shift, setShift] = useState(targetShift);
    const shiftRef = useRef(targetShift);
    const prevActiveRef = useRef<string | null>(null);
    const isAnimatingRef = useRef(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const prevActive = prevActiveRef.current;
        const target = targetShiftRef.current;

        if (prevActive === null || prevActive === activeSymbol) {
            prevActiveRef.current = activeSymbol;
            shiftRef.current = target;
            setShift(target);
            return;
        }

        prevActiveRef.current = activeSymbol;
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

        isAnimatingRef.current = true;
        const from = shiftRef.current;
        const delta = shortestArcDelta(from, target, arcSpanDeg);
        const startedAt = performance.now();

        const tick = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / PORTFOLIO_CHART_SHIFT_MS);
            const next = from + delta * easePortfolioChartShift(progress);
            shiftRef.current = next;
            setShift(next);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            rafRef.current = null;
            isAnimatingRef.current = false;
            shiftRef.current = targetShiftRef.current;
            setShift(targetShiftRef.current);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            isAnimatingRef.current = false;
        };
    }, [activeSymbol]);

    useEffect(() => {
        if (isAnimatingRef.current || prevActiveRef.current !== activeSymbol) return;
        shiftRef.current = targetShift;
        setShift(targetShift);
    }, [targetShift, activeSymbol]);

    const segments = useMemo(
        () => shiftPortfolioSegments(baseSegments, shift),
        [baseSegments, shift],
    );
    const activeSegment = segments.find((item) => item.symbol === activeSymbol) ?? segments[0];
    const activeMid = activeSegment?.mid ?? 0;
    const colors = PORTFOLIO_CHART_PALETTE[theme];
    const bodyGradientId = `pdc-active-body-${theme}`;
    const specularGradientId = `pdc-active-specular-${theme}`;
    const shadeGradientId = `pdc-active-shade-${theme}`;
    const inactiveSegments = segments.filter((item) => item.symbol !== activeSegment?.symbol);
    const activeSegments = segments.filter((item) => item.symbol === activeSegment?.symbol);
    const [lightX, lightY] = polarToPoint(
        radiusActive * lightRadiusScale,
        activeMid - lightOffsetDeg,
    );

    if (segments.length === 0) return null;

    return (
        <div
            className="relative shrink-0 overflow-hidden"
            style={{ width: displayWidth, height: displayHeight }}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                width={displayWidth}
                height={displayWidth}
                className="absolute left-0 top-0"
                role="img"
                aria-label={activeSegment?.symbol}
            >
                <defs>
                    <filter id="pdc-arc-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="12" />
                    </filter>
                    <radialGradient
                        id={bodyGradientId}
                        gradientUnits="userSpaceOnUse"
                        cx={center}
                        cy={center}
                        r={rOuter}
                    >
                        <stop offset={bandStops[0]} stopColor={colors.bandInner} />
                        <stop offset={bandStops[1]} stopColor={colors.bandMid} />
                        <stop offset={bandStops[2]} stopColor={colors.bandPeak} />
                        <stop offset={bandStops[3]} stopColor={colors.bandOuter} />
                        <stop offset={bandStops[4]} stopColor={colors.bandEdge} />
                    </radialGradient>
                    <radialGradient
                        id={specularGradientId}
                        gradientUnits="userSpaceOnUse"
                        cx={lightX}
                        cy={lightY}
                        r={radiusActive * specularSpreadScale}
                    >
                        <stop
                            offset="0"
                            stopColor={colors.specular}
                            stopOpacity={colors.specularOpacity}
                        />
                        <stop
                            offset="0.45"
                            stopColor={colors.specular}
                            stopOpacity={colors.specularOpacity * 0.35}
                        />
                        <stop offset="1" stopColor={colors.specular} stopOpacity={0} />
                    </radialGradient>
                    <radialGradient
                        id={shadeGradientId}
                        gradientUnits="userSpaceOnUse"
                        cx={lightX}
                        cy={lightY}
                        r={radiusActive * shadeSpreadScale}
                    >
                        <stop offset="0" stopColor={colors.angularShade} stopOpacity={0} />
                        <stop offset="0.25" stopColor={colors.angularShade} stopOpacity={0} />
                        <stop
                            offset="0.75"
                            stopColor={colors.angularShade}
                            stopOpacity={colors.angularShadeOpacity * 0.35}
                        />
                        <stop
                            offset="1"
                            stopColor={colors.angularShade}
                            stopOpacity={colors.angularShadeOpacity}
                        />
                    </radialGradient>
                </defs>
                {inactiveSegments.map((segment) => {
                    const pieceKey = getPieceKey(segment, segments);
                    return (
                        <PortfolioDonutInactiveSegment
                            key={pieceKey}
                            pieceKey={pieceKey}
                            segment={segment}
                            colors={colors}
                        />
                    );
                })}
                {activeSegments.map((segment) => {
                    const pieceKey = getPieceKey(segment, activeSegments);
                    return (
                        <PortfolioDonutActiveSegment
                            key={pieceKey}
                            pieceKey={pieceKey}
                            segment={segment}
                            colors={colors}
                            bodyGradientId={bodyGradientId}
                            specularGradientId={specularGradientId}
                            shadeGradientId={shadeGradientId}
                        />
                    );
                })}
                {segments.map((segment) => (
                    <path
                        key={`hit-${getPieceKey(segment, segments)}`}
                        d={describeArcPath(radiusActive, segment.start, segment.end)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={widthActive + 15}
                        className="cursor-pointer"
                        style={{ pointerEvents: 'stroke' }}
                        aria-label={segment.symbol}
                        onClick={() => onSelect(segment.symbol)}
                    />
                ))}
            </svg>
        </div>
    );
};
