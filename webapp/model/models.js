sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createFootballAppModel: function () {
			var oModel = new JSONModel();
			return oModel;
		},
		createMatchesModel: function () {
			var oModel = new JSONModel();
			return oModel;
		},
		createUserIdModel: function () {
			var oModel = new JSONModel("/services/userapi/currentUser");
			return oModel;
		}

	};
});