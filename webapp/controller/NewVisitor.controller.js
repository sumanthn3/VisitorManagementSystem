sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Fragment, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.NewVisitor", {

		onInit: function () {
			var comboData = {
				"sSelect": "",
				"NewsSelect":"",
				"AddVisVisibility": false,
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
			var oModel4 = new JSONModel("model/VisitorDetails.json");
			this.getView().setModel(oModel4, "oVisitorModel");
			var oVisitorModel1 = this.getOwnerComponent().getModel("oVisitorModel");
			this.getView().setModel(oVisitorModel1, "oVisitorModel1");
			var oModel5 = new JSONModel("model/VisitorDetails.json");
			this.getView().setModel(oModel5, "oPreRegForm");
			var today = new Date();
			this.getView().getModel("oVisitorModel").setProperty("/date", today);
			var sUrl = "/JAVA_SERVICE/employee/employees";
			$.ajax({
				url: sUrl,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					oVisitorModel1.setProperty("/getEmployeeList", data);
				},
				type: "GET"
			});

		},
	
		addVis:function(){
			this.bflag=true;
		     if (!this._oDialog) {
						this._oDialog = sap.ui.xmlfragment("idNewAddVisitor", "inc.inkthn.neo.NEO_VMS.fragments.AddVisitor", this);
					}
					this.getView().addDependent(this._oDialog);
				sap.ui.core.Fragment.byId("idNewAddVisitor","idNewEmail").setEditable(true);
					sap.ui.core.Fragment.byId("idNewAddVisitor","idNewfirstName").setEditable(true);
					sap.ui.core.Fragment.byId("idNewAddVisitor","idNewlastName").setEditable(true);
					this._oDialog.open();	
		},
		onVerifyVisitor:function(){
			var that=this;
			if(this.bflag===true){
				var email1=this.getView().getModel("oVisitorModel").getProperty("/NewEmail");
				var sUrl = "/JAVA_SERVICE/visitor/sendOtpOnSpot";
				var payload={
					email:email1
				};
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data:payload,
				success: function (oData) {
					if (oData.status === 200) {
						if (!that._oDialog3) {
							that._oDialog3 = sap.ui.xmlfragment("idVerifyOtp", "inc.inkthn.neo.NEO_VMS.fragments.VerifyOtp", that);
						}
						that.getView().addDependent(that._oDialog3);
						var fiveMinutesLater = new Date();
							var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
							
							var countdowntime = scs;
							
							var	x = setInterval(function() {
							var time=sap.ui.core.Fragment.byId("idVerifyOtp", "timer");
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
						that._oDialog3.open();
							
					}
				

				},
				error: function (e) {
					sap.m.MessageToast.show(" Failed");

				}

			});
			}
			else{
			var email=this.getView().getModel("oVisitorModel").getProperty("/email");
				var sUrl1 = "/JAVA_SERVICE/visitor/sendOtpOnSpot";
				var payload1={
					email:email
				};
			$.ajax({
				url: sUrl1,
				type: "POST",
				dataType: "json",
				async: true,
				data: payload1,
				success: function (oData) {
					if (oData.status === 200) {
						if (!that._oDialog2) {
							that._oDialog2 = sap.ui.xmlfragment("idOnVerifyOtp", "inc.inkthn.neo.NEO_VMS.fragments.VerifyOtp", that);
						}
						that.getView().addDependent(that._oDialog2);
						var fiveMinutesLater = new Date();
							var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
							
							var countdowntime = scs;
							
						var	x = setInterval(function() {
							var time=sap.ui.core.Fragment.byId("idOnVerifyOtp", "timer");
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
						that._oDialog2.open();
					}
					else if(oData.status === 100){
						sap.m.MessageToast.show("New Visitor Verification Not Required");
					}
					else{
						sap.m.MessageToast.show("Error");
					}

				},
				error: function (e) {
					sap.m.MessageToast.show(" Failed");

				}

			});

			}
		},
		onVerifyOTP:function(){
			var that=this;
			if(this.bflag===true){
					var email1=this.getView().getModel("oVisitorModel").getProperty("/NewEmail");
					var OTP = sap.ui.core.Fragment.byId("idVerifyOtp", "otp").getValue();
					var sUrl = "/JAVA_SERVICE/visitor/verificationOnSpot";
				var payload={
					email:email1,
					OTP:OTP
				};
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data:payload,
				success: function (oData) {
					that._oDialog3.close();
					var firstName = oData.firstName;
					var lastName =oData.lastName;
					var email2 = oData.email;
					var contactNo = oData.contactNo;
					var proofType = oData.proofType;
					var proofNo = oData.proofNo;
					that.getView().getModel("oVisitorModel").setProperty("/NewfirstName",firstName);
				    that.getView().getModel("oVisitorModel").setProperty("/NewlastName",lastName);
				    that.getView().getModel("oVisitorModel").setProperty("/NewEmail",email2);
				    that.getView().getModel("oVisitorModel").setProperty("/NewPhone",contactNo);
				    that.getView().getModel("oVisitorModel").setProperty("/NewProofType",proofType);
				    that.getView().getModel("oVisitorModel").setProperty("/NewIDnumber",proofNo);
					 if(oData.status===200){
					sap.ui.core.Fragment.byId("idNewAddVisitor","idNewEmail").setEditable(false);
					sap.ui.core.Fragment.byId("idNewAddVisitor","idNewfirstName").setEditable(false);
					sap.ui.core.Fragment.byId("idNewAddVisitor","idNewlastName").setEditable(false);
					}
				},
				error: function (e) {
					sap.m.MessageToast.show(" Failed");

				}

			});
			}
			else{
					var email2=this.getView().getModel("oVisitorModel").getProperty("/email");
					var OTP2 = sap.ui.core.Fragment.byId("idOnVerifyOtp", "otp").getValue();
					var sUrl1 = "/JAVA_SERVICE/visitor/verificationOnSpot";
				var payload1={
					email:email2,
					OTP:OTP2
				};
			$.ajax({
				url: sUrl1,
				type: "POST",
				dataType: "json",
				async: true,
				data:payload1,
				success: function (oData) {
					that._oDialog2.close();
					var firstName = oData.firstName;
					var lastName =oData.lastName;
					var emailId = oData.email;
					var contactNo = oData.contactNo;
					var proofType = oData.proofType;
					var proofNo = oData.proofNo;
					var organisation=oData.organisation;
					that.getView().getModel("oVisitorModel").setProperty("/firstName",firstName);
				    that.getView().getModel("oVisitorModel").setProperty("/lastName",lastName);
				    that.getView().getModel("oVisitorModel").setProperty("/email",emailId);
				    that.getView().getModel("oVisitorModel").setProperty("/contactNo",contactNo);
				    that.getView().getModel("oVisitorModel").setProperty("/personalIdType",proofType);
				    that.getView().getModel("oVisitorModel").setProperty("/identityNo",proofNo);
				    that.getView().getModel("oVisitorModel").setProperty("/organisation",organisation);
				    
				    if(oData.status===200){
					that.getView().byId("idEmail").setEditable(false);
					that.getView().byId("idfName").setEditable(false);
					that.getView().byId("idlName").setEditable(false);
					}
					
				},
				error: function (e) {
					sap.m.MessageToast.show(" Failed");

				}

			});
			}
		},
		onCancelOtp:function(){
			var that=this;
		if(this.bflag===true){
			that._oDialog3.close();
		}	
		else{
			that._oDialog2.close();
		}
		},
		onSubmit: function () {
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			var firstName = this.getView().getModel("oVisitorModel").getProperty("/firstName");
			var that = this;
			var lastName = this.getView().getModel("oVisitorModel").getProperty("/lastName");
			var email = this.getView().getModel("oVisitorModel").getProperty("/email");
			var contactNo = this.getView().getModel("oVisitorModel").getProperty("/contactNo");
			var personalIdType = this.getView().getModel("oVisitorModel").getProperty("/personalIdType");
			var identityNo = this.getView().getModel("oVisitorModel").getProperty("/identityNo");
			var organisation = this.getView().getModel("oVisitorModel").getProperty("/organisation");
			var purpose = this.getView().getModel("oVisitorModel").getProperty("/purpose");
		
			var eId = this.getView().getModel("oVisitorModel").getProperty("/eId");
			var date = this.getView().getModel("oVisitorModel").getProperty("/date");
			var begin = this.getView().getModel("oVisitorModel").getProperty("/begin");
			var end = this.getView().getModel("oVisitorModel").getProperty("/end");
			
			var Visitor = this.getView().getModel("oPreRegForm").getProperty("/PreRegFormData");
			var typeId = 1;
			if (!firstName || !email || !purpose || !end || !begin || !contactNo || !organisation || !date || !eId || !lastName) {
				MessageBox.alert("Please Fill all the Mandatory Details");
			}

			var payload = {
				firstName: firstName,
				lastName: lastName,
				email: email,
				contactNo: contactNo,
				organisation: organisation,
				proofType: personalIdType,
				proofNo: identityNo,
				purpose: purpose,
				typeId: typeId,
				eId: eId,
				date: date,
				begin: begin,
				end: end,

				visitor: Visitor
			};
			var sUrl = "/JAVA_SERVICE/visitor/newVisitor";
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data: {
					"data": JSON.stringify(payload)
				},
			
				success: function (oData) {
					if (oData.status === 200) {
						sap.m.MessageToast.show("Registered  Successfully");
						oDialog.close();
						if (!that._oDialog1) {
							that._oDialog1 = sap.ui.xmlfragment("idOnSpotSuccess", "inc.inkthn.neo.NEO_VMS.fragments.OnSpotSuccess", that);
						}
						that.getView().addDependent(that._oDialog1);
						that._oDialog1.open();
					}

				},
				error: function (e) {
					sap.m.MessageToast.show("Registration Failed");

				}

			});

		},
		onCancel: function () {

			var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter1.navTo("RouteLanding");
		},
		onOk: function () {
			this.getView().getModel("oVisitorModel").setProperty("/firstName", "");
			this.getView().getModel("oVisitorModel").setProperty("/lastName", "");
			this.getView().getModel("oVisitorModel").setProperty("/email", "");
			this.getView().getModel("oVisitorModel").setProperty("/contactNo", "");
			this.getView().getModel("oVisitorModel").setProperty("/personalIdType", "");
			this.getView().getModel("oVisitorModel").setProperty("/identityNo", "");
			this.getView().getModel("oVisitorModel").setProperty("/organisation", "");
			this.getView().getModel("oVisitorModel").setProperty("/purpose", "");
			this.getView().getModel("oVisitorModel").setProperty("/eId", "");
			this.getView().getModel("oVisitorModel").setProperty("/date", "");
			this.getView().getModel("oVisitorModel").setProperty("/begin", "");
			this.getView().getModel("oVisitorModel").setProperty("/end", "");
			this.getView().getModel("oPreRegForm").setProperty("/PreRegFormData", []);
			var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter1.navTo("RouteLanding");
		},
	
		onAddVisible: function () {
				this.getView().getModel("oViewModel").setProperty("/AddVisVisibility", true);
			var fName=this.getView().getModel("oVisitorModel").getProperty("/NewfirstName");
			var lName=this.getView().getModel("oVisitorModel").getProperty("/NewlastName");
			var emailId=this.getView().getModel("oVisitorModel").getProperty("/NewEmail");
			var proofType=this.getView().getModel("oVisitorModel").getProperty("/NewProofType");
			var phoneNo=this.getView().getModel("oVisitorModel").getProperty("/NewPhone");
			var idNo=this.getView().getModel("oVisitorModel").getProperty("/NewIDnumber");
			
	
			var obj = {
				fName: fName,
				lName: lName,
				emailId: emailId,
				proofType: proofType,
				phoneNo: phoneNo,
				idNo: idNo
			};
			var oPreRegForm = this.getView().byId("idNewVisitor").getModel("oPreRegForm");
			var item = oPreRegForm.getProperty("/PreRegFormData");
			item.push(obj);
			oPreRegForm.setData({
				"PreRegFormData": item
			});
			this._oDialog.close();
			this.getView().getModel("oVisitorModel").setProperty("/NewEmail","");
			this.getView().getModel("oVisitorModel").setProperty("/NewfirstName","");
			this.getView().getModel("oVisitorModel").setProperty("/NewlastName","");
			this.getView().getModel("oViewModel").setProperty("/NewsSelect","");
			this.getView().getModel("oVisitorModel").setProperty("/NewPhone","");
			this.getView().getModel("oVisitorModel").setProperty("/NewIDnumber","");
		},
		onClose:function(){
			this._oDialog.close();
		},
		onVisCancel: function (oEvent) {

			var oItemContextPath = oEvent.getSource().getBindingContext("oVisitorModel").getPath();
			var aPathParts = oItemContextPath.split("/");
			var iIndex = aPathParts[aPathParts.length - 1];

			var oJSONData = this.getView().getModel("oVisitorModel").getProperty("/NewVisitor");
			oJSONData.splice(iIndex, 1);
			this.getView().getModel("oVisitorModel").setProperty("/NewVisitor", oJSONData);

		},

		handleLinkPress: function (evt) {
			MessageBox.information(
				"At Incture, we recognize that privacy of your personal information is important and we take seriously the trust you place in us when you choose to do business with us. Acceptance of the terms of this Privacy Policy is a pre-requisite to visiting this website. If you visit this site, it means you have accepted the terms of this Privacy Policy. We take your privacy seriously and will only use your personal information to administer your account and to provide the products and services you have requested from us. Incture is committed to protecting and respecting your data privacy. We want you to know how we use and protect your personal information. This includes informing you of your rights regarding your personal information that we hold. This Privacy Policy sets out how we may use, process and store your personal information. This privacy policy is an electronic record, in the form of an electronic contract, formed under the Information Technology Act, 2000 and the rules made thereunder and the amended provisions pertaining to electronic documents/records in various statutes as amended by the Information Technology Act, 2000. This privacy policy does not require any physical, electronic or digital signature. This Privacy Policy (“Privacy Policy”) discloses the privacy practices for Incture Innovations Private Limited (“Incture”, “We” or “Us”) with regard to Your (“You” or “Your”) use of the online platform www.incture.com (“Site”). By visiting this Website you agree to be bound by the terms and conditions of this Privacy Policy. If you do not agree please do not use or access our Website. By mere use of the Website, you expressly consent to our use and disclosure of your personal information in accordance with this Privacy Policy. This Privacy Policy is incorporated into and subject to the Terms of Use. This document is published and shall be construed in accordance with the provisions of the Information Technology (Reasonable security practices and procedures and sensitive personal data or information) Rules, 2011 under Information Technology Act, 2000; that require publishing of the privacy policy for collection, use, storage and transfer of sensitive personal data or information. Please read this privacy policy carefully."
			);
		},

		onTermsandCond: function (oEvent) {

			var check = oEvent.getParameter("selected");
			if (check) {
				this.getView().byId("idSubmitBtn").setEnabled(true);
			} else {
				this.getView().byId("idSubmitBtn").setEnabled(false);
			}
		},

		handleUploadComplete: function (oEvent) {
			var sUrl = "/JAVA_SERVICE/visitor/addImage";
			var sResponse = oEvent.getParameter(sUrl);
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},
		handleUploadPress: function () {
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
		}
	
		

	});

});