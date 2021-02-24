interface Routes {
  home: {
    options: Record<string, any>
    view: (...args: any[]) => void;
  }

  [key: string]: {
    options: Record<string, any>
    view: (...args: any[]) => void;
  }
}


/**
 * Lug is a very simple router navigation for BangleJS
 * @param routes
 * @param options
 * @param init
 */
export function lug(routes: Routes, onChange: (name: string) => void, init: (app: any) => void) {

  const app = {
    goTo: (route: string, ...args: any[]) => {
      onChange(route);
      if (routes[route]) {
        routes[route].view(args);
      } else {
        E.showAlert(`Route ${route} not found`).then(() => routes.home.view());
      }
    }
  };
  init(app);
  return app;


}
