sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, UIComponent, Device) {
	"use strict";

	return Controller.extend("columnLayoutApp.columnLayout.controller.Master", {
		onInit: function () {

			var oList = this.getView().byId("list");
			var	oViewModel = this._createViewModel();
			var iOriginalBusyDelay = oList.getBusyIndicatorDelay();
			this._oList = oList;
			this.getView().setModel(oViewModel, "masterView");
			oList.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for the list
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;
			this._mViewSettingsDialogs = {};
		},

		_createViewModel: function () {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterListNoDataText"),
				sortBy: "QText",
				groupBy: "None"
			});
		},
		onUpdateFinished: function (oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
			
			this.getView().getModel("appView").setProperty("/addEnabled", true);
		},
		_updateListItemCount: function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getView().getModel("masterView").setProperty("/title", sTitle);
			}
		},
		
		
		
		onSelectionChange: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			this.oRouter.navTo("Detail", {
				layout: oNextUIState.layout,
				QID: oItem.getBindingContext("oData").getProperty("QID")
			});
		},
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("QText", FilterOperator.Contains, sQuery)];
			}
			this.getView().byId("list").getBinding("items").filter(oTableSearchState, "Application");
		},

		onAdd: function (oEvent) {

			this.oRouter.getTargets().display("create");
		},

		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("list"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("QText", this._bDescendingSort);

			oBinding.sort(oSorter);
		},
		onPressFilter: function () {
			this.createViewSettingsDialog("columnLayoutApp.columnLayout.fragment.QuestionFilter").open();
		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		onExit: function () {
			var oDialogKey,
				oDialogValue;
			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},
		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.byId("list"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					oFilter = new Filter(sPath, sOperator, sValue1);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		}
	});
}, true);