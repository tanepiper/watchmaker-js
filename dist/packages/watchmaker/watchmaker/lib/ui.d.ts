/**
 * Create a selection page
 * @param title
 * @param question
 * @param buttons
 * @param selected
 * @param dontFormatText
 */
export declare function createSelectPage(title: any, question: any, buttons: any, selected: any, dontFormatText: any): Promise<any>;
/**
 * Create a menu
 * @param title
 * @param subtitle
 * @param menuItems
 * @param backFn
 * @param exitFn
 */
export declare function createMenu(title: string, subtitle: string, menuItems: Record<string, any>, backFn: () => void, exitFn: () => void): {
    draw: () => void;
    move: () => void;
    select: () => void; /**
     * Create a selection page
     * @param title
     * @param question
     * @param buttons
     * @param selected
     * @param dontFormatText
     */
};
/**
 * Create an alert and call then passed callback
 * @param text
 * @param cb
 * @param dontFormat
 */
export declare function createAlert(text: string, cb: () => void, dontFormat?: boolean): void;
/**
 * Show a message for a specified time before resolving, if no time then immediately return
 * @param title
 * @param text
 * @param time
 * @param dontFormat
 */
export declare function createMessage(title: string, text: string, time?: number, dontFormat?: boolean): Promise<unknown>;
/**
 * Creates a  prompt where the answers can be scrolled
 * @param title
 * @param message
 * @param buttons
 * @param selected
 */
export declare function createScrollPrompt(title: string, message: string, buttons?: Record<string, any>, selected?: number): Promise<unknown>;
