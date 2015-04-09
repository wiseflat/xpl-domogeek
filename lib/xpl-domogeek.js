var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var http = require('http');
var pjson = require('../package.json');

function wt(device, options) {
	options = options || {};
	this._options = options;
        
	this.basicFile = "/etc/wiseflat/domogeek.basic.json";
        this.basicHash = [];    

        this.configFile = "/etc/wiseflat/domogeek.config.json";
        this.configHash = [];    
        
	this.version = pjson.version;
	
	options.xplSource = options.xplSource || "bnz-domogeek."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }
                        callback(null,  self.xpl);
                });
        },

	_log: function(log) {
		/*if (!this._configuration.xplLog) {
			return;
		}*/
                
		console.log('xpl-domogeek -', log);
	},

        _sendXplStat: function(body, schema) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema
                );
        },
          
	readTarget: function(target){
		var self = this;
		if (target && typeof (target) == "string" && self.xpl._configuration.xplSource != target) {
			return false;
		}
		else return true;
	},
	
        /*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.configFile+" is empty ...");
                        else self.configHash = JSON.parse(body);
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'domogeek.config');
        },
        
        writeConfig: function(evt) {
                var self = this;
		
		self.configHash.version = self.version;
                self.configHash.enable = evt.body.enable;
                self.configHash.interval = evt.body.interval;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) self._log("file "+self.configFile+" was not saved to disk ...");
			else self._sendXplStat(self.configHash, 'domogeek.config');
                });
        },

        /*
         *  Basic xPL message
         */
        
        readBasic: function(callback) {
                var self = this;
                fs.readFile(self.basicFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.basicFile+" is empty ...");
                        else self.basicHash = JSON.parse(body);
                });
        },

        sendBasic: function(callback) {
                var self = this;
                if (typeof self.basicHash !== 'undefined'){
                        self.basicHash.forEach(function(item, index) {
                                self._httpRequest(item.type, item.url);
                        });
                }
        },
        
        /*
         *  Plugin specifics functions
         */
        
        _httpRequest: function(type, url, callback){
                var self = this;
                return http.get(url, function(res) {
                        var body = "";
                        res.on('data', function(data) {
                                body += data; 
                        });
                        res.on('end', function() {
                                body.replace("'","");
                                var data = {};
                                data.device = type;
                                var current_tmp = JSON.parse(body);                                
                                for (var key in current_tmp) 
                                        data[key] = current_tmp[key];   
                                self._sendXplStat(data, 'domogeek.basic');
                        })
                        res.on('error', function(e) {
                                self._log("Got error: " + e.message);
                        });
                });
        },    
                  
        _contains: function(type, callback) {
                var self = this;
                var ok = false;
                self.config.forEach(function(item, index) {
                    if(item.type == type) ok=true;
                });
                return callback(ok);
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
