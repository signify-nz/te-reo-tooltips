/* global tinymce */
// eslint-disable-next-line no-unused-vars
tinymce.PluginManager.add('TeReoPlugin', (editor, url) => {
  // Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  const dictionaryMap = new Map();
  const library = [];
  let bookmark;

  // credit: https://stackoverflow.com/questions/16662393/insert-html-into-text-node-with-javascript
  function addHtmlToTextNode(textNode, innerHTML) {
    const span = document.createElement('span');
    textNode.parentNode.insertBefore(span, textNode);
    span.insertAdjacentHTML('beforebegin', innerHTML);
    span.remove();
    return textNode;
  }

  // credit: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function checkForMatches(content, shortcode = true) {
    let openTag = '';
    let closeTag = '';
    if (!content) {
      return content;
    }
    if (shortcode) {
      openTag = '[TT]';
      closeTag = '[/TT]';
    } else {
      openTag = '<span class=\"TeReoTooltip\" style="text-decoration: underline 1px dashed;">';
      closeTag = '</span>';
    }
    const inputList = content.split(/\b/g);
    const outputList = [];
    for (let i = 0; i < inputList.length; i++) {
      if (dictionaryMap.has(inputList[i].trim())) {
        outputList.push(openTag + inputList[i] + closeTag);
      } else {
        outputList.push(inputList[i]);
      }
    }
    return outputList.join('');
  }

  // The value of this function over something more simple (i.e. getContent, modify, setContent)
  // is that it circumvents tinymce's cleanup functionality which
  // will insert HTML tags when modifying a selection
  function treeWalk(rng) {
    const startNode = editor.selection.getNode();
    const walker = new tinymce.dom.TreeWalker(startNode);
    let found = false;
    let finished = false;
    let garbage;
    do {
      if (garbage) {
        garbage.remove();
        garbage = null;
      }
      const currentNode = walker.current();
      if (
        currentNode.isEqualNode(rng.startContainer)
        && currentNode.isEqualNode(rng.endContainer)
        && currentNode.nodeType === 3
      ) {
        found = false;
        const result = escapeHtml(currentNode.nodeValue.substr(0, rng.startOffset))
          + checkForMatches(editor.selection.getContent(), false)
          + escapeHtml(currentNode.nodeValue.substr(rng.endOffset));
        garbage = addHtmlToTextNode(currentNode, result);
      } else if (currentNode.nodeType === 3) {
        if (currentNode.isEqualNode(rng.endContainer)) {
          const result = checkForMatches(currentNode.nodeValue.substr(0, rng.endOffset), false)
            + currentNode.nodeValue.substr(rng.endOffset);
          garbage = addHtmlToTextNode(currentNode, result);
          found = false;
          finished = true;
        } else if (found) {
          const result = checkForMatches(currentNode.nodeValue, false);
          garbage = addHtmlToTextNode(currentNode, result);
        } else if (currentNode.isEqualNode(rng.startContainer)) {
          const result = currentNode.nodeValue.substr(0, rng.startOffset)
            + checkForMatches(currentNode.nodeValue.substr(rng.startOffset), false);
          garbage = addHtmlToTextNode(currentNode, result);
          found = true;
        }
      }
    } while (walker.next() && !finished);
    if (garbage) {
      garbage.remove();
    }
    editor.selection.moveToBookmark(bookmark);
  }

  function newWordPair(base, destination, id) {
    if (!base || !destination) {
      tinymce.activeEditor.windowManager.alert('Cannot submit an empty field!');
    } else if (dictionaryMap.has(base)) {
      tinymce.activeEditor.windowManager.alert(`This word already has a translation! (${dictionaryMap.get(base)})`);
    } else {
      tinymce.activeEditor.windowManager.close();
      const request = new XMLHttpRequest();
      const path = `/api/v1/dictionary/addWordPair/${id}`;
      request.open('POST', path);
      const tokenElement = document.getElementById('Form_EditForm_SecurityID');
      const token = tokenElement.getAttribute('value');
      request.setRequestHeader('X-SecurityID', token);
      const body = JSON.stringify({
        baseWord: base,
        destinationWord: destination
      });
      request.send(body);
      request.onreadystatechange = function handleUpdateResponse() {
        if (this.readyState === 4 && this.status === 200) {
          dictionaryMap.set(base, destination);
          tinymce.activeEditor.windowManager.alert(`Successfully added wordpair "${base}", "${destination}".`);
        }
        if (this.readyState === 4 && this.status === 400) {
          dictionaryMap.set(base, destination);
          tinymce.activeEditor.windowManager.alert(this.response);
        }
      };
    }
  }

  // Post request can handle much larger quantities
  // Tested with 15000 word request with approx 1 sec delay
  function translateThroughAPI(textContent) {
    const request = new XMLHttpRequest();
    const path = '/api/v1/dictionary/translateThroughInterface';
    request.open('POST', path, true);
    const tokenElement = document.getElementById('Form_EditForm_SecurityID');
    const token = tokenElement.getAttribute('value');
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

  // pass dictionary ID as argument to receive that dictionary, pass 0 to get currently dictionary
  function getDictionary(id) {
    const request = new XMLHttpRequest();
    const path = `/api/v1/dictionary/dictionaries/${id}`;
    request.open('GET', path);
    const tokenElement = document.getElementById('Form_EditForm_SecurityID');
    const token = tokenElement.getAttribute('value');
    request.setRequestHeader('X-SecurityID', token);
    request.send();
    request.onreadystatechange = function handleWordPairResponse() {
      if (this.readyState === 4 && this.status === 200) {
        let response = request.responseText;
        response = JSON.parse(response);
        for (let i = 0; i < response.length; i++) {
          dictionaryMap.set(response[i].Base, response[i].Destination);
        }
      }
    };
  }

  function getDictionaries() {
    const request = new XMLHttpRequest();
    const path = '/api/v1/dictionary/index/';
    request.open('GET', path);
    const tokenElement = document.getElementById('Form_EditForm_SecurityID');
    const token = tokenElement.getAttribute('value');
    request.setRequestHeader('X-SecurityID', token);
    request.send();
    request.onreadystatechange = function handleDictionaryResponse() {
      if (this.readyState === 4 && this.status === 200) {
        let response = request.responseText;
        response = JSON.parse(response);
        for (let i = 0; i < response.length; i++) {
          library.push({
            text: response[i].Title,
            value: response[i].Title,
            id: response[i].ID
          });
        }
      }
    };
  }

  // TODO hard-coded dictionary ID is not acceptable -- can provide no argument
  // and receive default? I think currently it just returns a list of dictionaries
  editor.on('init', () => {
    getDictionary();
    getDictionaries();
  });

  // this slice method is not robust, maybe use a regex to find everything between
  // the first '>' and the second '<'
  // Address zero width space duplication by having a second content.replace?
  function restoreShortcodes(content) {
    let restoration = null;
    const startOffset = 74;
    const endOffset = 7;
    return content.replace(/(<span class="TeReoTooltip" style="text-decoration: underline 1px dashed;">)(.+?)(<\/span>)/g, (match) => {
      if (dictionaryMap.has(match.slice(startOffset, match.length - endOffset))) {
        restoration = `[TT]${match.slice(startOffset, match.length - endOffset)}[/TT]`;
      } else {
        restoration = checkForMatches(match.slice(startOffset, match.length - endOffset));
      }
      return restoration;
    });
  }

  // adding a zero width space on the end means that text written after
  // a translation will not be in the span.
  // this has a hasty bug fix, this code runs before the dictionarymap is populated, so the
  // shortcodes are not replaced on page load. the last 'if else' addresses this
  function replaceShortcodes(content) {
    const startOffset = 4;
    const endOffset = 5;
    const openTag = '<span class=\"TeReoTooltip\" style="text-decoration: underline 1px dashed;">';
    const closeTag = '</span>';
    const zeroWidthSpace = '&#8203';
    // preceded by '[TT]', anything between, followed by '[/TT]'
    return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, (match) => {
      if (dictionaryMap.has(match.slice(startOffset, match.length - endOffset))) {
        return openTag + match.slice(startOffset, match.length - endOffset) + closeTag + zeroWidthSpace;
      }
      if (dictionaryMap.size === 0) {
        return openTag + match.slice(startOffset, match.length - endOffset) + closeTag + zeroWidthSpace;
      }
      return match.slice(startOffset, match.length - endOffset);
    });
  }

  // Before content is set in the editor, the shortcodes are
  // replaced with a simple span tag to style and delineate translations
  editor.on('BeforeSetcontent', (event) => {
    // eslint-disable-next-line no-param-reassign
    event.content = replaceShortcodes(event.content);
  });

  // When content is retrieved from the editor, the span tag
  // is removed and the shortcodes are restored
  editor.on('GetContent', (event) => {
    // eslint-disable-next-line no-param-reassign
    event.content = restoreShortcodes(event.content);
  });

  // Credit to the searchReplace plugin for how to do this
  function addToDictMenu(selection) {
    editor.windowManager.open({
      layout: 'flex',
      pack: 'center',
      align: 'center',
      onClose() {
        editor.focus();
      },
      onSubmit() {
      },
      buttons: [
        {
          text: 'Add',
          subtype: 'primary',
          onclick() {
            // This is likely messier than it needs to be. can it
            // handle special characters? is there any conversion?
            const selectedID = library.find(o => o.text === document.getElementById('DictionaryDisplayComboBox-inp').value).id;
            newWordPair(document.getElementById('BaseInputTextBox').value, document.getElementById('DestinationInputTextBox').value, selectedID);
          }
        },
        { type: 'spacer', flex: 1 },
      ],
      title: 'Add to Dictionary',
      items: {
        type: 'form',
        padding: 20,
        labelGap: 30,
        spacing: 10,
        items: [
          { type: 'textbox', name: 'Base', size: 40, label: 'Base', value: selection.trim(), id: 'BaseInputTextBox', tooltip: 'An untranslated word' },
          { type: 'textbox', name: 'Destination', size: 40, label: 'Translation', id: 'DestinationInputTextBox', tooltip: 'A translated word' },
          {
            type: 'combobox',
            name: 'Dictionary',
            size: 40,
            label: 'Dictionary',
            id: 'DictionaryDisplayComboBox',
            tooltip: 'Select which dictionary you want to add to',
            values: library,
            onPostRender() {
              // Select the first item by default, should get active?
              this.value(library[0].value);
            },
          },
        ],
      },
    });
  }

  // function handleActiveState() {
  //   const btn = this;
  //   btn.disabled(library.length === 0);
  // }

  editor.addMenuItem('addToDictionary', {
    text: 'Add to Dictionary',
    onclick() {
      const selection = editor.selection.getContent({ format: 'text' });
      addToDictMenu(selection);
    },
  });

  editor.addButton('translate', {
    image: '/_resources/vendor/signify-nz/te_reo_tooltips/client/dist/img/globe-light.svg',
    tooltip: 'Translate content',
    onclick() {
      bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
      editor.undoManager.add();
      translateThroughAPI(editor.getContent());
      tinymce.activeEditor.fire('change');
    }
    // onPostRender: handleActiveState
  });

  // repeated translations cause issues, fix by adding validation in checkForMatches?
  editor.addMenuItem('contextTranslate', {
    text: 'Translate',
    onclick() {
      bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
      treeWalk(editor.selection.getRng());
      tinymce.activeEditor.fire('change');
    }
  });
});
