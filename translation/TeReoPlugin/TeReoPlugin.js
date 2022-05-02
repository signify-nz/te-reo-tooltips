tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    //Possible security issue: elements from HTML may be inserted into website. Alter HTML -> build dictionary -> inserted. Build dictionary on page load?
    //Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    dictionaryMap = new Map();
    var textContent = "";
    var htmlContent = "";

    //TODO build a check and add for capitalisation -- if capital, add lower case etc.
    function buildDictionary() {
        var element = document.querySelector("[name='Content']");
        var nativeArray = element.dataset.dictionaryNative.split('///');
        var foreignArray = element.dataset.dictionaryForeign.split('///');
        //TODO if arrays aren't balanced, add a check for this. -- Should not be possible, every wordpair requires two entries
        if (nativeArray.length !== foreignArray.length) {
            throw 'Native dictionary does not match foreign dictionary.';
        } else {
            console.log(nativeArray.length);
            for (let i = 0; i < nativeArray.length; i++) {
                dictionaryMap.set(nativeArray[i], foreignArray[i]);
                console.log("key= " + nativeArray[i] + ", value= " + foreignArray[i]);
            }
            // Attempting to trigger a publishable state within CMS
            // if (element.classList.contains("changed")==false){
            //     element.classList.add("changed");
            // }
        }
    }

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

    // A regex to replace only outside of html tags
    // Thankyou stackoverflow. https://stackoverflow.com/questions/26951003/javascript-replace-all-but-only-outside-html-tags
    // TODO improve case sensitivity - should "wORK" translate to "mAHI"? I don't think so, but "Work" should translate to "Mahi"
    // TODO deal with multiple words. If dict has n . n + 1 ---- possible solution. 
    function searchAndReplaceHTMLRegex(item, index, arr) {
        if (dictionaryMap.has(item)) {
            console.log("found " + item);
            // var regex = new RegExp("/" + item + "(?!([^<]+)?>)/i");
            var regex = new RegExp("(" + item + ")(?!([^<]+)?>)", "gi");
            htmlContent = htmlContent.replace(regex, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
    }

    var translate = function () {
        textContent = tinymce.activeEditor.getContent({ format: 'text' });
        htmlContent = tinymce.activeEditor.getContent();
        var splitTextContent = textContent.split(/[^a-zA-Z0-9]/).filter(Boolean);
        splitTextContent.forEach(searchAndReplaceHTMLRegex);
        tinymce.activeEditor.setContent(htmlContent);
    };

    var translateModular = function (text, html) {
        var splitText = text.split(/[^a-zA-Z0-9]/).filter(Boolean);
        splitText.forEach(searchAndReplaceHTMLRegex);
        tinymce.activeEditor.setContent(html);
    };

    editor.addButton('translate', {
        //text: 'Translate',
        image: 'vendor/signify-nz/translation/client/dist/img/koru_icon.png',
        //403 error forbidden
        tooltip: "Translate content",
        onclick: function () {
            buildDictionary();
            translate();

            //TODO make silverstripe recognise that publishable changes have been made. Could hack it by appending a falsy value??
            //tinymce.activeEditor.setDirty(true);
            //tinymce.activeEditor.nodeChanged();
        }
    });

    editor.addMenuItem('contextTranslate', {
        text: 'Translate',
        onclick: function () {
            console.log(editor.selection.getContent());
            //DRY, this can be set into a separate function
            buildDictionary();
            textContent = editor.selection.getContent({ format: 'text' });
            htmlContent = editor.selection.getContent();
            var splitTextContent = textContent.split(/[^a-zA-Z0-9]/).filter(Boolean);
            console.log(splitTextContent);
            splitTextContent.forEach(searchAndReplaceHTMLRegex);
            editor.selection.setContent(htmlContent);
        }
    });

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