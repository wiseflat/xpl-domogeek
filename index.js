var xpldomogeek = require("./lib/xpl-domogeek");

var wt = new xpldomogeek(null, {
	xplLog: false,
	forceBodySchemaValidation: false
});

wt.init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}
        
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
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        });
    
});

