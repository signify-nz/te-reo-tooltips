<?php

namespace Signify\TeReoTooltips\Models;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\RequiredFields;

class Dictionary extends DataObject
{

    private static $db = [
        'Title' => 'Varchar',
        'SourceLanguage' => 'Varchar',
        'DestinationLanguage' => 'Varchar',
    ];

    private static $table_name = 'Signify_Dictionary';

    private static $has_many = [
        'WordPairs' => WordPair::class,
    ];

    private static $owns = [
        'WordPairs'
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
