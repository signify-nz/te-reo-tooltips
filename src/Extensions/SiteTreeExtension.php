<?php

namespace Signify\TeReoTooltips\Extensions;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\View\Requirements;

/**
 * SiteTreeExtension
 *
 * Provides a global means of accessing the custom theme variable
 */
class SiteTreeExtension extends Extension
{
    use Configurable;

    private static $custom_hexcode = "";

    public function updateCMSFields(FieldList $fields)
    {
        // Will currently accept incorrect values, I feel this is acceptable
        // considering the use-case (Intended for developers only).
        $customHexcode = $this->config()->get('custom_hexcode');
        if ($customHexcode !== 0) {
            $fields->dataFieldByName('Content')->setAttribute('data-custom-hexcode', $customHexcode);
            Requirements::css('signify-nz/te-reo-tooltips:client/dist/styles/main.css');
        }
        return $fields;
    }
}
