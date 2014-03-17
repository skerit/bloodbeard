/**
 * Server
 *
 * The place where the magic starts
 *
 * Alchemy: a node.js framework
 * Copyright 2013, Jelle De Loecker
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2013, Jelle De Loecker
 * @link          
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
require('alchemymvc');
var NNTP = require('nntp'),
    async = alchemy.use('async'),
    rxName = /"(.*)"/g;

var releases = {};
var c = new NNTP();

c.on('ready', function() {
	c.groups('alt.binaries.hdtv*', function(err, list) {
	if (err) throw err;
	pr(list);
	});

	c.group('alt.binaries.hdtv.x264', function(err, count, first, last) {

		var tasks = [];

		pr('Preparing ' + (last-first) + ' articles');

		for (var i = first; i < first+500; i++) {

			(function(articlenr) {
				tasks[tasks.length] = function(next) {

					c.headers(articlenr, function (err, articleNr, msgId, headers){
						
						var subject,
						    releaseName;
						
						if (headers) {
							subject = headers.subject[0];

							releaseName = /"(.*)"/g.exec(subject);

							if (releaseName && releaseName[1]) {
								releaseName = releaseName[1];
							}

							releaseName = releaseName.split(/\.par|\.vol/)[0];

							if (!releases[releaseName]) {
								releases[releaseName] = [];
							}

							releases[releaseName].push(subject);

						} else {
							pr(articlenr + ' not found!')
						}
						next();
					});

				};
			}(i))
		}

		pr('Launching async');

		async.parallel(tasks, function() {
			pr(releases, true)
		});

		

	});

});

c.on('error', function(err) {
	console.log('Error: ' + err);
});

c.on('close', function(had_err) {
	console.log('Connection closed');
});

c.connect({
	host: alchemy.settings.config.usenet.server,
	user: alchemy.settings.config.usenet.username,
	password: alchemy.settings.config.usenet.password
});

alchemy.ready(function onAlchemyReady() {

	// Do certain things when alchemy is ready


});