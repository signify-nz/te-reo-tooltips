<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;

HtmlEditorConfig::get('cms')->enablePlugins(['help']);
HtmlEditorConfig::get('cms')->enablePlugins(['testplugin' => '/public/_resources/vendor/silverstripe/admin/thirdparty/tinymce/plugins/testplugin/testplugin.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'help');
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'button1');
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'button2');

// You need this file if you don't have anything in the _config folder. If that folder exists
// and is not empty then you can delete this file.
