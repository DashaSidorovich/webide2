/*global location*/
sap.ui.define([
		"zjblessons/sidorovichApp2/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/sidorovichApp2/model/formatter",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Fragment,
		MessageBox
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
			
			onITBSelect(oEvent){
				const sSelectedKey = oEvent.getParameter('selectedKey');
				this.getModel('objectView').setProperty('/sSelectedTab', sSelectedKey);
			},
			
			onPressEditButton(oEvent){
				this._setEditMode(true);
			},
			
			onPressDeleteButton(oEvent){
				const oView = this.getView(),
					sPath = oView.getBindingContext().getPath();
				MessageBox.confirm(this.getResourceBundle().getText("deleteMessage"), {
				title: this.getResourceBundle().getText("deleteConfirm"),                                    
    			actions: [sap.m.MessageBox.Action.OK,
            	sap.m.MessageBox.Action.CANCEL],         
    			emphasizedAction: sap.m.MessageBox.Action.OK,
    			onClose: function(oAction){
					if(oAction === sap.m.MessageBox.Action.OK) {    				
						oView.setBusy(true);
						this.getModel().remove(sPath,
						{
							success: function(oData){
							oView.setBusy(false);
							this.onNavBack();
							}.bind(this)
						});
					}
				}.bind(this)
				});
					
			},
			
			onPressSaveButton(oEvent){
				const oModel = this.getModel(),
					oView = this.getView(),
					oPendingChanges = oModel.getPendingChanges(),
					sPath = oView.getBindingContext().getPath().slice(1);
									console.log(oPendingChanges);

					if (oPendingChanges.hasOwnProperty(sPath)){
						oView.setBusy(true);
						oModel.submitChanges({
							success: () => {
								oView.setBusy(false);
							},
							error: () => {
								oView.setBusy(true);
							}
						});
					}
			
				this._setEditMode(false);
			},
			
			onPressResetButton(oEvent){
				this._setEditMode(false);
				this.getModel().resetChanges();
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
				oITB.setBlocked(bValue);
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