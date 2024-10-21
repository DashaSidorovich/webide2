/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/sidorovichApp2/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/sidorovichApp2/test/integration/pages/Worklist",
	"zjblessons/sidorovichApp2/test/integration/pages/Object",
	"zjblessons/sidorovichApp2/test/integration/pages/NotFound",
	"zjblessons/sidorovichApp2/test/integration/pages/Browser",
	"zjblessons/sidorovichApp2/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.sidorovichApp2.view."
	});

	sap.ui.require([
		"zjblessons/sidorovichApp2/test/integration/WorklistJourney",
		"zjblessons/sidorovichApp2/test/integration/ObjectJourney",
		"zjblessons/sidorovichApp2/test/integration/NavigationJourney",
		"zjblessons/sidorovichApp2/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});