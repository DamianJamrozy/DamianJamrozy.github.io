// @ts-check

/** @typedef {'pl' | 'en'} Language */
/** @typedef {{pl: string, en: string}} Localized */
/** @typedef {{label: Localized, answer: Localized}} StoryQuestion */
/**
 * @typedef {object} Chapter
 * @property {string} id
 * @property {string} year
 * @property {Localized} title
 * @property {Localized} subtitle
 * @property {Localized} tag
 * @property {Localized} intro
 * @property {StoryQuestion[]} questions
 * @property {Localized} takeaway
 * @property {string[]} skills
 */

export {};
