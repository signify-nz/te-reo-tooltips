<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Injector\Injector;
use Signify\TeReoTooltips\Models\Dictionary;
use SilverStripe\Control\Director;
use SilverStripe\Security\Security;
use SilverStripe\Security\SecurityToken;

class DictionaryApiController extends Controller
{
    private static $allowed_actions = [
        'index',
        'dictionaries',
        'translateThroughInterface',
        'addWordPair',
    ];

    private function authorisedUser(){
        if( !Security::getCurrentUser() ) {
            $this->setResponse(new HTTPResponse("You must be logged in to use this feature.", 401));
            return false;
        }
        return true;
    }

    public function index(HTTPRequest $request)
    {
        if (!$request->isGET()){
            return $this->httpError(400, "Access denied");
        }
        if(!SecurityToken::inst()->checkRequest($request)){
            return $this->httpError(400, "Access denied");
        };
        if(!$this->authorisedUser()){
            return $this->getResponse();
        };
        // TODO this should reference the current site config and only get related dictionaries
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
        if (!$request->isGET()){
            return $this->httpError(400, "Access denied");
        }
        if(!SecurityToken::inst()->checkRequest($request)){
            return $this->httpError(400, "Access denied");
        };
        if(!$this->authorisedUser()){
            return $this->getResponse();
        };
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
            //this needs to handle the event where no such dictionary exists
            $dict = SiteConfig::current_site_config()->getField('ActiveDictionary');
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
        $this->getResponse()->addHeader("Access-Control-Allow-Origin", Director::absoluteBaseURL());
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "GET");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");

        return $this->getResponse();
    }

    public function translateThroughInterface(HTTPRequest $request)
    {
        if (!$request->isPOST()){
            return $this->httpError(400, "Access denied");
        }
        if(!SecurityToken::inst()->checkRequest($request)){
            return $this->httpError(400, "Access denied");
        };
        if(!$this->authorisedUser()){
            return $this->getResponse();
        };
        $service = Injector::inst()->create('Signify\TeReoTooltips\Services\LocalTranslator');
        $queryText = $request->getBody();
        $translation = $service->translateBody($queryText);
        $this->getResponse()->setBody($translation);
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "POST");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");
        return $this->getResponse();
    }

    public function addWordPair(HTTPRequest $request)
    {
        if(!$this->authorisedUser()){
            return $this->getResponse();
        };
        if(!SecurityToken::inst()->checkRequest($request)){
            return $this->httpError(400, "Access denied");
        };
        if (!$request->isPOST()){
            return $this->httpError(400, "Access denied");
        }
        $body = json_decode($request->getBody(), true);
        $base = $body['baseWord'];
        $destination = $body['destinationWord'];
        $id = $request->param('ID');
        $service = Injector::inst()->create('Signify\TeReoTooltips\Services\LocalUpdater');
        $newPair = $service->addWordPair($base, $destination, $id);
        if (!$newPair){
            $this->setResponse(new HTTPResponse("Unable to process this request.", 400));
            return $this->getResponse();
        }
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
