/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/Worklist",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/Object",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/NotFound",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/Browser",
	"sidorovichApp2/sidorovichApp2/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sidorovichApp2.sidorovichApp2.view."
	});

	sap.ui.require([
		"sidorovichApp2/sidorovichApp2/test/integration/WorklistJourney",
		"sidorovichApp2/sidorovichApp2/test/integration/ObjectJourney",
		"sidorovichApp2/sidorovichApp2/test/integration/NavigationJourney",
		"sidorovichApp2/sidorovichApp2/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});