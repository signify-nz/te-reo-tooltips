<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\View\Requirements;
use SilverStripe\SiteConfig\SiteConfig;

class SiteTreeExtension extends Extension
{

    use Configurable;

    /**
     * @config
     */
    private static $custom_hexcode = "";

    public function updateCMSFields(FieldList $fields)
    {
        $dict = SiteConfig::current_site_config()->getField('Dictionary');
        $pairs = $dict->WordPair();
        $base = implode('///', $pairs->column('Base'));
        $destination = implode('///', $pairs->column('Destination'));
        // TODO selector here may be too specific, consider making this dynamically pulled? This is no longer needed for the current method
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-destination', $destination);
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-base', $base);

        $customHexcode = $this->config()->get('custom_hexcode');
        // Will currently accept wrong values, I feel this is acceptable considering the use-case (Intended for developers only).
        // This function is not yet fully functional
        if ($customHexcode[0] !== 0) {
            $fields->dataFieldByName('Content')->setAttribute('data-custom-hexcode', $customHexcode[0]);
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/main.css');
        }
        //Requirements::javascript('https://kit.fontawesome.com/76f1d6e702.js');
        return $fields;
    }
}
