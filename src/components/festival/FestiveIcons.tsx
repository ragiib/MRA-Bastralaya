import React from 'react';

/**
 * Traditional Festive Motifs (Mahalaya & Durga Puja)
 * Drawn as inline SVGs strictly adhering to respectful abstract cultural motifs:
 * - Alpona (rice-paste circular mandala & linear border)
 * - Diya (terracotta oil lamp with warm flame)
 * - Marigold Flower (genda phool) & Petal
 * - Conch Shell (Shankha)
 * 
 * Strict Constraint: No deity depictions, no stars, no sparkles, no emojis.
 */

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Traditional Alpona Mandala Motif
 */
export function AlponaMotif({ className = 'w-16 h-16', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer concentric rings */}
      <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="50" cy="50" r="42" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="34" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.8" />
      
      {/* 8 Traditional Alpona Petals */}
      <path
        d="M50 16 C53 26 62 35 72 38 C62 41 53 50 50 60 C47 50 38 41 28 38 C38 35 47 26 50 16 Z"
        stroke="#D4AF37"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M74 26 C68 33 67 44 70 54 C63 47 52 46 42 49 C49 42 50 31 47 21 C54 28 65 29 74 26 Z"
        stroke="#D4AF37"
        strokeWidth="1"
        fill="none"
        transform="rotate(45 50 50)"
      />
      
      {/* Inner sacred lotus bud circle */}
      <circle cx="50" cy="50" r="16" stroke="#D4AF37" strokeWidth="1.2" fill="#FAF7F2" fillOpacity="0.08" />
      <circle cx="50" cy="50" r="8" stroke="#D4AF37" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="3" fill="#D4AF37" />

      {/* Radiating teardrop dots */}
      <circle cx="50" cy="8" r="2" fill="#D4AF37" />
      <circle cx="92" cy="50" r="2" fill="#D4AF37" />
      <circle cx="50" cy="92" r="2" fill="#D4AF37" />
      <circle cx="8" cy="50" r="2" fill="#D4AF37" />
    </svg>
  );
}

/**
 * Traditional Alpona Decorative Border Line
 */
export function AlponaBorder({ className = 'w-full h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 300 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <line x1="0" y1="8" x2="300" y2="8" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4" />
      {/* Repeating decorative rice-paste crests */}
      <path
        d="M20 8 Q35 0 50 8 T80 8 T110 8 T140 8 T170 8 T200 8 T230 8 T260 8 T290 8"
        stroke="#D4AF37"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="50" cy="8" r="1.5" fill="#D4AF37" />
      <circle cx="110" cy="8" r="1.5" fill="#D4AF37" />
      <circle cx="170" cy="8" r="1.5" fill="#D4AF37" />
      <circle cx="230" cy="8" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

/**
 * Traditional Diya (Oil Lamp with Warm Glow)
 */
export function DiyaLamp({ className = 'w-10 h-10', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Soft flame glow */}
        <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#D97706" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Flame Glow Backdrop */}
      <circle cx="32" cy="18" r="16" fill="url(#diyaGlow)" />

      {/* Flame Teardrop */}
      <path
        d="M32 8 C35 14 38 18 36 22 C34 26 30 26 28 22 C26 18 29 14 32 8 Z"
        fill="#F59E0B"
      />
      <path
        d="M32 12 C33.5 15 35 18 34 20 C33 22 31 22 30 20 C29 18 30.5 15 32 12 Z"
        fill="#FAF7F2"
      />

      {/* Terracotta Diya Base */}
      <path
        d="M14 36 C18 48 46 48 50 36 C52 32 46 32 32 33 C18 32 12 32 14 36 Z"
        fill="#6B0D2F"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      {/* Terracotta Stand Rim */}
      <ellipse cx="32" cy="34" rx="16" ry="3.5" stroke="#D4AF37" strokeWidth="1" fill="#500A23" />
      <path
        d="M24 45 C28 47 36 47 40 45 L42 49 C36 51 28 51 22 49 Z"
        fill="#D4AF37"
        fillOpacity="0.8"
      />
    </svg>
  );
}

/**
 * Sacred Marigold Flower (Genda Phool)
 */
export function MarigoldFlower({ className = 'w-8 h-8', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Petals */}
      <circle cx="24" cy="24" r="18" fill="#E06D10" />
      <g stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
        <line x1="24" y1="5" x2="24" y2="43" />
        <line x1="5" y1="24" x2="43" y2="24" />
        <line x1="10.5" y1="10.5" x2="37.5" y2="37.5" />
        <line x1="10.5" y1="37.5" x2="37.5" y2="10.5" />
      </g>
      {/* Middle Petal Ring */}
      <circle cx="24" cy="24" r="12" fill="#F59E0B" />
      <circle cx="24" cy="24" r="8" fill="#FBBF24" />
      {/* Center Pistil in Festive Maroon */}
      <circle cx="24" cy="24" r="4" fill="#6B0D2F" />
      <circle cx="24" cy="24" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

/**
 * Single Drifting Marigold Petal for CSS Particle Layer
 */
export function MarigoldPetal({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 2 C18 10 22 20 18 27 C15 31 9 31 6 27 C2 20 6 10 12 2 Z"
        fill="#E06D10"
      />
      <path
        d="M12 5 C15 11 18 19 15 24 C13 27 10 27 8 24 C5 19 8 11 12 5 Z"
        fill="#F59E0B"
        fillOpacity="0.8"
      />
    </svg>
  );
}

/**
 * Traditional Conch Shell (Shankha) Abstract Line Motif
 */
export function ConchShell({ className = 'w-8 h-8', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14 34 C12 28 14 18 20 12 C26 6 36 8 38 16 C40 24 34 32 26 38 C20 42 16 40 14 34 Z"
        stroke="#D4AF37"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Sacred Spiral */}
      <path
        d="M20 14 C24 10 32 11 34 17 C35 23 30 28 24 32 C20 34 18 32 18 28 C18 24 22 21 26 22"
        stroke="#D4AF37"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="1 1.5"
      />
      <ellipse cx="28" cy="18" rx="2" ry="1.5" fill="#D4AF37" />
    </svg>
  );
}
