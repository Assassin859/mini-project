// Ambient declarations to satisfy TypeScript in Node tooling while using Deno edge functions

// Deno global (provided at runtime by Supabase Edge Functions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

// Supabase npm import specifier for Deno
declare module 'npm:@supabase/supabase-js@2' {
  // Re-export types as any to avoid compile-time tooling issues; runtime uses Deno resolver
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const createClient: any;
}

// Fallback JSX namespace to avoid editor complaints when TS config isn't fully resolved
declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
  }
}

