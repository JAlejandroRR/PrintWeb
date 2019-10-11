/**
 * Summary WEB Printer Module
 * Description Provide a solution to show or print images or pdf from base64 or byte array (serialize).
 * 
 * @requires JQuery
 * @module
 * @author RRJA (Alejandro del Rio R.)
 * @version 0.0.1
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
        MODULE_VERSION: "0.0.1",
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
    var printer = {
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
    var supports = !!document.querySelector && !!root.addEventListener;
    var settings;
    var doc = null;

    /**
     * @description Define the default settings
     *
     * @member
     * @private
     */
    var defaults = {
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

    return printer;

});
