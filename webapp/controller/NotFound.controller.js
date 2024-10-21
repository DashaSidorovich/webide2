sap.ui.define([
		"zjblessons/sidorovichApp2/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.sidorovichApp2.controller.NotFound", {

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