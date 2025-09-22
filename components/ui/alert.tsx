import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef((
  ({ className, variant, ...props }: any, ref: any) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
));
// @ts-ignore
const AlertAny = Alert as any;
AlertAny.displayName = 'Alert';

const AlertTitle = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
));
// @ts-ignore
const AlertTitleAny = AlertTitle as any;
AlertTitleAny.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
));
// @ts-ignore
const AlertDescriptionAny = AlertDescription as any;
AlertDescriptionAny.displayName = 'AlertDescription';

export { AlertAny as Alert, AlertTitleAny as AlertTitle, AlertDescriptionAny as AlertDescription };
