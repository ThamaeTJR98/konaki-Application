
import React from 'react';

interface LogoProps {
  className?: string;
  isThinking?: boolean;
  isSpeaking?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", isThinking = false, isSpeaking = false }) => {
  return (
    <svg 
      viewBox="0 0 100 130" 
      className={`${className} overflow-visible`} 
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
      role="img"
      aria-label="Konaki Logo"
    >
      <style>
        {`
          .plant-leaf { transform-origin: 50% 60%; }
          .animate-speak { animation: logo-pulse 1s infinite ease-in-out; }
          .animate-think .plant-leaf { animation: leaf-sway 1.5s infinite ease-in-out alternate; }
          .animate-think .dot { animation: dot-blink 1s infinite alternate; }
          
          @keyframes logo-pulse { 
            0% { transform: scale(1); } 
            50% { transform: scale(1.05); } 
            100% { transform: scale(1); } 
          }
          @keyframes leaf-sway { 
            0% { transform: rotate(-5deg); } 
            100% { transform: rotate(5deg); } 
          }
          @keyframes dot-blink {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
      {/* Container Group */}
      <g className={`${isSpeaking ? 'animate-speak' : ''} ${isThinking ? 'animate-think' : ''} origin-center`}>
          
          {/* Outer Arch Frame */}
          <path 
            d="M20 40 A30 30 0 0 1 80 40 V85 H20 V40 Z" 
            strokeWidth="3" 
            className="text-inherit"
          />
          
          {/* Inner Arch Line (Detail) */}
          <path 
            d="M28 40 A22 22 0 0 1 72 40 V85" 
            strokeWidth="1.5" 
            className="opacity-50" 
          />
          
          {/* Arch Bricks/Rays */}
          <line x1="20" y1="40" x2="15" y2="40" strokeWidth="2" />
          <line x1="80" y1="40" x2="85" y2="40" strokeWidth="2" />
          <line x1="29" y1="13" x2="26" y2="9" strokeWidth="2" />
          <line x1="71" y1="13" x2="74" y2="9" strokeWidth="2" />
          <line x1="50" y1="10" x2="50" y2="5" strokeWidth="2" />

          {/* Plant Elements */}
          <g className="plant-group">
              {/* Stem */}
              <path d="M50 85 V50" strokeWidth="2.5" />
              
              {/* Soil / Roots Area */}
              <path d="M28 75 Q50 65 72 75" strokeWidth="1.5" className="opacity-70" />
              <path d="M35 85 Q50 80 65 85" strokeWidth="1.5" className="opacity-70" />

              {/* Leaves */}
              <path 
                d="M50 60 Q30 50 30 35 Q45 50 50 60" 
                fill="currentColor" 
                stroke="none" 
                className="plant-leaf"
                style={{ transformOrigin: '50% 60%', animationDelay: '0.1s' }}
              />
              <path 
                d="M50 60 Q70 50 70 35 Q55 50 50 60" 
                fill="currentColor" 
                stroke="none" 
                className="plant-leaf"
                style={{ transformOrigin: '50% 60%', animationDelay: '0.2s' }}
              />
              <path 
                d="M50 50 Q35 25 50 15 Q65 25 50 50" 
                fill="currentColor" 
                stroke="none" 
                className="plant-leaf"
                style={{ transformOrigin: '50% 50%' }}
              />
          </g>

          {/* Dots */}
          <circle cx="35" cy="30" r="2" fill="currentColor" stroke="none" className="dot" />
          <circle cx="65" cy="30" r="2" fill="currentColor" stroke="none" className="dot" style={{ animationDelay: '0.5s' }} />

      </g>

      {/* Text 'konaki' */}
      <text 
        x="50" 
        y="118" 
        textAnchor="middle" 
        fontFamily="sans-serif" 
        fontWeight="800" 
        fontSize="24" 
        fill="currentColor" 
        stroke="none"
      >
        konaki
      </text>
    </svg>
  );
};

export default Logo;
