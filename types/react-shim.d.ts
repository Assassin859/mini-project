// Minimal React module shim for type-checking in environments without full React types
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace React {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ReactNode = any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const React: any;

declare module 'react' {
  export = React;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useState: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useEffect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useCallback: any;
}

