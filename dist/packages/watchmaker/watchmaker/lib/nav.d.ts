interface Routes {
    home: {
        options: Record<string, any>;
        view: (...args: any[]) => void;
    };
    [key: string]: {
        options: Record<string, any>;
        view: (...args: any[]) => void;
    };
}
/**
 * Lug is a very simple router navigation for BangleJS
 * @param routes
 * @param options
 * @param init
 */
export declare function lug(routes: Routes, onChange: (name: string) => void, init: (app: any) => void): {
    goTo: (route: string, ...args: any[]) => void;
};
export {};
