/**
 * Global Imports
 */
const storage = require('Storage');
const locale = require('locale');
const watchMaker = require('watchmaker-js');

const version = '0.1';

// Instance of the debug function that collects debug data on a defined tick
let debugFn;
// Instance of the moods app, initialised below;
let moodsApp;

/**
 * Get debug information for the app per tick
 * @param tickTime
 * @return {function(): void}
 */
function debugInfo(tickTime?: number) {
  const interval = setInterval(() => {
    const memory = process.memory();
    const pc = Math.round((memory.usage * 100) / memory.total);
    const debugInfo = [
      Bangle.dbg(),
      memory,
      pc,
      storage.getFree(),
      process.version,
    ];
    moodsApp.setState('debugInfo', debugInfo);
  }, tickTime || 5000);

  return () => clearInterval(interval);
}

/**
 * Draw a heart for the HRM monitor page with current heart rate and number
 * of collected rates
 * @param queue
 * @param startX
 * @param startY
 */
function drawHeart(queue, startX, startY) {
  if (queue.length > 0) {
    const heartImage = moodsApp.getImage('heart');
    const item = `${queue[queue.length - 1]}`;
    g.drawImage(heartImage, startX, startY, { scale: 2 });
    g.setColor(255, 255, 255);
    g.setFontVector(item.length === 3 ? 15 : 18);
    g.drawString(`${item}`, startX + 17, startY + 20);
    g.setFontVector(15);
    g.drawString(`${queue.length}`, startX + 50, startY + 20);
  }
}

/**
 * Set up the LCD Listener, if the user has the setting to close the app on LCD
 * close this will check if the user is on the home screen and closes the app
 * If the user is on another page it won't close
 */
function setupLCDListener(app) {
  let timeout;
  // When the LCD Powers down on the menu page, close the app
  Bangle.on('lcdPower', (on) => {
    const lcdOff = app.getSettings('lcdOffClose');
    if (lcdOff) {
      if (on && timeout) {
        clearTimeout(timeout);
      } else if (!on && app.currentRoute === 'home') {
        timeout = setTimeout(() => load(), 20000);
      }
    }
  });
}

/**
 * Set up the GPS listener, if the user has it toggled on then when we get a fix set
 * the last location
 */
function setupGPSListener(app, cb) {
  Bangle.on('GPS', (gps) => {
    if (cb) {
      cb(gps);
    }
    if (gps.fix) {
      app.setState('currentLocation', gps);
    }
  });
}

/**
 * Set up a heart rate monitor collection, this collects a value that is above the
 * confidence level of the HRM device
 * @param app
 * @param cb
 */
function setupHMRListener(app, cb) {
  Bangle.on('HRM', (hrm) => {
    const confidenceLevel = app.getSettings('confidenceLevel');
    const hrmQueue = app.getState('hrmQueue');
    if (hrm.confidence >= confidenceLevel) {
      hrmQueue.push(hrm.bpm);
      app.setState('hrmQueue', hrmQueue);
      if (cb) {
        cb(hrmQueue, true);
      }
    } else {
      if (cb) {
        cb(hrmQueue, false);
      }
    }
  });
}

/**
 * Function called when showing intro
 * @param step
 * @param steps
 */
function showIntro(step: number, steps?: string[]) {
  steps =
    steps || watchMaker.convertStringToPage(moodsApp.getText('text.help'));

  if (step < 0 || !steps[step]) {
    moodsApp.goTo('home');
  } else {
    watchMaker
      .createSelectPage(
        'Welcome to Moods',
        steps[step],
        {
          Next: step + 1,
          Exit: 0,
        },
        0,
        true
      )
      .then((nextStep) => {
        if (!nextStep) {
          showIntro(-1, steps);
        } else {
          showIntro(nextStep, steps);
        }
      });
  }
}

/**
 * The main menu view, this first disables any active devices to off, which allows us to use it
 * as the last step or exit view for all other views
 */
