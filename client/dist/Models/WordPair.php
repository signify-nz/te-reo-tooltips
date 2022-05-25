<?php

//namespace Signify\Translation\Models;
namespace Signify\TeReoTooltips;

use SilverStripe\ORM\ArrayLib;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Dev\Debug;

class WordPair extends DataObject
{

    // Is this an appropriate naming convention?
    private static $table_name = 'Signify/WordPair_Object';

    private static $db = [
        'Base' => "HTMLVarchar",
        'Destination' => "HTMLVarchar",
    ];

    private static $has_one = [
        'Dictionary' => Dictionary::class,
    ];

    private static $summary_fields = [
        'Base' => 'Base Language',
        'Destination' => 'Destination Language',
    ];

    public function canView($member = null)
    {
        return true;
    }

    private static $api_access = true;

    public function getCMSFields()
    {
        $limitedConfig = HtmlEditorConfig::get('limited');
        $limitedConfig->setOptions([
            'friendly_name'      => 'Limited WYSIWYG Editor',
            'skin'               => 'silverstripe',
            'browser_spellcheck' => true,
        ]);
        $limitedConfig->removeButtons(ArrayLib::array_values_recursive($limitedConfig->getButtons()));
        $limitedConfig->setButtonsForLine(1, array('charmap'));
        // Add macrons
        $limitedConfig->enablePlugins('charmap');
        $limitedConfig->setOption('charmap_append', [
            ['256', 'A - macron'],
            ['274', 'E - macron'],
            ['298', 'I - macron'],
            ['332', 'O - macron'],
            ['362', 'U - macron'],
            ['257', 'a - macron'],
            ['275', 'e - macron'],
            ['299', 'i - macron'],
            ['333', 'o - macron'],
            ['363', 'u - macron']
        ]);
        $limitedConfig->setOption('valid_elements', '');
        $first = HTMLEditorField::create('Base', 'Base Language')
            ->setEditorConfig($limitedConfig)
            ->setRows(1);
        $second = HTMLEditorField::create('Destination', 'Destination Language')
            ->setEditorConfig($limitedConfig)
            ->setRows(1);
        $fields = new FieldList([
            $first,
            $second,
        ]);
        return $fields;
    }

    public function getCMSValidator()
    {
        return new RequiredFields(array('Base', 'Destination'));
    }

    public function onBeforeWrite()
    {
        parent::onBeforeWrite();
        $this->Base = strip_tags($this->Base);
        $this->Destination = strip_tags($this->Destination);
    }
}