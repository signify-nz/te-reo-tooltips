<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Injector\Injector;
use Signify\TeReoTooltips\Models\Dictionary;

class DictionaryApiController extends Controller
{
    private static $allowed_actions = [
        'index',
        'dictionaries',
        'translateThroughInterface',
        'addWordPair',
    ];

    public function index(HTTPRequest $request)
    {
        $dictionaries = Dictionary::get();
        $dictionaryList = [];

        foreach ($dictionaries as $dict) {
            array_push($dictionaryList, [
                'ID' => $dict->ID,
                'Title' => $dict->Title,
                'SourceLanguage' => $dict->SourceLanguage,
                'DestinationLanguage' => $dict->DestinationLanguage
            ]);
        }
        $dictionaryList = json_encode($dictionaryList);
        $this->getResponse()->setBody($dictionaryList);
        return $this->getResponse();
    }

    public function dictionaries(HTTPRequest $request)
    {
        $ID = $request->param('ID');
        if (is_numeric($ID)) {
            $dict = Dictionary::get_by_id($ID);
            $pairs = $dict->WordPairs();
            $pairList = [];
            foreach ($pairs as $pair) {
                array_push($pairList, [
                    'ID' => $pair->ID,
                    'Base' => $pair->Base,
                    'Destination' => $pair->Destination
                ]);
            }
            $pairList = json_encode($pairList);
            $this->getResponse()->setBody($pairList);
        } else {
            $dict = SiteConfig::current_site_config()->getField('Dictionary');
            $pairs = $dict->WordPairs();
            $pairList = [];
            foreach ($pairs as $pair) {
                array_push($pairList, [
                    'ID' => $pair->ID,
                    'Base' => $pair->Base,
                    'Destination' => $pair->Destination
                ]);
            }
            $pairList = json_encode($pairList);
            $this->getResponse()->setBody($pairList);
        };

        $this->getResponse()->addHeader("Content-type", "application/json");
        $this->getResponse()->addHeader(
            'Access-Control-Allow-Origin',
            "*"
        );
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "GET");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");

        return $this->getResponse();
    }

    public function translateThroughInterface(HTTPRequest $request)
    {
        $service = Injector::inst()->create('Signify\TeReoTooltips\Services\LocalService');
        $queryText = $request->getBody();
        $translation = $service->translateBody($queryText);
        $this->getResponse()->setBody($translation);
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "POST");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");
        return $this->getResponse();
    }

    public function addWordPair(HTTPRequest $request)
    {
        $id = $request->param('ID');
        $base = $request->getVar('base');
        $destination = $request->getVar('destination');
        $service = Injector::inst()->create('Signify\TeReoTooltips\Services\LocalService');
        $newPair = $service->addWordPair($base, $destination, $id);
        $response = [
            'ID' => $newPair->ID,
            'Base' => $newPair->Base,
            'Destination' => $newPair->Destination
        ];
        $response = json_encode($response);
        $this->getResponse()->setBody($response);
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "POST");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");
        return $this->getResponse();
    }
}
