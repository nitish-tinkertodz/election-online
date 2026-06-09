export type D1Value = string | number | ArrayBuffer | null;

export type D1Bindings = {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: D1Value[]) => {
        all: <T>() => Promise<{ results: T[] }>;
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
    batch?: (statements: unknown[]) => Promise<unknown>;
    exec?: (query: string) => Promise<unknown>;
  };
};
