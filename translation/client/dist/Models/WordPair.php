<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\RequiredFields;

class WordPair extends DataObject{

    //specify tablenames

    private static $db = [
        'Native' => "Varchar",
        'Foreign' => "Varchar",
    ];

    private static $has_one = [
        'Dictionary' => Dictionary::class,
    ];

    private static $summary_fields = [
        'Native' => 'Native Language',
        'Foreign' => 'Foreign Language',
    ];

    public function getCMSValidator() {
		return new RequiredFields(array('Native', 'Foreign'));
	}

}