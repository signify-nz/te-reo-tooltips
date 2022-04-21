<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;
use SilverStripe\Forms\FieldList;
//Below for debugging only, remove once solved
use SilverStripe\Dev\Debug;
use SilverStripe\ORM\DataExtension;
use SilverStripe\CMS\Controllers\ContentController;

class ThemeSetterExtension extends Extension
{
    // public function init()
    // {
    //     Debug::message("Before!");
    //     parent::init();
    //     Requirements::css('signify-nz/translation/client/dist/styles/bundle.css');
    //     Debug::message("After!");
    // }

    // public function onBeforeInit() {
    //     Debug::message("onBeforeInit!");
    // }
    
    public function onAfterInit() {
        //Debug::dump("onAfterInit!");
        Requirements::css('vendor/signify-nz/translation/client/dist/styles/bundle.css');
    }

    // public function updateCMSFields(FieldList $fields)
    // {
    //     Debug::message("Here!");
    // }

    // public function updateCMSFields(FieldList $fields)
    // {
    //     $dictionary = Dictionary::get()->first();
    //     $fields->dataFieldByName('WordPair')->setAttribute('data-text', $dictionary->);
    // }
}
