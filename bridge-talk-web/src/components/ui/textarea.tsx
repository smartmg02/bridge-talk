import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'w-full p-2 border rounded-md focus:outline-none focus:ring',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
