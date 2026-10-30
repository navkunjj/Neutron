import React from 'react';

interface NeutronLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  withTagline?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  standalone?: boolean;
}

export const NeutronLogo: React.FC<NeutronLogoProps> = ({
  size = 28,
  className = '',
  withText = false,
  withTagline = false,
  variant = 'auto',
  standalone = false,
}) => {
  // Main body color: crisp silver/white on dark UI (#EDEDF0), or dark slate (#22252C) on light backgrounds
  const bodyColor = variant === 'dark' ? '#22252C' : '#EDEDF0';

  const svgW = Math.round(standalone ? size * (248 / 192) : size * 0.68);
  const svgH = Math.round(standalone ? size : size * 0.68 * (192 / 248));

  const logoMark = (
    <svg
      viewBox="0 0 248 192"
      width={svgW}
      height={svgH}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="neutronBlueGrad" x1="139" y1="0" x2="248" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Main Body (N vertical stem and diagonal leg) */}
      <path
        d="M0,10 A10,10 0 0,1 10,0 L48,0 L242,169 A9,9 0 0,1 247,177 L247,183 A9,9 0 0,1 238,192 L196,192 A10,10 0 0,1 188,186 L54,77 L54,182 A10,10 0 0,1 44,192 L10,192 A10,10 0 0,1 0,182 Z"
        fill={bodyColor}
      />
      {/* Top-Right Vibrant Electric Blue Wedge */}
      <path
        d="M139,0 L238,0 A10,10 0 0,1 248,10 L248,94 A3,3 0 0,1 245,95 L138,1 Z"
        fill="url(#neutronBlueGrad)"
      />
    </svg>
  );

  return (
    <div
      className={`neutron-brand-wrapper ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      {standalone ? (
        logoMark
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: `${Math.max(6, Math.round(size * 0.26))}px`,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          {logoMark}
        </div>
      )}

      {withText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: `${Math.max(14, Math.round(size * 0.58))}px`,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#EDEDF0',
              fontFamily: 'var(--font-sans)',
              userSelect: 'none',
              lineHeight: 1.15,
            }}
          >
            NEUT<span style={{ color: '#3b82f6', textShadow: '0 0 16px rgba(59, 130, 246, 0.45)' }}>RON</span>
          </span>
          {withTagline && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                fontWeight: 500,
                marginTop: '1px',
              }}
            >
              Intelligence in Action
            </span>
          )}
        </div>
      )}
    </div>
  );
};
