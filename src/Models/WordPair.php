<?php

namespace Signify\TeReoTooltips\Models;

use SilverStripe\ORM\ArrayLib;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorConfig;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Security\Permission;
use Signify\TeReoTooltips\Validators\WordPairValidator;
use SilverStripe\Forms\CompositeValidator;
use SilverStripe\ORM\ValidationResult;

/**
 * WordPair
 *
 * An object to define the relationship between a word and a translation of that word
 */
class WordPair extends DataObject
{

    private static $table_name = 'Signify_WordPair';

    // Do these need to be HTMLVarchar anymore?
    // You strip tags throughout your program but I don't think you ever use them
    // Consider changing to Text or Varchar
    private static $db = [
        'Base' => 'HTMLVarchar',
        'Destination' => 'HTMLVarchar',
        'DestinationAlternate' => 'HTMLVarchar',
        'Sort' => 'Int',
    ];

    private static $default_sort = [
        'Sort ASC'
    ];

    private static $has_one = [
        'Dictionary' => Dictionary::class,
    ];

    private static $summary_fields = [
        'Base' => 'Base Language',
        'Destination' => 'Destination Language',
        'DestinationAlternate' => 'Alternate Translation',
    ];

    private static $api_access = true;

    public function canView($member = null)
    {
        return Permission::check('TOOLTIP_VIEW_OBJECTS', 'any', $member);
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
        $fields = parent::getCMSFields();
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
        // Hidden fields are generated to pass info to the custom validator
        $third = HiddenField::create('DictionaryID', 'Dictionary ID');
        $fourth = HiddenField::create('ID', 'ID');
        $fifth = HTMLEditorField::create('DestinationAlternate', 'Destination Language (optional)')
        ->setEditorConfig($limitedConfig)
        ->setDescription('Use this field if you would like to specify an alternate way of displaying a translated word. This will only be used when you translate a base word using different capitalisation.')
        ->setRows(1);
        $fields = new FieldList([
            $first,
            $second,
            $third,
            $fourth,
            $fifth
        ]);

        return $fields;
    }

    // Allows validation when additions are made from the text editor
    public function validate()
    {
        $result = ValidationResult::create();

        if (
            $this->Dictionary()->WordPairs()->filter([
            'Base' => $this->Base,
            'ID:ExactMatch:not' => $this->ID
            ])->exists()
        ) {
            return $result->addError('This base word/phrase already exists!');
        }
        if (str_contains($this->Base, '​') || str_contains($this->Base, PHP_EOL))) {
            return $result->addError('A base word/phrase not contain any new lines or abnormal spaces.');
        }
        if (strlen($this->Base) > 50) {
            return $result->addError('A base word/phrase is limited to 50 characters.');
        }
        return $result;
    }

    // Allows validation in the modelAdmin
    public function getCMSCompositeValidator(): CompositeValidator
    {
        $validator = parent::getCMSCompositeValidator();
        $validator->addValidator(
            WordPairValidator::create()
        );
        return $validator;
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
        $this->DestinationAlternate = strip_tags($this->DestinationAlternate);
        $this->Sort = strlen($this->Base);
    }
}
