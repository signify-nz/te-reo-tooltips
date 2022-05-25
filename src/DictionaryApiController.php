<?php

namespace Signify\TeReoTooltips;

use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Controller;

class DictionaryApiController extends Controller
{

    //Consider defining one service for all functions to use.

    private static $allowed_actions = [
        'index',
        'dictionaries',
        'associatedWordPairs',
        'translateThroughInterface',
        'addWordPair',
        'translateByWord',
    ];

    public function index(HTTPRequest $request)
    {
        $this->getResponse()->setStatusCode(404);
        return json_encode(["error" => "Something went very wrong.", "id" => 12]);
    }

    public function dictionaries(HTTPRequest $request)
    {
        //If dictionary ID is provided, return all wordpairs associated to that dictionary. Otherwise return list of dictionaries.
        if ($request->param('ID')) {
            $dict = Dictionary::get_by_id($request->param('ID'));
            $pairs = $dict->WordPair();
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

    //takes entire body of text and returns with shortcodes inserted where appropriate
    //This does not scale and will break if text body is too large
    public function translateThroughInterface(HTTPRequest $request)
    {
        $service = new LocalService;
        $queryText = $request->getVar('text');
        $translation = $service->translateBody($queryText, $request->param('ID'));
        //this is a dummy error function
        if ($translation == 'Error 404') {
            $this->getResponse()->setStatusCode(404);
            return $translation;
        }
        $this->getResponse()->setBody($translation);
        //Debug::dump($queryText);
        return $this->getResponse();
    }

    // translate and return only selected words, an attempt to address scalability
    // TODO decide if this takes a language argument
    // implement an index argument, this means that js doesn't need to hold on to position?
    // is a hyphen sensible to split?
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
        //TODO if falsy, return error? already somewhat validated in js
        $base = $request->getVar('base');
        $destination = $request->getVar('destination');
        $service = new LocalService;
        $service->addWordPair($base, $destination);
        return $this->getResponse();
    }
}
