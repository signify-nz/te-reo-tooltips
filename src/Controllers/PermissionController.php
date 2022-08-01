<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Security\PermissionProvider;

class PermissionController implements PermissionProvider
{
    public function providePermissions()
    {
        return [
            'TOOLTIP_DICTIONARY_RIGHTS' => 'Make high-level alterations to dictionaries (TeReoTooltips)',
            'TOOLTIP_WORDPAIR_RIGHTS' => 'Make alterations to the content of a dictionary (TeReoTooltips)',
        ];
    }
}
