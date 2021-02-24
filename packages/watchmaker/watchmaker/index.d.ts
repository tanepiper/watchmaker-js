interface E {
  showAlert: (text: string) => Promise<void>;
  showPrompt: (body: string, options: {
    title: string,
    buttons: Record<string, any>,
    selected?: number
  }) => Promise<any>;
  showMenu: (menu?: any) => {
    draw: () => void,
    move: () => void;
    select: () => void;
  }
}

declare var E: E;
