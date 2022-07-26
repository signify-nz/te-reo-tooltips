<?php

namespace Signify\TeReoTooltips\Services;

interface TranslatorInterface
{
    /**
     * Searches
     *
     * @param  string $text
     * Singular word to be translated
     * @param  mixed $languageID
     * A reference to the language being queried.
     * @return string
     * A successfully translated word. Returns null if no match is found.
     */
    public function translateWord($text, $languageID);

    /**
     * translateBody
     *
     * @param  string $text
     * A body of text to be translated
     * @param  mixed $languageID
     * A reference to the language being queried.
     * @return string
     * Original text with translations inserted, if applicable.
     */
    public function translateBody($text, $languageID);
}
