/*global location history */
/*eslint .eslintrc.json*/
sap.ui.define([
		"zjblessons/sidorovichApp2/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/sidorovichApp2/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment"

	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.sidorovichApp2.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");


				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this._aTableSearchState = [];
				this.oDatePicker = this.byId("idDatePicker");
				oViewModel = new JSONModel({
					sCount: '0',
					sITBKey: 'All',
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");


				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},
			
			onBeforeRendering: function (oEvent){
				this._bindTable();
			},
			
			_bindTable: function () {
				var oTable = this.getView().byId('table');
				
				oTable.bindItems({
					path: '/zjblessons_base_Headers',
					sorter: [new Sorter('DocumentDate', true)],
					template: this._getTableTemplate(),
					filters: this._getTableFilters(),
					urlParameters: {
						$select: 'HeaderId, DocumentNumber, DocumentDate, PlantText, RegionText, Description, Created'
					},
					events: {
            			dataRequested: function () {
                			this._getTableCounter(); 
            			}.bind(this) 
        		}
				});
			},
			
			_getTableCounter: function (){
				var context = this;
				this.getModel().read('/zjblessons_base_Headers/$count', {
					success: function (sCount) {
						context.getModel('worklistView').setProperty('/sCount', sCount);
					}
				});
			},
			
			_getTableFilters(){
				const sSelectedKey = this.getModel('worklistView').getProperty('/sITBKey');
				const filterName = this.getResourceBundle().getText("All");
				return sSelectedKey === filterName ? [] : [new Filter('Version', FilterOperator.EQ, 'D')]
			},
			
			onItemSelect(oEvent){
				const oSelectedItem = oEvent.getParameter('listItem'),
					sHeaderID = oSelectedItem.getBindingContext().getProperty('HeaderID');
					this.getRouter().navTo("object", {
					objectId: sHeaderID
				});
			},
			_getTableTemplate: function(){
				var oTemplate = new sap.m.ColumnListItem({
					highlight: "{= ${Version} === 'A' ? 'Success' : 'Error'}",
					type: 'Navigation',
					cells: [
						
						new sap.m.Text({
							text: '{DocumentNumber}'
						}),
						new sap.m.Text({
							text: '{DocumentDate}'
						}),
						new sap.m.Text({
							text: '{PlantText}'
						}),
						new sap.m.Text({
							text: '{RegionText}'
						}),
						new sap.m.Text({
							text: '{Description}'
						}),
						new sap.m.Text({
							text: '{Created}'
						}),
						new sap.m.Switch({
							state: "{= ${Version} === 'D'}",
							type: "AcceptReject",
							change: this.changeVersion.bind(this)
						}),
						new sap.m.Button({
							type: 'Transparent',
							icon: this.getResourceBundle().getText("iDelete"),
							press: this.onPressDelete.bind(this)
						})
						]
				});
				return oTemplate;
			},
			
			changeVersion(oEvent){
				const sVersion = oEvent.getParameter('state') ? 'D' : 'A',
				sPath = oEvent.getSource().getBindingContext().getPath();
				console.log(sVersion);
				console.log(sPath);

				this.getModel().setProperty(sPath + '/Version', sVersion);
				const sInfo = this.getModel().getProperty(sPath + '/Version');
				console.log(sInfo);
				console.log(this.getModel().getPendingChanges());
				this.getModel().submitChanges();
			},
			
			onPressDelete: function (oEvent){
				var oBindingContext = oEvent.getSource().getBindingContext(),
				key = this.getModel().createKey('/zjblessons_base_Headers',
				{
					HeaderID: oBindingContext.getProperty('HeaderID')
				});
				MessageBox.confirm(this.getResourceBundle().getText("deleteMessage"), {
				title: "Confirm",                                    
    			actions: [sap.m.MessageBox.Action.OK,
            	sap.m.MessageBox.Action.CANCEL],         
    			emphasizedAction: sap.m.MessageBox.Action.OK,
    			onClose: function(oAction){
					if(oAction === sap.m.MessageBox.Action.OK) {
						this.getModel().remove(key,
						{
							success: function(oData){
							var msg = this.getResourceBundle().getText("successDelete");
							MessageToast.show(msg);
							}.bind(this)
						});
					}
				}.bind(this)
				});
			},
			
			onPressRefresh: function(){
				this._bindTable();
				var msg = this.getResourceBundle().getText("refreshMessage");
				MessageToast.show(msg);
			},
			
			onPressCreate: function(){
				this._loadCreateDialog();
			},
			
			_loadCreateDialog: async function() {
			    this._oDialog ??= await Fragment.load({
			        name: "zjblessons.sidorovichApp2.view.fragment.CreateDialog",
			        controller: this, 
			        id: "createDialog"
			    }).then(oDialog => {
			    	this.getView().addDependent(this.oDialog);
			    	oDialog.setModel(this.getView().getModel("i18n"), "i18n");
			    	return oDialog;
				});
				
				
				this._oDialog.open();
			},

			onPressSave: function(oEvent){
				const oContext = this._oDialog.getBindingContext();
			    console.log(oContext.getObject());
			
			    const oDatePicker = Fragment.byId("createDialog", "idDatePicker");
			    const oDocumentDate = oDatePicker.getDateValue();
			
			    if (oDocumentDate) {
			        oContext.setProperty("DocumentDate", oDocumentDate); 
			    }
				this.getModel().submitChanges({
					success: () => {
						var msg = this.getResourceBundle().getText("successCreate");
						MessageToast.show(msg);
						console.log(oContext.getObject());
						this._bindTable();
					}
				});
				console.log("DocumentDate:", oContext.getProperty('DocumentDate'));

				this._oDialog.close();
			},
			onPressCancel: function(){
				this.getModel().resetChanges();
				this._oDialog.close();
			},
 
			onDialogBeforeOpen: function(oEvent){

				const oDialog = oEvent.getSource();
				
				const oParams = {
					Version: "A",
					HeaderID: "0",
					Created: new Date()
				},
				
				oEntry=this.getModel().createEntry('/zjblessons_base_Headers', {
					properties: oParams
				});
				
				oDialog.setBindingContext(oEntry);
				oDialog.setModel(this.getModel()); 
			},
			
			onFilterDateRange: function(oEvent) {
			    const oDateRange = oEvent.getSource();
			    const oDateFrom = oDateRange.getFrom();
			    const oDateTo = oDateRange.getTo();
			
			    if (oDateFrom && oDateTo) {
			        const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-ddTHH:mm:ss"});
			        const sFormattedDateFrom = oDateFormat.format(oDateFrom);
			        const sFormattedDateTo = oDateFormat.format(oDateTo);
			
			        const oTable = this.byId("table");
			        const oBinding = oTable.getBinding("items");
			
			        oBinding.filter(new sap.ui.model.Filter({
			           path: "DocumentDate",
			           operator: sap.ui.model.FilterOperator.BT, 
			           value1: sFormattedDateFrom,
			           value2: sFormattedDateTo
			        }));
			    }
			    else {
			    	const oTable = this.byId("table");
			        const oBinding = oTable.getBinding("items");
			    	oBinding.filter([]);
			    }
			},
			
			onITHSelect(oEvent){
				const sSelectedKey = oEvent.getParameter('key');
				this.getModel('worklistView').setProperty('/sITBKey', sSelectedKey);
				this._bindTable();
				
			},
			onUpdateFinished : function (oEvent) {
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");

				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},


			onPress : function (oEvent) {
				this._showObject(oEvent.getSource());
			},

			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {

					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("DocumentNumber", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},


			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},


			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("ID")
				});
			},


			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);