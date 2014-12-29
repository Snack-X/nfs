var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var mime = require("mime");
var swig = require("swig");

var config = require("./config.json");
var tpl = swig.compileFile(__dirname + "/template.html");

http.createServer(server).listen(config.server.port);
console.log("NFS is running at port " + config.server.port);

function server(request, response) {
	var req = url.parse(request.url, true);

	var fileRoot = config.server.dir;
	var fileRequest = path.join("/", decodeURIComponent(req.pathname));
	var reqPath = path.join(fileRoot, fileRequest);

	if(!fs.existsSync(reqPath)) {
		// file is not found

		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("Not Found");
		response.end();
		return;
	}

	var stat = fs.statSync(reqPath);

	if(stat.isDirectory()) {
		// directory listing

		var _list = fs.readdirSync(reqPath);
		var list = [];

		for(var idx in _list) {
			var name = _list[idx];
			try {
				var _stat = fs.statSync(path.join(reqPath, name));

				if(_stat.isDirectory()) {
					list.push({
						name: name + "/",
						size: "-",
						date: _stat.mtime
					});
				}
				else {
					list.push({
						name: name,
						size: formatSize(_stat.size),
						date: _stat.mtime
					});
				}
			} catch(e) { }
		}

		response.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});
		response.write(tpl({
			directory: fileRequest.replace(/\\/g, "/"),
			entries: list
		}));
		response.end();
		return;
	}
	else {
		// file serve

		var readStream = fs.createReadStream(reqPath);

		readStream.on("open", function() {
			response.writeHead(200, {"Content-Type": mime.lookup(reqPath)});
			readStream.pipe(response);
		});

		readStream.on("error", function(err) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write("Internal Server Error");
			response.end(err);
			return;
		});
	}
}

function formatSize(size) {
	var postfix = ["", "KB", "MB", "GB", "TB"];
	var idx;
	for(idx = 0 ; idx < postfix.length && size > 1024 ; size /= 1024, idx++);

	size = Math.round(size * 100) / 100;
	return "" + size + postfix[idx];
}