# xpl-domogeek

## Objective

Node JS module to get domogeek informations through xPL API
This module stores localy specifics url and it asks the online API every hour

## Installation

    $ git clone https://github.com/wiseflat/xpl-domogeek.git
    $ npm update

## Usage

You need to install the xPL_Hub first : https://github.com/Tieske/xPL4Linux

Send xpl-cmnd to get the configuration of the module

    $ xpl-send -m cmnd -c domogeek.request

Send xpl-cmnd to add/update a configuration

    $ xpl-send -m cmnd -c domogeek.config type=schoolholiday url="http://api.domogeek.fr/schoolholiday/A/now/json" enable=true
    $ xpl-send -m cmnd -c domogeek.config type=schoolholiday url="http://api.domogeek.fr/schoolholiday/B/now/json" enable=false
