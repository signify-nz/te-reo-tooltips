<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\View\Parsers\ShortcodeParser;

HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/te_reo_tooltips/client/dist/js/bundle.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'translate');

//setting the contextmenu config will override the defaults, must maintain the original configuration when adding
HtmlEditorConfig::get('cms')->setOption('contextmenu', "contextTranslate addToDictionary " . (HtmlEditorConfig::get('cms')->getOption('contextmenu')));

ShortcodeParser::get('default')->register('TT', ['Signify\TeReoTooltips\Handlers\ShortcodeHandler', 'parseShortcodes']);
