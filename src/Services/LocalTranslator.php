<?php

namespace Signify\TeReoTooltips\Services;

use SilverStripe\Core\Injector\Injectable;
use SilverStripe\SiteConfig\SiteConfig;
use Signify\TeReoTooltips\Models\Dictionary;

/**
 * LocalTranslator
 *
 * Translates text by wrapping applicable words in shortcodes
 */
class LocalTranslator implements TranslatorInterface
{
    use Injectable;

    /**
     * Retrieves a Dictionary object by ID, or the currently active dictionary if no ID is provided.
     *
     * @param  int $dictionaryID
     * The ID of the Dictionary to be retrieved
     * @return Dictionary
     */
    private function checkLanguage($dictionaryID = null)
    {
        if ($dictionaryID !== null) {
            if (Dictionary::get()->byID($dictionaryID)) {
                return Dictionary::get()->byID($dictionaryID);
            }
        }
        if (SiteConfig::current_site_config()->getField('ActiveDictionary')->exists()) {
            return SiteConfig::current_site_config()->getField('ActiveDictionary');
        }
        return null;
    }

    /**
     * Search for an exactly matching translation for a given string.
     *
     * Will search a given Dictionary object for a a WordPair with a matching Base word.
     * Returns the complementary Destination word for the matching Base.
     *
     * @param  string $text
     * The word to be matched against.
     * @param  int $dictionaryID
     * The ID of the Dictionary to be checked. Will check the currently active Dictionary if null is provided.
     * @return string
     * A successfully translated word. Returns null if no match is found.
     */
    public function translateWord($text, $dictionaryID = null)
    {
        $dict = $this->checkLanguage($dictionaryID);
        if (!$dict) {
            return null;
        }
        $pairList = $dict->WordPairs();
        foreach ($pairList as $pair) {
            if ($text === $pair->getField('Base')) {
                return $pair->getField("Destination");
            } else if (strcasecmp($text, $pair->getField('Base')) == 0){
                return $pair->getField("DestinationAlternate") ?? $pair->getField("Destination");
            }
        }
        return null;
    }

    /**
     * Search for any number of translatable words on larger body of text.
     *
     * Wraps matching words within shortcodes using regex, under the following conditions
     *  -   Matched text is not immediately followed by [/TT] i.e. is already a shortcode.
     *  -   Matched text is preceded and followed by a non-letter character,
     *      this is so that partial words are not selected
     *
     * @param  string $text
     * The text to be searched for matches.
     * @param  int $dictionaryID
     * The ID of the Dictionary to be checked. Will check the currently active Dictionary if null is provided.
     * @return string
     * The original text provided, with matches wrapped in shortcodes.
     */
    public function translateBody($text, $dictionaryID = null)
    {
        $dict = $this->checkLanguage($dictionaryID);
        if (!$dict) {
            return $text;
        }
        $pairs = $dict->WordPairs()->sort()->reverse();
        // encode here to prevent collisions with existing translations
        $text = $this->encodeToHex($text);

        foreach ($pairs as $word) {
            // /g is implicit in preg_replace.
            // regex look behind not supported in some browsers.
            // Need to use preg_replace_callback to preserve capitalisation
            $regex = '/(?<![a-zA-Z0-9])(' . preg_quote($word->getField("Base")) . ')(?!\[\/TT])(?![a-zA-Z0-9])(?![^<]*\>)/i';
            // $text = preg_replace($regex, "[TT]" . $word->getField('Base') . "[/TT]", $text);
            $text = preg_replace_callback($regex, function ($matches) {
                    return "[TT]".bin2hex($matches[0])."[/TT]";
            },
            $text);
        }

        $text = $this->decodeFromHex($text);

        return $text;
    }

    private function encodeToHex($text){
        $regex = '/(\[TT]).*?(\[\/TT])/';
        $text = preg_replace_callback($regex, function ($matches) {
                $encodedMatch = bin2hex(substr($matches[0], 4, strlen($matches[0])-9));
                return '[TT]'.$encodedMatch.'[/TT]';
            },
        $text);
        return $text;
    }

    private function decodeFromHex($text){
        $regex = '/(\[TT]).*?(\[\/TT])/';
        $text = preg_replace_callback($regex, function ($matches) {
                $decodedMatch = hex2bin(substr($matches[0], 4, strlen($matches[0])-9));
                return '[TT]'.$decodedMatch.'[/TT]';
            },
        $text);
        return $text;
    }
}
