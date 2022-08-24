<?php

namespace Signify\TeReoTooltips\Extensions;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;

class ThemeSetterExtension extends Extension
{
    public function onAfterInit()
    {
        Requirements::css('signify-nz/te-reo-tooltips:client/dist/styles/main.css');
    }
}
