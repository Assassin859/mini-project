'use client';

import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    }: any,
    ref: any
  ) => {
    const [carouselRef, api] = useEmblaCarousel( 
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: any) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
) as any;
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef(
  ({ className, ...props }: any, ref: any) => {
    const { carouselRef, orientation } = useCarousel();
    return (
      <div
        ref={carouselRef}
        className={cn(
          'overflow-hidden',
          orientation === 'horizontal' ? 'flex' : 'flex-col',
          className
        )}
        {...props}
      />
    );
  }
) as any;
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef(
  ({ className, ...props }: any, ref: any) => {
    const { orientation } = useCarousel();
    return (
      <div
        ref={ref}
        className={cn(
          'min-w-0',
          orientation === 'horizontal' ? 'h-full' : 'w-full',
          className
        )}
        {...props}
      />
    );
  }
) as any;
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef(
  ({ className, variant = 'outline', size = 'icon', ...props }: any, ref: any) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity focus:opacity-100 disabled:pointer-events-none disabled:opacity-50',
          orientation === 'horizontal' ? '' : 'left-1/2 top-4 -translate-x-1/2 -translate-y-0',
          className
        )}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  }
) as any;
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef(
  ({ className, variant = 'outline', size = 'icon', ...props }: any, ref: any) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity focus:opacity-100 disabled:pointer-events-none disabled:opacity-50',
          orientation === 'horizontal' ? '' : 'right-1/2 top-4 -translate-x-1/2 -translate-y-0',
          className
        )}
        onClick={scrollNext}
        disabled={!canScrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  }
) as any;
CarouselNext.displayName = 'CarouselNext';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
