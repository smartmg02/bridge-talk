import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition',
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
