var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var http = require('http');

function wt(device, options) {
	options = options || {};
	this._options = options;
        this.configFile = "./domogeek.config";
        this.server = {};
        this.config = 0;
        
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

        writeConfig: function(body) {
                var self = this;
                fs.writeFile(self.configFile, JSON.stringify(body), function(err) {
                        if(err) {
                            self.sendNoConfig();
                        } else {
                            self.getLocalConfig();
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
                                self.sendConfig(JSON.parse(body));
                        }
                });
        },
        
        setServerConfig: function(body){
            var self = this;
            this.server = {
                    host:       "http://api.domogeek.fr/",
                    port:       80,
                    path:       '',
                    /*headers: {
                            'Authorization': 'Basic ' + new Buffer(body.username + ':' + body.password).toString('base64')
                          }*/
             };
             self.config=1;
        },
        
        sendCommand: function(device, action, callback){
                var self = this;
                self.server.path = self.server.path+device+"="+action;
                
                if(self.config){
                        return http.get(self.server, function(res) {
                            // Continuously update stream with data
                                var body = "";
                                res.on('data', function(data) {
                                    body += data;
                                });
                                res.on('end', function() {
                                    console.log(body);
                                })
                                res.on('error', function(e) {
                                    console.log("Got error: " + e.message);
                                });
                        });
                }
                else {
                    self.sendNoConfig();
                }
                
        },    
        
        getLocalConfig: function(){
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                //self.sendNoConfig();
                                console.log("no config for domogeek.basic");
                        }
                        else {
                                //self.setServerConfig(JSON.parse(body));
                                //self.sendConfig(JSON.parse(body));
                                body.forEach(function(item, index) {
                                        console.log(item.label);
                                        console.log(item.url);
                                        console.log(item.enable);
                                    // `item` is the next item in the array
                                    // `index` is the numeric position in the array, e.g. `array[index] == item`
                                  });
                        }
                });
        },
          
        sendConfig: function(body) {
                var self = this;                
                self.xpl.sendXplStat({
                        host:       body.host,
                        port:       body.port,
                        username:   body.username,
                        password:   body.password
                }, 'ipx800.config');
        },
        
        sendNoConfig: function() {
                var self = this;
                self.xpl.sendXplStat({
                        host:       '',
                        port:       '',
                        username:   '',
                        password:   ''
                }, 'ipx800.config');
        },
                
        validBasicSchema: function(body, callback) {
                if (typeof(body.device) !== "string") {
                        //return callback("text invalid :"+body.text);
                        return false;
                }
                if (typeof(body.current) !== "string") {
                        //return callback("from invalid :"+body.from);
                        return false;
                }
                return true;
        },
        
        validConfigSchema: function(body, callback) {
                var self = this;
                if (typeof(body.label) !== "string") {
                        return false;
                }
                if (typeof(body.value) !== "string") {
                        return false;
                }
                return true;
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
