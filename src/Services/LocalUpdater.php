<?php

namespace Signify\TeReoTooltips\Services;

use SilverStripe\SiteConfig\SiteConfig;
use Signify\TeReoTooltips\Models\WordPair;
use Signify\TeReoTooltips\Models\Dictionary;

class LocalUpdater implements UpdaterInterface
{
    // Helper function
    // If no language is provided, get default.
    private function checkLanguage($language)
    {
        if ($language !== null) {
            if (Dictionary::get_by_id($language)) {
                return Dictionary::get_by_id($language);
            }
        }
        if (SiteConfig::current_site_config()->getField('ActiveDictionary')){
            return SiteConfig::current_site_config()->getField('ActiveDictionary');
        }
        return null;
    }

    public function addWordPair($Base, $Destination, $ID = null)
    {
        // some validation occurs at javascript level
        // returning null will result in an error message displayed to user
        $dict = $this->checkLanguage($ID);
        if (!$dict || !$Base || !$Destination){
            return null;
        }
        $pair = new WordPair();
        try {
        $pair->Base = $Base;
        $pair->Destination = $Destination;
        $pair->write();
        $dict->WordPairs()->add($pair);
        } catch (\Throwable $th) {
            return null;
        }
        return $pair;
    }
}