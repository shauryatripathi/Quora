sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"columnLayoutApp/columnLayout/model/models",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/ui/model/json/JSONModel"
], function (global, UIComponent, Device, models, FlexibleColumnLayoutSemanticHelper, JSONModel) {
	"use strict";

	return UIComponent.extend("columnLayoutApp.columnLayout.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// debugger;

			// UIComponent.prototype.init.apply(this, arguments);
			this.setModel(models.createFootballAppModel(), "FootballApp");
			this.setModel(models.createMatchesModel(), "matches");

			// Set Model for Layout
			var oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			// var oProductsModel = new JSONModel(sap.ui.require.toUrl("columnLayoutApp/columnLayout/model/products.json"));
			// oProductsModel.setSizeLimit(1000);
			// this.setModel(oProductsModel, "products"); 

			//Get UserInfo
			this.setModel(models.createUserIdModel(), "userId");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

		},
		createContent: function () {
			// debugger;
			return sap.ui.view({
				viewName: "columnLayoutApp.columnLayout.view.FlexibleColumnLayout",
				type: "XML"
			});
		},
		getHelper: function () {
			// debugger;
			var oFCL = this.getRootControl().byId("fcl"),
				oParams = jQuery.sap.getUriParameters(),
				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded,
					mode: oParams.get("mode"),
					initialColumnsCount: oParams.get("initial"),
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		},
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});
});