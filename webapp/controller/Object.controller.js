/*global location*/
sap.ui.define([
		"zjblessons/sidorovichApp2/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/sidorovichApp2/model/formatter",
		"sap/ui/core/Fragment"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Fragment
	) {
		"use strict";

		return BaseController.extend("zjblessons.sidorovichApp2.controller.Object", {

			formatter: formatter,

	
			onInit : function () {
	
				var oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						sSelectedTab: this.getResourceBundle().getText("List"),
						bEditMode: false
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "objectView");
			
			},

			onEditButtonPress(oEvent){
				this._setEditMode(true);
			},
			
			onBeforeRendering(){
				this._bindTemplate();
			},
			
			async _getPlantTemplate(){
				this._pPlantParameter ??= await Fragment.load({
					name: "zjblessons.sidorovichApp2.view.fragment.template.ComboBoxItem",
					id: this.getView().getId(),
					controller: this
				}).then((oTemplate) => {
					this.getView().addDependent(oTemplate);
					return oTemplate;
				})
				
				return this._pPlantParameter;
			},
			
			async _bindTemplate(){
				const oComboBox = this.getView().byId('idComboBox'),
					oTemplate = await this._getPlantTemplate();
				oComboBox.bindItems({
					path: '/zjblessons_base_Plants',
					template: oTemplate,
					events: {
						dataReceived: () => {
							oComboBox.setBusy(false);
						},
						dataRequested: () => {
							oComboBox.setBusy(true);
						}
					}
				})
			},
			
			_setEditMode(bValue){
				const oModel = this.getModel('objectView');
				const oITB = this.getView().byId('idITFForm')._getIconTabHeader();
				oITB.setBlocked(true);
				oModel.setProperty('/bEditMode', bValue);
			},
			
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},


			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("zjblessons_base_Headers", {
						HeaderID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
			
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				
			}

		});

	}
);