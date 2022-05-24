<?php

namespace Signify\TeReoTooltips;

interface ServiceInterface
{

    public function translateWord($text, $language);
    //take input word
    //return translated word
    //can speciify by language, otherwise default to en

    public function translateBody($text, $language);
    //same as above but takes a phrase

}
