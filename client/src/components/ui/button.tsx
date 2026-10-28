import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-coffee-800 text-white hover:bg-coffee-900 shadow-xs active:scale-[0.99]',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
        outline: 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 shadow-2xs',
        secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200/80',
        ghost: 'hover:bg-stone-100 text-stone-700 hover:text-stone-900',
        link: 'text-coffee-800 underline-offset-4 hover:underline',
        blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs',
        blueOutline: 'border border-blue-200 bg-blue-50/50 text-blue-900 hover:bg-blue-100/70 shadow-2xs',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-5 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
