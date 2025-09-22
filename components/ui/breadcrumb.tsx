import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef((
  ({ ...props }: any, ref: any) => <nav ref={ref} aria-label="breadcrumb" {...props} />
));
// @ts-ignore
const BreadcrumbAny = Breadcrumb as any;
BreadcrumbAny.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <ol
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className
      )}
      {...props}
    />
  )
));
// @ts-ignore
const BreadcrumbListAny = BreadcrumbList as any;
BreadcrumbListAny.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
));
// @ts-ignore
const BreadcrumbItemAny = BreadcrumbItem as any;
BreadcrumbItemAny.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef((
  ({ asChild, className, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        className={cn('transition-colors hover:text-foreground', className)}
        {...props}
      />
    );
  }
));
// @ts-ignore
const BreadcrumbLinkAny = BreadcrumbLink as any;
BreadcrumbLinkAny.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  )
));
// @ts-ignore
const BreadcrumbPageAny = BreadcrumbPage as any;
BreadcrumbPageAny.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: { children?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export {
  BreadcrumbAny as Breadcrumb,
  BreadcrumbListAny as BreadcrumbList,
  BreadcrumbItemAny as BreadcrumbItem,
  BreadcrumbLinkAny as BreadcrumbLink,
  BreadcrumbPageAny as BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
