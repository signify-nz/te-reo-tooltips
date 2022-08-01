<?php

namespace Signify\TeReoTooltips\Tests;

use Signify\TeReoTooltips\Controllers\DictionaryApiController;
use Signify\TeReoTooltips\Models\Dictionary;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Dev\FunctionalTest;
use SilverStripe\Security\SecurityToken;
use SilverStripe\Security\Member;

class DictionaryApiControllerTest extends FunctionalTest
{
    public function testIndex()
    {
        SecurityToken::enable();
        // We should see an error response, wrong request type
        $wrongMethod = $this->post('/api/v1/dictionary/index', null);
        $this->assertEquals(400, $wrongMethod->getStatusCode());

        // We should see an error response, no security token provided
        $noToken = $this->get('/api/v1/dictionary/index', null);
        $this->assertEquals(400, $noToken->getStatusCode());

        // We should see an error response, user not logged in
        $headers = [
            'X-SecurityID' => SecurityToken::inst()->getValue(),
        ];
        $noMember = $this->get('/api/v1/dictionary/index', null, $headers);
        $this->assertEquals(401, $noMember->getStatusCode());

        // Should successfully access API
        $this->logInAs(Member::get()->first());
        $authorized = $this->get('/api/v1/dictionary/index', null, $headers);
        $this->assertNotEquals(null, $authorized->getBody());
        $this->assertNotEquals(400, $authorized->getStatusCode());
        $this->assertNotEquals(401, $authorized->getStatusCode());
    }

    public function testDictionaries()
    {
        $this->logInAs(Member::get()->first());
        $dictRequest = $this->get('/api/v1/dictionary/dictionaries', null);
        $data = json_decode($dictRequest->getBody(), true);
        $this->assertArrayHasKey('ID', $data[0]);
        $this->assertArrayHasKey('Base', $data[0]);
        $this->assertArrayHasKey('Destination', $data[0]);
    }

    public function testTranslateThroughInterface()
    {
        $this->logInAs(Member::get()->first());
        $body = ' work ';
        $authorised = $this->post('/api/v1/dictionary/translateThroughInterface', null, null, null, $body);
        $this->assertEquals(' [TT]work[/TT] ', $authorised->getBody());
    }

    public function testAddWordPair()
    {
        $this->loadFixture('fixtures.yml');
        $this->logInAs(Member::get()->first());
        $values = [
            'baseWord' => 'Work',
            'destinationWord' => 'Mahi'
        ];
        $body = json_encode($values);
        $newWord = $this->post('/api/v1/dictionary/addWordPair/999', null, null, null, $body);
        $data = json_decode($newWord->getBody(), true);
        $this->assertArrayHasKey('ID', $data[0]);
        $this->assertArrayHasKey('Base', $data[0]);
        $this->assertArrayHasKey('Destination', $data[0]);
        $testDict->Dictionaries->get_by_id($data[0][ID])->destroy();
    }
}
