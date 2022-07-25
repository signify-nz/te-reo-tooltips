<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Security\Permission;
use SilverStripe\Security\PermissionProvider;
use SilverStripe\Security\Security;

class PermissionController implements PermissionProvider
{
    public function init()
    {
        parent::init();
        if (!Permission::check('TOOLTIP_DICTIONARY_RIGHTS')) {
            Security::permissionFailure();
        }
        if (!Permission::check('TOOLTIP_WORDPAIR_RIGHTS')) {
            Security::permissionFailure();
        }
    }

    public function providePermissions()
    {
        return [
            'TOOLTIP_DICTIONARY_RIGHTS' => 'Make high-level alterations to dictionaries (TeReoTooltips)',
            'TOOLTIP_WORDPAIR_RIGHTS' => 'Make alterations to the content of a dictionary (TeReoTooltips)',
        ];
    }
}
