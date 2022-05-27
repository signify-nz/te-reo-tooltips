<?php

namespace Signify\TeReoTooltips;

use SilverStripe\SiteConfig\SiteConfig;

class LocalService implements ServiceInterface
{

    // Helper function
    // If no language is provided, get default.
    public function checkLanguage($language)
    {
        if ($language !== null) {
            return Dictionary::get_by_id($language);
        } else {
            return SiteConfig::current_site_config()->getField('Dictionary');
        }
        // add check to see if dictionary is null. i.e. invalid ID provided. or perhaps have try/catch in main function
    }

    //search for a strictly exact match on a string
    public function translateWord($text, $languageID = null)
    {
        $dict = $this->checkLanguage($languageID);
        if ($dict == null) {
            return "This should be a 400 status code";
        }
        $pairs = $dict->WordPair();
        foreach ($pairs as $word) {
            if ($text == $word->getField('Base')) {
                return $word->getField("Destination");
            }
        }
        return false;
    }

    //Search for an exact match to an extended string -- incomplete
    //This functionality is covered by the translate word function
    public function translatePhrase($text, $languageID = null)
    {
        $dict = $this->checkLanguage($languageID);
        if ($dict == null) {
            return "This should be a 400 status code";
        }
        $pairs = $dict->WordPair();
    }

    //Search for any number of matches on larger body of text
    //maybe cast an array, return indexes in json format?
    public function translateBody($text, $languageID = null)
    {
        $dict = $this->checkLanguage($languageID);
        // if ($dict == null) {
        //     return "Error 404";
        // }
        //try {
        //this error is not being caught
        $pairs = $dict->WordPair();
        // } catch (\Exception $e) {
        //     return 'Caught exception: ' .  $e->getMessage() . "\n";
        // }
        foreach ($pairs as $word) {
            //this replaces text with a shortcode, only if text is not immediately followed by [/TT] i.e. is already a shortcode. /g is implicit in preg_replace.
            //regex look behind not supported in some browsers. Target must be preceded and followed by a non-letter character, this is so that partial words are not selected 
            $regex = '/(?<![a-zA-Z0-9])(' . preg_quote($word->getField("Base")) . ')(?!\[\/TT])(?![a-zA-Z0-9])/';
            $text = preg_replace($regex, "[TT]" . $word->getField('Base') . "[/TT]", $text);
        }
        return $text;
    }

    function addWordPair($Base, $Destination, $ID = null)
    {
        //there needs to be some validation here -- does this wordpair exist already? are the fields identical?
        $dict = null;
        if ($ID != null) {
            $dict = Dictionary::get_by_id($ID);
        } else {
            $dict = SiteConfig::current_site_config()->getField('Dictionary');
        }
        $pair = new WordPair();
        $pair->Base = $Base;
        $pair->Destination = $Destination;
        $pair->write();
        $dict->WordPair()->add($pair);
        return $pair;
    }
}
