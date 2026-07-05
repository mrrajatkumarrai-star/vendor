import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ isOpen, onClose, title, children, width = 'w-[480px]' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className={cn(
              'fixed top-0 right-0 h-full bg-white shadow-drawer z-50 flex flex-col',
              width
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-hover-bg text-muted hover:text-foreground transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
