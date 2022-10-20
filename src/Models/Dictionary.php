<?php

namespace Signify\TeReoTooltips\Models;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Security\Permission;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Forms\FormAction;

/**
 * Dictionary
 *
 * An object meant to hold WordPairs with a specific language scope
 */
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
        return Permission::check('TOOLTIP_VIEW_OBJECTS', 'any', $member);
    }

    public function canEdit($member = null)
    {
        // This check for TOOLTIP_WORDPAIR_RIGHTS enables wordpairs to be editable in the cms gridfield
        // Inheritance of permissions prevents wordpairs from being editable unless dictionaries are also editable
        return (Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member)
            || Permission::check('TOOLTIP_WORDPAIR_RIGHTS', 'any', $member)
        );
    }

    public function canDelete($member = null)
    {
        return Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member);
    }

    public function canCreate($member = null, $context = [])
    {
        return Permission::check('TOOLTIP_DICTIONARY_RIGHTS', 'any', $member);
    }

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName([
            'SiteConfigID',
        ]);

        return $fields;
    }

    public function getCMSValidator()
    {
        return new RequiredFields(array('Title', 'SourceLanguage', 'DestinationLanguage'));
    }
}
