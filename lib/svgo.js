'use strict';

/**
 * SVGO is a Nodejs-based tool for optimizing SVG vector graphics files.
 *
 * @see https://github.com/svg/svgo
 *
 * @author Kir Belevich <kir@soulshine.in> (https://github.com/deepsweet)
 * @copyright © 2012 Kir Belevich
 * @license MIT https://raw.githubusercontent.com/svg/svgo/master/LICENSE
 */

var CONFIG = require('./svgo/config.js'),
    SVG2JS = require('./svgo/svg2js.js'),
    PLUGINS = require('./svgo/plugins.js'),
    JSAPI = require('./svgo/jsAPI.js'),
    encodeSVGDatauri = require('./svgo/tools.js').encodeSVGDatauri,
    JS2SVG = require('./svgo/js2svg.js');

var SVGO = function(config) {
    this.config = CONFIG(config);
};

SVGO.prototype.optimize = function(svgstr, info) {
    if (this.config.error) {
        return {error: this.config.error};
    }

    var config = this.config,
        maxPassCount = config.multipass ? 10 : 1,
        counter = 0,
        prevResultSize = Number.POSITIVE_INFINITY,
        result,
        optimizeOnceCallback = (svgjs) => {
            if (svgjs.error) {
                result = svgjs;
                return;
            }

            if (++counter < maxPassCount && svgjs.data.length < prevResultSize) {
                prevResultSize = svgjs.data.length;
                this._optimizeOnce(svgjs.data, info, optimizeOnceCallback);
            } else {
                if (config.datauri) {
                    svgjs.data = encodeSVGDatauri(svgjs.data, config.datauri);
                }
                if (info && info.path) {
                    svgjs.path = info.path;
                }
                result = svgjs;
            }
        };

    this._optimizeOnce(svgstr, info, optimizeOnceCallback);

    return result;
};

SVGO.prototype._optimizeOnce = function(svgstr, info, callback) {
    var config = this.config;

    SVG2JS(svgstr, function(svgjs) {
        if (svgjs.error) {
            callback(svgjs);
            return;
        }

        svgjs = PLUGINS(svgjs, info, config.plugins);

        callback(JS2SVG(svgjs, config.js2svg));
    });
};

/**
 * The factory that creates a content item with the helper methods.
 *
 * @param {Object} data which passed to jsAPI constructor
 * @returns {JSAPI} content item
 */
SVGO.prototype.createContentItem = function(data) {
    return new JSAPI(data);
};

module.exports = SVGO;
// Offer ES module interop compatibility.
module.exports.default = SVGO;
