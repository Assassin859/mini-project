import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
));
// @ts-ignore
const CardAny = Card as any;
CardAny.displayName = "Card";

const CardHeader = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
));
// @ts-ignore
const CardHeaderAny = CardHeader as any;
CardHeaderAny.displayName = "CardHeader";

const CardTitle = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
));
// @ts-ignore
const CardTitleAny = CardTitle as any;
CardTitleAny.displayName = "CardTitle";

const CardDescription = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
));
// @ts-ignore
const CardDescriptionAny = CardDescription as any;
CardDescriptionAny.displayName = "CardDescription";

const CardContent = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
));
// @ts-ignore
const CardContentAny = CardContent as any;
CardContentAny.displayName = "CardContent";

const CardFooter = React.forwardRef((
  ({ className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
));
// @ts-ignore
const CardFooterAny = CardFooter as any;
CardFooterAny.displayName = "CardFooter";

export { CardAny as Card, CardHeaderAny as CardHeader, CardFooterAny as CardFooter, CardTitleAny as CardTitle, CardDescriptionAny as CardDescription, CardContentAny as CardContent }