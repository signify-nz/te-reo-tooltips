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
        $native = implode('///', $pairs->column('Native'));
        $foreign = implode('///', $pairs->column('Foreign'));
        // TODO selector here may be too specific, consider making this dynamically pulled?
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-foreign', $foreign);
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-native', $native);

        $customHexcode = $this->config()->get('custom_hexcode');
        // will currently accept wrong values, I feel this is acceptable considering the use-case.
        // This function is untested
        if ($customHexcode[0] !== 0) {
            //this needs to pass to the tooltip directly or the css needs to pull from this element.
            $fields->dataFieldByName('Content')->setAttribute('data-custom-hexcode', $customHexcode[0]);
            Requirements::css('vendor/signify-nz/translation/client/dist/styles/customTheme.scss');
        }

        return $fields;
    }
}
