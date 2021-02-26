interface Routes {
    home: {
        options?: Record<string, any>;
        view: (...args: any[]) => void;
    };
    [key: string]: {
        options?: Record<string, any>;
        view: (...args: any[]) => void;
    };
}
interface LugOptions {
    state?: Record<string, unknown>;
    routes: Routes;
    onChange?: (app: Lug) => void;
    init: (app: Lug) => void;
    first?: (app: Lug) => void;
}
interface Lug {
    name: string;
    routes: Routes;
    state: {};
    setState: (key: string, state: any) => void;
    getState: (key: string) => any;
    getText: () => Record<string, unknown> | undefined;
    getSettings: () => Record<string, unknown> | undefined;
    saveSettings: (settings: Record<string, unknown>) => boolean;
    saveData: (data: Record<string, unknown>) => void;
    getData: (lines?: number) => Record<string, unknown>[];
    currentRoute: string;
    goTo: (route: string, ...args: any[]) => void;
}
/**
 * Lug is a very simple application builder for BangleJS
 * @param name Name of the app
 * @param options Options for Lug
 */
export declare function lug(name: string, options: LugOptions): Lug;
export {};
