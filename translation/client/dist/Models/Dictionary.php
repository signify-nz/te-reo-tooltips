<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;

class Dictionary extends DataObject{

    //TODO specify tablenames

    private static $db = [
        'Title' => 'Varchar',
        'SourceLanguage' => 'Varchar',
        'DestinationLanguage' => 'Varchar',
    ];

    private static $has_many = [
        'WordPair' => WordPair::class,
    ];

    private static $owns = [
        'WordPair'
    ];

    // public function getCMSFields(){
    //     $fields = FieldList::create(TabSet::create('Root'));
    //     $fields->addFieldsToTab('Root.Main', TextField::create('Title'));
    //     return $fields;
    // }

}