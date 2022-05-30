tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    // Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    var dictionaryMap = new Map();
    var library = [];
    var bookmark;

    editor.addButton('translate', {
        image: '/_resources/vendor/signify-nz/te_reo_tooltips/client/dist/img/globe-light.svg',
        tooltip: "Translate content",
        onclick: function () {
            bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
            editor.undoManager.add();
            translateThroughAPI(editor.getContent());
            tinymce.activeEditor.fire('change');
        }
    });

    //repeated translations cause issues, fix by adding validation in checkForMatches?
    editor.addMenuItem('contextTranslate', {
        text: 'Translate',
        onclick: function () {
            console.log("Selection content = " + editor.selection.getContent({ format: 'html' }));
            bookmark = tinymce.activeEditor.selection.getBookmark(2, true);
            //Passing the selection argument here seems unneccesary
            treeWalk(editor.selection.getRng(), editor.selection.getSel());

            // Could make this selectively fire only if changes are made? Entwine with undo functionality i think
            tinymce.activeEditor.fire('change');

            // execCommand 'insertHTML' as an alternative method? If dom traversal is messy

            //This is the previous method that used the API, issues around tinymce get/set caused this to be dropped in favour of treeWalk()
            // var translation = translateSelectionThroughAPI(editor.selection.getContent({format: 'html'}));
            // editor.selection.setContent(translation);
        }
    });

    // The value of this function over something more simple (i.e. getContent, modify, setContent) is that it circumvents tinymce's cleanup functionality 
    // which will insert HTML tags when modifying a selection
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

    //credit: https://stackoverflow.com/questions/16662393/insert-html-into-text-node-with-javascript
    function addHtmlToTextNode(textNode, innerHTML) {
        var span = document.createElement('span');
        textNode.parentNode.insertBefore(span, textNode);
        span.insertAdjacentHTML('beforebegin', innerHTML);
        span.remove();
        return textNode;
    };

    //credit: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    editor.addMenuItem('addToDictionary', {
        text: 'Add to Dictionary',
        onclick: function () {
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
            const Http = new XMLHttpRequest();
            const url = '/api/v1/dictionary/addWordPair/' + id + "?base=" + base + "&destination=" + destination;
            Http.open("POST", url);
            Http.send();
            Http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    dictionaryMap.set(base, destination);
                }
            }

        }
    };

    //Credit to the searchReplace plugin for how to do this
    function addToDictMenu(selection) {
        editor.windowManager.open({
            layout: "flex",
            pack: "center",
            align: "center",
            onClose: function () {
                editor.focus();
                // self.done();
            },
            onSubmit: function () {
            },
            buttons: [
                {
                    text: "Add", subtype: 'primary', onclick: function () {
                        //This is likely messier than it needs to be. can it handle special characters? is there any conversion?
                        var selectedID = library.find(o => o.text == document.getElementById('DictionaryDisplayComboBox-inp').value).id;
                        newWordPair(document.getElementById('BaseInputTextBox').value, document.getElementById('DestinationInputTextBox').value, selectedID);
                    }
                },
                { type: "spacer", flex: 1 },
            ],
            title: "Add to Dictionary",
            items: {
                type: "form",
                padding: 20,
                labelGap: 30,
                spacing: 10,
                items: [
                    { type: 'textbox', name: 'Base', size: 40, label: 'Base', value: selection.trim(), id: 'BaseInputTextBox', tooltip: 'An untranslated word' },
                    { type: 'textbox', name: 'Destination', size: 40, label: 'Translation', id: 'DestinationInputTextBox', tooltip: 'A translated word' },
                    {
                        type: 'combobox', name: 'Dictionary', size: 40, label: 'Dictionary', id: 'DictionaryDisplayComboBox', tooltip: 'Select which dictionary you want to add to', values: library,
                        onPostRender: function () {
                            // Select the first item by default, should get active?
                            this.value(library[0].value);
                        },
                    },
                ],
            },
        });
    };

    //Post request can handle much larger quantities
    //Tested with 15000 word request with approx 1 sec delay
    function translateThroughAPI(textContent) {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/translateThroughInterface';
        Http.open("POST", url, true);
        Http.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                editor.setContent(Http.responseText, { format: 'html' });
                editor.undoManager.add();
                tinymce.activeEditor.selection.moveToBookmark(bookmark);
            }
        }
        Http.send(textContent);
    };

    // pass dictionary ID as argument to recieve that dictionary, pass 0 to get currently selected dictionary
    // These two functions could be consolidated into one
    function getDictionary(ID) {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/dictionaries/' + ID;
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = Http.responseText;
                response = JSON.parse(response);
                console.log("Building local dictionary:");
                for (let i = 0; i < response.length; i++) {
                    dictionaryMap.set(response[i]['Base'], response[i]['Destination']);
                    console.log("key = " + response[i]['Base'] + ", value = " + response[i]['Destination']);
                }
            }
        }
    };

    function getDictionaries() {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/index/';
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = Http.responseText;
                response = JSON.parse(response);
                console.log("Building library:");
                for (let i = 0; i < response.length; i++) {
                    library.push({ text: response[i]['Title'], value: response[i]['Title'], id: response[i]['ID'] });
                    console.log("added dictionary = " + response[i]['Title']);
                }
            }
        }
    };

    function checkForMatches(content, shortcode = true) {
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
        let inputList = content.split(/\b/g)
        let outputList = [];
        for (let i = 0; i < inputList.length; i++) {
            if (dictionaryMap.has(inputList[i].trim())) {
                outputList.push(openTag + inputList[i] + closeTag);
            }
            else {
                outputList.push(inputList[i]);
            }
        }
        return outputList.join('');
    };

    // TODO hard-coded dictionary ID is not acceptable -- can provided no argument and receive default? I think currently it just returns a list of dictionaries
    editor.on('init', function (event) {
        getDictionary();
        getDictionaries();
    });

    // Before content is set in the editor, the shortcodes are replaced with a simple span tag to style and delineate translations
    editor.on('BeforeSetcontent', function (event) {
        console.log('BeforeSetcontent');
        event.content = replaceShortcodes(event.content);
    });

    //When content is retrieved from the editor, the span tag is removed and the shortcodes are restored
    editor.on('GetContent', function (event) {
        console.log('GetContent');
        event.content = restoreShortcodes(event.content);
    });

    //this slice method is not robust, maybe use a regex to find everything between the first '>' and the second '<'
    function restoreShortcodes(content) {
        let restoration = null;
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

    // adding a zero width space on the end means that text written after a translation will not be in the span
    // this has a hasty bug fix, this code runs before the dictionarymap is populated, so the shortcodes are not replaced on page load. the last 'if else' addresses this
    function replaceShortcodes(content) {
        console.log('replaceShortcodes');
        // preceded by '[TT]', anything between, followed by '[/TT]'
        return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
            if (dictionaryMap.has(match.slice(4, match.length - 5))) {
                console.log("found = '" + match + "', replaced with span " + match.slice(4, match.length - 5) + " span");
                return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203';
            } else {
                if (dictionaryMap.size == 0) {
                    console.log("empty dictionary, you should only see this on init");
                    return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203'
                } else {
                    return match.slice(4, match.length - 5);
                }
            }
        });
    }
});