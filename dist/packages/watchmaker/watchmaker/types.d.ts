/**
 * Options passed to string methods that mutate strings, these handle the
 * line ending and join and split characters for strings
 */
export interface StringOptions {
    /**
     * Line ending for strings, default is (`\n`)
     */
    lineEnding?: string;
    /**
     * Join character for strings, default is space (` `)
     */
    joinChar?: string;
    /**
     * Split character for strings, default is space (` `)
     */
    splitChar?: string;
}
