<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\ORM\DataObject;

class Dictionary extends DataObject{

    //specify tablenames

    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $has_many = [
        'WordPair' => WordPair::class,
    ];

    private static $owns = [
        'WordPair'
    ];

}