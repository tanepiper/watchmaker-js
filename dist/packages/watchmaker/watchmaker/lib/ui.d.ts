/**
 * Create a selection page
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dont
 */
export declare function createSelectPage(title: any, question: any, buttons: any, selected: any, dont: any): Promise<any>;
/**
 * Create a menu
 * @param title
 * @param subtitle
 * @param menuItems
 * @param backFn
 * @param exitFn
 */
export declare function createMenu(title: any, subtitle: any, menuItems: any, backFn: any, exitFn: any): {
    draw: () => void;
    move: () => void;
    select: () => void;
};
