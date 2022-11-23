<?php

namespace Signify\TeReoTooltips\Validators;

use SilverStripe\Forms\Validator;
use Signify\TeReoTooltips\Models\Dictionary;

/**
 * Validator for the bespoke validation of a WordPair.
 * This is for use within a {@link CompositeValidator} which does the internal validation.
 */
class WordPairValidator extends Validator
{
    private $target;
    private $filter;

    public function php($data)
    {
        // $valid = parent::php($data);
        $result = true;
        $this->target = strip_tags($data['Base']);
        $this->filter = [
            'Base:ExactMatch:case' => $this->target,
            'ID:ExactMatch:not' => $data['ID']
        ];
        $duplicate = Dictionary::get()->byID($data['DictionaryID'])->WordPairs()->filter($this->filter);
        if (
            $duplicate->exists()
        ) {
            // echo 'invalid';
            $result = false;
            $this->validationError(
                'Base',
                'This base word already exists!',
                'bad'
            );
        };
        if (str_contains($data['Base'], '​')) {
            $result = false;
            $this->validationError(
                'Base',
                'A base word must be a single word only with no spaces.',
                'bad'
            );
        };
        // foreach(Dictionary::get()->byID($data['DictionaryID'])->WordPairs() as $pair){
        //     if ($data['Base'] === $pair->Base){
        //         $result = false;
        //     }
        //     $this->validationError(
        //         'Base',
        //         'This base word already exists!',
        //         'bad'
        //     );
        // };
        return $result;
    }
}
