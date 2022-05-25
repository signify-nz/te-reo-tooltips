tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    // Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    var dictionaryMap = new Map();
    var bookmark;

    editor.addButton('translate', {
        image: 'public/_resources/vendor/signify-nz/translation/client/dist/img/globe-light.svg',
        tooltip: "Translate content",
        onclick: function () {
            bookmark = tinymce.activeEditor.selection.getBookmark(2,true);
            editor.undoManager.add();
            console.log(editor.undoManager.hasUndo());
            translateThroughAPI(editor.getContent());
            tinymce.activeEditor.fire('change');
        }
    });

    //repeated translations cause issues, fix by adding validation in checkForMatches?
    editor.addMenuItem('contextTranslate', {
        text: 'Translate',
        onclick: function () {
            console.log("Selection content = " + editor.selection.getContent({ format: 'html' }));
            bookmark = tinymce.activeEditor.selection.getBookmark(2,true);
            //Passing the selection argument here seems unneccesary
            treeWalk(editor.selection.getRng(), editor.selection.getSel());

            // Could make this selectively fire only if changes are made? Entwine with undo functionality i think
            tinymce.activeEditor.fire('change');

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
        var garbage;
        console.log("treewalk begins here");
        do {
            if (garbage) {
                console.log("this is being deleted: " + garbage.nodeValue);
                garbage.remove();
                garbage = null;
            }
            //order of operations might need to change - must accept if a node is both the start and end.
            var currentNode = walker.current();
            //this can be tidied
            if (currentNode.isEqualNode(rng.startContainer) && currentNode.isEqualNode(rng.endContainer) && currentNode.nodeType == 3) {
                found = false;
                console.log("single node selection found");
                var result = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(editor.selection.getContent(), false) + currentNode.nodeValue.substr(rng.endOffset);
                garbage = addHtmlToTextNode(currentNode, result);
            } else if (currentNode.nodeType == 3) {
                if (currentNode.isEqualNode(rng.endContainer)) {
                    var result = checkForMatches(currentNode.nodeValue.substr(0, rng.endOffset), false) + currentNode.nodeValue.substr(rng.endOffset);
                    garbage = addHtmlToTextNode(currentNode, result);
                    found = false;
                    //break of some kind?
                } else if (found) {
                    var result = checkForMatches(currentNode.nodeValue, false);
                    garbage = addHtmlToTextNode(currentNode, result);
                } else if (currentNode.isEqualNode(rng.startContainer)) {
                    var result = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(currentNode.nodeValue.substr(rng.startOffset), false);
                    garbage = addHtmlToTextNode(currentNode, result);
                    found = true;
                }
            }
        } while (walker.next());
        if (garbage) {
            console.log("this is being deleted: " + garbage.nodeValue);
            garbage.remove();
        }
        console.log("treewalk finished");
        console.log("bookmark is ");
        console.log(bookmark);
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

    editor.addMenuItem('addToDictionary', {
        text: 'Add to Dictionary',
        onclick: function () {
            console.log(editor.selection.getContent());
            var selection = editor.selection.getContent({ format: 'text' });
            addToDictMenu(selection);
        }
    });

    function newWordPair(base, destination) {
        console.log(base + destination);
        if (base == false || destination == false) {
            tinymce.activeEditor.windowManager.alert("Cannot submit an empty field!");
        } else if (dictionaryMap.has(base)) {
            tinymce.activeEditor.windowManager.alert("This word already has a translation! (" + dictionaryMap.get(base) + ")");
        } else {
            tinyMCE.activeEditor.windowManager.close();
            const Http = new XMLHttpRequest();
            const url = '/api/v1/dictionary/addWordPair/' + "?base=" + base + "&destination=" + destination;
            Http.open("POST", url);
            Http.send();
            Http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("wordpair sent");
                    dictionaryMap.set(base, destination);
                }
            }

        }
    }

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
                        newWordPair(document.getElementById('BaseInputTextBox').value, document.getElementById('DestinationInputTextBox').value);
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
                    { type: 'textbox', name: 'Base', size: 40, label: 'Base', value: selection, id: 'BaseInputTextBox' },
                    { type: 'textbox', name: 'Destination', size: 40, label: 'Translation', id: 'DestinationInputTextBox' },
                ]
            }
        });
    }

    // Inconsistent naming here, look to fix.
    // should be parameterised better and have access to a dictionary?
    // This is the currently used translation method - it call translateBody on localService, this function does not scale well. Look to use translateByWord instead.
    function translateThroughAPI(textContent) {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/translateThroughInterface/?text=' + encodeURIComponent(textContent);
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(Http.responseText);
                editor.setContent(Http.responseText, { format: 'html' });
                editor.undoManager.add();
                tinymce.activeEditor.selection.moveToBookmark(bookmark);
            }
        }
    }

    // This method passes through a list of words that need to be translated, but requires that the translations are already known.
    // the point was initially to reduce the size of the request, but it seems more sensible to have some logic here.
    // The editor page should get a dictionary on page load?
    function translateByWord(text) {
        const Http = new XMLHttpRequest();
        text = text.join('---');
        const url = '/api/v1/dictionary/translateByWord/?text=' + encodeURIComponent(text);
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(Http.responseText);
            }
        }
    }

    // Calls translate body on localService, provides current selection as argument. This does not scale well but may not need to? 
    // causes an issues of <p> tags being inserted and a new line started. Solve by getting the index of selection, get copy of whole body of text, alter selection on that copy then set all.
    function translateSelectionThroughAPI(textContent) {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/translateThroughInterface/?text=' + encodeURIComponent(textContent);
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(Http.responseText);
                editor.selection.setContent(Http.responseText, { format: 'html' });
                return Http.responseText;
            }
        }
    }

    //If no ID is passed, it currently returns a list of all dictionaries. Should it instead return the currently selected dictionary?
    function getDictionary(ID) {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/dictionary/dictionaries/' + ID;
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = Http.responseText;
                response = JSON.parse(response);
                console.log(response);
                for (let i = 0; i < response.length; i++) {
                    dictionaryMap.set(response[i]['Base'], response[i]['Destination']);
                    console.log("key = " + response[i]['Base'] + ", value = " + response[i]['Destination']);
                }
            }
        }
    }

    // TODO hard-coded dictionary ID is not acceptable -- can provided no argument and receive default? I think currently it just returns a list of dictionaries
    editor.on('init', function (event) {
        getDictionary(1);
    });

    // Before content is set in the editor, the shortcodes are replaced with a simple span tag to style and delineate translations
    editor.on('BeforeSetcontent', function (event) {
        console.log('BeforeSetcontent');
        //bookmark = editor.selection.getBookmark();
        event.content = replaceShortcodes(event.content);
    });

    //When content is retrieved from the editor, the span tag is removed and the shortcodes are restored
    editor.on('GetContent', function (event) {
        console.log('GetContent');
        event.content = restoreShortcodes(event.content);
    });

    //this slice method is not robust, maybe use a regex to find everything between the first '>' and the second '<'
    // two returns?
    function restoreShortcodes(content) {
        //console.log('restoreShortcodes');
        let restoration = null;
        return content.replace(/(<span class="TeReoTooltip" style="text-decoration: underline;">)(.+?)(<\/span>)/g, function (match) {
            if (dictionaryMap.has(match.slice(63, match.length - 7))) {
                restoration = '[TT]' + match.slice(63, match.length - 7) + '[/TT]';
            } else {
                //restoration =  match.slice(63, match.length - 7);
                console.log("Does not match a dictionary, looking deeper");
                restoration = checkForMatches(match.slice(63, match.length - 7));
            }
            console.log("restoration = " + restoration);
            return restoration;
        });
    }

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
        //inputList = content.match(/\b(\w+)\b/g);
        //inputList = content.match(/\b(\w+\W+)/g)
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
    }

    // adding a zero width space on the end means that text written after a translation will not be in the span
    // this has a hasty bug fix, this code runs before the dictionarymap is populated, so the shortcodes are not replaced on page load. the last 'if else' addresses this
    function replaceShortcodes(content) {
        console.log('replaceShortcodes');
        // preceded by '[TT]', anything between, followed by [/TT]
        return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
            console.log(match + ' sliced to ' + match.slice(4, match.length - 5));
            if (dictionaryMap.has(match.slice(4, match.length - 5))) {
                //if (dictionaryMap.has(match.slice(4, match.length - 5).replace("&ZeroWidthSpace;", ''))) {
                console.log("found = '" + match + "', replaced with span " + match.slice(4, match.length - 5) + " span");
                return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203';
                //&hairsp;
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