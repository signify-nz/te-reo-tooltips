<?php

namespace Signify\TeReoTooltips\Services;

/**
 * TranslatorInterface
 *
 * Handles the translation of text
 */
interface TranslatorInterface
{
    /**
     * Translates a singular word
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
     * Translates all applicable words within a body of text
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
