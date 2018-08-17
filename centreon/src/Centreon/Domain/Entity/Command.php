<?php

namespace Centreon\Domain\Entity;

class Command
{
    CONST COMMAND_START_IMPEX_WORKER = 'START_IMPEX_WORKER';

    /**
     * @var string
     */
    private $commandLine;

    /**
     * @return string
     */
    public function getCommandLine(): string
    {
        return $this->commandLine;
    }

    /**
     * @param string $commandLine
     */
    public function setCommandLine(string $commandLine): void
    {
        $this->commandLine = $commandLine;
    }

}