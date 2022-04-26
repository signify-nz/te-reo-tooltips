<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
//Below for debugging only, remove once solved
use SilverStripe\Dev\Debug;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HiddenField;

class SiteTreeExtension extends Extension{

    public function formatList(String $base, String $addition){
        $base = $base . $addition;
        return $base;
    }
    
    public function updateCMSFields(FieldList $fields)
    {
        $dict = Dictionary::get()->first();
        $pairs = $dict->WordPair();
        $native = implode('/', $pairs->column('Native'));
        $foreign = implode('/', $pairs->column('Foreign'));
        // $first = $pairs->first();
        // Debug::dump($fields->dataFieldNames());
        // Debug::show(implode($pairs->toArray()));
        // $toString = $pairs->__toString();
        // Debug::dump($toString);
        // $string = '';
        // $toString = $pairs->toArray();
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-foreign', $foreign);
        $fields->dataFieldByName('Content')->setAttribute('data-dictionary-native', $native);
        return $fields;
    }

}