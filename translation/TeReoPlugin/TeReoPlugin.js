tinymce.PluginManager.add('TeReoPlugin', function (editor, url) {

    function openSettings() {
        return editor.windowManager.open({
            title: 'Translation Settings',
            // type: 'container',
            body: [
                {
                    type: 'button',
                    text: 'View dictionary',
                },
                {
                    type: 'button',
                    text: 'Change dictionary',
                },
                {
                    type: 'button',
                    text: 'Additional button',
                }
            ]
        });
    };

    var translate = function () {
        tinymce.activeEditor.windowManager.alert("function");
    };

    /* Add a button that opens a window */
    editor.addButton('translate', {
        text: 'Translate',
        onclick: function () {
            translate();
        }
    });
    /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
    editor.addButton('settings', {
        text: 'Settings',
        onclick: function () {
            /* Open window */
            openSettings();
        }
    });
    /* Return the metadata for the help plugin */
    // return {
    //     getMetadata: function () {
    //         return {
    //             name: 'Te Reo Tooltips',
    //             url: 'http://testplugindocsurl.com'
    //         };
    //     }
    // };
});

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