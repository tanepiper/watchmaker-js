const loc = require('locale');

/**
 * Returns a promise that is a page with a title, question or statement and buttons
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dont
 * @return {*}
 */
import { convertStringToPage, getFixedStringLines } from './string';

/**
 * Create a selection page
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dontFormatText
 */
export function createSelectPage(
  title: string,
  question: string,
  buttons: Record<string, any>,
  selected?: number,
  dontFormatText?: boolean
) {
  selected = selected || 0;
  if (!dontFormatText) {
    question = convertStringToPage(question)[0];
  }
  return E.showPrompt(question, {
    title: title,
    buttons: buttons,
    selected: selected,
  });
}

/**
 * Create a menu
 * @param title
 * @param subtitle
 * @param menuItems
 * @param backFn
 * @param exitFn
 */
export function createMenu(
  title: string,
  subtitle: string,
  menuItems: Record<string, any>,
  backFn?: () => void,
  exitFn?: () => void
) {
  E.showMenu();
  const menu = {
    '': { title: title },
  };
  if (subtitle) {
    menu[' '] = { value: subtitle };
  }
  Object.keys(menuItems).forEach((key) => {
    menu[key] = menuItems[key];
  });
  if (backFn) {
    menu['< Back'] = backFn;
  }
  if (exitFn) {
    menu['<< Exit'] = exitFn;
  }
  return E.showMenu(menu);
}

/**
 * Create an alert and call then passed callback
 * @param title
 * @param text
 * @param dontFormat
 */
export function createAlert(title: string, text: string, dontFormat?: boolean) {
  if (!dontFormat) {
    text = convertStringToPage(text)[0];
  }
  return E.showAlert(text, title);
}

/**
 * Show a message for a specified time before resolving, if no time then immediately return
 * @param title
 * @param text
 * @param time
 * @param dontFormat
 */
export function createMessage(
  title: string,
  text: string,
  time?: number,
  dontFormat?: boolean
) {
  time = time || 0;
  if (!dontFormat) {
    text = convertStringToPage(text)[0];
  }
  return new Promise((resolve) => {
    E.showMessage(text, title);
    setTimeout(() => resolve(), time);
  });
}

/**
 * Creates a  prompt where the answers can be scrolled
 * @param title
 * @param message
 * @param buttons
 * @param selected
 */
export function createScrollPrompt(
  title: string,
  message: string,
  buttons?: Record<string, any>,
  selected?: number
) {
  if (!buttons) {
    buttons = { Yes: true, No: false };
  }
  selected = selected || 0;
  let buttonKeys = Object.keys(buttons);

  const msg = getFixedStringLines(message);

  function draw(currentBtn: number) {
    g.clear(1); // clear screen
    g.reset().setFont('6x8', 2).setFontAlign(0, 0);
    const W = g.getWidth();
    const H = g.getHeight();
    if (title) {
      title = loc.translate(title);
      g.drawString(title, W / 2, 34);
      const w = (g.stringWidth(title) + 16) / 2;
      g.fillRect(W / 2 - w, 44, W / 2 + w, 44);
    }
    const offset = (H - msg.length * 16) / 2;
    msg.forEach((line, y) =>
      g.drawString(loc.translate(line), W / 2, offset + y * 16)
    );
    let buttonWidths = 0;
    const buttonPadding = 16;
    let btn = loc.translate(buttonKeys[currentBtn]);
    buttonWidths = buttonPadding + g.stringWidth(btn);
    //buttonKeys.forEach(btn => buttonWidths += buttonPadding + g.stringWidth(loc.translate(btn)));
    let x = (W - buttonWidths) / 2;
    let y = H - 40;
    const w = g.stringWidth(btn);
    x += (w + buttonPadding) / 2;
    const bw = 2 + w / 2;

    // Polygon for button
    const poly = [
      x - bw,
      y - 12,
      x + bw,
      y - 12,
      x + bw + 4,
      y - 8,
      x + bw + 4,
      y + 8,
      x + bw,
      y + 12,
      x - bw,
      y + 12,
      x - bw - 4,
      y + 8,
      x - bw - 4,
      y - 8,
      x - bw,
      y - 12,
    ];
    g.setColor(0x02f7)
      .fillPoly(poly)
      .setColor(-1)
      .drawPoly(poly)
      .drawString(btn, x, y + 1);

    g.setColor(!currentBtn ? 0 : -1);
    g.fillPoly([120, y - 29, 106, y - 15, 134, y - 15]);
    g.setColor(buttonKeys.length - 1 === currentBtn ? 0 : -1);
    g.fillPoly([120, y + 12 + 4 + 14, 106, y + 12 + 4, 134, y + 12 + 4]);

    g.setColor(-1).flip(); // turn screen on
  }

  if (Bangle.btnWatches) {
    Bangle.btnWatches.forEach(clearWatch);
    Bangle.btnWatches = undefined;
  }
  g.clear(1); // clear screen
  Bangle.drawWidgets(); // redraw widgets

  draw(selected);

  return new Promise((resolve) => {
    Bangle.btnWatches = [
      setWatch(
        () => {
          if (selected > 0) {
            selected--;
            draw(selected);
          }
        },
        BTN1,
        { repeat: 1 }
      ),
      setWatch(
        () => {
          if (selected < buttonKeys.length - 1) {
            selected++;
            draw(selected);
          }
        },
        BTN3,
        { repeat: 1 }
      ),
      setWatch(
        () => {
          g.clear(1);
          resolve(buttons[buttonKeys[selected]]);
        },
        BTN2,
        { repeat: 1 }
      ),
    ];
  });
}