function viewMainMenu() {
  toggleLocationCollection(false);
  toggleHMR(false);

  let moodText = '';
  const lastMood = moodsApp.getState('lastMood');

  if (lastMood) {
    moodText = `${locale.time(new Date(lastMood.time), 1)} - ${lastMood.mood}`;
  }
  const menu = {};
  menu['Set Mood'] = () => moodsApp.goTo('addMood');
  menu['Recent History'] = () => moodsApp.goTo('showHistory');
  menu['Settings'] = () => moodsApp.goTo('settings');
  menu['Help'] = () => moodsApp.goTo('help', 0);
  if (moodsApp.getState('globalDebug')) {
    menu['Debug'] = () => moodsApp.goTo('debug');
  }

  watchMaker.createMenu('Moods', moodText, menu, undefined, () => {
    if (debugFn) debugFn();
    load();
  });
}

/**
 * Create a queue for collecting Heart Rate data of a certain confidence level
 * @param seconds
 * @return {Promise<unknown>}
 */
function createHRMQueue(seconds) {
  moodsApp.setState('hrmQueue', []);

  const countdown = watchMaker.createCountdown(
    seconds / 1000,
    (left) => {
      E.showMessage(
        `Collecting\nKeep Still...\nCancel - BTN2\n${left} seconds left`,
        'Heart Rate'
      );
      LED2.write(1);
    },
    5
  );

  setWatch(() => {
    countdown.cancel();
  }, BTN2);

  toggleHMR(true);
  return countdown.start.then((cancelled) => {
    toggleHMR(false);
    return cancelled ? [] : moodsApp.getState('hrmQueue');
  });
}

function toggleLocationCollection(on) {
  Bangle.setGPSPower(on ? 1 : 0);
}

function toggleHMR(on) {
  Bangle.setHRMPower(on ? 1 : 0);
}

/**
 *
 * @param mood
 * @param level
 * @param settings
 */
function requestHeartRate(mood, level) {
  watchMaker
    .createSelectPage(
      'Your Mood Data',
      'Do you want to collect an average heart rate? Select 30s, 60s or skip this time',
      {
        '30s': 30000,
        '60s': 60000,
        Skip: 0,
      }
    )
    .then((seconds) => {
      if (seconds === 0) {
        writeMood(mood, level, 0);
      } else {
        createHRMQueue(seconds).then((results) => {
          const average = Math.floor(
            results.reduce((a, b) => a + b, 0) / results.length
          );
          writeMood(mood, level, average);
        });
      }
    });
}

/**
 * Prompt the user for a more detailed mood selection
 * @param forMood
 */
function promptMoodList(forMood) {
  const emotions = moodsApp.getText(`emotions.${forMood}`);
  if (!emotions) {
    E.showAlert(`No values for ${forMood}`).then(() => moodsApp.goTo('home'));
    return;
  }
  watchMaker
    .createScrollPrompt(
      `${forMood} Mood`,
      'Select a more detailed emotion - use BTN1 and BTN3 to scroll',
      emotions.reduce((a, k) => {
        a[k] = k;
        return a;
      }, {})
    )
    .then((k) => moodsApp.goTo('setMoodLevel', k));
}

/**
 * Prompt the user for a general mood, this allows us to load the sub-menu of more detailed mood desriptions
 */
function promptMoodGroup() {
  const collectLocation = moodsApp.getSettings('collectLocation');
  if (collectLocation) {
    toggleLocationCollection(true);
  }

  const emotions = moodsApp.getText('emotions');
  E.showMessage('', 'Select An Emotion');
  // drawSelect((g.getWidth() / 2) - 48, 140);

  setTimeout(() => {
    const menuButtons = Object.keys(emotions).reduce((buttons, key) => {
      buttons[key] = () => moodsApp.goTo('setMoodType', key);
      return buttons;
    }, {});

    watchMaker.createMenu(
      'Select Emotion',
      undefined,
      menuButtons,
      undefined,
      () => moodsApp.goTo('home')
    );
  }, 3000);
}

