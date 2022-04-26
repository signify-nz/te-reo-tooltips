<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\ORM\DataObject;

class WordPair extends DataObject{

    //specify tablenames

    private static $db = [
        'Native' => "Varchar",
        'Foreign' => "Varchar",
    ];

    private static $has_one = [
        'Dictionary' => Dictionary::class,
    ];

}