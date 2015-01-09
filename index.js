var xpldomogeek = require("./lib/xpl-domogeek");

var wt = new xpldomogeek(null, {
	//xplSource: 'bnz-ipx800.wiseflat'
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
        }, 60 * 1000);

        setInterval(function(){
                wt.sendBasic();
        }, 3600 * 1000);
        
        xpl.on("xpl:domogeek.request", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.sendConfig();
        });
        
        /*xpl.on("xpl:domogeek.config", function(evt) {
		//console.log("Receive message domogeek.config ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        }); */
    
});

