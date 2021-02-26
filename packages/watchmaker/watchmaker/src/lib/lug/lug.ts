import { Lug, LugOptions } from '../../types';
import { createAlert } from '../ui';

const storage = require('Storage');

/**
 * Lug is an opinionated application framework for the BangleJS watch - it provides
 * a small routable application that be used to go between views in your app.
 *
 * It tries to be as memory-efficient as possible - Lug takes care of providing
 * you a file for your app settings and text data to use globally across the app,
 * avoiding to use memory and preferring flash.
 *
 * It also provides access to data files which allow you to save lines of JSON content,
 * separated by line endings - this way the application can read per line, and provides
 * helpers for memory efficient reading.
 *
 * @param name Name of the app
 * @param options Options for Lug
 */
export function lug(name: string, options: LugOptions): Lug {
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
     * Store images for use in app, don't have too many but speeds up for one's
     * accessed often
     */
    images: {},
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

    /**
     * Load an image to memory for fast use
     * @param name
     */
    loadImage: (name: string) => {
      const img = storage.read(`${app.name}.${name}.img`);
      app.images[name] = img;
      return img;
    },

    /**
     * Get a stored image
     * @param name
     */
    getImage: (name: string) => {
      return app.images[name];
    },

    /**
     * Get a value from your applications text file
     * @param name
     */
    getText: (name?: string) => {
      const data = storage.readJSON(`${app.name}.text.json`, 1);
      if (!name) {
        return data;
      }
      return name.includes('.')
        ? name.split('.').reduce((a, k) => (a[k] && a[k]) || a, data || {})
        : data[name];
    },

    /**
     * Return a setting from the global settings file of BangleJS
     * @param name
     */
    getGlobalSettings: (name?: string) => {
      const data = storage.readJSON('setting.json', 1);
      if (data && data[name]) {
        return data[name];
      }
      return data;
    },

    /**
     * Get a value from your applications settings file
     * @param name
     */
    getSettings: (name?: string) => {
      const data = storage.readJSON(`${app.name}.settings.json`, 1);
      if (data && data[name]) {
        return data[name];
      }
      return data;
    },

    /**
     * Save an application setting
     * @param settings
     */
    saveSettings: (settings: Record<string, unknown>) => {
      return storage.writeJSON(`${app.name}.settings.json`, settings);
    },

    /**
     * Write to a data file
     * @param name
     * @param data
     */
    saveData: (
      name: string,
      data: Record<string, unknown> | Record<string, unknown>[]
    ) => {
      return new Promise((resolve, reject) => {
        try {
          const fileWriter = storage.open(`${app.name}.${name}.json`, 'w');

          let output = '';
          if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
              output += `${JSON.stringify(data[i])}\n`;
            }
          } else {
            output = `${JSON.stringify(data)}\n`;
          }
          fileWriter.write(`${output}`);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    },

    /**
     * Read a data file
     * @param name
     * @param lines
     */
    getData: (name: string, lines?: number) => {
      return new Promise((resolve, reject) => {
        try {
          const fileReader = storage.open(`${app.name}.${name}.json`, 'r');
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
          resolve(output);
        } catch (e) {
          reject(e);
        }
      });
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
        createAlert('Lug Error', `Route ${route} not found`).then(() =>
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
