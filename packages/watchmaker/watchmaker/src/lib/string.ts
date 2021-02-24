import { StringOptions } from '../types';

/**
 * Returns an array of strings where a source input is split into lines of the maximum length, for use in displaying
 * pages of data
 * @param inputString The input string to split into pages
 * @param maxLen The maximum length of a line
 * @param options
 */
export function getFixedStringLines(inputString: string, maxLen?: number, options?: StringOptions) {
  maxLen = maxLen || 20;
  options = options || {
    splitChar: ' ',
    joinChar: ' '
  };

  const allWords = (inputString || '').split(options.splitChar);
  const output = [];
  let currentLine = '';
  for (let i = 0; i < allWords.length; i++) {
    // Fetch the current and next word
    const currentWord = allWords[i];
    const nextWord = allWords[i + 1];

    // Set the current line and next line
    currentLine = [currentLine, currentWord].join(' ').trim();
    const nextLine = [currentLine, nextWord].join(' ');

    // If the next word will cause the line to go over length, this is where
    // we break to the next line
    if (nextWord && nextLine.length > maxLen) {
      output.push(`${currentLine}`);
      currentLine = '';
    }
  }
  if (currentLine) output.push(currentLine);
  return output;
}


/**
 * Takes a Timestamp and formats to a YYYY-MM-DD date
 * @param timestamp
 * @return {string}
 */
export function formatTimestampToDate(timestamp) {
  const lineDate = new Date(timestamp);
  return [`${lineDate.getFullYear()}`, `${lineDate.getMonth()}`, `${lineDate.getDate()}`].map(d => d.length < 2 ? `0${d}` : `${d}`).join(`-`);
}

/**
 * Takes a timestamp and formats to correct time
 * @param timestamp
 * @param withSeconds
 * @return {string}
 */
export function formatTimestampToTime(timestamp, withSeconds) {
  const lineDate = new Date(timestamp);
  const time = [`${lineDate.getHours()}`, `${lineDate.getMinutes()}`, `${lineDate.getSeconds()}`].map(d => d.length < 2 ? `0${d}` : `${d}`).join(`:`);
  return withSeconds ? time : time.substr(0, 5);
}
