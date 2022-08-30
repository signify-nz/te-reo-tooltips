<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Security\PermissionProvider;

/**
 * PermissionController
 *
 * Defines permissions for the Dictionary and WordPair DataObjects
 */
class PermissionController implements PermissionProvider
{
    public function providePermissions()
    {
        return array(
            "TOOLTIP_DICTIONARY_RIGHTS" => array(
                'name' => _t(
                    'Signify\\TeReoTooltips\\Models\\Dictionary.EDIT_PERMISSION',
                    "Manage dictionary configuration",
                    array(
                        'title' => 'title'
                    )
                ),
                'category' => _t('SilverStripe\\Security\\Permission.TOOLTIPS_CATEGORY', 'Te Reo Tooltips')
            ),
            "TOOLTIP_WORDPAIR_RIGHTS" => array(
                'name' => _t(
                    'Signify\\TeReoTooltips\\Models\\WordPair.EDIT_PERMISSION',
                    "Make changes to the content of dictionaries",
                    array(
                        'title' => 'title'
                    )
                ),
                'category' => _t('SilverStripe\\Security\\Permission.TOOLTIPS_CATEGORY', 'Te Reo Tooltips')
            ),
            "TOOLTIP_VIEW_OBJECTS" => array(
                'name' => _t(
                    'DictionaryAdmin.ACCESS_PERMISSION',
                    'Access to \'Dictionaries\' section'
                ),
                'category' => _t(
                    'Permission.CMS_ACCESS_CATEGORY',
                    'CMS Access'
                ),
                'sort' => 0
            ),
        );
    }
}
