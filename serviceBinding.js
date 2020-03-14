function initModel() {
	var sUrl = "/mnaEmp/EmpDetails/quora.xsodata/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}