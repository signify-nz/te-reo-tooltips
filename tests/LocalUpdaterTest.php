<?php

namespace Signify\TeReoTooltips\Tests;

use Signify\TeReoTooltips\Services\LocalUpdater;
use SilverStripe\Dev\SapphireTest;

class LocalUpdaterTest extends SapphireTest
{

    protected static $fixture_file = [
        'fixtures.yml'
    ];

    public function testAddWordPair()
    {
        $service = new LocalUpdater();
        $observed = $service->addWordPair(
            'BaseTest',
            'DestinationTest',
            $this->objFromFixture('Dictionary', 'testDictionary')->ID()
        );
        $expected =
        $this->assertEquals('BaseTest', $observed);
        $this->assertEquals('DestinationTest', $observed);
    }
}
