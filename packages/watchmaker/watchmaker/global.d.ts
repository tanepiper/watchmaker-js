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

declare function clearWatch();
declare function setWatch(fn: () => void, btn, options);

declare var BTN1;
declare var BTN2;
declare var BTN3;
