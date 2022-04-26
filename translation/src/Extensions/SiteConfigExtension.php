<?php

namespace Signify\TeReoTooltips;

use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\GridField\GridField;

class SiteConfigExtension extends DataExtension
{

    private static $db = [
        'FacebookLink' => 'Varchar',
        'TwitterLink' => 'Varchar',
        'GoogleLink' => 'Varchar',
        'YouTubeLink' => 'Varchar',
        'FooterContent' => 'Text'
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab('Root.Dictionary', array (
            TextField::create('FacebookLink','1'),
            TextField::create('TwitterLink','2'),
            TextField::create('GoogleLink','3'),
            TextField::create('YouTubeLink','4')
        ));
        $fields->addFieldsToTab('Root.Dictionary', TextareaField::create('FooterContent', 'Content for footer'));
        //$field->addFieldsToTab('Root.Dictionary', GridField::create($name, $title, $list));
    }
}