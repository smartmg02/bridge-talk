import clsx from 'clsx';
import { forwardRef,InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full px-4 py-2 border rounded-md bg-white text-black focus:outline-none focus:ring focus:ring-blue-300',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
