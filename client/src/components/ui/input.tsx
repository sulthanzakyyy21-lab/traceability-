import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-xl border border-stone-200 bg-white px-3 py-1 text-xs text-stone-900 transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-800/30 focus-visible:border-coffee-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
