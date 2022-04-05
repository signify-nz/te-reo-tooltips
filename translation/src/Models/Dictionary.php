<?php

namespace Signify\Translation\Models;

use SilverStripe\ORM\DataObject;

class Dictionary extends DataObject{

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