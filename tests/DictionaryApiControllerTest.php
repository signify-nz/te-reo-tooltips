<?php

namespace Signify\TeReoTooltips\Tests;

use Signify\TeReoTooltips\Controllers\DictionaryApiController;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Dev\FunctionalTest;
use SilverStripe\Security\SecurityToken;
use SilverStripe\Security\Member;

class DictionaryApiControllerTest extends FunctionalTest
{

    public function indexTest()
    {
        $token = SecurityToken::inst()->getValue();
        $header = [
            'X-SecurityID: ' . $token,
        ];
        $index = $this->get('/api/v1/dictionary/index', null, $header);
        $this->assertEquals(400, $index->getStatusCode());
        // not a good test condition
        $this->assertNotEquals(null, $index->getBody());
    }

    public function dictionariesTest()
    {
        $token = SecurityToken::inst()->getValue();
        $header = [
            'X-SecurityID: ' . $token,
        ];
        $index = $this->get('/api/v1/dictionary/index', null, $header);
        $this->assertEquals(400, $index->getStatusCode());
    }

    public function testTranslateThroughInterface()
    {
        // We should see an error message, user not logged in
        $noAuth = $this->post('/api/v1/dictionary/translateThroughInterface');
        $this->assertEquals(400, $noAuth->getStatusCode());

        // We should see an error message, no security token provided
        $this->logInAs(Member::post()->first());
        $noToken = $this->get('/api/v1/dictionary/translateThroughInterface');
        $this->assertEquals(400, $noToken->getStatusCode());

        $token = SecurityToken::inst()->getValue();
        $header = [
            'X-SecurityID: ' . $token,
        ];
        $body = ' work ';
        $authorised = $this->post('/api/v1/dictionary/translateThroughInterface', null, $header, null, $body);
        $this->assertEquals(200, $authorised->getStatusCode());
        $this->assertEquals(' [TT]work[/TT] ', $authorised->getBody());

        // We should see an error message, wrong request type
        $wrongMethod = $this->get('/api/v1/dictionary/translateThroughInterface', null, $header);
        $this->assertEquals(400, $wrongMethod->getStatusCode());
    }

    public function addWordPairTest()
    {
        $token = SecurityToken::inst()->getValue();
    }
}
