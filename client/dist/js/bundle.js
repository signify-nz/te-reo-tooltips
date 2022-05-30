/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./te_reo_plugin/TeReoPlugin.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./te_reo_plugin/TeReoPlugin.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {
    var dictionaryMap = new Map();
    var library = [];
    var bookmark;

    editor.addButton('translate', {
        image: '/_resources/vendor/signify-nz/te_reo_tooltips/client/dist/img/globe-light.svg',
        tooltip: "Translate content",
        onclick: function onclick() {
            bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
            editor.undoManager.add();
            translateThroughAPI(editor.getContent());
            tinymce.activeEditor.fire('change');
        }
    });

    editor.addMenuItem('contextTranslate', {
        text: 'Translate',
        onclick: function onclick() {
            console.log("Selection content = " + editor.selection.getContent({ format: 'html' }));
            bookmark = tinymce.activeEditor.selection.getBookmark(2, true);

            treeWalk(editor.selection.getRng(), editor.selection.getSel());

            tinymce.activeEditor.fire('change');

            addEventHandler();
        }
    });

    function addEventHandler() {
        var elements = document.getElementsByClassName("TeReoTooltip");

        var myFunction = function myFunction(event) {
            console.log('mouse over');
            event.target.style.color = "purple";
        };

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('mouseover', myFunction, false);
        }
    };

    function treeWalk(rng, sel) {
        var startNode = editor.selection.getNode();
        var walker = new tinymce.dom.TreeWalker(startNode);
        var found = false;
        var finished = false;
        var garbage;
        console.log("treewalk begins here");
        do {
            if (garbage) {
                garbage.remove();
                garbage = null;
            }
            var currentNode = walker.current();
            if (currentNode.isEqualNode(rng.startContainer) && currentNode.isEqualNode(rng.endContainer) && currentNode.nodeType == 3) {
                found = false;
                var result = escapeHtml(currentNode.nodeValue.substr(0, rng.startOffset)) + checkForMatches(editor.selection.getContent(), false) + escapeHtml(currentNode.nodeValue.substr(rng.endOffset));
                garbage = addHtmlToTextNode(currentNode, result);
            } else if (currentNode.nodeType == 3) {
                if (currentNode.isEqualNode(rng.endContainer)) {
                    var result = checkForMatches(currentNode.nodeValue.substr(0, rng.endOffset), false) + currentNode.nodeValue.substr(rng.endOffset);
                    garbage = addHtmlToTextNode(currentNode, result);
                    found = false;
                    finished = true;
                } else if (found) {
                    var result = checkForMatches(currentNode.nodeValue, false);
                    garbage = addHtmlToTextNode(currentNode, result);
                } else if (currentNode.isEqualNode(rng.startContainer)) {
                    var result = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(currentNode.nodeValue.substr(rng.startOffset), false);
                    garbage = addHtmlToTextNode(currentNode, result);
                    found = true;
                }
            }
        } while (walker.next() && !finished);
        if (garbage) {
            garbage.remove();
        }
        editor.selection.moveToBookmark(bookmark);
    };

    function addHtmlToTextNode(textNode, innerHTML) {
        var span = document.createElement('span');
        textNode.parentNode.insertBefore(span, textNode);
        span.insertAdjacentHTML('beforebegin', innerHTML);
        span.remove();
        return textNode;
    };

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    editor.addMenuItem('addToDictionary', {
        text: 'Add to Dictionary',
        onclick: function onclick() {
            var selection = editor.selection.getContent({ format: 'text' });
            addToDictMenu(selection);
        }
    });

    function newWordPair(base, destination, id) {
        if (base == false || destination == false) {
            tinymce.activeEditor.windowManager.alert("Cannot submit an empty field!");
        } else if (dictionaryMap.has(base)) {
            tinymce.activeEditor.windowManager.alert("This word already has a translation! (" + dictionaryMap.get(base) + ")");
        } else {
            tinyMCE.activeEditor.windowManager.close();
            var Http = new XMLHttpRequest();
            var _url = '/api/v1/dictionary/addWordPair/' + id + "?base=" + base + "&destination=" + destination;
            Http.open("POST", _url);
            Http.send();
            Http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    dictionaryMap.set(base, destination);
                }
            };
        }
    };

    function addToDictMenu(selection) {
        editor.windowManager.open({
            layout: "flex",
            pack: "center",
            align: "center",
            onClose: function onClose() {
                editor.focus();
            },
            onSubmit: function onSubmit() {},
            buttons: [{
                text: "Add", subtype: 'primary', onclick: function onclick() {
                    var selectedID = library.find(function (o) {
                        return o.text == document.getElementById('DictionaryDisplayComboBox-inp').value;
                    }).id;
                    newWordPair(document.getElementById('BaseInputTextBox').value, document.getElementById('DestinationInputTextBox').value, selectedID);
                }
            }, { type: "spacer", flex: 1 }],
            title: "Add to Dictionary",
            items: {
                type: "form",
                padding: 20,
                labelGap: 30,
                spacing: 10,
                items: [{ type: 'textbox', name: 'Base', size: 40, label: 'Base', value: selection.trim(), id: 'BaseInputTextBox', tooltip: 'An untranslated word' }, { type: 'textbox', name: 'Destination', size: 40, label: 'Translation', id: 'DestinationInputTextBox', tooltip: 'A translated word' }, {
                    type: 'combobox', name: 'Dictionary', size: 40, label: 'Dictionary', id: 'DictionaryDisplayComboBox', tooltip: 'Select which dictionary you want to add to', values: library,
                    onPostRender: function onPostRender() {
                        this.value(library[0].value);
                    }
                }]
            }
        });
    };

    function translateThroughAPI(textContent) {
        var Http = new XMLHttpRequest();
        var url = '/api/v1/dictionary/translateThroughInterface';
        Http.open("POST", url, true);
        Http.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                editor.setContent(Http.responseText, { format: 'html' });
                editor.undoManager.add();
                tinymce.activeEditor.selection.moveToBookmark(bookmark);
            }
        };
        Http.send(textContent);
    };

    function getDictionary(ID) {
        var Http = new XMLHttpRequest();
        var url = '/api/v1/dictionary/dictionaries/' + ID;
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = Http.responseText;
                response = JSON.parse(response);
                console.log("Building local dictionary:");
                for (var i = 0; i < response.length; i++) {
                    dictionaryMap.set(response[i]['Base'], response[i]['Destination']);
                    console.log("key = " + response[i]['Base'] + ", value = " + response[i]['Destination']);
                }
            }
        };
    };

    function getDictionaries() {
        var Http = new XMLHttpRequest();
        var url = '/api/v1/index/';
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = Http.responseText;
                response = JSON.parse(response);
                console.log("Building library:");
                for (var i = 0; i < response.length; i++) {
                    library.push({ text: response[i]['Title'], value: response[i]['Title'], id: response[i]['ID'] });
                    console.log("added dictionary = " + response[i]['Title']);
                }
            }
        };
    };

    function checkForMatches(content) {
        var shortcode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var openTag = '';
        var closeTag = '';
        if (!content) {
            return content;
        }
        if (shortcode) {
            openTag = '[TT]';
            closeTag = '[/TT]';
        } else {
            openTag = '<span class=\"TeReoTooltip\" style="text-decoration: underline;">';
            closeTag = '</span>';
        }
        var inputList = content.split(/\b/g);
        var outputList = [];
        for (var i = 0; i < inputList.length; i++) {
            if (dictionaryMap.has(inputList[i].trim())) {
                outputList.push(openTag + inputList[i] + closeTag);
            } else {
                outputList.push(inputList[i]);
            }
        }
        return outputList.join('');
    };

    editor.on('init', function (event) {
        getDictionary();
        getDictionaries();
    });

    editor.on('BeforeSetcontent', function (event) {
        console.log('BeforeSetcontent');
        event.content = replaceShortcodes(event.content);
    });

    editor.on('GetContent', function (event) {
        console.log('GetContent');
        event.content = restoreShortcodes(event.content);
    });

    function restoreShortcodes(content) {
        var restoration = null;
        return content.replace(/(<span class="TeReoTooltip" style="text-decoration: underline;">)(.+?)(<\/span>)/g, function (match) {
            if (dictionaryMap.has(match.slice(63, match.length - 7))) {
                restoration = '[TT]' + match.slice(63, match.length - 7) + '[/TT]';
            } else {
                console.log("Does not match a dictionary, looking deeper");
                restoration = checkForMatches(match.slice(63, match.length - 7));
            }
            return restoration;
        });
    }

    function replaceShortcodes(content) {
        console.log('replaceShortcodes');

        return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
            if (dictionaryMap.has(match.slice(4, match.length - 5))) {
                console.log("found = '" + match + "', replaced with span " + match.slice(4, match.length - 5) + " span");
                return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203';
            } else {
                if (dictionaryMap.size == 0) {
                    console.log("empty dictionary, you should only see this on init");
                    return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203';
                } else {
                    return match.slice(4, match.length - 5);
                }
            }
        });
    }
});

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map