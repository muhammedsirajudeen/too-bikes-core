"use client";

interface VerticalTimelineProps {
  className?: string;
}

export default function VerticalTimeline({ className = "" }: VerticalTimelineProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex flex-col items-center h-full">
        {/* Top dot - Green */}
        <div className="w-3 h-3 rounded-full bg-green-500 z-10" />
        
        {/* Dotted line */}
        <div 
          className="flex-1 w-0.5 my-1"
          style={{
            background: "repeating-linear-gradient(to bottom, #10b981 0px, #10b981 4px, transparent 4px, transparent 8px)",
            backgroundSize: "2px 8px"
          }}
        />
        
        {/* Bottom dot - Red */}
        <div className="w-3 h-3 rounded-full bg-red-500 z-10" />
      </div>
    </div>
  );
}

