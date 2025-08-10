import * as React from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "neutral" | "happy" | "encouraging";

interface MascotProps extends React.SVGProps<SVGSVGElement> {
  mood?: MascotMood;
}

export function Mascot({ mood = "neutral", className, ...props }: MascotProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("transition-all duration-500", className)}
      {...props}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Body */}
      <g className="transition-transform duration-500 ease-in-out group-hover:scale-105">
        <circle cx="50" cy="55" r="35" fill="hsl(var(--primary))" className="opacity-20" />
        <path d="M50 20 a30 35 0 0 1 0 70 a30 35 0 0 1 0 -70" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
      </g>
      
      {/* Eyes */}
      <g className="eyes">
        {/* Neutral */}
        <g className={cn("transition-opacity duration-300", mood === 'neutral' ? 'opacity-100' : 'opacity-0')}>
          <circle cx="38" cy="50" r="3" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--foreground))" strokeWidth="1"/>
          <circle cx="62" cy="50" r="3" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--foreground))" strokeWidth="1"/>
        </g>
        {/* Happy */}
        <g className={cn("transition-opacity duration-300", mood === 'happy' ? 'opacity-100' : 'opacity-0')}>
          <path d="M32 52 Q38 45 44 52" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
          <path d="M56 52 Q62 45 68 52" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
        </g>
        {/* Encouraging */}
        <g className={cn("transition-opacity duration-300", mood === 'encouraging' ? 'opacity-100' : 'opacity-0')}>
           <circle cx="38" cy="50" r="4" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))" strokeWidth="1"/>
           <circle cx="62" cy="50" r="4" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))" strokeWidth="1"/>
        </g>
      </g>
      
      {/* Mouth */}
      <g className="mouth">
         <path 
           d={mood === 'happy' ? "M40 65 Q50 75 60 65" : "M40 65 Q50 62 60 65"} 
           stroke="hsl(var(--foreground))" 
           strokeWidth="2" 
           fill="none" 
           className="transition-all duration-500"
         />
      </g>
      
      {/* Antenna */}
      <g className="antenna">
        <line x1="50" y1="20" x2="50" y2="10" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx="50" cy="8" r="4" fill="hsl(var(--accent))" className="transition-all duration-300 ease-in-out" style={ mood !== 'neutral' ? { filter: 'url(#glow)'} : {}}/>
      </g>
    </svg>
  );
}
