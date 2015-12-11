/* jshint node: true */
'use strict';

var fs = require('fs');
var merge = require('merge');
var mergeTrees = require('broccoli-merge-trees');
var flatiron = require('./flatiron');
var Funnel = require('broccoli-funnel');
var SVGOptmizer = require('./svg-optimizer');

module.exports = {
    name: 'ember-inline-svg',

    included: function (app) {
        if (app.app) {
            app = app.app;
        }
        this.app = app;
    },

    options: function () {
        return merge(true, {}, {
            paths: ['public'],
            optimize: {/* svgo defaults */}
        }, this.app.options.svg || {});
    },

    svgPaths: function () {
        if (this.isDevelopingAddon()) {
            return ['tests/dummy/public'];
        }
        return this.options().paths;
    },

    optimizeSVGs: function (tree) {
        var config = this.options().optimize;
        if (!config) {
            return tree;
        }

        return new SVGOptmizer(tree, {svgoConfig: config});
    },

    treeForApp: function (tree) {
        var svgs = mergeTrees(this.svgPaths().filter(function (path) {
            return fs.existsSync(path);
        }));

        svgs = new Funnel(svgs, {
            include: [new RegExp(/\.svg$/)]
        });

        svgs = this.optimizeSVGs(svgs);

        svgs = flatiron(svgs, {
            outputFile: 'svgs.js',
            trimExtensions: true
        });

        return mergeTrees([tree, svgs]);
    }
};
