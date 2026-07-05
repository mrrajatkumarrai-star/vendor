import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 400);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {isVisible && content && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-2xs text-white bg-gray-800 rounded whitespace-nowrap',
            'animate-fade-in pointer-events-none',
            positionClasses[side],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
