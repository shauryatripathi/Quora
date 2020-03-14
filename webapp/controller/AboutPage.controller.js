sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("columnLayoutApp.columnLayout.controller.AboutPage", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
		},

		onBack: function () {
			window.history.go(-1);
		}
	});

}, true);