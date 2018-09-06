-- Change version of Centreon
UPDATE `informations` SET `value` = '18.9.0' WHERE CONVERT( `informations`.`key` USING utf8 ) = 'version' AND CONVERT ( `informations`.`value` USING utf8 ) = '2.8.25' LIMIT 1;

-- Create remote servers table for keeping track of remote instances
CREATE TABLE IF NOT EXISTS `remote_servers` (
`id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
`ip` VARCHAR(16) NOT NULL,
`app_key` VARCHAR(40) NOT NULL,
`version` VARCHAR(16) NOT NULL,
`is_connected` TINYINT(1) NOT NULL DEFAULT 0,
`created_at` TIMESTAMP NOT NULL,
`connected_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Add column to topology table to mark which pages are with React
ALTER TABLE `topology` ADD COLUMN `is_react` ENUM('0', '1') NOT NULL DEFAULT '0' AFTER `readonly`;

-- Move "Graphs" & "Broker Statistics" as "Server status" sub menu
UPDATE topology SET topology_parent = '505' WHERE topology_page = '10205';
UPDATE topology SET topology_page = '50501' WHERE topology_page = '10205' and topology_parent = '505';
UPDATE topology SET topology_parent = '505' WHERE topology_page = '10201';
UPDATE topology SET topology_page = '50502' WHERE topology_page = '10201' and topology_parent = '505';

-- Remane "Graphs" menu to "Engine Statistics"
UPDATE topology SET topology_name = 'Engine Statistics' WHERE topology_page = '50502';

-- Rename "Server Status" to "Platform Status"
UPDATE topology SET topology_name = 'Platform Status' WHERE topology_page = '505';

-- Change default page of "Platform Status" menu to "Broker Statistics"
UPDATE topology SET topology_url = './include/Administration/brokerPerformance/brokerPerformance.php' WHERE topology_page = '505' AND topology_name = 'Platform Status';

-- Delete old entries
DELETE FROM topology WHERE topology_page = '102';

-- Remove Zend support
DELETE FROM `options` WHERE `key` = 'backup_zend_conf';
