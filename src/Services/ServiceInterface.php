<?php

namespace Signify\TeReoTooltips\Services;

interface ServiceInterface
{
    public function translateWord($text, $languageID);
    //take input word
    //return translated word
    //can specify language, otherwise use default

    public function translateBody($text, $languageID);
    //same as above but takes a body of text

    public function addWordPair($base, $destination, $ID);
    //create a new wordPair object
}
