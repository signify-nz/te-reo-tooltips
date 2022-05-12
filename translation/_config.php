<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\View\Parsers\ShortcodeParser;
use SilverStripe\Dev\Debug;

HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/translation/TeReoPlugin/TeReoPlugin.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'translate');

//adding to the contextmenu config will override the defaults, must maintain the original configuration when adding
HtmlEditorConfig::get('cms')->setOption('contextmenu', "contextTranslate addToDictionary test " . (HtmlEditorConfig::get('cms')->getOption('contextmenu')));
//HtmlEditorConfig::get('cms')->setOption('init_instance_callback:', 'function (editor) {tinmyce.activeEditor.on(\'GetContent\', function (event) {console.log(\'right here\');event.content = restoreShortcodes(event.content);});');


//can be removed
HtmlEditorConfig::get('cms')->enablePlugins(['help', 'autolink', 'searchreplace']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'searchreplace');

//HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/public/_resources/vendor/silverstripe/admin/thirdparty/tinymce/plugins/TeReoPlugin/TeReoPlugin.js']);

ShortcodeParser::get('default')->register('my_shortcode', ['ShortcodeHandler', 'MyShortCodeMethod']);
ShortcodeParser::get('default')->register('TT', ['ShortcodeHandler', 'ShortMethod']);
