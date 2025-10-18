import React, { useEffect, useState } from 'react';
import "./ProgressChart.css";

export default function ProgressChart({ values = [], labels = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 768 && width <= 1024);
    };
    
    checkDeviceType();
    
    // Add resize listener
    window.addEventListener('resize', checkDeviceType);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);
  
  const W = 320;
  const H = isMobile ? 160 : isTablet ? 220 : 180;
  const P = isMobile ? 20 : 24; // padding
  const max = 100;

  if (!values.length) {
    return <div className="progress-chart" aria-label="No progress data">No data</div>;
  }

  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

  const xs = values.map((_, i) =>
    P + (i * (W - 2 * P)) / Math.max(values.length - 1, 1)
  );
  const ys = values.map(v => P + (H - 2 * P) * (1 - clamp(v, 0, max) / max));
  const linePath = `M ${xs[0]} ${ys[0]} ` + xs.slice(1).map((x, i) => `L ${x} ${ys[i+1]}`).join(" ");
  const areaPath = `${linePath} L ${W - P} ${H - P} L ${P} ${H - P} Z`;

  return (
    <div className="progress-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="User progress line chart">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ad6fc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6ad6fc" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
          const y = P + (H - 2 * P) * (1 - ratio);
          return (
            <line 
              key={idx} 
              x1={P} 
              y1={y} 
              x2={W - P} 
              y2={y} 
              className="chart-grid-line"
            />
          );
        })}

        {/* Area under line */}
        <path d={areaPath} className="chart-area" />

        {/* Line */}
        <path 
          d={linePath} 
          className="chart-line" 
          strokeLinecap="round" 
          strokeWidth={isTablet ? 3 : 2.5}
        />

        {/* X-axis */}
        <line 
          x1={P} 
          y1={H - P} 
          x2={W - P} 
          y2={H - P} 
          className="chart-x-axis"
        />

        {/* Points */}
        {xs.map((x, i) => (
          <g key={i} className="chart-point">
            <circle 
              cx={x} 
              cy={ys[i]} 
              r={isMobile ? 3 : isTablet ? 5 : 4} 
              fill="white" 
              stroke="#6ad6fc" 
              strokeWidth={isTablet ? 3 : 2.5}
            />
            {/* Only show values on the points that are not too close together */}
            {(!isMobile || i % 2 === 0) && (
              <text 
                x={x} 
                y={ys[i] - (isTablet ? 12 : 10)} 
                textAnchor="middle" 
                className="chart-value"
              >
                {values[i]}
              </text>
            )}
          </g>
        ))}

        {/* Labels */}
        {labels.length === values.length && (
          labels.map((lbl, i) => (
            <text 
              key={i} 
              x={xs[i]} 
              y={H - P + 14} 
              textAnchor="middle" 
              className="chart-label"
            >
              {lbl}
            </text>
          ))
        )}
      </svg>
    </div>
  );
}
