/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"inc/inkthn/neo/NEO_VMS/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});