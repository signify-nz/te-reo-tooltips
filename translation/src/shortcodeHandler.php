<?php

use Signify\TeReoTooltips\LocalService;
use SilverStripe\CMS\Model\SiteTree;

class ShortcodeHandler extends SiteTree
{
    private static $casting = [
        'MyShortCodeMethod' => 'HTMLText'
    ];

    public static function MyShortCodeMethod($arguments, $content = null, $parser = null, $tagName = null)
    {
        $service = new LocalService;
        $translation = $service->translateWord($content);
        return "<span id=\"TeReoToolTip\" data-originaltext=\"$content\">" . $translation . "</span>";
    }

    public static function ShortMethod($arguments, $content = null, $parser = null, $tagName = null)
    {
        $service = new LocalService;
        if ($arguments) {
            $translation = $service->translateWord($arguments['X']);
            if ($translation) {
                return "<span id=\"TeReoToolTip\" data-originaltext=\"" . $arguments['X'] . "\">" . $translation . "</span>";
            } else return $arguments['X'];
        } else {
            $translation = $service->translateWord($content);
            if ($translation) {
                return "<span id=\"TeReoToolTip\" data-originaltext=\"$content\">" . $translation . "</span>";
            } else return $content;
        }
    }

    public static function HandleShortCodesWithDifficulty($arguments, $content = null, $parser = null, $tagName = null)
    {
        if ($difficulty == 1) {
            return renderFew();
        } elseif ($difficulty == 2) {
            return renderSome();
        } elseif ($difficulty == 3) {
            return renderAll();
        }
    }
}
