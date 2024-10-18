/*global location history */
sap.ui.define([
		"sidorovichApp2/sidorovichApp2/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sidorovichApp2/sidorovichApp2/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/m/MessageBox",
		"sap/m/MessageToast"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Sorter, MessageBox, MessageToast) {
		"use strict";

		return BaseController.extend("sidorovichApp2.sidorovichApp2.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");


				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					sCount: '0',
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
			
			onPressRefresh: function(){
				this._bindTable();
				var msg = this.getResourceBundle().getText("refreshMessage");
				MessageToast.show(msg);
			},
			
			_getTableTemplate: function(){
				var oTemplate = new sap.m.ColumnListItem({
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
						new sap.m.Button({
							type: 'Transparent',
							icon: this.getResourceBundle().getText("iDelete"),
							press: this.onPressDelete.bind(this)
						})
						]
				});
				return oTemplate;
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
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},

			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("CreatedBy", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("ID")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
			 * @private
			 */
			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);