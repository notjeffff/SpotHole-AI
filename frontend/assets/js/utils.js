/**
 * utility functions for DOM manipulation and common tasks.
 * Extension point for future phases.
 */

/**
 * Select a single element from the DOM.
 * @param {string} selector 
 * @returns {Element|null}
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * Select multiple elements from the DOM.
 * @param {string} selector 
 * @returns {NodeList}
 */
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Adds a CSS class to an element.
 * @param {Element} el 
 * @param {string} className 
 */
export const addClass = (el, className) => {
  if (el) el.classList.add(className);
};

/**
 * Removes a CSS class from an element.
 * @param {Element} el 
 * @param {string} className 
 */
export const removeClass = (el, className) => {
  if (el) el.classList.remove(className);
};
