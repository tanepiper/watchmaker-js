declare module NodeJS {
  interface Process {
    memory: () => {
      free: number;
      usage: number;
      total: number;
      history: number;
      gc: number;
      gctime: number;
      blocksize: number;
    }
  }
}

interface E {
  showAlert: (text: string, title?: string) => Promise<void>;
  showPrompt: (
    body?: string,
    options?: {
      title: string;
      buttons: Record<string, any>;
      selected?: number;
    }
  ) => Promise<any>;
  showMenu: (
    menu?: any
  ) => {
    draw: () => void;
    move: () => void;
    select: () => void;
  };
  showMessage: (text: string, title: string) => void;
  dumpVariables: () => void;
}

interface g {
  [key: string]: any;
}

interface Bangle {
  [key: string]: any;
}

interface StorageFile {
  erase: () => void;
  getLength: () => number;
  read: (len: number) => string | undefined;
  readLine: () => string | undefined;
  write: (data: string) => void;
}

declare var E: E;
declare var g: g;
declare var Bangle: Bangle;

declare function load(): void;
declare function clearWatch(): void;
declare function setWatch(fn: () => void, btn, options?: Record<string, any>): void;

declare var BTN1;
declare var BTN2;
declare var BTN3;
declare var LED1;
declare var LED2;
