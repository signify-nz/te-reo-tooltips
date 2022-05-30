<?php

use Signify\TeReoTooltips\LocalService;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\CMS\Model\SiteTree;

class ShortcodeHandler extends SiteTree
{
    public static function ShortMethod($arguments, $content = null, $parser = null, $tagName = null)
    {
        $service = new LocalService;
        $translation = $service->translateWord($content);
        $hexcode = SiteTree::config()->get('custom_hexcode')[0];
        if ($hexcode) {
            if ($translation) {
                return "<span class=\"TeReoToolTip CustomTheme\" data-originaltext=\"$content\" aria-describedby=\"The meaning of '$translation' is '$content'\"  style=\"---tooltip-customhexcode: " . $hexcode . "\">" . $translation . "</span>";
            } else return $content;
        } else if (SiteConfig::current_site_config()->getField('DarkTheme') == 1) {
            if ($translation) {
                return "<span class=\"TeReoToolTip DarkTheme\" data-originaltext=\"$content\" aria-describedby=\"The meaning of '$translation' is '$content'\" >" . $translation . "</span>";
            } else return $content;
        } else {
            if ($translation) {
                return "<span class=\"TeReoToolTip\" data-originaltext=\"$content\" aria-describedby=\"The meaning of \'$translation\' is '$content'\" >" . $translation . "</span>";
            } else return $content;
        }
    }
}
