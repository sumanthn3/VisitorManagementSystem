sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Core",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Fragment, UIComponent, Core, MessageToast,MessageBox) {
	"use strict";
	var oView;
	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.ExistingVisitor", {
		oView: null,
		onInit: function () {
			oView = this.getView();
			var comboData = {

				"list": [

					{
						"Identity": "Aadhar Card"
					}, {
						"Identity": "PassPort"
					}, {
						"Identity": "Driving License"
					}

				]

			};
			var oModel1 = new JSONModel(comboData);
			this.getView().setModel(oModel1, "oViewModel");

		},

		onEditDetailsSubmit: function () {
			var that=this;
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");
			var visitorName = this.getView().getModel("oLoginModel").getProperty("/ExvisitorName");
			var email = this.getView().getModel("oLoginModel").getProperty("/Exemail");
			var contactNo = this.getView().getModel("oLoginModel").getProperty("/ExcontactNo");
			var personalIdType = this.getView().getModel("oLoginModel").getProperty("/ExpersonalIdType");

			var identityNo = this.getView().getModel("oLoginModel").getProperty("/ExidentityNo");
			var organization = this.getView().getModel("oLoginModel").getProperty("/Exorganisation");
			var image = this.getView().getModel("oLoginModel").getProperty("/VistorImage");
            var imageb64=image.split(",");
            var imageString=imageb64[1];
			var payload = {
				vhId: vhId,
				visitorName: visitorName,
				email: email,
				contactNo: contactNo,
				proofType: personalIdType,
				proofNo: identityNo,
				organisation: organization,
				imageString: imageString

			};
		
			
			var sUrl = "/JAVA_SERVICE/visitor/existingVisitor1";
			$.ajax({
				url: sUrl,
				data: {
					"data": JSON.stringify(payload)
				},
				type: "POST",
				dataType: "json",
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Your Details Updated Successfully");
							that.getView().byId("badgeBtn").setEnabled(true);
							oDialog.close();
					} else {
						MessageBox.alert("Edit Details Failed");
							oDialog.close();
					}
				},
				error: function (err) {
					MessageBox.alert("Registration Failed");
						oDialog.close();
				}
			});
		},
		ongetBatch:function(){
				var that=this;
			var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");
			var oLoginModel = that.getView().getModel("oLoginModel");
			var sUrl1 = "/JAVA_SERVICE/visitor/getBadgeDetails?vhId=" + vhId;
			$.ajax({
				url: sUrl1,
				data: null,
				async: false,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
						oDialog.close();
				},
				success: function (odata) {
					oLoginModel.setProperty("/getBadge", odata);
						oDialog.close();
					if (!that._oDialog2) {
						that._oDialog2 = sap.ui.xmlfragment("idbadge", "inc.inkthn.neo.NEO_VMS.fragments.Badge", that);
					}
					that.getView().addDependent(that._oDialog2);
					that._oDialog2.open();
				},
				type: "GET"
			});
			
		},
		onCancel:function(){
		var that=this;
		that._oDialog2.close();
		},
		onCheckIn: function () {

			var that = this;
			that._oDialog2.close();
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");

			var item = {
				vhId: vhId
			};
			var sUrl = "/JAVA_SERVICE/visitor/checkin";

			$.ajax({
				url: sUrl,
				data: item,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						
							oDialog.close();
						if (!that._oDialog4) {
							that._oDialog4 = sap.ui.xmlfragment("idOnSuccess", "inc.inkthn.neo.NEO_VMS.fragments.ExistSuccess", that);
						}
						that.getView().addDependent(that._oDialog4);
						that._oDialog4.open();
						that.getView().getModel("oLoginModel").setProperty("/visitorid","");

					} else if (data.status === 500) {
							oDialog.close();
						sap.m.MessageToast.show("Something Happened Wrong");
					}
				},
				type: "POST"
			});
		},
		onSuccess: function () {
			var that = this;
			that._oDialog4.close();
			var oRouter2 = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter2.navTo("RouteLanding");
		},
		onExVisCancel: function () {
			var that = this;
			var oRouter2 = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter2.navTo("RouteLanding");
		},

		handleUploadPress: function () {
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
		},
		onCapture: function () {
			navigator.camera.getPicture(this.onSuccessPic, this.onFail, {
				quality: 75,
				targetWidth: 300,
				targetHeight: 300,
				sourceType: navigator.camera.PictureSourceType.CAMERA,
				destinationType: navigator.camera.DestinationType.FILE_URI
			});
		},
		onSelect: function () {
			navigator.camera.getPicture(this.onSuccessPic, this.onFail, {
				quality: 75,
				targetWidth: 300,
				targetHeight: 300,
				sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: navigator.camera.DestinationType.FILE_URI
			});
		},
		onSuccessPic: function (imageData) {
			var imageId = oView.byId("myImage");
			imageId.setSrc(imageData);
            oView.getModel("oLoginModel").setProperty("/VistorImage",imageData);
           
		},
		onFail: function (message) {
			MessageBox.alert("Failed because: " + message);
		}
	});

});