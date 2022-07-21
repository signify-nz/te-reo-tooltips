<?php
// Definitely rename this file, updaterInterface?

namespace Signify\TeReoTooltips\Services;

interface UpdaterInterface
{
    public function addWordPair($base, $destination, $ID);
    //create a new wordPair object
}
