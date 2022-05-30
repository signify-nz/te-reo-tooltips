<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Forms\CheckBoxField;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;
use SilverStripe\View\Requirements;

use SilverStripe\Dev\Debug;

class SiteConfigExtension extends DataExtension
{

    private static $has_one = [
        'Dictionary' => Dictionary::class,
    ];

    private static $api_access = true;

    private static $db = [
        'DarkTheme' => 'Boolean',
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab('Root.Dictionary', array(
            $fieldGroup = FieldGroup::create(
                DropdownField::create('DictionaryID', 'Active Dictionary')
                    ->setSource(Dictionary::get()->map('ID', 'Title')),
                CheckBoxField::create('DarkTheme', 'Tooltip dark theme'),
            ),
            $grid = GridField::create('name', 'Current dictionaries', Dictionary::get()),
        ));
        $gridConfig = GridFieldConfig_RecordEditor::create();
        $grid->setConfig($gridConfig);

        //This requirement is added so that styling is applied to the cms page
        Requirements::css('vendor/signify-nz/te_reo_tooltips/client/dist/styles/main.css');
        return $fields;
    }
}
