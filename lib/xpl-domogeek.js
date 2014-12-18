var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var http = require('http');

function wt(device, options) {
	options = options || {};
	this._options = options;
        this.configFile = "./domogeek.config";
        this.config = {};
        
	options.xplSource = options.xplSource || "bnz-domogeek."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        _init: function(callback) {
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

        contains: function(type, callback) {
            var self = this;
            var ok = false;
            self.config.forEach(function(item, index) {
                if(item.type == type) ok=true;
            });
            return callback(ok);
        },
        
        writeConfig: function(body) {
                var self = this;
                
                self.contains(body.type, function(found) {
                        if (found) {
                               //console.log("new config Found. Need to update");
                               self.config.forEach(function(item, index) {
                                    if(item.type == body.type){
                                        self.config[index].url = body.url;
                                        self.config[index].enable = body.enable;
                                    }
                                });
                        } else {
                                //console.log("New config not found. Need to add");
                                self.config.push({
                                        type: body.type,
                                        url: body.url,
                                        enable: body.enable
                                });


                        }
                });
                
                fs.writeFile(self.configFile, JSON.stringify(self.config), function(err) {
                        if(err) {
                            self.sendNoConfig();
                        } else {
                            self.readConfig();
                        }
                });
        },
                
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                self.sendNoConfig();
                        }
                        else {
                                self.config = JSON.parse(body);
                                self.config.forEach(function(item, index) {
                                        self.sendConfig(item.type, item.url, item.enable);
                                });
                        }
                });
        },
     
        sendHttpRequest: function(type, url, callback){
                var self = this;
                return http.get(url, function(res) {
                        var body = "";
                        res.on('data', function(data) {
                                body += data; 
                        });
                        res.on('end', function() {
                                body.replace("'","");
                                var data = JSON.parse(body);
                                data.device = "domogeek";
                                data.type = type;
                                self.sendBasic(data);
                        })
                        res.on('error', function(e) {
                                console.log("Got error: " + e.message);
                        });
                });
        },    
        
        sendCommands: function(url, callback){
                var self = this;
                if (typeof self.config !== 'undefined'){
                        self.config.forEach(function(item, index) {
                                if(item.enable == "true" || item.enable == true) self.sendHttpRequest(item.type, item.url);
                        });   
                }
        },    
        
        /*getLocalConfig: function(){
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                self.sendNoConfig();
                        }
                        else {
                                self.config = JSON.parse(body);
                                var data = JSON.parse(body);
                                data.forEach(function(item, index) {
                                        self.sendConfig(item.type, item.url, item.enable);
                                });
                        }
                });
        },*/
          
        sendBasic: function(data) {
                var self = this;                
                self.xpl.sendXplStat(
                        data
                        , 'domogeek.basic');
        },
        
        sendConfig: function(type, url, enable) {
                var self = this;                
                self.xpl.sendXplStat({
                        type:       type,
                        url:        url,
                        enable:     enable
                }, 'domogeek.config');
        },
        
        sendNoConfig: function() {
                var self = this;
                self.xpl.sendXplStat({
                        config:      'noconfig'
                }, 'domogeek.config');
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
                if (typeof(body.type) !== "string") {
                        return false;
                }
                if (typeof(body.url) !== "string") {
                        return false;
                }
                if (typeof(body.enable) !== "string") {
                        return false;
                }
                return true;
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
