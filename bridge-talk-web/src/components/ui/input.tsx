import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full p-2 border rounded-md focus:outline-none focus:ring',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
