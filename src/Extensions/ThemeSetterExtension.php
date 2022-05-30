<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;

class ThemeSetterExtension extends Extension
{
    public function onAfterInit()
    {
        Requirements::css('vendor/signify-nz/te_reo_tooltips/client/dist/styles/main.css');
    }
}
