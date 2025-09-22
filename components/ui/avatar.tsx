'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

const Avatar = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
));
// @ts-ignore
const AvatarAny = Avatar as any;
AvatarAny.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  )
));
// @ts-ignore
const AvatarImageAny = AvatarImage as any;
AvatarImageAny.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
));
// @ts-ignore
const AvatarFallbackAny = AvatarFallback as any;
AvatarFallbackAny.displayName = AvatarPrimitive.Fallback.displayName;

export { AvatarAny as Avatar, AvatarImageAny as AvatarImage, AvatarFallbackAny as AvatarFallback };
