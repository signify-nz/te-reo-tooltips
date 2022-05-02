<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;

HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/translation/TeReoPlugin/TeReoPlugin.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'translate');
//adding to the contextmenu config will override the defaults, must maintain the original configuration when adding
HtmlEditorConfig::get('cms')->setOption('contextmenu', "contextTranslate " . (HtmlEditorConfig::get('cms')->getOption('contextmenu')));

//can be removed
HtmlEditorConfig::get('cms')->enablePlugins(['help', 'autolink']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'help');

//HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/public/_resources/vendor/silverstripe/admin/thirdparty/tinymce/plugins/TeReoPlugin/TeReoPlugin.js']);
