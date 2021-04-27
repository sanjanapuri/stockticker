var http = require('http');
var port = process.env.PORT || 3000; 
var fs = require('fs');
var qs = require('querystring');
const MongoClient = require('mongodb').MongoClient; 
const url = "mongodb+srv://sanjanapuri:Database2021!@cluster0.fb7r4.mongodb.net/hw14db?retryWrites=true&w=majority";

http.createServer(function (req, res) 
{
	  
	if (req.url == "/")
	{
		file = "form.html"; //show form on home page
		fs.readFile(file, function(err, txt) {
    		res.writeHead(200, {'Content-Type': 'text/html'});
          	res.write(txt);
          	res.end();
		});
	} else if (req.url == "/process") {
		res.writeHead(200, {'Content-Type':'text/html'});
		pdata = "";
		req.on('data', data => { //when we have data 
           pdata += data.toString();
        });


        req.on('end', () => { //when there is nothing left
			pdata = qs.parse(pdata);
			var origquery = pdata["entry"]; 
			var query = pdata["entry"];
			//if stock ticker data is lowercase 
			if(pdata['t_or_n'] == "ticker"){
				query = query.toUpperCase(); 
			}  
			var theQuery = ""; 
			if(pdata['t_or_n'] == "company"){
				theQuery = {company:query};
			} else {
				theQuery = {ticker:query};
			}

			MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    			if(err) { 
					console.log("Connection err: " + err); return; 
				}
  
    			var dbo = db.db("hw14db");
				var coll = dbo.collection('companies');
				console.log("before find");
				console.log(theQuery); 
				coll.find(theQuery).toArray(function(err, items) {
	  				if (err) {
						console.log("Error: " + err);
	  				} else {
						console.log("collecting items");
						res.write("<h1>Results</h1>");
						if(items.length == 0){
							if(pdata["t_or_n"] == "ticker"){
								res.write("No ticker data for '" + origquery + "'"); 
							} else {
								res.write("No company data for '" + origquery + "'"); 
							}
						} else {
							for (i=0; i<items.length; i++){
								res.write(i+1 + ".) " + items[i].company + ", " + items[i].ticker);
								res.write("<br>"); 				
							}
						}
						res.end(); 
	  				}   
					console.log("after close");
				});  //end find		
			});  //end connect
		});
	}
	else {
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write ("Unknown page request");
		res.end();
	}
  

}).listen(port); //listen(8080)