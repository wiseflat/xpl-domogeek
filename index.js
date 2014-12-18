var xpldomogeek = require("./lib/xpl-domogeek");

var wt = new xpldomogeek(null, {
	//xplSource: 'bnz-ipx800.wiseflat'
});

wt._init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}
        
        wt.getLocalConfig();

        setInterval(function(){
                wt.sendCommands();
        }, 30 * 1000);  
        
        /*xpl.on("xpl:domogeek.config", function(evt) {
		console.log("Receive message domogeek.config ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        }); 

        xpl.on("xpl:domogeek.request", function(evt) {
		console.log("Receive message domogeek.request ", evt);
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });*/
});

