import { StringOptions } from '../types';
/**
 * Returns an array of strings where a source input is split into lines of the maximum length, for use in displaying
 * pages of data
 * @param inputString The input string to split into pages
 * @param maxLen The maximum length of a line
 * @param options
 */
export declare function getFixedStringLines(inputString: string, maxLen?: number, options?: StringOptions): any[];
/**
 * Export a set of pages from a string
 * @param str
 * @param linesPerPage
 * @param charactersPerLine
 * @param otherOpts
 */
export declare function convertStringToPage(str: string, linesPerPage?: number, charactersPerLine?: number, otherOpts?: StringOptions): any[];
/**
 * Takes a Timestamp and formats to a YYYY-MM-DD date
 * @param timestamp
 * @return {string}
 */
export declare function formatTimestampToDate(timestamp: any): string;
/**
 * Takes a timestamp and formats to correct time
 * @param timestamp
 * @param withSeconds
 * @return {string}
 */
export declare function formatTimestampToTime(timestamp: any, withSeconds: any): string;
