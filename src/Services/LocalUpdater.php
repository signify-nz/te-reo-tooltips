<?php

namespace Signify\TeReoTooltips\Services;

use SilverStripe\Core\Injector\Injectable;
use SilverStripe\SiteConfig\SiteConfig;
use Signify\TeReoTooltips\Models\WordPair;
use Signify\TeReoTooltips\Models\Dictionary;
use Silverstripe\ORM\ValidationException;

/**
 * LocalUpdater
 *
 * Handles the addition of WordPairs to the database and binds them to Dictionary DataObjects
 */
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
            if (Dictionary::get()->byID($dictionaryID)) {
                return Dictionary::get()->byID($dictionaryID);
            }
        }
        if (SiteConfig::current_site_config()->getField('ActiveDictionary')) {
            return SiteConfig::current_site_config()->getField('ActiveDictionary');
        }
        return null;
    }

    /**
     * Generates a WordPair object from parameters and associates it with a Dictionary.
     *
     * @param  string $base
     * An untranslated word.
     * @param  string $destination
     * The translation of $base
     * @param  int $dictionaryID
     * ID of the Dictionary object for this WordPair to be associated to.
     * Will default to currently active dictionary if no ID is provided.
     * @return WordPair
     * @link WordPair::validate()
     * Requirements for WordPair to be valid.
     * @throws ValidationException if WordPair cannot be written to database
     */
    public function addWordPair($base, $destination, $dictionaryID = null)
    {
        // some validation occurs at javascript level
        // returning null will result in an error message displayed to user
        $dict = $this->checkLanguage($dictionaryID);
        if (!$dict || !$base || !$destination) {
            throw new Exception('Missing sufficient data to generate a wordpair');
        }
        $pair = WordPair::create();
        try {
            $pair->Base = $base;
            $pair->Destination = $destination;
            $pair->write();
            $dict->WordPairs()->add($pair);
        } catch (\ValidationException $e) {
            throw $e;
        }
        return $pair;
    }
}
