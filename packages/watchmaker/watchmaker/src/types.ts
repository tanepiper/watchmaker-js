/**
 * Options passed to string methods that mutate strings, these handle the
 * line ending and join and split characters for strings
 */
export interface StringOptions {
  /**
   * Line ending for strings, default is (`\n`)
   */
  lineEnding?: string;
  /**
   * Join character for strings, default is space (` `)
   */
  joinChar?: string;
  /**
   * Split character for strings, default is space (` `)
   */
  splitChar?: string;
}

export interface Routes {
  home: {
    options?: Record<string, unknown>;
    view: (...args: any[]) => void;
  };

  [key: string]: {
    options?: Record<string, unknown>;
    view: (...args: any[]) => void;
  };
}

export interface LugOptions {
  state?: Record<string, unknown>;
  routes: Routes;
  onChange?: (app: Lug) => void;
  init: (app: Lug) => void;
  first?: (app: Lug) => void;
}

export interface Lug {
  name: string;
  routes: Routes;
  state: Record<string, unknown>;
  images: Record<string, unknown>;
  loadImage: (name: string) => void;
  getImage: (name: string) => void;
  setState: (key: string, state: any) => void;
  getState: (key: string) => unknown;
  getText: () => Record<string, unknown> | undefined;
  getGlobalSettings: () => Record<string, unknown> | undefined;
  getSettings: () => Record<string, unknown> | undefined;
  saveSettings: (settings: Record<string, unknown>) => boolean;
  saveData: (name: string, data: Record<string, unknown>) => Promise<void>;
  getData: (name: string, lines?: number) => Promise<Record<string, unknown>[]>;
  currentRoute: string;
  goTo: (route: string, ...args: unknown[]) => void;
}