/**
 * Get the intensity of feeling from the user, this is on a scale of 1-5.
 *
 * Next ->
 *  - If setting `collectHRM` is true -> requestHRM
 *  - If setting `collectHRM` is false -> writeMood
 *
 * @param mood
 */
function promptMoodLevel(mood) {
  watchMaker
    .createSelectPage(
      'Mood Intensity',
      'How intensely are you feeling this mood?',
      {
        '5': 5,
        '4': 4,
        '3': 3,
        '2': 2,
        '1': 1,
      },
      2
    )
    .then((level) => {
      const collectHRM = moodsApp.getSettings('collectHRM');
      if (!collectHRM) {
        writeMood(mood, level, 0);
      } else {
        moodsApp.goTo('requestHRM', mood, level);
      }
    });
}

function showLastMoods(index, lastIndex, moods) {
  const maxHistory = moodsApp.getSettings('maxHistory');
  moodsApp.getData('data', maxHistory).then((moods) => {
    if (moods.length === 0) {
      watchMaker
        .createAlert('No Data', 'No data has been collected for Moods')
        .then(() => {
          moodsApp.goTo('home');
        });
      return;
    }
    let btnCount = 1;
    const buttons = {};
    if (moods.length > 1 && index !== 0) {
      buttons['<'] = index - 1;
      btnCount++;
    }
    buttons['Exit'] = -1;
    if (moods.length > 1 && index !== moods.length - 1) {
      buttons['>'] = index + 1;
      btnCount++;
    }
    let selected;
    switch (btnCount) {
      case 3:
        selected = index > lastIndex ? 2 : 0;
        break;
      case 2:
        selected = index === 0 ? 1 : 0;
        break;
      default:
        selected = 0;
    }
    const mood = moods[index];

    watchMaker
      .createSelectPage(
        `${locale.date(new Date(mood.time), 1)}: ${locale.time(
          new Date(mood.time),
          1
        )}`,
        [
          `Mood: ${mood.mood}`,
          `Level: ${mood.level}`,
          mood.bpmRate ? `Heart rate ${mood.bpmRate}bpm` : `No Heart Rate`,
          mood.location !== null ? `With Location` : `No Location`,
        ].join('\n'),
        buttons,
        selected,
        true
      )
      .then((i) => {
        if (i === -1) {
          moodsApp.goTo('home');
        } else {
          moodsApp.goTo('showHistory', i, index, moods);
        }
      });
  });
}

/**
 * Show the application settings menu
 */
function showSettings() {
  const currentSettings = moodsApp.getSettings();

  watchMaker.createMenu(
    'Mood Settings',
    undefined,
    {
      'Log Location': {
        value: currentSettings.collectLocation,
        format: (v) => (v ? 'On' : 'Off'),
        onchange: (v) => (currentSettings.collectLocation = v),
      },
      'Log HRM': {
        value: currentSettings.collectHRM,
        format: (v) => (v ? 'On' : 'Off'),
        onchange: (v) => (currentSettings.collectHRM = v),
      },
      'Buzz On HRM': {
        value: currentSettings.buzzOnHRM,
        format: (v) => (v ? 'On' : 'Off'),
        onchange: (v) => (currentSettings.buzzOnHRM = v),
      },
      'HRM Min Conf': {
        value: currentSettings.confidenceLevel,
        min: 0,
        max: 100,
        step: 5,
        onchange: (v) => (currentSettings.confidenceLevel = v),
      },
      'Max History': {
        value: currentSettings.maxHistory,
        min: 0,
        max: 50,
        step: 5,
        onchange: (v) => (currentSettings.maxHistory = v),
      },
      'LCD Off Close': {
        value: currentSettings.lcdOffClose,
        format: (v) => (v ? 'On' : 'Off'),
        onchange: (v) => (currentSettings.lcdOffClose = v),
      },
    },
    () => {
      if (!moodsApp.saveSettings(currentSettings)) {
        E.showAlert('Unable to save settings').then(() => {
          moodsApp.goTo('home');
        });
      } else {
        moodsApp.goTo('home');
      }
    }
  );
}

