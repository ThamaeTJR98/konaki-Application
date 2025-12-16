
import React from 'react';

interface LogoProps {
  className?: string;
  isThinking?: boolean;
  isSpeaking?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", isThinking = false, isSpeaking = false }) => {
  // Brand Colors from JSON
  const COLORS = {
    green: "#2E7D32",
    brown: "#6D3F1F",
    lightGreen: "#7CB342",
    yellow: "#FDB813",
    orange: "#F57C00",
    tan: "#E0AC69"
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Konaki Logo - Mokorotlo with Sunrise"
    >
      <style>
        {`
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes pulse-speak {
            0% { transform: scale(0.95); opacity: 1; }
            50% { transform: scale(1.02); opacity: 0.9; }
            100% { transform: scale(0.95); opacity: 1; }
          }
          @keyframes sun-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-think .hat-group {
            animation: bounce-gentle 1.2s infinite ease-in-out;
          }
          .animate-speak .hat-group {
             animation: pulse-speak 0.8s infinite ease-in-out;
          }
          .animate-think .sun-rays {
             animation: sun-spin 10s linear infinite;
             transform-origin: 100px 100px;
          }
        `}
      </style>

      {/* Circle Background */}
      <circle cx="100" cy="100" r="95" fill="#ffffff" stroke={COLORS.lightGreen} strokeWidth="1" />
      
      {/* Sunrise (Background Element) */}
      <g className={isThinking ? "sun-rays" : ""}>
        <circle cx="100" cy="100" r="60" fill={COLORS.yellow} opacity="0.2" />
        <path d="M100 20 L100 40 M180 100 L160 100 M100 180 L100 160 M20 100 L40 100" stroke={COLORS.orange} strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
        <path d="M156 44 L142 58 M156 156 L142 142 M44 156 L58 142 M44 44 L58 58" stroke={COLORS.orange} strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
      </g>

      {/* Main Content Group (Animated) */}
      <g className={isThinking ? "animate-think" : isSpeaking ? "animate-speak" : ""}>
          
          <g className="hat-group" transform="translate(100, 110) scale(0.95)">
            {/* Hat Base */}
            <path 
                d="M-65 40 Q0 65 65 40 L55 20 Q0 45 -55 20 Z" 
                fill={COLORS.tan} 
                stroke={COLORS.brown} 
                strokeWidth="3"
            />
            {/* Hat Cone */}
            <path 
                d="M-55 20 Q0 -105 55 20" 
                fill={COLORS.tan} 
                stroke={COLORS.brown} 
                strokeWidth="3"
            />
            
            {/* Woven Patterns */}
            <path d="M0 -85 L0 20" stroke={COLORS.brown} strokeWidth="1.5" strokeDasharray="4,3" />
            <path d="M-35 0 Q0 -25 35 0" fill="none" stroke={COLORS.brown} strokeWidth="1.5" />
            <path d="M-45 20 Q0 -5 45 20" fill="none" stroke={COLORS.brown} strokeWidth="1.5" />
            
            {/* Top Knot */}
            <circle cx="0" cy="-90" r="6" fill={COLORS.brown} />
          </g>

          {/* Stylized Crops/Fields (Foreground) */}
          <path 
            d="M35 150 Q55 120 45 90 M35 150 Q15 120 25 90" 
            stroke={COLORS.green} 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill="none"
          />
          <path 
            d="M165 150 Q145 120 155 90 M165 150 Q185 120 175 90" 
            stroke={COLORS.green} 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill="none"
          />
      </g>
    </svg>
  );
};

export default Logo;
