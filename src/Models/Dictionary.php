<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\Control\HTTPResponse;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Security\Member;
use SilverStripe\Dev\Debug;

class Dictionary extends DataObject
{

    private static $db = [
        'Title' => 'Varchar',
        'SourceLanguage' => 'Varchar',
        'DestinationLanguage' => 'Varchar',
    ];

    // Is this an appropriate naming convention?
    private static $table_name = 'Signify/Dictionary_Object';

    private static $has_many = [
        'WordPair' => WordPair::class,
    ];

    private static $owns = [
        'WordPair'
    ];

    //Is this necessary?
    private static $belongs_to = [
        'SiteConfig' => SiteConfigExtension::class,
    ];

    private static $summary_fields = [
        'Title' => 'Title',
        'SourceLanguage' => 'Base language',
        'DestinationLanguage' => 'Destination language',
    ];

    public function getCMSValidator()
    {
        return new RequiredFields(array('Title', 'SourceLanguage', 'DestinationLanguage'));
    }
}
