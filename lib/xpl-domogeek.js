var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var http = require('http');

function wt(device, options) {
	options = options || {};
	this._options = options;
        
        this.basicFile = __dirname +"/../domogeek.basic";
        this.basicHash = [];    

        this.configFile = __dirname +"/../domogeek.config";
        this.configHash = [];    
        
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

                        console.log("XPL is ready");
                        callback(null,  self.xpl);
                });
        },

	_log: function() {
		if (!this._configuration.xplLog) {
			return;
		}
                
		console.log.apply(console, arguments);
	},

        _sendXplStat: function(body, schema) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema
                );
        },      
                
        /*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) console.log("file "+self.configFile+" is empty ...");
                        else self.configHash = JSON.parse(body);
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'domogeek.config');
        },
        
        writeConfig: function(body) {
                var self = this;
                self.configHash.enable = body.enable;
                self.configHash.interval = body.interval;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) console.log("file "+self.configFile+" was not saved to disk ...");
                });
        },

        /*
         *  Basic xPL message
         */
        
        readBasic: function(callback) {
                var self = this;
                fs.readFile(self.basicFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) console.log("file "+self.basicFile+" is empty ...");
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
        
        /*writeBasic: function(body) {
                var self = this;
                
                self._contains(body.type, function(found) {
                        if (found) {
                               self.configHash.forEach(function(item, index) {
                                    if(item.type == body.type){
                                        self.configHash[index].enable = body.enable;
                                        self.configHash[index].interval = body.interval;
                                    }
                                });
                        } else {
                                self.configHash.push({
                                        enable: body.enable,
                                        interval: body.interval
                                });
                        }
                });
                
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) console.log("file "+self.configFile+" was not saved to disk ...");
                });
        },*/
        
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
                                for (var key in current_tmp) {
                                     console.log(key + ' is ' + current_tmp[key]);
                                     data[key] = current_tmp[key];
                                }                                
                                self._sendXplStat(data, 'domogeek.basic');
                        })
                        res.on('error', function(e) {
                                console.log("Got error: " + e.message);
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
        },
                        
        validBasicSchema: function(body, callback) {
                if (typeof(body.type) !== "string") {
                        return false;
                }
                if (typeof(body.url) !== "string") {
                        return false;
                }
                return true;
        },
        
        validConfigSchema: function(body, callback) {
                var self = this;
                if (typeof(body.enable) !== "string") {
                        return false;
                }
                if (typeof(body.interval) !== "string") {
                        return false;
                }
                return true;
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
