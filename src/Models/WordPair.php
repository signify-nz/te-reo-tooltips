<?php

namespace Signify\TeReoTooltips\Models;

use SilverStripe\ORM\ArrayLib;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Security\Permission;

class WordPair extends DataObject
{

    private static $table_name = 'Signify_WordPair';

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

    private static $api_access = true;

    public function canView($member = null)
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canEdit($member = null)
    {
        return Permission::check('TOOLTIP_WORDPAIR_RIGHTS', 'any', $member);
    }

    public function canDelete($member = null)
    {
        return Permission::check('TOOLTIP_WORDPAIR_RIGHTS', 'any', $member);
    }

    public function canCreate($member = null, $context = [])
    {
        return Permission::check('TOOLTIP_WORDPAIR_RIGHTS', 'any', $member);
    }

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

    public function validate()
    {
        $result = parent::validate();

        if (
            $this->Dictionary()->WordPairs()->filter([
            'Base' => $this->Base,
            'ID:ExactMatch:not' => $this->ID
            ])->exists()
        ) {
            $result->addError('This base word already exists!');
        }
        if (preg_match('/\s/', $this->Base)) {
            $result->addError('A base word must be a single word only with no spaces.');
        }
        return $result;
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
