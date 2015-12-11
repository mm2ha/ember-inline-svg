import Ember from 'ember';

/**
 * Cache that will store all the SVGs
 * @type {Object}
 */
let SVGs_CACHE = {};

/**
 * Converts slash paths to dot paths so nested hash values can be fetched with Ember.get</br>
 * <ul>
 *      <li>foo/bar/baz -> foo.bar.baz</li>
 * </ul>
 *
 * @param {String} path
 * @returns {String}
 */
function dottify(path) {
    return path.replace(/\//g, '.');
}

/**
 * Sets the collection of SVGs from the application to the Addon.
 *
 * @param {Object} SVGs
 */
export function setSVGs(SVGs) {
    SVGs_CACHE = SVGs;
}

/**
 * Returns svg structure that we can use for constructing icons
 *
 * @param {string} path
 * @returns {{attributes: Array<{string, string}>, innerSvg: String}}
 */
export function getSvgData(path) {
    var jsonPath = dottify(path);
    var svg = Ember.get(SVGs_CACHE, jsonPath);

    // TODO: Ember.get should return `null`, not `undefined`.
    // if (svg === null && /\.svg$/.test(path))
    if (svg === undefined && /\.svg$/.test(path)) {
        svg = Ember.get(SVGs_CACHE, jsonPath.slice(0, -4));
    }

    Ember.assert('No SVG data found for ' + path, svg);

    // make sure that the innerSvg is safe
    svg.innerSvg = Ember.String.htmlSafe(svg.innerSvg).string;

    return svg;
}