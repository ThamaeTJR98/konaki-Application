import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full" }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Konaki Logo - Mokorotlo"
    >
      {/* Background Circle - Earthy Tone */}
      <circle cx="100" cy="100" r="95" fill="#f5f5f4" stroke="#78350f" strokeWidth="2" />
      
      {/* Stylized Mokorotlo (Basotho Hat) */}
      <g transform="translate(100, 110) scale(0.9)">
        {/* Hat Base */}
        <path 
            d="M-60 40 Q0 60 60 40 L50 20 Q0 40 -50 20 Z" 
            fill="#d97706" 
            stroke="#78350f" 
            strokeWidth="3"
        />
        {/* Hat Cone (Woven Texture effect) */}
        <path 
            d="M-50 20 Q0 -100 50 20" 
            fill="#fcd34d" 
            stroke="#78350f" 
            strokeWidth="3"
        />
        {/* Center line decoration */}
        <path d="M0 -80 L0 20" stroke="#78350f" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Top Knot */}
        <circle cx="0" cy="-85" r="8" fill="#78350f" />
        
        {/* Decorative Weave Lines */}
        <path d="M-30 0 Q0 -20 30 0" fill="none" stroke="#b45309" strokeWidth="2" />
        <path d="M-40 20 Q0 0 40 20" fill="none" stroke="#b45309" strokeWidth="2" />
      </g>

      {/* Wheat/Crops flanking the hat */}
      <path 
        d="M30 150 Q50 120 40 90 M30 150 Q10 120 20 90" 
        stroke="#15803d" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none"
      />
      <path 
        d="M170 150 Q150 120 160 90 M170 150 Q190 120 180 90" 
        stroke="#15803d" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none"
      />
    </svg>
  );
};

export default Logo;