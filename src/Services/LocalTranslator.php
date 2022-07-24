<?php

namespace Signify\TeReoTooltips\Services;

use Exception;
use SilverStripe\SiteConfig\SiteConfig;
use Signify\TeReoTooltips\Models\Dictionary;

class LocalTranslator implements TranslatorInterface
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
        if (SiteConfig::current_site_config()->getField('ActiveDictionary')->exists()){
            return SiteConfig::current_site_config()->getField('ActiveDictionary');
        }
        return null;
    }

    //search for an exact match on a string
    public function translateWord($text, $languageID = null)
    {
        $dict = $this->checkLanguage($languageID);
        if (!$dict){
            return null;
        }
        $pairList = $dict->WordPairs();
        foreach ($pairList as $pair) {
            if ($text === $pair->getField('Base')) {
                return $pair->getField("Destination");
            }
        }
        return null;
    }

    //Search for any number of matches on larger body of text
    public function translateBody($text, $languageID = null)
    {
        $dict = $this->checkLanguage($languageID);
        if (!$dict){
            return $text;
        }
        $pairs = $dict->WordPairs();
        foreach ($pairs as $word) {
            // This replaces text with a shortcode, only if text is not immediately followed by [/TT] i.e. is already a shortcode.
            // Target must be preceded and followed by a non-letter character, this is so that partial words are not selected
            // /g is implicit in preg_replace.
            // regex look behind not supported in some browsers.
            $regex = '/(?<![a-zA-Z0-9])(' . preg_quote($word->getField("Base")) . ')(?!\[\/TT])(?![a-zA-Z0-9])/';
            $text = preg_replace($regex, "[TT]" . $word->getField('Base') . "[/TT]", $text);
        }
        return $text;
    }
}
