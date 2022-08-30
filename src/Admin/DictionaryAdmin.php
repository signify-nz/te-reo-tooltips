<?php

namespace Signify\TeReoTooltips\Admin;

use SilverStripe\Security\Permission;
use SilverStripe\Forms\CheckBoxField;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\View\Requirements;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;
use SilverStripe\Forms\LabelField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\FormAction;
use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\Form;

/**
 * DictionaryAdmin
 *
 * Manages the user interface for the Te Reo Tooltips module
 */
class DictionaryAdmin extends LeftAndMain
{
    private static $url_segment = 'dictionaries';

    private static $url_rule = '/$Action/$ID/$OtherID';

    private static $menu_priority = -1;

    private static $menu_title = 'Dictionaries';

    // private static $menu_icon = 'framework/admin/images/menu-icons/16x16/gears.png';

    private static $tree_class = 'SiteConfig';

    private static $required_permission_codes = array('TOOLTIP_VIEW_OBJECTS');

    /**
     * Get the edit form for this section.
     *
     * @param null $id     Not used.
     * @param null $fields Not used.
     *
     * @return Form
     */
    public function getEditForm($id = null, $fields = null)
    {
        Requirements::css('signify-nz/te-reo-tooltips:client/dist/styles/main.css');

        $fields = FieldList::create();
        $fields = $this->addDictionaries($fields);
        $fields = $this->addButtons($fields);

        $actions = $this->getCMSActions();
        $form = Form::create(
            $this,
            'EditForm',
            $fields,
            $actions
        )->setHTMLID('Form_EditForm');

        $form->addExtraClass('flexbox-area-grow fill-height cms-content center cms-edit-form');
        $form->setTemplate($this->getTemplatesWithSuffix('_EditForm'));

        // Use <button> to allow full jQuery UI styling
        $actions = $actions->dataFields();
        if ($actions) {
            foreach ($actions as $action) {
                $action->setUseButtonTag(true);
            }
        }

        $this->extend('updateEditForm', $form);

        return $form;
    }

    public function addButtons($fields)
    {
        $siteConfig = SiteConfig::current_site_config();
        $fields->unshift(
            $fieldgroup = FieldGroup::create(
                CheckboxField::create('DarkTheme', 'Tooltip dark theme')
                    ->setValue($siteConfig->DarkTheme)
            ),
        );
        if ($siteConfig->Dictionaries()->exists()) {
            $fieldgroup->insertBefore(
                'DarkTheme',
                DropdownField::create('ActiveDictionaryID', 'Active Dictionary')
                    ->setSource($siteConfig->Dictionaries()->map('ID', 'Title'))
                    ->setValue(
                        $siteConfig->ActiveDictionary()->exists()
                        ? $siteConfig->ActiveDictionary()->ID
                        : $siteConfig->Dictionaries()->first()->ID
                    )
            );
            if (!$siteConfig->ActiveDictionary()->exists()) {
                $siteConfig->SetField('ActiveDictionary', $siteConfig->Dictionaries()->first()->ID);
                $fieldgroup->insertAfter(
                    'DarkTheme',
                    LabelField::create(
                        'No Active Dictionary Warning Label',
                        'No dictionary is currently selected as active.
                        Please choose one from the dropdown field and press \'Save\'.'
                    )
                );
            };
            if (!Permission::check('TOOLTIP_DICTIONARY_RIGHTS')) {
                $fieldgroup->setDisabled(true);
            };
        } else {
            $fieldgroup->insertBefore(
                'DarkTheme',
                LabelField::create('No Dictionary Warning Label', 'No dictionaries currently exist')
            );
        };
        return $fields;
    }


    public function addDictionaries($fields)
    {
        $config = GridFieldConfig_RecordEditor::create();
        $grid = GridField::create(
            'Dictionary',
            'Dictionaries Gridfield Title',
            SiteConfig::current_site_config()->Dictionaries()
        );

        $grid->setConfig($config);

        $fields->add($grid);

        return $fields;
    }

    public function getCMSActions()
    {
        if (Permission::check('ADMIN') || Permission::check('TOOLTIP_DICTIONARY_RIGHTS')) {
            $actions = new FieldList(
                FormAction::create('saveSiteConfig', _t('CMSMain.SAVE', 'Save'))
                    ->addExtraClass('btn btn-primary')
                    ->setAttribute('data-icon', 'accept')
            );
        } else {
            $actions = new FieldList();
        }

        $this->extend('updateCMSActions', $actions);

        return $actions;
    }

    /**
     * Save the current sites {@link SiteConfig} into the database.
     *
     * @param  array $data
     * @param  Form  $form
     * @return String
     */
    public function saveSiteConfig($data, $form)
    {
        $siteConfig = SiteConfig::current_site_config();
        $form->saveInto($siteConfig);

        try {
            $siteConfig->write();
        } catch (ValidationException $ex) {
            $form->sessionMessage($ex->getResult()->message(), 'bad');
            return $this->getResponseNegotiator()->respond($this->request);
        }

        $this->response->addHeader(
            'X-Status',
            rawurlencode(_t('LeftAndMain.SAVEDUP', 'Saved.'))
        );

        return $this->getResponseNegotiator()->respond($this->request);
    }

    /**
     * Show this admin area in all subsites.
     *
     * @return bool true
     */
    public function subsiteCMSShowInMenu()
    {
        return true;
    }
}
