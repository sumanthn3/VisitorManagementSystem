sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utility/formatter"
], function (Controller, JSONModel, Log, MessageToast, Fragment, Sorter, Popover, Button, library, Device, coreLibrary, Core, MessageBox,
	UIComponent, Filter, FilterOperator, formatter) {
	"use strict";
	var webSocket;
	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;
	var oView;
	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.Security", {
		formatter: formatter,
		onInit: function () {
			oView = this.getView();
			var comboData = {
				"sSelect": "",
				"CheckedInVisibility": true,
				"CheckedOutVisibility": false,
				"ExpectedVisibility": true,
				"NoShowVisibility": false,
				"list": [

					{
						"Type": "Signature Required",
						"Value": 1
					}, {
						"Type": "No Signature Required",
						"Value": 0
					}
				]
			};
			var oModel1 = new JSONModel(comboData);
			this.getView().setModel(oModel1, "oViewModel");
			var oModel2 = new JSONModel(this._data);
			this.getView().setModel(oModel2);
			var oModel3 = new JSONModel("model/data.json");
			this.getView().setModel(oModel3, "oGlobalModel");
			var oModel4 = new JSONModel("model/VisitorDetails.json");
			this.getView().setModel(oModel4, "oPreRegForm");

			var oSecurityModel = this.getOwnerComponent().getModel("oSecurityModel");
			this.getView().setModel(oSecurityModel, "oSecurityModel");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var today = new Date();
			var newdate = oDateFormat.format(today);
			this.getView().getModel("oSecurityModel").setProperty("/Date", newdate);
			var evacMessage = "Please Evacuate this building As soon as possible";
			this.getView().getModel("oSecurityModel").setProperty("/evacMessage", evacMessage);

			this.onCheckedOut();
			this.onCheckedIn();

			this.onAvailableSlots();
			this.onNoShow();
			this.onExpected();
			this.getView().byId("navlist").setSelectedKey("securityDash");
			//Evacuation

			var sUrl2 = "/JAVA_SERVICE/admin/getAllPresentInside?date=" + newdate;
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
				success: function (data) {
					var emp = data.employeeDos;
					var visitor = data.visitorResponses;
					oSecurityModel.setProperty("/getAllPresent", emp);
					oSecurityModel.setProperty("/getAllPresent1", visitor);
				

				},
				type: "GET"
			});

			//get Employee List
			var sUrl1 = "/JAVA_SERVICE/employee/employees";
			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					oSecurityModel.setProperty("/getEmployeeList", data);
				},
				type: "GET"
			});

			//Recent Deliveries

			var sUrl4 = "/JAVA_SERVICE/security/getRecentDelivery?date=" + newdate;
			$.ajax({
				url: sUrl4,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					oSecurityModel.setProperty("/getRecentDeliveries", data);
				},
				type: "GET"
			});

			//parking
			var sUrl5 = "/JAVA_SERVICE/security/getVehicles";
			$.ajax({
				url: sUrl5,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					oSecurityModel.setProperty("/getParkingStatus", data);
				},
				type: "GET"
			});

			//get Available 
			var sUrl6 = "/JAVA_SERVICE/security/getParkingSlots";
			$.ajax({
				url: sUrl6,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var n = 0;
					var result = data.filter(function (e) {
						return e.status === n;
					});
					var NumOfParking = result.length;
					oSecurityModel.setProperty("/NumOfParking", NumOfParking);

					oSecurityModel.setProperty("/getAvailablePark", result);

				},
				type: "GET"
			});
			//notiF coUNT
			var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oSecurityModel.getProperty("/eId");
			$.ajax({
				url: sUrl3,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data1) {
					var NotifCount = data1.toString();
					oSecurityModel.setProperty("/NotifCount", NotifCount);
				},
				type: "GET"
			});

			webSocket = new WebSocket("WSS://vms14p2002476963trial.hanatrial.ondemand.com/VMS/chat/" + oSecurityModel.getProperty("/eId"));
			webSocket.onerror = function (event) {
				var message = JSON.parse(event.data);
				MessageBox.information(message.content);

			};
			webSocket.onopen = function (event) {
				var message = JSON.parse(event.data);
				MessageBox.information(message.content);
			};
			webSocket.onmessage = function (event) {
				var message = JSON.parse(event.data);
			 MessageBox.information(message.content);
				var sUrl7 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oSecurityModel.getProperty("/eId");
				$.ajax({
					url: sUrl7,
					data: null,
					async: true,
					cache: false,
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					error: function (err) {
						sap.m.MessageToast.show("Destination Failed");
					},
					success: function (data) {
						var NotifCount = data.toString();
						oSecurityModel.setProperty("/NotifCount", NotifCount);
					},
					type: "GET"
				});
				
			};

		},

		_data: {
			"date": new Date()

		},
		onDateChange1: function () {
			var that = this;
			that.onCheckedOut();
			that.onCheckedIn();

		},
		onDateChange2: function () {
			var that = this;
			that.onExpected();
			that.onNoShow();

		},
		//Delivery
		onAdd: function () {
		
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("idNewDelivery", "inc.inkthn.neo.NEO_VMS.fragments.Security.NewDelivery", this);
			}
			this.getView().addDependent(this._oDialog);
			this._oDialog.open();

		},
		onCancel: function () {
		
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
		},
		onCancelPark:function(){
			this._oDialog1.close();
			this._oDialog1.destroy();
			this._oDialog1 = null;
		
		},
		onBadgeCancel:function(){
			var that=this;
			 that._oDialog2.close();
			that._oDialog2.destroy();
			that._oDialog2= null;	
		},
		onNotify: function () {
			
			var that = this;
			var eId = that.getView().getModel("oSecurityModel").getProperty("/eId");
			var contactNo = sap.ui.core.Fragment.byId("idNewDelivery", "idEmpId").getValue();
			var signature = that.getView().getModel("oViewModel").getProperty("/sSelect");
			var payload = {
				eId: eId,
				contactNo: contactNo,
				signature: signature
			};
			var sUrl = "/JAVA_SERVICE/security/addDelivery";
			$.ajax({
				url: sUrl,
				data: {
					"data": JSON.stringify(payload)
				},
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show(" Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Notification Sent Successfully");

					} else if (data.status === 300) {
						MessageBox.alert("Mobile Number Doesn't Exist");
					} else {
						sap.m.MessageToast.show("Server Not Responding");
					}
				},
				type: "POST"
			});
			this.onRefreshDeliveries();
			this._oDialog.destroy();
			this._oDialog = null;
			this._oDialog.close();
				
		},
		onAcceptDelivery: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var odata = oEvent.getSource().getBindingContext("oSecurityModel").getObject();
			var dId = odata.dId;
			var payload = {
				dId: dId
			};
			var sUrl = "/JAVA_SERVICE/security/acceptDelivery";
			$.ajax({
				url: sUrl,
				data: payload,

				dataType: "json",

				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Delivery Accepted");
						
					}

				},
				type: "POST"
			});
			this.onRefreshDeliveries();
		},
		onRejectDelivery: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var odata = oEvent.getSource().getBindingContext("oSecurityModel").getObject();
			var dId = odata.dId;
			var payload = {
				dId: dId
			};
			var sUrl = "/JAVA_SERVICE/security/rejectDelivery";
			$.ajax({
				url: sUrl,
				data: payload,

				dataType: "json",

				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Delivery Rejected");
						var date = that.getView().byId("evacDate").getValue();
						var sUrl4 = "/JAVA_SERVICE/security/getRecentDelivery?date=" + date;
						$.ajax({
							url: sUrl4,
							data: null,
							async: true,
							cache: false,
							dataType: "json",
							contentType: "application/json; charset=utf-8",
							error: function (err) {
								sap.m.MessageToast.show("Destination Failed");
							},
							success: function (odata1) {

								oSecurityModel.setProperty("/getRecentDeliveries", odata1);
							},
							type: "GET"
						});
					}

				},
				type: "POST"
			});
				this.onRefreshDeliveries();
		},

		//Parking
		onSpotRegister: function () {
			
			var oSecurityModel = this.getOwnerComponent().getModel("oSecurityModel");

			
			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("idSpotRegister", "inc.inkthn.neo.NEO_VMS.fragments.Security.SpotRegParking", this);
			}
			this.getView().addDependent(this._oDialog1);
			this._oDialog1.open();
		
		},
		onBookParking: function () {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl6 = "/JAVA_SERVICE/security/getParkingSlots";
			$.ajax({
				url: sUrl6,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var n = 0;
					var result = data.filter(function (e) {
						return e.status === n;
					});
					var NumOfParking = result.length;
					oSecurityModel.setProperty("/NumOfParking", NumOfParking);

					oSecurityModel.setProperty("/getAvailablePark", result);

				},
				type: "GET"
			});
			var pId = that.getView().getModel("oSecurityModel").getProperty("/pId");
			var vehicleNo = that.getView().getModel("oSecurityModel").getProperty("/VehicleNo");
			var payload = {
				pId: pId,
				vehicleNo: vehicleNo
			};
			var sUrl = "/JAVA_SERVICE/security/parkVehicle";
			$.ajax({
				url: sUrl,
				data: payload,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Booking Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Booked Successful");

					} else if (data.status === 500) {
						sap.m.MessageToast.show("Something Happened Wrong");

					}
				},
				type: "POST"
			});
		    	this._oDialog1.close();
		    	this._oDialog1.destroy();
		    	this._oDialog1 = null;
		    	this.onAvailableSlots();
				this.onRefreshParking();
				
		},
		onBackOut: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var odata = oEvent.getSource().getBindingContext("oSecurityModel").getObject();
			var vehicleNo = odata.vehicleNo;
			var payload = {
				vehicleNo: vehicleNo
			};
			var sUrl = "/JAVA_SERVICE/security/backOutVehicle";
			$.ajax({
				url: sUrl,
				data: payload,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Booking Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("BackOut Successful");

						var sUrl5 = "/JAVA_SERVICE/security/getVehicles";
						$.ajax({
							url: sUrl5,
							data: null,
							async: true,
							cache: false,
							dataType: "json",
							contentType: "application/json; charset=utf-8",
							error: function (err) {
								sap.m.MessageToast.show("Destination Failed");
							},
							success: function (data) {

								oSecurityModel.setProperty("/getParkingStatus", data);
							},
							type: "GET"
						});

					} else if (data.status === 500) {
						sap.m.MessageToast.show("Something Happened Wrong");

					}
				},
				type: "POST"
			});
			this.onAvailableSlots();
				this.onRefreshParking();
		},

		//DashBoard
		onCheckedIn: function () {
			this.getView().byId("onCheckInTile").addStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onParkingTile").removeStyleClass("TilePress");
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl1 = "/JAVA_SERVICE/security/getCheckedInVisitors?date=" + oSecurityModel.getProperty("/Date");
			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var CheckedInCount = data.length;
					oSecurityModel.setProperty("/CheckedInCount", CheckedInCount);
					oSecurityModel.setProperty("/CheckedIn", data);

				},
				type: "GET"
			});

			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
		},
		onCheckedOut: function () {
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").addStyleClass("TilePress");
			this.getView().byId("onParkingTile").removeStyleClass("TilePress");
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl1 = "/JAVA_SERVICE/security/getCheckedOutVisitors?date=" + oSecurityModel.getProperty("/Date");
			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var CheckedOutCount = data.length;
					oSecurityModel.setProperty("/CheckedOutCount", CheckedOutCount);
					oSecurityModel.setProperty("/CheckedOut", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", true);
		},
		onAvailableSlots: function () {
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onParkingTile").addStyleClass("TilePress");
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl6 = "/JAVA_SERVICE/security/getParkingSlots";
			$.ajax({
				url: sUrl6,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var n = 0;
					var result = data.filter(function (e) {
						return e.status === n;
					});
					var NumOfParking = result.length;
					oSecurityModel.setProperty("/NumOfParking", NumOfParking);

					oSecurityModel.setProperty("/getAvailablePark", result);

				},
				type: "GET"
			});

		},
		getBadge:function(oEvent){
				var that=this;
			var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var odata = oEvent.getSource().getBindingContext("oSecurityModel").getObject();
			var vhId = odata.vhId;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
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
				success: function (odata1) {
					oSecurityModel.setProperty("/getBadge", odata1);
						oDialog.close();
					if (!that._oDialog2) {
						that._oDialog2 = sap.ui.xmlfragment("idbadge1", "inc.inkthn.neo.NEO_VMS.fragments.Security.Badge", that);
					}
					that.getView().addDependent(that._oDialog2);
					that._oDialog2.open();
				},
				type: "GET"
			});
		},
         onPrint:function(){
         	
           window.print();
         },
		//Today Log
		onExpected: function () {
			this.getView().byId("onExpected").addStyleClass("TilePress");
			this.getView().byId("onNoShow").removeStyleClass("TilePress");

			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl1 = "/JAVA_SERVICE/security/getExpectedVisitors?date=" + oSecurityModel.getProperty("/Date");
			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var ExpectedCount = data.length;
					oSecurityModel.setProperty("/ExpectedCount", ExpectedCount);
					oSecurityModel.setProperty("/Expected", data);

				},
				type: "GET"
			});

			this.getView().getModel("oViewModel").setProperty("/ExpectedVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/NoShowVisibility", false);
		},
		onNoShow: function () {
			this.getView().byId("onExpected").removeStyleClass("TilePress");
			this.getView().byId("onNoShow").addStyleClass("TilePress");

			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl1 = "/JAVA_SERVICE/security/getNoShowVisitors?date=" + oSecurityModel.getProperty("/Date");
			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var NoShowCount = data.length;
					oSecurityModel.setProperty("/NoShowCount", NoShowCount);
					oSecurityModel.setProperty("/NoShow", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/ExpectedVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/NoShowVisibility", true);
		},

		//TNT
		onSideNavButtonPress: function () {
			var oToolPage = this.byId("ToolPage");
			var bSideExpanded = oToolPage.getSideExpanded();
			// this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},
		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		},
		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("detailContainer").to(this.getView().createId(oItem.getKey()));
		},

		// NOTIFICATION
		onNotificationPopover: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl = "/JAVA_SERVICE/employee/viewNotifications?eId=" + oSecurityModel.getProperty("/eId");
			$.ajax({
				url: sUrl,
				data: null,
				type: "GET",
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					 
					oSecurityModel.setProperty("/Notification", data);

				}

			});
			var oButton = oEvent.getSource();
			if (!this._oPopover) {
				Fragment.load({
					name: "inc.inkthn.neo.NEO_VMS.fragments.Security.Notification",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},
		onNotificationPopoverClose: function (oEvent) {
			this._oPopover.close();
		},
		handleDelete: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("oSecurityModel").getPath();
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			var oDel = sPath.split("/");
			var oDelitem = oDel[2];
			oSecurityModel.getProperty("/Notification").splice(oDelitem);
		},
		onItemClose: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();
			oList.removeItem(oItem);
			var del = oItem.getAuthorName();
			var aDel = del.split(",");
			var nId = aDel[0];

			var sUrl = "/JAVA_SERVICE/employee/readNotifications";
			var payload = {
				nId: nId,
			};
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				type: "POST",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oSecurityModel.getProperty("/eId");
					$.ajax({
						url: sUrl3,
						data: null,
						async: true,
						cache: false,
						dataType: "json",
						contentType: "application/json; charset=utf-8",
						error: function (err) {
							sap.m.MessageToast.show("Destination Failed");
						},
						success: function (data1) {
							var NotifCount = data1.toString();
							oSecurityModel.setProperty("/NotifCount", NotifCount);
						},
						type: "GET"
					});
				}
			});
		},
		onRejectPress: function () {
			MessageToast.show("Rejected");
		},
		onAcceptPress: function () {
			MessageToast.show("Accepted");
		},

		//Profile
		onRefreshPicture: function(){
			var that = this;
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var username = that.getView().getModel("oLoginModel").getProperty("/eId");
			var password = that.getView().getModel("oLoginModel").getProperty("/password");
			var sUrl = "/JAVA_SERVICE/employee/login2?username=" + username + "&password=" + password;
			$.ajax({
				url: sUrl,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
						oDialog.close();
				},
				success: function (data) {
					var email = data.email;
					var image = data.image;
					var name = data.name;
					var contactNo = data.contactNo;
					that.getView().getModel("oSecurityModel").setProperty("/email", email);
					that.getView().getModel("oSecurityModel").setProperty("/image", image);
					that.getView().getModel("oSecurityModel").setProperty("/name", name);
					that.getView().getModel("oSecurityModel").setProperty("/contactNo", contactNo);
						oDialog.close();

				},
				type: "GET"
			});
		},
		onEditProfile: function () {
			if (!this._oDialog3) {
				this._oDialog3 = sap.ui.xmlfragment("idSecurityEditProfile", "inc.inkthn.neo.NEO_VMS.fragments.Security.EditProfile", this);
			}
			this.getView().addDependent(this._oDialog3);
			this._oDialog3.open();
			var that = this;
			var username = that.getView().getModel("oLoginModel").getProperty("/eId");
			var password = that.getView().getModel("oLoginModel").getProperty("/password");
			var sUrl = "/JAVA_SERVICE/employee/login2?username=" + username + "&password=" + password;
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
					var email = data.email;
					var image = data.image;
					var name = data.name;
					var contactNo = data.contactNo;
					that.getView().getModel("oSecurityModel").setProperty("/email", email);
					that.getView().getModel("oSecurityModel").setProperty("/image", image);
					that.getView().getModel("oSecurityModel").setProperty("/name", name);
					that.getView().getModel("oSecurityModel").setProperty("/contactNo", contactNo);

				},
				type: "GET"
			});
		},
		onSaveProfile: function () {
			var that = this;
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			
			var eId = that.getView().getModel("oSecurityModel").getProperty("/eId");
			var email = that.getView().getModel("oSecurityModel").getProperty("/email");
			var contactNo = that.getView().getModel("oSecurityModel").getProperty("/contactNo");
			var NewImage = that.getView().getModel("oSecurityModel").getProperty("/NewImage");
			var imageb64 = NewImage.split(",");
			var imageString = imageb64[1];
			var sUrl = "/JAVA_SERVICE/employee/editDetails";
			var item = {
				"eId": eId,
				"email": email,
				"contactNo": contactNo,
				"image": imageString
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data: item,
			
				success: function (oData) {
					if (oData.status === 200) {
						MessageBox.alert("Profile Updated Successfully");
										oDialog.close();
						that.onRefreshPicture();
					}
					
					that._oDialog3.close();
				
				},
				error: function (e) {
					MessageBox.alert("Update Failed");
						oDialog.close();
			
				}

			});
			
		},
		onProfile: function (event) {
			var that = this;
			var name = this.getView().getModel("oSecurityModel").getProperty("/name");
			var email = this.getView().getModel("oSecurityModel").getProperty("/EMPemail");
			var image = this.getView().getModel("oSecurityModel").getProperty("/image");
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [
					new sap.m.Avatar({
						src: 'data:image/png;base64,' + image, // sap.ui.core.URI
						displayShape: sap.m.AvatarShape.Circle, // sap.m.AvatarShape
						displaySize: sap.m.AvatarSize.L, // sap.m.AvatarSize
						customDisplaySize: "3rem", // sap.ui.core.CSSSize
						customFontSize: "1.125rem", // sap.ui.core.CSSSize
						imageFitType: sap.m.AvatarImageFitType.Cover,
						showBorder:true // sap.m.AvatarImageFitType

					}),
					new sap.m.Text({
						text: name,
						textAlign: 'Center'
					}),
					new sap.m.Text({
						text: email,
						textAlign: 'Center'
					}),
					new Button({
						text: "Edit Profile",
						type: ButtonType.Ghost,
						press: function (oEvent) {
							that.onEditProfile(oEvent);
						}
					}),
					new Button({
						text: 'Logout',
						type: ButtonType.Ghost,
						press: function (oEvent) {
							that.onLogOut(oEvent);
						},
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover ProfileName PopImage ProfileBtns');
			oPopover.openBy(event.getSource());
		},
		onLogOut: function () {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl = "/JAVA_SERVICE/employee/logout";
			var eId = that.getView().getModel("oSecurityModel").getProperty("/eId");
			var item = {
				eId: eId
			};
			$.ajax({
				url: sUrl,
				data: item,
				dataType: "json",
				error: function (err) {
					sap.m.MessageToast.show("Logout Failed");
				},
				success: function (data) {
					if (data.status === 200) {

						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("RouteLanding");
						that.getView().getModel("oLoginModel").setProperty("/eId","");
						that.getView().getModel("oLoginModel").setProperty("/password","");
					}
				},
				type: "POST"
			});
			webSocket.close();
		},
		onChangePicture: function () {
			navigator.camera.getPicture(this.onSuccessPic, this.onFail, {
				quality: 75,
				targetWidth: 300,
				targetHeight: 300,
				sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: navigator.camera.DestinationType.FILE_URI
			});
		},
		onSuccessPic: function (imageData) {
			var imageId = sap.ui.core.Fragment.byId("idSecurityEditProfile", "idEditSecurityPICTURE");
			imageId.setSrc(imageData);
			oView.getModel("oSecurityModel").setProperty("/NewImage", imageData);

		},
		onFail: function (message) {
			MessageBox.alert("Failed because: " + message);
		},
		onCancelProfile: function () {
			this._oDialog3.close();

		},

		//Evacuation
		onSelectEmployee: function () {
			if (!this._oDialog6) {
				this._oDialog6 = sap.ui.xmlfragment("idSecurityEmployee", "inc.inkthn.neo.NEO_VMS.fragments.Security.EvacuationEmp", this);
			}
			this.getView().addDependent(this._oDialog6);
			this._oDialog6.open();
		},
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleClose: function (oEvent) {

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				var email = aContexts.map(function (oContext) {
					return oContext.getObject().email;
				});

			}
			this.getView().getModel("oSecurityModel").setProperty("/empEmail", email);
		},
		onSelectAll: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var emp = that.getView().getModel("oSecurityModel").getProperty("/getAllPresent");
			var vis = that.getView().getModel("oSecurityModel").getProperty("/getAllPresent1");
			var total = emp.concat(vis);
			var list = [];
			var item;
			for (var i = 0; i < total.length; i++) {
				item = total[i];
				list.push(item.email);
			}
			var evacMessage = that.getView().getModel("oSecurityModel").getProperty("/evacMessage");
			var sUrl = "/JAVA_SERVICE/admin/sendEvacuationMessage";
			var payload = {
				"emailList": list,
				"message": evacMessage
			};
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
						sap.m.MessageToast.show("Evacuation Message Sent Successfully");
					}

				},
				error: function (e) {
					sap.m.MessageToast.show("Failed");

				}

			});
			that.getView().getModel("oSecurityModel").setProperty("/evacMessage", "");
		},
		onSendSelected: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var oSelectedPathEmp = that.getView().byId("tableEmp").getSelectedIndices();
			var oEmpTable = that.getView().byId("tableEmp");
			var EmpemailList = [];
			var Emplist = oEmpTable.getBinding().oList;
			for (var i = 0; i <= oSelectedPathEmp.length; i++) {
				EmpemailList.push(Emplist[i].email);
			}
			var oSelectedPathVis = that.getView().byId("tableEmp").getSelectedIndices();
			var oVisTable = that.getView().byId("tableVis");
			var VisemailList = [];
			var Vislist = oVisTable.getBinding().oList;
			for (var i = 0; i <= oSelectedPathVis.length; i++) {
				VisemailList.push(Vislist[i].email);
			}
			var TotalList = EmpemailList.concat(VisemailList);

			var evacMessage = that.getView().getModel("oSecurityModel").getProperty("/evacMessage");
			var sUrl = "/JAVA_SERVICE/admin/sendEvacuationMessage";
			var payload = {
				"emailList": TotalList,
				"message": evacMessage
			};
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
						sap.m.MessageToast.show("Evacuation Message Sent Successfully");
					}

				},
				error: function (e) {
					sap.m.MessageToast.show("Failed");

				}

			});
			that.getView().getModel("oSecurityModel").setProperty("/evacMessage", "");
		},

		//Refresh
		onRefreshDeliveries: function () {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var date = that.getView().getModel("oSecurityModel").getProperty("/Date");
			var sUrl4 = "/JAVA_SERVICE/security/getRecentDelivery?date=" + date;
			$.ajax({
				url: sUrl4,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {

					oSecurityModel.setProperty("/getRecentDeliveries", data);
				},
				type: "GET"
			});
		},
		onRefreshParking: function () {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var sUrl5 = "/JAVA_SERVICE/security/getVehicles";
			$.ajax({
				url: sUrl5,
				data: null,
				async: true,
				cache: false,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {

					oSecurityModel.setProperty("/getParkingStatus", data);
				},
				type: "GET"
			});
		},
		onVisSearch: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("tableVis");
			var oBinding = oTable.getBinding();
			oBinding.filter(aFilters);
		},
		onEmpSearch: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("tableEmp");
			var oBinding = oTable.getBinding();
			oBinding.filter(aFilters);
		}
	});

});