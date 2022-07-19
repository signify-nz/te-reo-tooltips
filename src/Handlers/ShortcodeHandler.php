<?php
namespace Signify\TeReoTooltips\Handlers;

use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\View\ArrayData;

class ShortcodeHandler
{
  public static function parseShortcodes($arguments, $content = null, $parser = null, $tagName = null)
    {
        $service = Injector::inst()->create('Signify\TeReoTooltips\Services\LocalService');
        return ArrayData::create([
            'Content' => $content,
            'Translation' => $service->translateWord($content),
            'DarkMode' => !!SiteConfig::current_site_config()->getField('DarkTheme'),
            'Hexcode' => SiteTree::config()->get('custom_hexcode'),
        ])->renderWith('Shortcode');
    }
}
