<?php

namespace Signify\TeReoTooltips\Services;

interface UpdaterInterface
{
    /**
     * Generate a WordPair object
     *
     * @param  string $base
     * An untranslated word.
     * @param  string $destination
     * A translated word.
     * @param  int $languageID
     * A reference to the associated language or dictionary.
     * @return WordPair
     */
    public function addWordPair($base, $destination, $languageID);
}
