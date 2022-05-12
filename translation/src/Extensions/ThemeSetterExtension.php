<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Control\HTTPRequest;

class ThemeSetterExtension extends Extension
{
    public function onAfterInit()
    {
        //First requirement should be kept, second should be removed. for testing purposes only
        //Requirements::css('vendor/signify-nz/translation/client/dist/styles/bundle.css');
        //Requirements::css('vendor/signify-nz/translation/src/Styles/pluginStyle.scss');

        //Maybe add condition for custom css here. Whichever file is required determines the theme for the page, will this cause an issue when css is bundled? Can I bundle into multiple separate files?
        if (SiteConfig::current_site_config()->getField('DarkTheme') == 1) {
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/darkTheme.scss');
        } else {
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/lightTheme.scss');
        }
    }
}