/**
 * Write the mood to the moods file
 * @param mood
 * @param level
 * @param rate
 */
function writeMood(mood, level, rate) {
  toggleLocationCollection(false);

  const currentLocation = moodsApp.getState('currentLocation');

  const time = Math.round(Date.now());
  const result = {
    time: time,
    mood: mood,
    level: level,
    bpmRate: rate,
    location:
      currentLocation && currentLocation.fix
        ? {
            lat: currentLocation.lat,
            lon: currentLocation.lon,
            alt: currentLocation.alt,
          }
        : null,
  };

  moodsApp.getData('data').then((moods) => {
    moods.unshift(result);
    moodsApp.saveData('data', moods).then(() => {
      moodsApp.setState('lastMood', result);
      moodsApp.goTo('home');
    });
  });
}

/**
 * Show the application debug menu which shows current memory usage
 */
function showDebug() {
  const debugInfo = moodsApp.getState('debugInfo');
  if (!debugInfo) {
    watchMaker
      .createAlert(
        'No Debug Info',
        'No Debug info available, try again in a few seconds'
      )
      .then(() => {
        moodsApp.goTo('home');
      });
    return;
  }
  const header = `Debug Info (${version})`;
  watchMaker.createMenu(
    header,
    undefined,
    {
      'Mem % Used': { value: `${debugInfo[2]}` },
      'Mem Usage': { value: `${debugInfo[1].usage}` },
      'Mem Total': { value: `${debugInfo[1].total}` },
      'Mem Free': { value: `${debugInfo[1].free}` },
      Blocksize: { value: `${debugInfo[1].blocksize}` },
      'Space Free': { value: `${debugInfo[3]}` },
      'Espurino v.': { value: `${debugInfo[4]}` },
      Dump: () => {
        watchMaker
          .createMessage('Moods Debug', 'Dumping variables to console')
          .then(() => {
            E.dumpVariables();
            moodsApp.goTo('debug');
          });
      },
      Refresh: () => moodsApp.goTo('debug'),
    },
    () => moodsApp.goTo('home')
  );
}

/**
 * Initialise the application
 */
moodsApp = watchMaker.lug('moods', {
  routes: {
    home: { view: () => viewMainMenu() },
    help: { view: (step) => showIntro(step) },
    addMood: { view: () => promptMoodGroup() },
    setMoodType: { view: (mood) => promptMoodList(mood) },
    setMoodLevel: { view: (mood) => promptMoodLevel(mood) },
    showHistory: {
      view: (index, lastIndex, moods) =>
        showLastMoods(index || 0, lastIndex, moods),
    },
    requestHRM: { view: (mood, level) => requestHeartRate(mood, level) },
    settings: { view: () => showSettings() },
    debug: { view: () => showDebug() },
  },
  init: (app) => {
    // Fast access images
    app.loadImage('heart');

    // Set up global listeners
    setupLCDListener(app);
    setupGPSListener(app, () => LED1.write(1));
    setupHMRListener(app, (currentQueue, buzz) => {
      drawHeart(currentQueue, 80, 160);
      if (buzz) {
        app.getSettings('buzzOnHRM') && Bangle.buzz(200, 1);
      }
    });

    // Setup global debug
    const globalDebug = app.getGlobalSettings('log');
    if (globalDebug) {
      app.setState('globalDebug', true);
      debugFn = debugInfo();
    }

    // Check for settings, if not there create defaults
    let settings = app.getSettings();
    if (!settings) {
      app.saveSettings({
        collectLocation: false,
        collectHRM: true,
        buzzOnHRM: true,
        confidenceLevel: 65,
        lcdOffClose: true,
        maxHistory: 10,
      });
      app.setState('firstTime', true);
    }

    app.getData('data', 1).then((result) => {
      app.setState('lastMood', result[0]);
    });
  },
  /**
   * Once the app is initialised, do the first transition
   * @param app
   */
  first: (app) => {
    if (app.getState('firstTime')) {
      app.goTo('help', 0);
    } else {
      app.goTo('home');
    }
  },
});
