tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    //Possible security issue: elements from HTML may be inserted into website. Alter HTML -> build dictionary -> inserted. Build dictionary on page load?
    //Likely need to 'escape' regex function, possible security issue with user input. https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    dictionaryMap = new Map();
    var textContent = "";
    var htmlContent = "";

    function printItems(item, index, arr){
        console.log(item + index);
    }

    function buildDictionary(){
        var element = document.querySelector("[name='Content']");
        var nativeArray = element.dataset.dictionaryNative.split('///');
        var foreignArray = element.dataset.dictionaryForeign.split('///');
        //TODO possibility of issues if arrays aren't balanced, add a check for this.
        console.log(nativeArray.length);
        for (let i = 0; i < nativeArray.length; i++){
            dictionaryMap.set(nativeArray[i], foreignArray[i]);
            console.log("key= " + nativeArray[i] + ", value= " + foreignArray[i]);
        }
    }

    //Functions on the plain text input, removes formatting!
    function searchAndReplace(item, index, arr){
        if (dictionaryMap.has(item)){
            console.log("found " + item);
            textContent = textContent.replace(item, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
        //item = "<span id=\"test\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>";
    }

    //Functions on html input, causes issues when you insert the target substring back in html tags!
    function searchAndReplaceHTML(item, index, arr){
        if (dictionaryMap.has(item)){
            console.log("found " + item);
            htmlContent = htmlContent.replace(item, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
    }

    //A regex to replace only outside of html tags
    //Thankyou stackoverflow. https://stackoverflow.com/questions/26951003/javascript-replace-all-but-only-outside-html-tags
    function searchAndReplaceHTMLRegex(item, index, arr){
        if (dictionaryMap.has(item)){
            console.log("found " + item);
            // var regex = new RegExp("/" + item + "(?!([^<]+)?>)/i");
            var regex = new RegExp("(" + item + ")(?!([^<]+)?>)", "gi");
            console.log(regex);
            htmlContent = htmlContent.replace(regex, "<span id=\"TeReoToolTip\" data-originaltext=\"" + item + "\">" + dictionaryMap.get(item) + "</span>");
        }
        else console.log("Didn't find " + item);
    }

    var translate = function () {
        //tinymce.activeEditor.windowManager.alert(nativeDictionary);
        var element = document.querySelector("[name='Content']");
        textContent = tinymce.activeEditor.getContent({ format: 'text' });
        htmlContent = tinymce.activeEditor.getContent();
        var splitTextContent = textContent.split(/[^a-zA-Z0-9]/).filter(Boolean);
        splitTextContent.forEach(searchAndReplaceHTMLRegex);
        tinymce.activeEditor.setContent(htmlContent);
    };

    /* Add a button that opens a window */
    editor.addButton('translate', {
        text: 'Translate',
        onclick: function () {
            buildDictionary();
            translate();
        }
    });

});
    /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
    // editor.addButton('settings', {
    //     text: 'Settings',
    //     onclick: function () {
    //         /* Open window */
    //         openSettings();
    //     }
    // });
    /* Return the metadata for the help plugin */
    // return {
    //     getMetadata: function () {
    //         return {
    //             name: 'Te Reo Tooltips',
    //             url: 'http://testplugindocsurl.com'
    //         };
    //     }
    // };


          // buttons: [
            //     {
            //       type: 'cancel',
            //       text: 'Close'
            //     },
            //     {
            //       type: 'submit',
            //       text: 'Save',
            //       primary: true
            //     }
            //   ],

//   <span id="test" data-text="Hello">Kia ora</span>

// function openSettings() {
//     return editor.windowManager.open({
//         title: 'Translation Settings',
//         // type: 'container',
//         body: [
//             {
//                 type: 'button',
//                 text: 'View dictionary',
//             },
//             {
//                 type: 'button',
//                 text: 'Change dictionary',
//             },
//             {
//                 type: 'button',
//                 text: 'Additional button',
//             }
//         ]
//     });
// };