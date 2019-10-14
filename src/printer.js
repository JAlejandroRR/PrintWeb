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

    /**
     * @description Create the html code of embed object
     * @param {string} url The url of object
     * @param {string} type The type of object
     * @returns {string} The html code with url and type
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createObjectEmbed = function (url, type) {
        let objectEmbed = "";
        objectEmbed += '<object width="100%" height="100%" data="' + url + '" type="' + type + '">';
        objectEmbed += '<embed width="100%" height="100%" src="' + url + '" type="' + type + '"/>';
        objectEmbed += '</object>';
        return objectEmbed;
    };

    /**
     * @description Create the html code of image
     * @param {string} url The url of image
     * @returns {string} The html code with src
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createImageEmbed = function (url) {
        let imageEmbed = "";
        imageEmbed += '<div class="page-break">';
        imageEmbed += '<img style="display: block; margin: 3px;" src="' + url + '">';
        imageEmbed += '</div>';
        return imageEmbed;
    };

    /**
     * @description Decorator to create html documents: contain header and footer
     * @param {function} action The function to add content to body
     * @returns {string} The html code
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createBaseDocument = function (action) {
        let html = '<html moznomarginboxes mozdisallowselectionprint>' +
            '<head><title>' + settings.title + '</title>' +
            '<style type="text/css" media="print">' +
            '@page { size: auto; margin: 3px; }' +
            '@media all { .page-break { display: none; } }' +
            '@media print { .page-break { display: block; page-break-after: always; }' +
                '#Header, #Footer { display: none!important; } }' +
            '</style></head><body>';
        if (typeof (action) === CONSTANT.TYPEOF.FUNCTION) html = action(html);
        html += '</body></html>';
        return html;
    };

    /**
     * @description Create the documet html for object
     * @param {object, string} objUrl The objects or string that contain the url for object
     * @returns {string} The html document code with object(s)
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createDocumentForObject = function (objUrl) {
        return createBaseDocument(function (html) {
            if (!settings.isSingleFile && typeof (objUrl) === CONSTANT.TYPEOF.OBJECT) {
                for (var i = 0; i < objUrl.length; i++) {
                    html += createObjectEmbed(objUrl[i], settings.fileType);
                }
            } else {
                html += createObjectEmbed(objUrl, settings.fileType);
            }
            return html;
        });
    };

    /**
     * @description Create the documet html for image
     * @param {object, string} imageUrl The object or string that contain the url for image
     * @returns {string} The html document code with image(s)
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createDocumentForImage = function (imageUrl) {
        return createBaseDocument(function (html) {
            if (!settings.isSingleFile && typeof (imageUrl) === CONSTANT.TYPEOF.OBJECT) {
                for (var i = 0; i < imageUrl.length; i++) {
                    html += createImageEmbed(imageUrl[i]);
                }
            } else {
                html += createImageEmbed(imageUrl);
            }
            return html;
        });
    }

    /**
     * @description Create the url from byte array
     * @param {object} file The byte array of file
     * @returns {string} The url of file
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const getUrl = function (file) {
        let docBytes = settings.isSerialize ? JSON.parse(file) : file;
        let bytes = new Uint8Array(docBytes);
        let file = new Blob([bytes], { type: settings.fileType });
        return URL.createObjectURL(file);
    }

    /**
     * @description Normalize base64 url, validate if not contain the data header to put it
     * @param {string} baseUrl The url of file
     * @returns {string} The url of file normalized
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const normalizeBase64 = function (baseUrl) {
        let regex = new RegExp(CONSTANT.BASE_REGEX);
        let normalizeUrl = [];
        if (!settings.isSingleFile && typeof (baseUrl) === CONSTANT.TYPEOF.OBJECT) {
            for (var i = 0; i < baseUrl.length; i++) {
                if (!regex.test(baseUrl[i])) {
                    normalizeUrl.push("data:" + settings.fileType + ";base64," + baseUrl[i].trim());
                }
                normalizeUrl.push(baseUrl[i].trim());
            }
        } else {
            if (!regex.test(baseUrl)) {
                baseUrl = "data:" + settings.fileType + ";base64," + baseUrl[i].trim();
            }
            normalizeUrl= baseUrl.trim();
        }
        return normalizeUrl;
    };

    /**
     * @description Create the url from byte array of filedata
     * @returns {string, object} The url(s)
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const createUrlFromByteArray = function () {
        let url = [];
        if (!settings.isSingleFile) {
            for (var i = 0; i < settings.fileData; i++) {
                url.push(getUrl(settings.fileData[i]));
            } 
        } else {
            url = getUrl(settings.fileData);
        }
        return url;
    };

    /**
     * @description Open a new window
     * @param {string} url The url of window
     * @returns {object} The window opened
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const openWindow = function (url) {
        url = url || CONSTANT.STRING.EMPTY;
        return window.open(url, settings.title);
    };

    /**
     * @description Write on global document
     * @param {string} html The html code to write
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const writeOnWindow = function (html) {
        if (typeof (doc) !== CONSTANT.TYPEOF.UNDEFINED && doc !== null) {
            html = html || CONSTANT.STRING.EMPTY;
            doc.document.open();
            doc.document.write(html);
            doc.document.close();
        }
    };

    /**
     * @description Print the global document
     * @param {boolean} close If window will be closed
     * @param {number} timeOut The time out to print the document
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const printWindow = function (close) {
        let timeOut = (typeof (settings.printTimeOut) === CONSTANT.TYPEOF.NUMBER
            ? settings.printTimeOut
            : (!isNaN(settings.printTimeOut) ? parseInt(settings.printTimeOut) : 1000));
        setTimeout(function () {
            doc.focus();
            doc.print();
            if (close) doc.close();
        }, timeOut);
    };

    /**
     * @description Open a new frame (create)
     * @param {string} html The html code to append in frame
     * @returns {object} The frame opened
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const openFrame = function (html) {
        html = html || CONSTANT.STRING.EMPTY;
        let n = Math.floor(Math.random() * 1000);
        let frameID = CONSTANT.MODULE_NAME + "-" + n;
        let frame = createCustomElement("iframe", {
            "id": frameID,
            "class": CONSTANT.MODULE_NAME
        }, [html]);
        document.body.appendChild(frame);
        return frame;
    };

    /**
     * @description Write on frame
     * @param {object} frame The frame
     * @param {string} html The html code to write
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const writeOnFrame = function (frame, html) {
        if (typeof (frame) !== CONSTANT.TYPEOF.UNDEFINED && frame !== null) {
            html = html || CONSTANT.STRING.EMPTY;
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(html);
            frame.contentWindow.document.close();
        }
    };    

    /**
     * @description Print the frame
     * @param {number} timeOut The time out to print
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const printFrame = function (frame) {
        let timeOut = (typeof (settings.printTimeOut) === CONSTANT.TYPEOF.NUMBER
            ? settings.printTimeOut
            : (!isNaN(settings.printTimeOut) ? parseInt(settings.printTimeOut) : 1000));
        setTimeout(function () {
            frame.contentWindow.focus();
            frame.contentWindow.print();
        }, timeOut);
    };

    /**
     * @description Remove all frames create by module from DOM
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const destroyAllFrame = function () {
        let frames = document.getElementsByClassName(CONSTANT.MODULE_NAME);
        for (var i = frames.length - 1; i >= 0; i--) {
            frames[i].parentNode.removeChild(frames[i]);
        }
    };

    /**
     * @description Show the file(s) from base64
     * @param {boolean} print If document will be printed
     * @param {boolean} close If window will be closed
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const showFromBase64 = function (print, close) {
        doc = openWindow();
        let u = normalizeBase64(settings.fileData);
        let h = null;

        switch (settings.fileType.toLowerCase()) {
            case CONSTANT.FILE_TYPES.JPEG:
                h = createDocumentForImage(u);
                break;
            case CONSTANT.FILE_TYPES.PDF:
                h = createDocumentForObject(u);
                break;
            default:
                console.error("The file type", settings.fileType, "is not supported from base64 file format.");
                break;
        }

        if (h !== null) {
            writeOnWindow(h);
            doc.focus();
            if (print) printWindow(close);
        }
    };

    /**
     * @description Show the file(s) from byte array
     * @param {boolean} print If document will be printed
     * @param {boolean} close If window will be closed
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const showFromByteArray = function (print, close) {
        doc = openWindow();
        let u = createUrlFromByteArray();
        let h = null;

        switch (settings.fileType.toLowerCase()) {
            case CONSTANT.FILE_TYPES.JPEG:
            case CONSTANT.FILE_TYPES.PDF:
                h = createDocumentForObject(u);
                break;
            default:
                console.error("The file type", settings.fileType, "is not supported from byte array file format.");
                break;
        }

        if (h !== null) {
            writeOnWindow(h);
            doc.focus();
            if (print) printWindow(close);
        }
    };

    /**
     * @description Print from base64
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const printFrameFromBase64 = function () {
        let u = normalizeBase64(settings.fileData);
        let h = null;
        switch (settings.fileType.toLowerCase()) {
            case CONSTANT.FILE_TYPES.JPEG:
                h = createDocumentForImage(u);
                break;
            case CONSTANT.FILE_TYPES.PDF:
                h = createDocumentForObject(u);
                break;
            default:
                console.error("The file type", settings.fileType, "is not supported from base64 file format.");
                break;
        }

        if (h !== null) {
            let f = openFrame();
            writeOnFrame(f, h);
            printFrame(f);
            let timeout = (typeof (settings.printTimeOut) === CONSTANT.TYPEOF.NUMBER
                ? settings.printTimeOut
                : (!isNaN(settings.printTimeOut) ? parseInt(settings.printTimeOut) : 1000)) + CONSTANT.DESTROY_TIMEOUT
            setTimeout(destroyAllFrame, timeout);
        }
    };

    /**
     * @description Print from byte array
     *
     * @function
     * @private
     * @author RRJA
     * @version 0.1
     */
    const printFrameFromByteArray = function () {
        let u = createUrlFromByteArray();
        let h = null;
        switch (settings.fileType.toLowerCase()) {
            case CONSTANT.FILE_TYPES.JPEG:
            case CONSTANT.FILE_TYPES.PDF:
                h = createDocumentForObject(u);
                break;
            default:
                console.error("The file type", settings.fileType, "is not supported from byte array file format.");
                break;
        }

        if (h !== null) {
            let f = openFrame();
            writeOnFrame(f, h);
            printFrame(f);
            let timeout = (typeof (settings.printTimeOut) === CONSTANT.TYPEOF.NUMBER
                ? settings.printTimeOut
                : (!isNaN(settings.printTimeOut) ? parseInt(settings.printTimeOut) : 1000)) + CONSTANT.DESTROY_TIMEOUT
            setTimeout(destroyAllFrame, timeout);
        }
    };

    /**
     * @description Destroy
     *
     * @function
     * @public
     * @author RRJA
     * @version 0.1
     */
    printer.destroy = function () {
        // If plugin isn't already initialized, stop
        if (!settings) return;

        // Reset variables
        doc = null;
        settings = null;
    };

    /**
     * @description Initialize Plugin
     * @param {object} options User options
     *
     * @function
     * @public
     * @author RRJA
     * @version 0.1
     */
    printer.init = function (options) {
        if (!supports) return;
        printer.destroy();
        settings = jQuery.extend(defaults, options || {});
        if (settings.debugger) console.info(CONSTANT.MODULE_NAME, CONSTANT.MODULE_VERSION, "is initialize:", settings);
    };

    /**
     * @description Unlink previous window opened
     *
     * @function
     * @public
     * @author RRJA
     * @version 0.1
     */
    printer.resetWindow = function () {
        if (!isInitialize()) return;
        doc = null;
    };

    /**
     * @description Show the file
     * @param {object} options User options
     *
     * @function
     * @public
     * @author RRJA
     * @version 0.1
     */
    printer.show = function (options) {
        if (!isInitialize() || !isValidSettings()) return;
        settings = jQuery.extend(settings, options || {});
        if (settings.debugger) console.info("Function show start...");
        if (settings.debugger) console.info("Function show(options):", options);

        switch (settings.fileFormat.toLowerCase()) {
            case CONSTANT.FILE_FORMATS.BASE64:
                showFromBase64(settings.showAndPrint, false);
                break;
            case CONSTANT.FILE_FORMATS.BYTE_ARRAY:
                showFromByteArray(settings.showAndPrint, false);
                break;
            default:
                console.error("Argument fileFormat invalid.", settings.fileFormat, "Not supported.");
                break;
        }

        if (settings.debugger) console.info("Function show end...");
    };

    /**
     * @description Print the file
     * @param {object} options User options
     *
     * @function
     * @public
     * @author RRJA
     * @version 0.1
     */
    printer.print = function (options) {
        if (!isInitialize() || !isValidSettings()) return;
        settings = jQuery.extend(settings, options || {});
        if (settings.debugger) console.info("Function print start...");
        if (settings.debugger) console.info("Function print(options):", options);

        if (typeof (doc) !== CONSTANT.TYPEOF.UNDEFINED && doc !== null) {
            printWindow(false);
        } else {
            switch (settings.fileFormat.toLowerCase()) {
                case CONSTANT.FILE_FORMATS.BASE64:
                    if (settings.printOnNewWindow) {
                        showFromBase64(true, settings.printCloseNewWindow);
                    } else {
                        printFrameFromBase64();
                    }
                    break;
                case CONSTANT.FILE_FORMATS.BYTE_ARRAY:
                    if (settings.printOnNewWindow) {
                        showFromByteArray(true, settings.printCloseNewWindow);
                    } else {
                        printFrameFromByteArray();
                    }
                    break;
                default:
                    console.error("Argument fileFormat invalid.", settings.fileFormat, "Not supported.");
                    break;
            }
        }

        if (settings.debugger) console.info("Function print end...");
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