sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("columnLayoutApp.columnLayout.controller.Detail", {

		onInit: function () {
			// debugger;
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("detailLineItemTableHeading")
			});
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("Master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("Detail").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("DetailDetail").attachPatternMatched(this._onProductMatched, this);
			this.getView().setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel("oData").metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getView().getModel("detailView"),
				oLineItemTable = this.getView().byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		
		onListUpdateFinished: function (oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getView().getModel("detailView");

			// only update the counter if the length is final
			if (this.getView().byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},
		handleItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			// var apath = oEvent.getSource().getBindingContext("oData").getPath();
			// var AID = apath.substr(apath.indexOf("("), apath.lastIndexOf(")"));
			this.oRouter.navTo("DetailDetail", {
				layout: oNextUIState.layout,
				QID: this.QID,
				AID: oEvent.getSource().getBindingContext("oData").getProperty("AID")
			});
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("Detail", {
				layout: sNextLayout,
				QID: this.QID
			});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("Detail", {
				layout: sNextLayout,
				QID: this.QID
			});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("Master", {
				layout: sNextLayout,
				QID: this.QID
			});
		},
		_onProductMatched: function (oEvent) {
			// debugger;
			this.getView().byId("lineItemsList").removeSelections(true);
			this.QID = oEvent.getParameter("arguments").QID || this.QID || "0";
			var oParameter = oEvent.getParameter("arguments");
			oParameter.QID = this.QID;
			var sObjectPath = this.getView().getModel("oData").createKey("Questions", oParameter);
			this.getView().bindElement({
				path: "/" + sObjectPath,
				model: "oData"
			});
		},
		onPost: function (oEvent) {
			var userInfo = this.getOwnerComponent().getModel("userId").getData();
			var oDate = new Date();
			var that = this;
			// create new entry
			var sValue = oEvent.getParameter("value");
			var oEntry = {
				QID: that.QID,
				AID: that.getView().byId("lineItemsList").getItems().length + 1,
				APostedByID: userInfo.name,
				APostedByNAME: userInfo.firstName,
				APostedOn: oDate,
				AText: sValue,
				Verified: "0",
				VCOUNT: 0
			};

			this.getOwnerComponent().getModel("oData").create("/Answers", oEntry, {
				success: function (res) {
					MessageBox.show("Successfully Answer Posted");
				},
				error: function (err) {
					MessageBox.show("Operation Failed");
				}
			});
		},
		onVoteUp: function (oEvent) {
			// debugger;
			var oBinding = oEvent.getSource().getBindingContext("oData");
			var vcount = oBinding.getObject().VCOUNT;
			var that = this;
			var recent = this.getOwnerComponent().getModel("userId").getProperty("/name");
			var vpath = oBinding.getPath();
			var obj = {
				QID: that.QID,
				AID: oBinding.getObject().AID,
				VotedBy: recent
			};
			var oCount = {
				VCOUNT: vcount + 1
			};

			this.getView().getModel("oData").create("/VOTES", obj, {
				success: function (res) {
					that.getView().getModel("oData").update(vpath, oCount, {
						success: function (countRes) {
							MessageBox.show("Thanks for your Feedback!");
						},
						error: function (err) {
							MessageBox.show("Unable to update count value!");
						}
					});

				},
				error: function (er) {
					MessageBox.show("You have already Voted");
				}
			});
		},

		onVerify: function () {
			// debugger;
			var that = this;
			var recent = this.getOwnerComponent().getModel("userId").getProperty("/name");
			// var ques = this.getView().byId("ansLilineItemsListst").getBindingContext();
			var bindingContext = this.getView().byId("lineItemsList").getSelectedContextPaths().length;
			if (bindingContext === 0) {
				// debugger;
				MessageBox.show("Please Select An Answer!");
			} else {
				var ques = that.getView().byId("lineItemsList").getBindingContext("oData").getProperty(that.getView().byId("lineItemsList").getBindingContext("oData")
					.getPath() +
					"/QPostedByID");
				if (recent === ques) {
					var objAns = {
						Verified: "1"
					};
					var objQues = {
						Answerd: "1"
					};
					that.getView().getModel("oData").update(that.getView().byId("lineItemsList").getSelectedContextPaths("oData")[0], objAns);
					that.getView().getModel("oData").update(that.getView().byId("lineItemsList").getBindingContext("oData").getPath(), objQues);
					that.getView().byId("lineItemsList").removeSelections(true);
				} else {
					MessageBox.show("You can not Verified");
				}
			}
		}

	});

}, true);