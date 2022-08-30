<?php

namespace Signify\TeReoTooltips\Handlers;

use Signify\TeReoTooltips\Services\LocalTranslator;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\View\ArrayData;
use SilverStripe\Core\Injector\Injectable;

/**
 * ShortcodeHandler
 *
 * Handles the rendering of shortcodes through a template
 */
class ShortcodeHandler
{
    use Injectable;

    public $translator;

    /**
     * @var array $dependencies
     */
    private static $dependencies = [
        'translator' => '%$LocalTranslator'
    ];
    public static function parseShortcodes($arguments, $content = null, $parser = null, $tagName = null)
    {
        $service = Injector::inst()->get(LocalTranslator::class);
        return ArrayData::create([
            'Content' => $content,
            'Translation' => ShortcodeHandler::singleton()->translator->translateWord($content),
            'DarkMode' => !!SiteConfig::current_site_config()->getField('DarkTheme'),
            'Hexcode' => SiteTree::config()->get('custom_hexcode'),
        ])->renderWith('Shortcode');
    }
}
