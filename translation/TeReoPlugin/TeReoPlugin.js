tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    // run buildDictionary on page load? does not need to be run everytime you press a button
    // Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    dictionaryMap = new Map();
    var textContent = "";
    var htmlContent = "";
    var bookmark;

    editor.addButton('translate', {
        //image: 'public/_resources/vendor/signify-nz/translation/client/dist/img/koru_icon.png',
        image: 'public/_resources/vendor/signify-nz/translation/client/dist/img/globe-light.svg',
        // This image will need to be replaced with something that belongs to us, maybe the classic globe icon?
        tooltip: "Translate content",
        onclick: function () {
            translateThroughAPI(editor.getContent());

            // TODO make silverstripe recognise that publishable changes have been made. Could hack it by appending a falsy value??
            // window.activeEditor = tinymce.activeEditor;
            // tinymce.activeEditor.setDirty(true);
            // tinymce.activeEditor.nodeChanged();
            // tinymce.triggerSave();
            // console.log(tinymce.activeEditor.isDirty());

            // When changes are made within the text editor, the container element gains the class 'changed'
            // Manually adding this does not trigger a 'publishable' event
            // if (element.classList.contains("changed")==false){
            //     element.classList.add("changed");
            // }
        }
    });

    //repeated translations cause issues, fix by adding validation in checkForMatches?
    editor.addMenuItem('contextTranslate', {
        text: 'Translate',
        onclick: function () {
            console.log("Selection content = " + editor.selection.getContent({ format: 'html' }));
            //console.log(editor.selection.getBookmark());
            var rng = editor.selection.getRng();
            var sel = editor.selection.getSel();
            console.log(rng);
            console.log(sel);
            treeWalk(rng, sel);
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
        do {
            if (garbage) {
                garbage.remove();
            }
            //order of operations might need to change - must accept if a node is both the start and end.
            var currentNode = walker.current();
            //this can be tidied
            if (currentNode.isEqualNode(rng.startContainer) && currentNode.isEqualNode(rng.endContainer) && currentNode.nodeType == 3) {
                found = false;
                console.log(currentNode.nodeValue.substr(0, rng.startOffset));
                console.log(checkForMatches(currentNode.nodeValue.substr(rng.startOffset, rng.endOffset), false));
                console.log(currentNode.nodeValue.substr(rng.endOffset));
                var result = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(editor.selection.getContent(), false) + currentNode.nodeValue.substr(rng.endOffset);
                garbage = addHtmlToTextNode(currentNode, result);
            } else if (currentNode.nodeType == 3) {
                if (currentNode.isEqualNode(rng.endContainer)) {
                    //var result = checkForMatches(currentNode.nodeValue, false);
                    var result = checkForMatches(currentNode.nodeValue.substr(0, rng.endOffset), false) + currentNode.nodeValue.substr(rng.endOffset);
                    garbage = addHtmlToTextNode(currentNode, result);
                    console.log('finish');
                    found = false;
                    //break
                } else if (found) {
                    var result = checkForMatches(currentNode.nodeValue, false);
                    garbage = addHtmlToTextNode(currentNode, result);
                } else if (currentNode.isEqualNode(rng.startContainer)) {
                    //var result = checkForMatches(currentNode.nodeValue, false);
                    var result = currentNode.nodeValue.substr(0, rng.startOffset) + checkForMatches(currentNode.nodeValue.substr(rng.startOffset), false);
                    garbage = addHtmlToTextNode(currentNode, result);
                    found = true;
                }
            }
        } while (walker.next());
        if (garbage) {
            garbage.remove();
        }
        editor.selection.moveToBookmark(0);
    };

    //credit: https://stackoverflow.com/questions/16662393/insert-html-into-text-node-with-javascript
    function addHtmlToTextNode(textNode, innerHTML) {
        var span = document.createElement('span');
        textNode.parentNode.insertBefore(span, textNode);
        span.insertAdjacentHTML('beforebegin', innerHTML);
        span.remove();
        return textNode;
        //textNode.remove();
        //textNode.nodeValue = '';
    };

    editor.addMenuItem('addToDictionary', {
        text: 'Add to Dictionary',
        onclick: function () {
            console.log(editor.selection.getContent());
            textContent = editor.selection.getContent({ format: 'text' });
            addToDictMenu(textContent);
        }
    });

    function newWordPair(base, destination) {
        console.log(base + destination);
        if (base == false || destination == false) {
            console.log("Cannot submit an empty field");
        } else {
            const Http = new XMLHttpRequest();
            const url = '/api/v1/dictionary/addWordPair/' + "?base=" + base + "&destination=" + destination;
            Http.open("POST", url);
            Http.send();
            Http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("wordpair sent");
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

    //Does not work
    // editor.on('SetContent', function (event){
    //     editor.selection.moveToBookmark(bookmark);
    // });

    // function replaceShortcodes(content) {
    //     //console.log('replaceShortcodes');
    //     // preceded by '[TT]', anything between, followed by [/TT]
    //     return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
    //         console.log("found = '" + match + "', replaced with span " + match.slice(4, match.length - 5) + " span");
    //         return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>';
    //     });
    // }

    //When content is retrieved from the editor, the span tag is removed and the shortcodes are restored
    editor.on('GetContent', function (event) {
        console.log('GetContent');
        event.content = restoreShortcodes(event.content);
    });

    // function restoreShortcodes(content) {
    //     //console.log('restoreShortcodes');
    //     return content.replace(/(<span class="TeReoTooltip" style="text-decoration: underline;">)(.+?)(<\/span>)/g, function (match) {
    //         restoration = '[TT]' + match.slice(63, match.length - 7) + '[/TT]';
    //         console.log("restoration = " + restoration);
    //         return restoration;
    //     });
    // }

    //this slice method is not robust, maybe use a regex to find everything between the first '>' and the second '<'
    function restoreShortcodes(content) {
        //console.log('restoreShortcodes');
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
        inputList = content.split(/\b/g)
        //inputList = content.match(/\b(\w+)\b/g);
        //inputList = content.match(/\b(\w+\W+)/g)
        outputList = [];
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
    function replaceShortcodes(content) {
        console.log('replaceShortcodes');
        // preceded by '[TT]', anything between, followed by [/TT]
        return content.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g, function (match) {
            if (dictionaryMap.has(match.slice(4, match.length - 5).trim())) {
                console.log("found = '" + match + "', replaced with span " + match.slice(4, match.length - 5) + " span");
                return '<span class=\"TeReoTooltip\" style="text-decoration: underline;">' + match.slice(4, match.length - 5) + '</span>&#8203';
                //&hairsp;
            } else {
                return match.slice(4, match.length - 5);
            }
        });
    }

    // editor.on("keyup", function (e) {
    //     if (e.keyCode == 32) {
    //         console.log('spacebar');
    //         bookmark = editor.selection.getBookmark(2);
    //         var temp = replaceShortcodes(tinymce.activeEditor.getContent());
    //         tinymce.activeEditor.setContent(temp);
    //         editor.selection.moveToBookmark(bookmark);
    //     }      
    // });

    // editor.on('KeyUp', function (event){
    //     var bm = tinymce.activeEditor.selection.getBookmark();
    //     // var temp = replaceShortcodes(tinymce.activeEditor.getContent());
    //     // tinymce.activeEditor.setContent(temp);
    //     tinymce.activeEditor.setContent(tinymce.activeEditor.getContent());
    //     tinymce.activeEditor.selection.moveToBookmark(bm);

    //     //replaceShortcodes(tinymce.activeEditor.getContent());
    // });


    //
    //  Everything below this point is currently unused. Either incomplete, or outdated/being held onto for reference
    //









    // editor.addMenuItem('contextTranslate', {
    //     text: 'Translate',
    //     onclick: function () {
    //         console.log(editor.selection.getContent());
    //         //DRY, this can be set into a separate function
    //         buildDictionary();
    //         textContent = editor.selection.getContent({ format: 'text' });
    //         htmlContent = editor.selection.getContent();
    //         var splitTextContent = textContent.split(/[^a-zA-Z0-9]/).filter(Boolean);
    //         console.log(splitTextContent);
    //         splitTextContent.forEach(searchAndReplaceHTMLRegex);
    //         editor.selection.setContent(htmlContent);
    //     }
    // });


    //TODO build a check and add for capitalisation -- if capital, add lower case etc.
    function buildDictionary() {
        var element = document.querySelector("[name='Content']");
        var nativeArray = element.dataset.dictionaryBase.split('///');
        var foreignArray = element.dataset.dictionaryDestination.split('///');
        // Should not be possible for arrays to be unbalanced, every wordpair requires two entries
        if (nativeArray.length !== foreignArray.length) {
            throw 'Dictionaries are not an equal size!';
        } else {
            for (let i = 0; i < nativeArray.length; i++) {
                dictionaryMap.set(nativeArray[i], foreignArray[i]);
                console.log("key= " + nativeArray[i] + ", value= " + foreignArray[i]);
            }
        }
    }

    // A function with regex to replace only outside of html tags
    // Thankyou stackoverflow. https://stackoverflow.com/questions/26951003/javascript-replace-all-but-only-outside-html-tags
    // TODO improve case sensitivity - should "wORK" translate to "mAHI"? I don't think so, but "Work" should translate to "Mahi"
    // TODO deal with multiple words. If dict has n . n + 1 ---- possible solution. 
    function searchAndReplaceHTMLRegex(item, index, arr) {
        if (dictionaryMap.has(item)) {
            console.log("found " + item);
            var regex = new RegExp("(" + item + ")(?!([^<]+)?>)", "gi");
            var hexcode = document.querySelector("[name='Content']").dataset.customHexcode;
            if (document.querySelector("[name='Content']").dataset.customHexcode) {
                htmlContent = htmlContent.replace(regex, "<span id=\"TeReoToolTip\" data-customhexcode=\"" + hexcode + "\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
            };
            htmlContent = htmlContent.replace(regex, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
            // add "aria-describedby=item" for accessiblity?
        }
        else console.log("Didn't find " + item);
    }

    function searchAndReplaceHTMLRegexFlipped() {
        for (var x of dictionaryMap.keys()) {
            if (tinymce.activeEditor.getContent().includes(x)) {
                var regex = new RegExp("(" + x + ")(?!([^<]+)?>)", "gi");
                htmlContent = htmlContent.replace(regex, "<span id=\"TeReoToolTip\" data-originaltext=\"" + x + "\">" + dictionaryMap.get(x) + "</span>");
            }
        }

        console.log("Flipped: " + htmlContent);
    }

    function searchAndReplaceShortcodes() {
        for (var x of dictionaryMap.keys()) {
            if (tinymce.activeEditor.getContent().includes(x)) {
                var regex = new RegExp("(" + x + ")(?!([^<]+)?>)", "gi");
                htmlContent = htmlContent.replace(regex, "[TT]" + x + "[/TT]");
            }
        }
    }

    var translate = function () {
        textContent = tinymce.activeEditor.getContent({ format: 'text' });
        htmlContent = tinymce.activeEditor.getContent();
        var splitTextContent = textContent.split(/[^a-zA-Z0-9]/).filter(Boolean);
        //splitTextContent.forEach(searchAndReplaceHTMLRegex);
        //searchAndReplaceHTMLRegexFlipped();
        searchAndReplaceShortcodes();
        tinymce.activeEditor.setContent(htmlContent);
    };

    //helper functions
    function getAttr(s, n) {
        n = new RegExp(n + '=\"([^\"]+)\"', 'g').exec(s);
        return n ? window.decodeURIComponent(n[1]) : '';
    };

    function html(cls, data, con) {
        var placeholder = url + '/img/' + getAttr(data, 'type') + '.jpg';
        data = window.encodeURIComponent(data);
        content = window.encodeURIComponent(con);

        return '<img src="' + placeholder + '" class="mceItem ' + cls + '" ' + 'data-sh-attr="' + data + '" data-sh-content="' + con + '" data-mce-resize="false" data-mce-placeholder="1" />';
    }

    function getPairList() {
        const Http = new XMLHttpRequest();
        const url = '/api/v1/Signify-TeReoTooltips-Dictionary/2';
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(Http.responseText, "text/xml");
                pairHeader = xmlDoc.getElementsByTagName("WordPair")[0];
                pairList = pairHeader.getElementsByTagName("Signify-TeReoTooltips-WordPair");
                console.log(pairList);
                for (let i = 0; i < pairList.length; i++) {
                    getPair(pairList[i]);
                }
            }
        }
    }

    function getPair(item) {
        console.log(item.getAttribute("href"));
        //This will work, but won't scale well. If a Dictionary has 1000 pairs, you don't want to wait on 2001 http requests. Can you get the dictionary to retrieve it's wordpairs?
    }

    // Modify the translate function to limit repetition
    var translateModular = function (text, html) {
        var splitText = text.split(/[^a-zA-Z0-9]/).filter(Boolean);
        splitText.forEach(searchAndReplaceHTMLRegex);
        tinymce.activeEditor.setContent(html);
    };

    //Functions on the plain text input, removes formatting!
    function searchAndReplace(item, index, arr) {
        if (dictionaryMap.has(item)) {
            console.log("found " + item);
            textContent = textContent.replace(item, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
    }

    //Functions on html input, causes issues when you insert the target substring back in html tags!
    function searchAndReplaceHTML(item, index, arr) {
        if (dictionaryMap.has(item)) {
            console.log("found " + item);
            htmlContent = htmlContent.replace(item, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
    }

    //Testing out an active listener style translation, currently disabled
    editor.on("keyup", function (e) {
        if (e.keyCode == 32) {
            //return handleSpacebar(editor);
        }
    });

    function handleSpacebar(editor) {
        return readLine(editor);
    };

    function readLine(editor) {
        //range will be the number of characters from the beginning of the the HTML element plus 1, after pressing spacebar
        //var offset = editor.selection.getRng().startOffset;
        //console.log(editor.selection);
        var startNode = editor.selection.getNode();
        var walker = new tinymce.dom.TreeWalker(startNode);
        do {
            var currentNode = walker.current();
            console.log(currentNode.nodeValue)
            if (currentNode.nodeType == 3) {
                if (currentNode.nodeValue.includes("work")) {
                    console.log("Found work in ->" + currentNode.nodeValue)
                    var stringHolder = currentNode.nodeValue;
                    stringHolder = stringHolder.replace('work', '<em>mahi</em>');
                    console.log("stringholder -> " + stringHolder);
                    currentNode.nodeValue = stringHolder;
                    //currentNode.replace(stringHolder);
                    console.log("current node after replace -> " + currentNode.nodeValue);
                    //replace node with a new node containing the edited content?
                    //replace child could be an option? I don't know how you do a prompt that waits for the user..
                    //could possibly provide a filter argument to treewalker to remove falsy (optimisation)
                    //sax parser may be the answer for waiting on a user input?
                }
            }
        } while (walker.next());
        // var text = document.createTextNode("SPACEBAR");
        // editor.dom.replace(text, editor.selection, false);
    };

});