<?php

namespace Signify\TeReoTooltips\Controllers;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Injector\Injector;
use Signify\TeReoTooltips\Models\Dictionary;
use Signify\TeReoTooltips\Services\LocalUpdater;
use Signify\TeReoTooltips\Services\LocalTranslator;
use SilverStripe\Control\Director;
use SilverStripe\Security\Permission;
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

    /**
     * Checks if a user is logged into the CMS
     *
     * @return boolean
     */
    private function authorisedUser()
    {
        if (!Security::getCurrentUser()) {
            $this->setResponse(new HTTPResponse("You must be logged in to use this feature.", 401));
            return false;
        }
        return true;
    }

    /**
     * Retrieves a list of Dictionaries associated with the SiteConfig
     *
     * @param  HTTPRequest $request
     * Required headers:
     * - X-SecurityID
     * @return HTTPResponse
     * JSON formatted response
     */
    public function index(HTTPRequest $request)
    {
        if (!$request->isGET() || !SecurityToken::inst()->checkRequest($request)) {
            return $this->httpError(400, "Access denied");
        }
        if (!$this->authorisedUser()) {
            return $this->getResponse();
        };
        $dictionaries = SiteConfig::current_site_config()->Dictionaries();

        if ($dictionaries) {
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
        } else {
            $this->getResponse()->setBody(null);
        }
        return $this->getResponse();
    }

    /**
     * Retrieves a specific Dictionary Object from SiteConfig
     *
     * If an ID parameter is provided the matching Dictionary will be queried and returned.
     * If no ID is provided the current active Dictionary will be queried and returned.
     *
     * @param  HTTPRequest $request
     * Required headers:
     * - X-SecurityID
     * @return HTTPResponse
     * JSON formatted response
     */
    public function dictionaries(HTTPRequest $request)
    {
        if (!$request->isGET() || !SecurityToken::inst()->checkRequest($request)) {
            return $this->httpError(400, "Access denied");
        }
        if (!$this->authorisedUser()) {
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

    /**
     * Queries a translation service and returns text with shortcodes wrapped around translatable words.
     *
     * @param  HTTPRequest $request
     * Requires header => X-SecurityID
     * @return HTTPResponse
     * JSON formatted response
     */
    public function translateThroughInterface(HTTPRequest $request)
    {
        if (!$request->isPOST() || !SecurityToken::inst()->checkRequest($request)) {
            return $this->httpError(400, "Access denied");
        }
        if (!$this->authorisedUser()) {
            return $this->getResponse();
        };
        $service = Injector::inst()->get(LocalTranslator::class);
        $queryText = $request->getBody();
        $translation = $service->translateBody($queryText);
        $this->getResponse()->setBody($translation);
        $this->getResponse()->addHeader("Access-Control-Allow-Methods", "POST");
        $this->getResponse()->addHeader("Access-Control-Allow-Headers", "x-requested-with");
        return $this->getResponse();
    }

    /**
     * Makes a request to create a new WordPair object and associate with a Dictionary object.
     *
     * @param  HTTPRequest $request
     * @return HTTPResponse
     */
    public function addWordPair(HTTPRequest $request)
    {
        if (!$this->authorisedUser()) {
            return $this->getResponse();
        };
        if (!$request->isPOST() || !SecurityToken::inst()->checkRequest($request)) {
            return $this->httpError(400, "Access denied");
        }
        if (!Permission::check('TOOLTIP_WORDPAIR_RIGHTS')) {
            return $this->httpError(400, "Access denied");
        };
        $body = json_decode($request->getBody(), true);
        $base = $body['baseWord'];
        $destination = $body['destinationWord'];
        $id = $request->param('ID');
        $service = Injector::inst()->get(LocalUpdater::class);
        $newPair = $service->addWordPair($base, $destination, $id);
        if (!$newPair) {
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
