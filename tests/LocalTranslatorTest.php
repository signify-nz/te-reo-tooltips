<?php

namespace Signify\TeReoTooltips\Tests;

use Signify\TeReoTooltips\Services\LocalTranslator;
use SilverStripe\Dev\SapphireTest;

class LocalTranslatorTest extends SapphireTest
{

    protected static $fixture_file = [
        'fixtures.yml'
    ];

    public function testTranslateWord()
    {
        $service = new LocalTranslator();
        $observed = $service->translateWord(
            'untranslated',
            $this->objFromFixture('Dictionary', 'testDictionary')->ID()
        );
        $expected = 'translated';
        $this->assertEquals($expected, $observed);
    }

    public function testTranslateBody()
    {
        $service = new LocalTranslator();
        $observed = $service->translateBody(
            'abcdef untranslated ghijkl',
            $this->objFromFixture('Dictionary', 'testDictionary')->ID()
        );
        $expected = 'abcdef translated ghijkl';
        $this->assertEquals($expected, $observed);
    }
}
