<?php

namespace Signify\TeReoTooltips\Services;

use SilverStripe\Core\Injector\Injectable;
use SilverStripe\SiteConfig\SiteConfig;
use Signify\TeReoTooltips\Models\WordPair;
use Signify\TeReoTooltips\Models\Dictionary;

class LocalUpdater implements UpdaterInterface
{
    use Injectable;

    /**
     * Retrieves a Dictionary object by ID, or the currently active dictionary if no ID is provided.
     *
     * @param  int $dictionaryID
     * The ID of the Dictionary to be retrieved
     * @return Dictionary
     */
    private function checkLanguage($dictionaryID)
    {
        if ($dictionaryID !== null) {
            if (Dictionary::get_by_id($dictionaryID)) {
                return Dictionary::get_by_id($dictionaryID);
            }
        }
        if (SiteConfig::current_site_config()->getField('ActiveDictionary')) {
            return SiteConfig::current_site_config()->getField('ActiveDictionary');
        }
        return null;
    }

    /**
     * Generates a Wordpair object from parameters and associates it with a Dictionary.
     *
     * @param  string $Base
     * An untranslated word.
     * @param  string $Destination
     * The translation of $Base
     * @param  int $dictionaryID
     * ID of the Dictionary object for this WordPair to be associated to.
     * Will default to currently active dictionary if no ID is provided.
     * @return WordPair
     * If generated WordPair is invalid, returns null.
     * @link WordPair::validate()
     * Requirements for WordPair to be valid.
     */
    public function addWordPair($Base, $Destination, $dictionaryID = null)
    {
        // some validation occurs at javascript level
        // returning null will result in an error message displayed to user
        $dict = $this->checkLanguage($dictionaryID);
        if (!$dict || !$Base || !$Destination) {
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
