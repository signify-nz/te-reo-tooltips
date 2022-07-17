<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\SiteConfig\SiteConfig;


class DictionaryApiController extends Controller
{

    private static $allowed_actions = [
        'index',
        'dictionaries',
        'translateThroughInterface',
        'addWordPair',
        'translateByWord',
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
        $service = new LocalService;
        $queryText = $request->getBody();
        $translation = $service->translateBody($queryText);
        $this->getResponse()->setBody($translation);
        return $this->getResponse();
    }

    public function translateByWord(HTTPRequest $request)
    {
        $service = new LocalService;
        $untranslatedList = explode('---', $request->getVar('text'));
        $translatedList = [];
        foreach ($untranslatedList as $baseWord) {
            $destinationWord = $service->translateWord($baseWord);
            array_push($translatedList, [
                'original' => $baseWord,
                'new' => $destinationWord
            ]);
        }
        $translatedList = json_encode($translatedList);
        $this->getResponse()->setBody($translatedList);
        return $this->getResponse();
    }

    public function addWordPair(HTTPRequest $request)
    {
        $id = $request->param('ID');
        $base = $request->getVar('base');
        $destination = $request->getVar('destination');
        $service = new LocalService;
        $newPair = $service->addWordPair($base, $destination, $id);
        $response = [
            'ID' => $newPair->ID,
            'Base' => $newPair->Base,
            'Destination' => $newPair->Destination
        ];
        $response = json_encode($response);
        $this->getResponse()->setBody($response);
        return $this->getResponse();
    }
}
