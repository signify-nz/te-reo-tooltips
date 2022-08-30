<?php

namespace Signify\TeReoTooltips\Extensions;

use SilverStripe\ORM\DataExtension;
use Signify\TeReoTooltips\Models\Dictionary;

/**
 * SiteConfigExtension
 *
 * Generates a user interface for managing the Dictionary and WordPair DataObjects
 */
class SiteConfigExtension extends DataExtension
{
    private static $has_many = [
        'Dictionaries' => Dictionary::class,
    ];

    private static $has_one = [
        'ActiveDictionary' => Dictionary::class,
    ];

    private static $db = [
        'DarkTheme' => 'Boolean',
    ];
}
