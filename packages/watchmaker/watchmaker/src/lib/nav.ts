const storage = require('Storage');

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
export function lug(name: string, options: LugOptions): Lug {
  const fileWriter = storage.open(`${name}.data.json`, 'a');

  const app: Lug = {
    /**
     * Application name
     */
    name: name,

    /**
     * Application state, this should be used as little as possible but provides
     * a way to share local state across the app
     */
    state: {},
    /**
     * App routes
     */
    routes: options.routes || {
      home: { view: () => E.showAlert('No Lug Home Set') },
    },
    /**
     * current route
     */
    currentRoute: '',

    getText: (name?: string) => {
      const data = storage.readJSON(`${app.name}.text.json`, 1);

      if (!name) {
        return data;
      }
      if (name.includes('.')) {
        let keys = name.split('.');
        return keys.reduce((a, k) => (a[k] && a[k]) || a, data || {});
      } else {
        return data[name];
      }
    },

    getSettings: (name?: string) => {
      const data = storage.readJSON(`${app.name}.settings.json`, 1);
      if (data && data[name]) {
        return data[name];
      }
      return data;
    },

    saveSettings: (settings: Record<string, unknown>) => {
      return storage.writeJSON(`${app.name}.settings.json`, settings);
    },

    /**
     * Wrote a data file
     * @param data
     */
    saveData: (data: Record<string, unknown>) => {
      const txt = JSON.stringify(data);
      fileWriter.write(`${txt}\n`);
    },

    /**
     * Read a data file
     * @param lines
     */
    getData: (lines?: number) => {
      const fileReader = storage.open(`${app.name}.data.json`, 'r');
      const output = [];
      if (lines) {
        for (let i = 0; i < lines; i++) {
          const line = fileReader.readLine();
          if (!line) break;
          output.push(JSON.parse(line));
        }
      } else {
        let line = fileReader.readLine();
        while (line !== undefined) {
          output.push(JSON.parse(line));
          line = fileReader.readLine();
        }
      }
      return output;
    },

    /**
     * Set state
     * @param key
     * @param state
     */
    setState: (key: string, state: any) => {
      app.state[key] = state;
    },
    /**
     * Get State
     * @param key
     */
    getState: (key) => {
      return app.state[key];
    },

    /**
     * Goto a route in the router object
     * @param route
     * @param args
     */
    goTo: (route: string, ...args: any[]) => {
      if (options.onChange) {
        options.onChange(app);
      }
      if (app.routes[route]) {
        app.routes[route].view.apply(app, args);
        app.currentRoute = route;
      } else {
        E.showAlert(`Route ${route} not found`).then(() =>
          app.routes.home.view.apply(app, args)
        );
      }
    },
  };
  options.init(app);
  if (options.first) {
    setTimeout(() => options.first(app), 1000);
  }

  return app;
}
