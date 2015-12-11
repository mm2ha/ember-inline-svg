'use strict';

const fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    Writer = require('broccoli-writer'),
    Promise = require('rsvp').Promise,
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer,
    util = require('util');

const parser = new DOMParser();
const serializer = new XMLSerializer();

//region changing of the svg tree
/**
 * Extracts inner svg definition from the svg and gathers attributes from the root svg element
 *
 * @param svgLeaf
 * @returns {{attributes: Array, innerSvg: string}}
 */
function extractInnerSvgAndAttributes(svgLeaf) {
    // parse the whole svg
    const parsed = parser.parseFromString(svgLeaf, 'image/svg+xml');

    // extract attributes from the svg root
    const attributes = parsed.childNodes[0].attributes;

    // holds the parsed attributes for our new svg node
    const svgAttributes = Object.keys(attributes)
        .map(key => attributes[key])
        .filter(item => item.nodeName && item.nodeName.toLowerCase() !== 'svg')
        //.map(item => ({name: item.nodeName, value: item.nodeValue}));
        .reduce((svgAttributes, item) => {
            svgAttributes[item.nodeName] = item.nodeValue;

            return svgAttributes;
        }, {});

    /*
     const cache = x.reduce((cache, item) => {
     cache[item.n] = item.v;
     return cache;
     }, {});
     */

    // grab all of the child nodes
    const childNodes = parsed.childNodes[0].childNodes;

    // variable to store the string for all child nodes
    let innerSvg = '';

    // iterate over all child nodes
    Object.keys(childNodes).forEach(key => {
        const item = childNodes[key];

        // if it is not an object, then don't do anything
        if (typeof item !== 'object') {
            return;
        }

        // serialize node and add to the inner svg
        innerSvg += serializer.serializeToString(item);
    });

    // return the new structure
    return {
        attributes: svgAttributes,
        innerSvg: innerSvg
    };
}

/**
 * Recursively processes folder tree, updating each svg definition
 *
 * @param node
 * @returns {*}
 */
function recurseDirectoryTree(node) {
    // if we are in the leaf node, then it will be a string, so I want to convert it to the new structure
    if (typeof node === 'string' || node instanceof String) {
        node = extractInnerSvgAndAttributes(node);
        return node;
    }

    // otherwise, iterate over all keys and check those
    Object.keys(node).forEach(key => {
        node[key] = recurseDirectoryTree(node[key]);
    });

    return node;
}
//endregion

//region Flatiron from https://github.com/buschtoens/broccoli-flatiron
Flatiron.prototype = Object.create(Writer.prototype);
Flatiron.prototype.constructor = Flatiron;

function Flatiron(inputTree, options) {
    if (!(this instanceof Flatiron)) return new Flatiron(inputTree, options);

    this.inputTree = inputTree;
    this.options = options;
}

Flatiron.prototype.write = function (readTree, destDir) {
    var _this = this;

    return readTree(this.inputTree).then(function (srcDir) {
        var obj = readDirectory(srcDir),
            output;

        function readDirectory(srcDir) {
            var obj = {},
                entries = fs.readdirSync(srcDir);

            Array.prototype.forEach.call(entries, function (entry) {
                if (fs.lstatSync(path.join(srcDir, entry)).isDirectory())
                    obj[entry] = readDirectory(path.join(srcDir, entry));
                else
                    obj[_this.options.trimExtensions ? entry.split(".")[0] : entry] =
                        fs.readFileSync(path.join(srcDir, entry), {encoding: "utf8"});
            });

            return obj;
        }

        // run recursively optimization of the tree for our purposes
        let newObj = recurseDirectoryTree(obj);

        // export it to the file
        output = 'export default ' + JSON.stringify(newObj, null, 2);

        mkdirp.sync(path.join(destDir, path.dirname(_this.options.outputFile)));
        fs.writeFileSync(path.join(destDir, _this.options.outputFile), output);
    });
};
//endregion

module.exports = Flatiron;