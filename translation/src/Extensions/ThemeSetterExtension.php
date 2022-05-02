<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;
use SilverStripe\SiteConfig\SiteConfig;

class ThemeSetterExtension extends Extension
{    
    public function onAfterInit() {
        //First requirement should be kept, second should be removed. for testing purposes only
        //Requirements::css('vendor/signify-nz/translation/client/dist/styles/bundle.css');
        //Requirements::css('vendor/signify-nz/translation/src/Styles/pluginStyle.scss');

        //Maybe add condition for custom css here
        if (SiteConfig::current_site_config()->getField('DarkTheme') == 1){
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/darkTheme.scss');
        } else {
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/lightTheme.scss');
        }
    }
}




    // public function updateCMSFields(FieldList $fields)
    // {
    //     $dictionary = Dictionary::get()->first();
    //     Debug::message("here");
    //     return $fields;
    // }

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

    // Debug::dump(WordPair::get()->first()->getField('Native'));
    // Debug::dump(WordPair::get()->getField('Native'));
    // Debug::message(Dictionary::get()->first()->get());
    // $dict = Dictionary::get()->first()->map('Native', 'Foreign');
