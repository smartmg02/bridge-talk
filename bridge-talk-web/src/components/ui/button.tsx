'use client';

import * as React from 'react';
import { cn } from '@/lib/utils'; // 如果你沒有 utils.ts，可用 className 直接串接
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
