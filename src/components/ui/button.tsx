import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const baseStyle =
    'px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      {...props}
      className={clsx(baseStyle, variants[variant], className)}
    />
  );
}
