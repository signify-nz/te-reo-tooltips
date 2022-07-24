<?php
namespace Signify\TeReoTooltips\Extensions;

use SilverStripe\Forms\CheckBoxField;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;
use SilverStripe\View\Requirements;
use Signify\TeReoTooltips\Models\Dictionary;
use SilverStripe\Forms\LabelField;

class SiteConfigExtension extends DataExtension
{
    private static $has_many = [
        'Dictionaries' => Dictionary::class,
    ];

    private static $has_one = [
        'ActiveDictionary' => Dictionary::class,
    ];

    private static $api_access = true;

    private static $db = [
        'DarkTheme' => 'Boolean',
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab('Root.Dictionary', array(
            $fieldgroup = FieldGroup::create(
                CheckboxField::create('DarkTheme', 'Tooltip dark theme'),
            ),
            $grid = GridField::create('Dictionaries', 'Current dictionaries', $this->owner->Dictionaries()),
        ));
        if ($this->owner->Dictionaries()->exists()){
            $fieldgroup->insertBefore('DarkTheme',
                DropdownField::create('ActiveDictionaryID', 'Active Dictionary')
                    ->setSource($this->owner->Dictionaries()->map('ID', 'Title')));
            // This nested if statement is intended to ensure that if possible, an active dictionary is always selected
            // However, i'm not sure it is as comprehensive as I want. May require further changes
            if (!$this->owner->ActiveDictionary()->exists()){
                $this->owner->SetField('ActiveDictionary', $this->owner->Dictionaries()->first());
            };
        } else {
            $fieldgroup->insertBefore('DarkTheme',
                LabelField::create('No dictionaries currently exist'));
        };
        $gridConfig = GridFieldConfig_RecordEditor::create();
        $grid->setConfig($gridConfig);

        //This requirement is added so that styling is applied to the cms page
        Requirements::css('signify-nz/te_reo_tooltips:client/dist/styles/main.css');
        return $fields;
    }
}
