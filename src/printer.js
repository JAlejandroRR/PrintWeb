/**
 * Summary WEB Printer Module
 * Description Provide a solution to show or print images or pdf from base64 or byte array (serialize).
 * 
 * @requires JQuery
 * @module
 * @author RRJA (Alejandro del Rio R.)
 * @version 0.0.2
 * @since  20.09.19
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jQuery'], factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jQuery'));
    } else {
        root.printer = factory(root, root.jQuery);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

    'use strict';

    /**
     * @description Define the const vars
     *
     * @member
     * @private
     */
    const CONSTANT = {
        MODULE_NAME: "PrintWeb",
        MODULE_VERSION: "0.0.2",
        BASE_REGEX: /data:{1}.*base64,{1}.*/,
        DESTROY_TIMEOUT: 5000,
        FILE_TYPES: {
            JPEG: "image/jpeg",
            PDF: "application/pdf"
        },
        FILE_FORMATS: {
            BASE64: "base64",
            BYTE_ARRAY: "byte_array"
        },
        STRING: {
            EMPTY: "",
            WHITE_SPACE: " "
        },
        TYPEOF: {
            OBJECT: "object",
            FUNCTION: "function",
            NUMBER: "number",
            STRING: "string",
            UNDEFINED: "undefined",
            SYMBOL: "symbol",
            BOOLEAN: "boolean"
        }
    }

    /**
     * @description Define a public vars. NOT MODIFIED!
     *
     * @member
     * @public
     */
    let printer = {
        FileTypes: {
            JPEG: "image/jpeg",
            PDF: "application/pdf" },
        FileFormats: {
            BASE64: "base64",
            BYTE_ARRAY: "byte_array" }
    };

    /**
     * @description Define a local vars
     *
     * @member
     * @private
     */
    let supports = !!document.querySelector && !!root.addEventListener;
    let settings;
    let doc = null;

    /**
     * @description Define the default settings
     *
     * @member
     * @private
     */
    let defaults = {
        isSingleFile: true,
        fileData: null,
        fileType: CONSTANT.FILE_TYPES.JPEG,
        fileFormat: CONSTANT.FILE_FORMATS.BASE64,
        isSerialize: true,
        title: CONSTANT.MODULE_NAME,
        printOnNewWindow: true,
        printCloseNewWindow: true,
        printTimeOut: 1000,
        showAndPrint: false,
        debugger: false
    };

    /**
     * @description Appends the object attributes to html element
     * @param {object} element The html element. Eg: div, span, ..., iframe
     * @param {object} attrObj The object with the attributes. Eg: { id: "idEl", class: "classEl" }
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const addAttributesToElement = function addAttributes(element, attrObj) {
        for (var attr in attrObj) {
            if (attrObj.hasOwnProperty(attr)) element.setAttribute(attr, attrObj[attr]);
        }
    };

    /**
     * @description Create a html custom element
     * @param {string} element The type of html element to create. Eg: div, span, ..., iframe
     * @param {object} attributes The object with the attributes. Eg: { id: "idEl", class: "classEl" }
     * @param {array} children The list with the children elements. Eg: ["text"] or [div, anotherDiv]
     * @return {object} The element created
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createCustomElement = function (element, attributes, children) {
        var customElement = document.createElement(element);
        if (children !== undefined) children.forEach(function (el) {
            if (el.nodeType) {
                if (el.nodeType === 1 || el.nodeType === 11) customElement.appendChild(el);
            } else {
                customElement.innerHTML += el;
            }
        });
        addAttributesToElement(customElement, attributes);
        return customElement;
    };

    /**
	 * @description Validate if the module is initialized and show an alert in console
     * @return {boolean} The value if is initialized
     *
	 * @function
     * @private
     * @author RRJA
     * @version 0.1
	 */
    const isInitialize = function () {
        if (!settings) {
            console.error(CONSTANT.MODULE_NAME, CONSTANT.MODULE_VERSION, "is not initialized");
            return false;
        }
        return true;
    };

    /**
	 * @description Validate if the options are valid
	 * @return {boolean} The value if are valid
     *
	 * @function
     * @private
     * @author RRJA
     * @version 0.1
	 */
    const isValidSettings = function () {
        if (settings.fileData === undefined || settings.fileData === null) {
            console.error("Argument fileData is null or undefined", settings.fileData);
            return false;
        }
        return true;
    };

    return printer;

});

// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(global) {
  'use strict';
  if (!global.console) {
    global.console = {};
  }
  var con = global.console;
  var prop, method;
  var dummy = function() {};
  var properties = ['memory'];
  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
     'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn,timeLog,trace').split(',');
  while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
  while (method = methods.pop()) if (!con[method]) con[method] = dummy;
  // Using `this` for web workers & supports Browserify / Webpack.
})(typeof window === 'undefined' ? this : window);