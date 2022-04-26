<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;
use SilverStripe\Forms\FieldList;
//Below for debugging only, remove once solved
use SilverStripe\Dev\Debug;
use SilverStripe\ORM\DataExtension;
use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HiddenField;

class ThemeSetterExtension extends Extension
{
    
    public function onAfterInit() {
        Requirements::css('vendor/signify-nz/translation/client/dist/styles/bundle.css');
        // Debug::dump(WordPair::get()->first()->getField('Native'));
        // Debug::dump(WordPair::get()->getField('Native'));
        // Debug::message(Dictionary::get()->first()->get());
        // $dict = Dictionary::get()->first()->map('Native', 'Foreign');
        $dict = Dictionary::get()->first();
        $pairs = $dict->WordPair();
        $first = $pairs->first();
    }


    public function updateCMSFields(FieldList $fields)
    {
        //$dictionary = Dictionary::get()->first();
        Debug::message("here");
        return $fields;
    }

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

    // public function getCMSFields(FieldList $fields)
    // {
    //     Debug::message("Here!");
    //     return FieldList::create(
    //         TextareaField::create('Title')
    //     );
    // }

    // public function beforeUpdateCMSFields(FieldList $fields)
    // {
    //     Debug::message("Here!");
    //     $fields->addFieldToTab('Root.Main', TextareaField::create('Title'));
    //     return $fields;
    // }

    // public function updateCMSFields(FieldList $fields)
    // {
    //     $dictionary = Dictionary::get()->first();
    //     $fields->dataFieldByName('WordPair')->setAttribute('data-text', $dictionary->);
    // }
}
