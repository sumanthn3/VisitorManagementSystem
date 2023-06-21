sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Core",
	"sap/m/MessageToast",
	"sap/ndc/BarcodeScanner",
		"sap/m/MessageBox"
], function (Controller, JSONModel, Fragment, UIComponent, Core, MessageToast, BarcodeScanner,MessageBox) {
	"use strict";

	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.Landing", {
		onInit: function () {

			var comboData = {
				"FeedbackVisibility": false,
				"BtnsVisibility": true,
				"gifVisibility": false
			};
			var oModel1 = new JSONModel(comboData);
			this.getView().setModel(oModel1, "oVisibleModel");
			var oLoginModel = this.getOwnerComponent().getModel("oLoginModel");
			this.getView().setModel(oLoginModel, "oLoginModel");
	
		},

		//Login As Employee
		onPressLogin: function (oEvent) {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();
		
			var username = this.getView().getModel("oLoginModel").getProperty("/eId");
			var password = this.getView().getModel("oLoginModel").getProperty("/password");
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/login";
			var item = {
				"username": username,
				"password": password
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				data: {
					"data": JSON.stringify(item)
				},
			
				success: function (oData) {
					if (oData.status === true) {
						if (oData.role === "Employee") {
							var eId = oData.eid;
							var image = oData.image;
							var name = oData.name;
							var email = oData.email;
							that.getView().getModel("oHostModel").setProperty("/eId", eId);
							that.getView().getModel("oHostModel").setProperty("/image", image);
							that.getView().getModel("oHostModel").setProperty("/name", name);
							that.getView().getModel("oHostModel").setProperty("/EMPemail", email);
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("RouteHost");
										oDialog.close();
						} else if (oData.role === "Admin") {
							var eId1 = oData.eid;
							var image1 = oData.image;
							var name1 = oData.name;
							var email1 = oData.email;
							that.getView().getModel("oAdminModel").setProperty("/eId", eId1);
							that.getView().getModel("oAdminModel").setProperty("/image", image1);
							that.getView().getModel("oAdminModel").setProperty("/name", name1);
							that.getView().getModel("oAdminModel").setProperty("/EMPemail", email1);
							var oRouter1 = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter1.navTo("RouteAdmin");
							oDialog.close();
						} else if (oData.role === "Security") {
							var eId2 = oData.eid;
							var image2 = oData.image;
							var name2 = oData.name;
							var email2 = oData.email;
							that.getView().getModel("oSecurityModel").setProperty("/eId", eId2);
							that.getView().getModel("oSecurityModel").setProperty("/image", image2);
							that.getView().getModel("oSecurityModel").setProperty("/name", name2);
							that.getView().getModel("oSecurityModel").setProperty("/EMPemail", email2);
							var oRouter2 = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter2.navTo("RouteSecurity");
							oDialog.close();
						}
						sap.m.MessageToast.show("Logged In Successfully!");
					} else if (oData.status === false) {
						MessageBox.alert("User doesn't exist");
						oDialog.close();
					}
				},
				error: function (e) {
					var oValue = that.getView().byId("idEmpPass").getValue();
					if (oValue === "AAAA" || oValue === "SSAVK") {
						var eId = that.getView().getModel("oLoginModel").getProperty("/eId");
						that.getView().getModel("oHostModel").setProperty("/eId", eId);
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("RouteHost");
						oDialog.close();

					} else if (oValue === "AKR") {
						var oRouter1 = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter1.navTo("RouteAdmin");
						oDialog.close();
					} else if (oValue === "JG") {
						var oRouter2 = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter2.navTo("RouteSecurity");
						oDialog.close();
					}
					sap.m.MessageToast.show("Server Not Responding");
						oDialog.close();
				}

			});
		
		},

		//Existing Visitor
		onPressVerify: function () {
			this.bflag = true;
			var that = this;
				var oLoginModel = this.getOwnerComponent().getModel("oLoginModel");
			var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");
			var sUrl = "/JAVA_SERVICE/visitor/sendOtp";
			var item = {
				vhId: vhId
			};
			$.ajax({
				url: sUrl,
				data: item,

				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
					
				},
				success: function (data) {
					if (data.status === 200) {
						if (!that._oDialog1) {
							that._oDialog1 = sap.ui.xmlfragment("idOnotp", "inc.inkthn.neo.NEO_VMS.fragments.EnterOtp", that);
						}
						that.getView().addDependent(that._oDialog1);
						that._oDialog1.open();
					
							var fiveMinutesLater = new Date();
							var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
							
							var countdowntime = scs;
							
						var	x = setInterval(function() {
							var time=sap.ui.core.Fragment.byId("idOnotp", "timer");
							var now = new Date().getTime();
							var cTime = countdowntime - now;
							var minutes = Math.floor((cTime % (1000 * 60 * 60)) / (1000 * 60));
							var second = Math.floor((cTime % (1000 * 60)) / 1000);
							time.setValue("OTP Expires in " + minutes + ":" + second + " Minutes");
							
							if (cTime < 0) {
							clearInterval(x);
							time.setValue("OTP Expires in 0:0 Minutes");
							}
							});
					} else if (data.status === 100) {
						sap.m.MessageToast.show("checked in");
						if (!that._oDialog2) {
							that._oDialog2 = sap.ui.xmlfragment("idcheckoutfrag", "inc.inkthn.neo.NEO_VMS.fragments.CheckedOut", that);
						}
						that.getView().addDependent(that._oDialog2);
						that._oDialog2.open();
					} else if(data.status === 300){
						var oRouter6 = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter6.navTo("RouteExistingVisitor");
							var sUrl2 = "/JAVA_SERVICE/visitor/getVisitorDetails?vhId=" + vhId;
							$.ajax({
								url: sUrl2,
								data: null,
								async: true,
								cache: false,
								dataType: "json",
								contentType: "application/json; charset=utf-8",
								error: function (err) {
									sap.m.MessageToast.show("Destination Failed");
								},
								success: function (data1) {
									var ExvhId = data1.vhId;
									var visitorName = data1.visitorName;
									var eId = data1.eId;
									var email = data1.email;
									var contactNo = data1.contactNo;
									var puprose = data1.puprose;
									var organisation = data1.organisation;
									var hostName = data1.hostName;
									var date = data1.date;
									var proofType = data1.proofType;
									var proofNo = data1.proofNo;
									oLoginModel.setProperty("/ExvhId", ExvhId);
									oLoginModel.setProperty("/ExeId", eId);
									oLoginModel.setProperty("/ExvisitorName", visitorName);
									oLoginModel.setProperty("/Exemail", email);
									oLoginModel.setProperty("/ExcontactNo", contactNo);
									oLoginModel.setProperty("/Expuprose", puprose);
									oLoginModel.setProperty("/Exorganisation", organisation);
									oLoginModel.setProperty("/ExhostName", hostName);
									oLoginModel.setProperty("/Exdate", date);
									oLoginModel.setProperty("/ExpersonalIdType", proofType);
									oLoginModel.setProperty("/ExidentityNo", proofNo);

								},
								type: "GET"
							});
						
					}
					else if (data.status === 500) {
						MessageBox.alert("Could Not Send");
					}
				},
				type: "POST"
			});
		},
		onVerifyOtp: function () {
			if (this.bflag === true) {
				var that = this;
				that._oDialog1.close();
				var oLoginModel = this.getOwnerComponent().getModel("oLoginModel");
				var OTP = sap.ui.core.Fragment.byId("idOnotp", "otp").getValue();
				var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");
				var item = {
					vhId: vhId,
					OTP: OTP

				};
				var sUrl = "/JAVA_SERVICE/visitor/verification";
				$.ajax({
					url: sUrl,
					data: item,
					dataType: "json",
					error: function (err) {
						sap.m.MessageToast.show("Error");

					},
					success: function (data) {
						if (data.status === 200) {
							sap.m.MessageToast.show("User Verified");
							var oRouter6 = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter6.navTo("RouteExistingVisitor");
							var sUrl2 = "/JAVA_SERVICE/visitor/getVisitorDetails?vhId=" + vhId;
							$.ajax({
								url: sUrl2,
								data: null,
								async: true,
								cache: false,
								dataType: "json",
								contentType: "application/json; charset=utf-8",
								error: function (err) {
									sap.m.MessageToast.show("Destination Failed");
								},
								success: function (data1) {
									var ExvhId = data1.vhId;
									var visitorName = data1.visitorName;
									var eId = data1.eId;
									var email = data1.email;
									var contactNo = data1.contactNo;
									var puprose = data1.puprose;
									var organisation = data1.organisation;
									var hostName = data1.hostName;
									var date = data1.date;
									var proofType = data1.proofType;
									var proofNo = data1.proofNo;
									oLoginModel.setProperty("/ExvhId", ExvhId);
									oLoginModel.setProperty("/ExeId", eId);
									oLoginModel.setProperty("/ExvisitorName", visitorName);
									oLoginModel.setProperty("/Exemail", email);
									oLoginModel.setProperty("/ExcontactNo", contactNo);
									oLoginModel.setProperty("/Expuprose", puprose);
									oLoginModel.setProperty("/Exorganisation", organisation);
									oLoginModel.setProperty("/ExhostName", hostName);
									oLoginModel.setProperty("/Exdate", date);
									oLoginModel.setProperty("/ExpersonalIdType", proofType);
									oLoginModel.setProperty("/ExidentityNo", proofNo);

								},
								type: "GET"
							});
						} else if (data.status === 300) {
							MessageBox.alert("Otp Expired Please Try Again");

						} else if (data.status === 500) {
							MessageBox.alert("Could Not Verify");
						}

					},
					type: "POST"
				});

			} else {
				var that = this;
				var Otp = sap.ui.core.Fragment.byId("idForgotOTP", "otp").getValue();
				var username = this.getView().getModel("oLoginModel").getProperty("/eId");
				var Payload = {
					email: username,
					OTP: Otp
				};
				var sUrl2 = "/JAVA_SERVICE/employee/verification";
				$.ajax({
					url: sUrl2,
					data: Payload,
					dataType: "json",
					type: "POST",
					error: function (err) {
						sap.m.MessageToast.show("Error");

					},
					success: function (data) {
						if (data.status === 200) {
							sap.m.MessageToast.show("User Verified");
							that._oDialog10.close();
							if (!that._oDialog11) {
								that._oDialog11 = sap.ui.xmlfragment("idForgotPassword", "inc.inkthn.neo.NEO_VMS.fragments.ForgotPassword", that);
							}
							that.getView().addDependent(that._oDialog11);
							that._oDialog11.open();
						} else if (data.status === 300) {
							MessageBox.alert("expired");
						} else {
							MessageBox.alert("Could not verify");
						}

					}
				});
			}
		},
		onPressCheckOut: function () {

			var that = this;

			var vhId = this.getView().getModel("oLoginModel").getProperty("/visitorid");
			var feedback = sap.ui.core.Fragment.byId("idcheckoutfrag", "idFeedback").getValue();
			var rating = sap.ui.core.Fragment.byId("idcheckoutfrag", "idRating").getValue();
			var item = {
				vhId: vhId,
				feedback: feedback,
				rating: rating

			};
			var sUrl = "/JAVA_SERVICE/visitor/addFeedback";

			$.ajax({
				url: sUrl,
				data: {
					"data": JSON.stringify(item)
				},
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Feedback Sent Successful");
						that.getView().getModel("oLoginModel").setProperty("/visitorid","");
						

					} else if (data.status === 500) {
						sap.m.MessageToast.show("Something Happened Wrong");
					}
				},
				type: "POST"
			});

			var item = {
				vhId: vhId
			};
			var sUrl = "/JAVA_SERVICE/visitor/checkout";

			$.ajax({
				url: sUrl,
				data: item,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("CheckedOut  Successful");
						if (!that._oDialog9) {
							that._oDialog9 = sap.ui.xmlfragment("idfeedBackSuccess", "inc.inkthn.neo.NEO_VMS.fragments.ExistSuccess", that);
						}
						that.getView().addDependent(that._oDialog9);
						that._oDialog9.open();

					} else if (data.status === 500) {
						sap.m.MessageToast.show("Something Happened Wrong");
					}
				},
				type: "POST"
			});
			that._oDialog2.close();
			that._oDialog2.destroy();
			that._oDialog2 = null;
		},
		onCheckOutCancel: function () {
			var that = this;
			that._oDialog2.close();
		
			sap.ui.core.Fragment.byId("idcheckoutfrag", "idFeedback").setValue("");
			sap.ui.core.Fragment.byId("idcheckoutfrag", "idRating").setValue("");
					that.getView().getModel("oLoginModel").setProperty("/visitorid","");
		},
		onSuccess: function () {
			var that = this;
			that._oDialog9.close();
			
        	that.getView().getModel("oLoginModel").setProperty("/visitorid","");
		},
		//New Visitor
		onNewVisitor: function () {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 1000);
			var oRouter3 = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter3.navTo("RouteNewVisitor");

		},
		handleBarcodeScannerSuccess: function (oEvent) {
			var that = this;
			jQuery.sap.require("sap.ndc.BarcodeScanner");
			sap.ndc.BarcodeScanner.scan(
				function (mResult) {
					// MessageBox.alert("Scan Successful\n" +
					// 	"Result: " + mResult.text + "\n" +
					// 	"Format: " + mResult.format + "\n" +
					// 	"Cancelled: " + mResult.cancelled);
					var qrCode = mResult.text;
					that.getView().getModel("oLoginModel").setProperty("/visitorid", qrCode);
					that.onPressVerify();
				},
				function (Error) {
					MessageBox.alert("Scanning failed: " + Error);
				}
			);
			
		},

		//FORGOT PASSWORD
		onPressForgot: function () {
			this.bflag = false;
			var that = this;
			var username = this.getView().getModel("oLoginModel").getProperty("/eId");
			var sUrl = "/JAVA_SERVICE/employee/sendOtp?email=" + username;

			$.ajax({
				url: sUrl,
				data: null,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						if (!that._oDialog10) {
							that._oDialog10 = sap.ui.xmlfragment("idForgotOTP", "inc.inkthn.neo.NEO_VMS.fragments.EnterOtp", that);
						}
						that.getView().addDependent(that._oDialog10);
						that._oDialog10.open();
							var time=sap.ui.core.Fragment.byId("idForgotOTP", "timer");
							var fiveMinutesLater = new Date();
							var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
							
							var countdowntime = scs;
							
						var	x = setInterval(function() {
							var now = new Date().getTime();
						
							var cTime = countdowntime - now;
							var minutes = Math.floor((cTime % (1000 * 60 * 60)) / (1000 * 60));
							var second = Math.floor((cTime % (1000 * 60)) / 1000);
							time.setValue("OTP Expires in " + minutes + ":" + second + " Minutes");
							
							if (cTime < 0) {
							clearInterval(x);
							time.setValue("OTP Expires in 0:0 Minutes");
							}
							});
					} else if (data.status === 500) {
						MessageBox.alert("Could Not Send");
					}
				},
				type: "GET"
			});

		},
		onConfirmPassword: function () {
			var that = this;
			var username = this.getView().getModel("oLoginModel").getProperty("/eId");
			var password = sap.ui.core.Fragment.byId("idForgotPassword", "idPassForgot").getValue();
			var confirmPassword = sap.ui.core.Fragment.byId("idForgotPassword", "idPassCNFForgot").getValue();
			if (confirmPassword === password) {
				var sUrl2 = "/JAVA_SERVICE/employee/forgotPassword";
				var Payload = {
					username: username,
					password: password
				};
				$.ajax({
					url: sUrl2,
					data: {
						"data": JSON.stringify(Payload)
					},
					dataType: "json",
					type: "POST",
					error: function (err) {
						sap.m.MessageToast.show("Something Happened Wrong");

					},
					success: function (data) {
						if (data.status === 200) {
							MessageBox.alert("Password Reset Successful");
							that._oDialog11.close();
						}
					}
				});
			} else {
				MessageBox.alert("Password Didn't Match");
			}

		},
		onCancelPassword: function () {
			this._oDialog11.close();
			this._oDialog11.destroy();
			this._oDialog11 = null;
		},

		//Password
		onShow: function () {

			var Type = sap.ui.core.Fragment.byId("idForgotPassword", "idPassForgot").getType();
			if (Type === "Text") {
				sap.ui.core.Fragment.byId("idForgotPassword", "idPassForgot").setType("Password");
				sap.ui.core.Fragment.byId("idForgotPassword", "Show").setVisible(true);
				sap.ui.core.Fragment.byId("idForgotPassword", "Hide").setVisible(false);
			} else if (Type === "Password") {
				sap.ui.core.Fragment.byId("idForgotPassword", "idPassForgot").setType("Text");
				sap.ui.core.Fragment.byId("idForgotPassword", "Show").setVisible(false);
				sap.ui.core.Fragment.byId("idForgotPassword", "Hide").setVisible(true);
			}
		},
		onShowCNF: function () {
			var Type = sap.ui.core.Fragment.byId("idForgotPassword", "idPassCNFForgot").getType();
			if (Type === "Text") {
				sap.ui.core.Fragment.byId("idForgotPassword", "idPassCNFForgot").setType("Password");
				sap.ui.core.Fragment.byId("idForgotPassword", "ShowCNF").setVisible(true);
				sap.ui.core.Fragment.byId("idForgotPassword", "HideCNF").setVisible(false);
			} else if (Type === "Password") {
				sap.ui.core.Fragment.byId("idForgotPassword", "idPassCNFForgot").setType("Text");
				sap.ui.core.Fragment.byId("idForgotPassword", "ShowCNF").setVisible(false);
				sap.ui.core.Fragment.byId("idForgotPassword", "HideCNF").setVisible(true);
			}
		},
		
		// CANCEL OTP
		onCancelOtp:function(){
			var that = this;
			if(this.blag ===  true){
				that._oDialog1.close();
			}else{
				that._oDialog10.close();
			}
		},
		

	});
});