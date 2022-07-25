<?php

namespace Signify\TeReoTooltips\Models;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Security\Permission;
use SilverStripe\SiteConfig\SiteConfig;

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

    private static $has_one = [
        'SiteConfig' => SiteConfig::class,
    ];

    private static $summary_fields = [
        'Title' => 'Title',
        'SourceLanguage' => 'Base language',
        'DestinationLanguage' => 'Destination language',
    ];

    public function canView($member = null)
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canEdit($member = null)
    {
        return Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member);
    }

    public function canDelete($member = null)
    {
        return Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member);
    }

    public function canCreate($member = null, $context = [])
    {
        return Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member);
    }

    public function getCMSValidator()
    {
        return new RequiredFields(array('Title', 'SourceLanguage', 'DestinationLanguage'));
    }
}
