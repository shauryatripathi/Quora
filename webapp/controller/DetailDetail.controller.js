sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("columnLayoutApp.columnLayout.controller.DetailDetail", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
			this.oRouter.getRoute("DetailDetail").attachPatternMatched(this._onSupplierMatched, this);
		},

		handleAboutPress: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(3);
			this.oRouter.navTo("AboutPage", {
				layout: oNextUIState.layout
			});
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
			this.oRouter.navTo("DetailDetail", {
				layout: sNextLayout,
				QID: this.QID,
				AID: this.AID
			});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oRouter.navTo("DetailDetail", {
				layout: sNextLayout,
				QID: this.QID,
				AID: this.AID
			});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
			this.oRouter.navTo("Detail", {
				layout: sNextLayout,
				QID: this.QID
			});
		},
		_onSupplierMatched: function (oEvent) {
			// debugger;
			this.AID = oEvent.getParameter("arguments").AID || this.AID;
			this.QID = oEvent.getParameter("arguments").QID;
			var oParameter = oEvent.getParameter("arguments");
			var sObjectPath = this.getView().getModel("oData").createKey("Answers", oParameter);
			this.getView().bindElement({
				path: "/" + sObjectPath,
				model: "oData"
			});

		},

		onReplyPost: function (oEvent) {
			var userInfo = this.getOwnerComponent().getModel("userId").getData();
			var oDate = new Date();
			var that = this;
			// create new entry
			var sValue = oEvent.getParameter("value");
			var oEntry = {
				QID: that.QID,
				AID: that.AID,
				RID: that.getView().byId("ReplyItem").getItems().length + 1,
				ReplyByID: userInfo.name,
				ReplyByName: userInfo.firstName,
				RPostedOn: oDate,
				RText: sValue,
			};

			this.getOwnerComponent().getModel("oData").create("/Replys", oEntry, {
				success: function (res) {
					MessageBox.show("Successfully Answer Posted");
				},
				error: function (err) {
					MessageBox.show("Operation Failed");
				}
			});
		}

	});

});