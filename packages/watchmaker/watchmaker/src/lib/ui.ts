/**
 * Returns a promise that is a page with a title, question or statement and buttons
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dont
 * @return {*}
 */
import { convertStringToPage } from './string';

/**
 * Create a selection page
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dont
 */
export function createSelectPage(title, question, buttons, selected, dont) {
  selected = selected || 0;
  if (!dont) {
    question = convertStringToPage(question)[0];
  }
  return E.showPrompt(question, {
    title: title,
    buttons: buttons,
    selected: selected
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
export function createMenu(title, subtitle, menuItems, backFn, exitFn) {
  E.showMenu();
  const menu = {
    "": {title: title},
  };
  if (subtitle) {
    menu[" "] = {value: subtitle};
  }
  Object.keys(menuItems).forEach((key) => {
    menu[key] = menuItems[key];
  });
  if (backFn) {
    menu['Back'] = backFn
  }
  if (exitFn) {
    menu['Exit'] = exitFn
  }
  return E.showMenu(menu);
}
