import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-premium duration-200 disabled:pointer-events-none disabled:opacity-50 ds-focus-ring',
  {
    variants: {
      variant: {
        primary: 'bg-charcoal-900 text-ivory-100 hover:bg-charcoal-800',
        gold: 'bg-gold-500 text-charcoal-950 hover:bg-gold-400',
        outline: 'border border-neutral-300 bg-transparent text-charcoal-900 hover:bg-neutral-50',
        ghost: 'bg-transparent text-charcoal-700 hover:bg-neutral-100',
        danger: 'bg-danger text-ivory-100 hover:opacity-90',
        link: 'text-gold-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'Button';
