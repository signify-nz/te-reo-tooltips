<?php

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\View\Requirements;

class ThemeSetter extends SiteTree
{
    protected function init()
    {
        Requirements::css('client/dist/styles/pluginstyle.css');
    }
}
