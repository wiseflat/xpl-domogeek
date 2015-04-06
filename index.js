var xpldomogeek = require("./lib/xpl-domogeek");
var schema_domogeekbasic = require('/etc/wiseflat/schemas/domogeek.basic.json');
var schema_domogeekconfig = require('/etc/wiseflat/schemas/domogeek.config.json');

var wt = new xpldomogeek(null, {
	xplLog: false,
	forceBodySchemaValidation: false
});

wt.init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}
        
	xpl.addBodySchema(schema_domogeekbasic.id, schema_domogeekbasic.definitions.body);
	xpl.addBodySchema(schema_domogeekconfig.id, schema_domogeekconfig.definitions.body);
	
        // Load config file into hash
        wt.readConfig();
        wt.readBasic();
        
        // Send every minutes an xPL status message 
        setInterval(function(){
                wt.sendConfig();
                wt.sendBasic();
        }, 30 * 1000);
        
        xpl.on("xpl:domogeek.request", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.sendConfig();
        });
        
        xpl.on("xpl:domogeek.config", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.writeConfig(evt.body);
        });
    
});

