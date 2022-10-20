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
/******/ 	return __webpack_require__(__webpack_require__.s = "./client/src/js/TeReoPlugin.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/src/js/TeReoPlugin.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {
  var dictionaryMap = new Map();
  var library = [];
  var bookmark = void 0;

  function addHtmlToTextNode(textNode, innerHTML) {
    var span = document.createElement('span');
    textNode.parentNode.insertBefore(span, textNode);
    span.insertAdjacentHTML('beforebegin', innerHTML);
    span.remove();
    return textNode;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function regexQuote(str) {
    if (!str) {
      return '';
    }
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
  }

  function encode(str) {
    var encodedString = '-%-%-';
    for (var i = 0; i < str.length; i++) {
      encodedString += str.codePointAt(i) + '-';
    }
    encodedString += '%-%-';
    return encodedString;
  }

  function decode(str) {
    var splitString = str.split('-%-%-').filter(Boolean);
    splitString = splitString[0].split('-');
    var decodedStr = [];
    for (var i = 0; i < splitString.length; i++) {
      decodedStr[i] = String.fromCodePoint(splitString[i]);
    }
    return decodedStr.join('');
  }

  function checkForMatches(content) {
    var shortcode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var openTag = '';
    var closeTag = '';
    var openRegex = '';
    var closeRegex = '';
    if (!content) {
      return content;
    }
    if (shortcode) {
      openTag = '[TT]';
      closeTag = '[/TT]';
    } else {
      openTag = '<span class=\"TeReoTooltip\" style="text-decoration: underline 1px dashed;">';
      closeTag = '</span>';
      openRegex = '(?<![a-zA-Z0-9])(';
      closeRegex = ')(?!\[\/TT])(?![a-zA-Z0-9])(?![^<]*\>)';
    }
    var alteredContent = content;

    dictionaryMap.forEach(function (value, key) {
      var quotedKey = regexQuote(key);
      var regex = new RegExp(openRegex + quotedKey + closeRegex, 'gi');
      alteredContent = alteredContent.replace(regex, openTag + encode(key) + closeTag);
    });
    var regexDecode = new RegExp('(-%-%-).*?(-%-%-)', 'gi');
    alteredContent = alteredContent.replace(regexDecode, function (match) {
      return decode(match);
    });
    return alteredContent;
  }

  function treeWalk(rng) {
    var startNode = editor.selection.getNode();
    if (startNode.nodeType === 1) {
      startNode = startNode.firstChild;
    }
    var walker = new tinymce.dom.TreeWalker(startNode);
    var foundStartNode = false;
    var finished = false;
    var garbage = void 0;
    do {
      if (garbage) {
        garbage.remove();
        garbage = null;
      }
      var currentNode = walker.current();
      if (currentNode.isEqualNode(rng.startContainer) && currentNode.isEqualNode(rng.endContainer) && currentNode.nodeType === 3) {
        foundStartNode = false;
        var result = escapeHtml(currentNode.nodeValue.substr(0, rng.startOffset)) + checkForMatches(editor.selection.getContent(), false) + escapeHtml(currentNode.nodeValue.substr(rng.endOffset));
        garbage = addHtmlToTextNode(currentNode, result);
      } else if (currentNode.nodeType === 3) {
        if (currentNode.isEqualNode(rng.endContainer) && foundStartNode) {
          var _result = checkForMatches(currentNode.nodeValue.substr(0, rng.endOffset), false) + currentNode.nodeValue.substr(rng.endOffset);
          garbage = addHtmlToTextNode(currentNode, _result);
          foundStartNode = false;
          finished = true;
        } else if (foundStartNode) {
          var _result2 = checkForMatches(currentNode.nodeValue, false);
          garbage = addHtmlToTextNode(currentNode, _result2);
        } else if (currentNode.isEqualNode(rng.startContainer)) {
          var _result3 = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(currentNode.nodeValue.substr(rng.startOffset), false);
          garbage = addHtmlToTextNode(currentNode, _result3);
          foundStartNode = true;
        }
      }
    } while (walker.next() && !finished);
    if (garbage) {
      garbage.remove();
    }
    editor.selection.moveToBookmark(bookmark);
  }

  function newWordPair(base, destination, destinationAlternate, id) {
    if (!base || !destination) {
      tinymce.activeEditor.windowManager.alert('Cannot submit an empty field!');
    } else if (dictionaryMap.has(base)) {
      tinymce.activeEditor.windowManager.alert('This word already has a translation! (' + dictionaryMap.get(base) + ')');
    } else {
      var request = new XMLHttpRequest();
      var path = '/api/v1/dictionary/addWordPair/';
      request.open('POST', path);
      var tokenElement = document.getElementsByName('SecurityID')[0];
      var token = tokenElement.getAttribute('value');
      request.setRequestHeader('X-SecurityID', token);
      var body = JSON.stringify({
        dictionaryID: id,
        baseWord: base,
        destinationWord: destination,
        destinationAlternateWord: destinationAlternate
      });
      request.send(body);
      request.onreadystatechange = function handleUpdateResponse() {
        if (this.readyState === 4 && this.status === 200) {
          dictionaryMap.set(base, destination);
          tinymce.activeEditor.windowManager.close();
          if (destinationAlternate) {
            tinymce.activeEditor.windowManager.alert('Successfully added wordpair "' + base + '", "' + destination + '", "' + destinationAlternate + '".');
          } else {
            tinymce.activeEditor.windowManager.alert('Successfully added wordpair "' + base + '", "' + destination + '".');
          }
        }
        if (this.readyState === 4 && this.status === 400) {
          tinymce.activeEditor.windowManager.alert(this.response);
        }
      };
    }
  }

  function translateThroughAPI(textContent) {
    var request = new XMLHttpRequest();
    var path = '/api/v1/dictionary/translateThroughInterface';
    request.open('POST', path, true);
    var tokenElement = document.getElementsByName('SecurityID')[0];
    var token = tokenElement.getAttribute('value');
    request.setRequestHeader('X-SecurityID', token);
    request.onreadystatechange = function handleTranslationResponse() {
      if (this.readyState === 4 && this.status === 200) {
        editor.setContent(request.responseText, { format: 'html' });
        editor.undoManager.add();
        tinymce.activeEditor.selection.moveToBookmark(bookmark);
      }
    };
    request.send(textContent);
  }

  function getDictionary(id) {
    var request = new XMLHttpRequest();
    var path = '/api/v1/dictionary/dictionaries/' + id;
    request.open('GET', path);
    var tokenElement = document.getElementsByName('SecurityID')[0];
    var token = tokenElement.getAttribute('value');
    request.setRequestHeader('X-SecurityID', token);
    request.send();
    request.onreadystatechange = function handleWordPairResponse() {
      if (this.readyState === 4 && this.status === 200) {
        var response = request.responseText;
        response = JSON.parse(response);
        for (var i = 0; i < response.length; i++) {
          dictionaryMap.set(response[i].Base, response[i].Destination);
        }
      }
    };
  }

  function getDictionaries() {
    var request = new XMLHttpRequest();
    var path = '/api/v1/dictionary/index/';
    request.open('GET', path);
    var tokenElement = document.getElementsByName('SecurityID')[0];
    var token = tokenElement.getAttribute('value');
    request.setRequestHeader('X-SecurityID', token);
    request.send();
    request.onreadystatechange = function handleDictionaryResponse() {
      if (this.readyState === 4 && this.status === 200) {
        var response = request.responseText;
        if (response) {
          response = JSON.parse(response);
          for (var i = 0; i < response.length; i++) {
            library.push({
              text: response[i].Title,
              value: response[i].Title,
              id: response[i].ID
            });
          }
        }
      }
    };
  }

  editor.on('init', function () {
    getDictionary();
    getDictionaries();
  });

  function restoreShortcodes(content) {
    var restoration = null;
    var startOffset = 74;
    var endOffset = 7;
    return content.replace(/(<span class="TeReoTooltip" style="text-decoration: underline 1px dashed;">)(.+?)(<\/span>)/g, function (match) {
      restoration = match.slice(startOffset, match.length - endOffset);
      dictionaryMap.forEach(function (value, key) {
        if (key.toLowerCase() === match.slice(startOffset, match.length - endOffset).toLowerCase()) {
          restoration = '[TT]' + match.slice(startOffset, match.length - endOffset) + '[/TT]';
        }
      });
      if (!restoration) {
        restoration = match.slice(startOffset, match.length - endOffset);
      }
      return restoration;
    });
  }

  function replaceShortcodes(content) {
    var startOffset = 4;
    var endOffset = 5;
    var openTag = '<span class=\"TeReoTooltip\" style="text-decoration: underline 1px dashed;">';
    var closeTag = '</span>';
    var zeroWidthSpace = '&#8203';
    var restoration = '';

    return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
      var spaceInserted = match.includes(zeroWidthSpace);
      if (dictionaryMap.size === 0) {
        restoration = openTag + match.slice(startOffset, match.length - endOffset) + closeTag;
        if (!spaceInserted) {
          restoration += zeroWidthSpace;
        }
        return restoration;
      }
      dictionaryMap.forEach(function (value, key) {
        if (key.toLowerCase() === match.slice(startOffset, match.length - endOffset).toLowerCase()) {
          restoration = openTag + match.slice(startOffset, match.length - endOffset) + closeTag;
          if (!spaceInserted) {
            restoration += zeroWidthSpace;
          }
        }
      });
      if (!restoration) {
        restoration = match.slice(startOffset, match.length - endOffset);
      }
      return restoration;
    });
  }

  editor.on('BeforeSetcontent', function (event) {
    event.content = replaceShortcodes(event.content);
  });

  editor.on('GetContent', function (event) {
    event.content = restoreShortcodes(event.content);
  });

  function addToDictMenu(selection) {
    editor.windowManager.open({
      layout: 'flex',
      pack: 'center',
      align: 'center',
      onClose: function onClose() {
        editor.focus();
      },
      onSubmit: function onSubmit() {},

      buttons: [{
        text: 'Add',
        subtype: 'primary',
        onclick: function onclick() {
          var selectedID = library.find(function (o) {
            return o.text === document.getElementById('DictionaryDisplayComboBox-inp').value;
          }).id;
          var alternateDest = document.getElementById('DestinationAlternateInputTextBox').value ? document.getElementById('DestinationAlternateInputTextBox').value : '';
          newWordPair(document.getElementById('BaseInputTextBox').value.replace(/[\u200B-\u200D\uFEFF]/g, ''), document.getElementById('DestinationInputTextBox').value, alternateDest, selectedID);
        }
      }, { type: 'spacer', flex: 1 }],
      title: 'Add to Dictionary',
      items: {
        type: 'form',
        padding: 20,
        labelGap: 30,
        spacing: 10,
        items: [{ type: 'textbox', name: 'Base', size: 40, label: 'Base', value: selection.trim(), id: 'BaseInputTextBox', tooltip: 'An untranslated word/phrase' }, { type: 'textbox', name: 'Destination', size: 40, label: 'Translation', id: 'DestinationInputTextBox', tooltip: 'A translated word/phrase' }, { type: 'textbox', name: 'DestinationAlternate', size: 40, label: 'Alternate Translation', id: 'DestinationAlternateInputTextBox', tooltip: 'An alternate translated word/phrase' }, {
          type: 'combobox',
          name: 'Dictionary',
          size: 40,
          label: 'Dictionary',
          id: 'DictionaryDisplayComboBox',
          tooltip: 'Select which dictionary you want to add to',
          values: library,
          onPostRender: function onPostRender() {
            this.value(library[0].value);
          }
        }]
      }
    });
  }

  function handleActiveState() {
    var btn = this;

    editor.on('MouseMove', function () {
      btn.disabled(library.length === 0);
    });
  }

  editor.addMenuItem('addToDictionary', {
    text: 'Add to Dictionary',
    onclick: function onclick() {
      var selection = editor.selection.getContent({ format: 'text' });
      addToDictMenu(selection);
    },

    onPostRender: handleActiveState
  });

  editor.addButton('translate', {
    image: '/_resources/vendor/signify-nz/te-reo-tooltips/client/dist/img/globe-light.svg',
    tooltip: 'Translate content',
    onclick: function onclick() {
      bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
      editor.undoManager.add();
      translateThroughAPI(editor.getContent());
      tinymce.activeEditor.fire('change');
    },

    onPostRender: handleActiveState
  });

  editor.addMenuItem('contextTranslate', {
    text: 'Translate',
    onclick: function onclick() {
      bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
      treeWalk(editor.selection.getRng());
      tinymce.activeEditor.fire('change');
    },

    onPostRender: handleActiveState
  });
});

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map