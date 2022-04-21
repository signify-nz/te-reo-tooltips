<?php

use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\CMS\Controllers\ContentController;

HtmlEditorConfig::get('cms')->enablePlugins(['help']);
// HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/public/_resources/vendor/silverstripe/admin/thirdparty/tinymce/plugins/TeReoPlugin/TeReoPlugin.js']);
HtmlEditorConfig::get('cms')->enablePlugins(['TeReoPlugin' => '/vendor/signify-nz/translation/TeReoPlugin/TeReoPlugin.js']);
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'help');
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'translate');
HtmlEditorConfig::get('cms')->addButtonsToLine(1, 'settings');
//ContentController::add_extension(Signify\TeReoTooltips\ThemeSetterExtension::class);
// error_reporting(E_ALL);

//call_user_func(function () {
//     $module = ModuleLoader::inst()->getManifest()->getModule('silverstripe/cms');

//     // Enable insert-link to internal pages
//     TinyMCEConfig::get('cms')
//         ->enablePlugins([
//             'sslinkinternal' => $module
//                 ->getResource('client/dist/js/TinyMCE_sslink-internal.js'),
//             'sslinkanchor' => $module
//                 ->getResource('client/dist/js/TinyMCE_sslink-anchor.js'),
//         ]);
// });


// You need this file if you don't have anything in the _config folder. If that folder exists
// and is not empty then you can delete this file.
