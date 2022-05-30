<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\View\Requirements;

class SiteTreeExtension extends Extension
{

    use Configurable;

    /**
     * @config
     */
    private static $custom_hexcode = "";

    public function updateCMSFields(FieldList $fields)
    {
        // Will currently accept incorrect values, I feel this is acceptable considering the use-case (Intended for developers only).
        $customHexcode = $this->config()->get('custom_hexcode');
        if ($customHexcode[0] !== 0) {
            $fields->dataFieldByName('Content')->setAttribute('data-custom-hexcode', $customHexcode[0]);
            Requirements::css('vendor/signify-nz/te_reo_tooltips/client/dist/styles/main.css');
        }
        return $fields;
    }
}
