import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-coffee-800 text-white',
        secondary: 'border-transparent bg-stone-100 text-stone-900',
        destructive: 'border-transparent bg-red-600 text-white',
        outline: 'text-stone-900 border-stone-200 bg-white',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        blue: 'border-blue-200 bg-blue-50 text-blue-800',
        blueSolid: 'border-transparent bg-blue-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

