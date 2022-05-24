<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\View\Parsers\ShortcodeParser;

//HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/translation/TeReoPlugin/TeReoPlugin.js']);
HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/translation/client/dist/js/bundle.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'translate');

//adding to the contextmenu config will override the defaults, must maintain the original configuration when adding
HtmlEditorConfig::get('cms')->setOption('contextmenu', "contextTranslate addToDictionary " . (HtmlEditorConfig::get('cms')->getOption('contextmenu')));

ShortcodeParser::get('default')->register('my_shortcode', ['ShortcodeHandler', 'MyShortCodeMethod']);
ShortcodeParser::get('default')->register('TT', ['ShortcodeHandler', 'ShortMethod']);
