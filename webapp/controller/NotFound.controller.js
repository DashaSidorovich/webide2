sap.ui.define([
		"sidorovichApp2/sidorovichApp2/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sidorovichApp2.sidorovichApp2.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);