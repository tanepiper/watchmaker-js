# WatchmakerJS

<div style='text-align: center'>

![](logo-mid.png)

</div>

Helpful libraries for creating [BangleJS](https://banglejs.com/) applications.

**This is in early development and subject to change**

## Watchmaker

To build the library type `nx build watchmaker-js` to build the library. Currently this outputs a UMD and ESM build,
the best option is to use `watchmaker-js.umd.js`.

Copy this file to your BangleApp's `modules` folder and rename `watchmaker-js.min.js` This can now be imported in any apps:

`const watchMaker = require('watchmaker-js)'`

### Lug - Routable Apps

The main feature of WatchmakerJS is `lug` - a small API for creating applications that are routable. Each route is a screen or screens
that link the application together. It also has functions to loading/saving settings (and loading global settings) and dealing with
your application text and data content.

## Moods App

The Moods App is an example BangleJS application built using Watchmaker - to build run `nx build app-wmaker` - this will
again create a folder in `dist`. This also copies the assets to the folder.

Copy these files to the BangleApp's `apps` folder under `moods` and add the following to `apps.js`

```json
  {
    "id": "moods",
    "name": "Mood Tracker",
    "shortName": "Moods",
    "icon": "moods-icon.png",
    "version": "0.1",
    "description": "A mood tracker for your day",
    "tags": "tool",
    "interface": "interface.html",
    "allow_emulator":true,
    "storage": [
      {"name":"moods.app.js","url":"moods.js"},
      {"name":"moods.text.json","url":"moods.text.json"},
      {"name":"moods.img","url":"moods-icon.js","evaluate":true},
      {"name":"moods.heart.img","url":"heart.js","evaluate":true}
    ]
  },
```

The app should now appear in your apps list. When you upload it will compile the app and include `watchmaker-js` as a dependency.
