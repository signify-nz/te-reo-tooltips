<?php



use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\View\Requirements;

class ThemeSetter extends SiteTree
{
    protected function init()
    {
        Requirements::css('/vendor/signify-nz/translation/client/dist/styles/pluginstyle.css');
    }
}
