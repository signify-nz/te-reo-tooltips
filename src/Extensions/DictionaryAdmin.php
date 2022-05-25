<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Admin\ModelAdmin;

class DictionaryAdmin extends ModelAdmin
{

    private static $menu_title = 'Dictionaries';

    private static $url_segment = 'dictionaries';

    private static $managed_models = [
        Dictionary::class,
    ];
}