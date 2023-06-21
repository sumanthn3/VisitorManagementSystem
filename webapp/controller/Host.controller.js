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
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Log, MessageToast, Fragment, Sorter, Popover, Button, library, Device, coreLibrary, Core, MessageBox,
	UIComponent, Filter, FilterOperator) {
	"use strict";
	var webSocket;
	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;
	var oView;

	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.Host", {
		oView: null,
		onInit: function () {
			oView = this.getView();
			var comboData = {

				"sSelect": "",
				"UpcomingVisibility": true,
				"CheckedInVisibility": false,
				"CheckedOutVisibility": false,
				"TotalVisitorVisibility": false,
				"AddVisVisibility": false,
				"TextVisibility": false,
				"ButtonVisibility": true,
				"AcceptVisibility": false,
				"RejectVisibility": false,
				"MeetingReqVisibility": true,
				"OnGoingMeetingVisibility": false,
				"list": [

					{
						"Identity": "Aadhar Card"
					}, {
						"Identity": "PassPort"
					}, {
						"Identity": "Driving License"
					}

				],
				"list1": [

					{
						"ParkingType": "Not Required",
						"Parkingid": 0
					}, {
						"ParkingType": "Two Wheeler",
						"Parkingid": 2
					}, {
						"ParkingType": "Four Wheeler",
						"Parkingid": 4
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
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			this.getView().setModel(oHostModel, "oHostModel");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var today = new Date();
			var newdate = oDateFormat.format(today);
			this.getView().getModel("oHostModel").setProperty("/Date", newdate);
 
			this.getView().byId("navlist").setSelectedKey("hostDash");
			
			var meetingDate = new Date();
			this.getView().getModel("oHostModel").setProperty("/meetingDate", meetingDate);
			//get Blacklist details
			var sUrl = "/JAVA_SERVICE/employee/getBlacklistedVisitors?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/GetBlacklisted", data);
				},
				type: "GET"
			});
			//Pre Reg UpComing
			var sUrl1 = "/JAVA_SERVICE/employee/getPreregisterStatus?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/getPreregister", data);
				},
				type: "GET"
			});
			//GET on-Spot Meeting Request
			var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/getOnSpotMeetingRequest", data);
				},
				type: "GET"
			});

			//Notifications
			var sUrl6 = "/JAVA_SERVICE/employee/viewNotifications?eId=" + oHostModel.getProperty("/eId");
			$.ajax({
				url: sUrl6,
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
					oHostModel.setProperty("/Notification", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].name === "Delivery") {
							oHostModel.setProperty("/Notification/" + i + "/AcceptVisibility", true);

						} else {
							oHostModel.setProperty("/Notification/" + i + "/AcceptVisibility", false);
						}
					}

				}
			});

			//notiF coUNT
			var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oHostModel.getProperty("/eId");
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
				success: function (data) {
					var NotifCount = data.toString();
					oHostModel.setProperty("/NotifCount", NotifCount);
				},
				type: "GET"
			});

			//DashBoard

			this.onCheckedIn();
			this.onCheckedOut();
			this.onTotalVisittor();
			this.onUpcoming();
			this.OnGoingMeeting();
			this.onMeetingRequest();
			webSocket = new WebSocket("WSS://vms14p2002476963trial.hanatrial.ondemand.com/VMS/chat/" + oHostModel.getProperty("/eId"));
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
				var sUrl4 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oHostModel.getProperty("/eId");
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
						var NotifCount = data.toString();
						oHostModel.setProperty("/NotifCount", NotifCount);
					},
					type: "GET"
				});
			
			};

		},

		// DATE
		_data: {
			"date": new Date()

		},
		onDateChange: function () {
			var that = this;

			that.onCheckedIn();
			that.onCheckedOut();
			that.onTotalVisittor();
			that.onUpcoming();
		},

		// PRE REGISTRATION
		onAdd: function () {
			this.bFlag = true;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("idAddVisitorFrag", "inc.inkthn.neo.NEO_VMS.fragments.Host.PreRegForm", this);
			}
			this.getView().addDependent(this._oDialog);
			this._oDialog.open();

		},
		onNext: function () {
			var vfirstName = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idfirstName").getValue();
			var vlastName = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idlastName").getValue();
			var vemail = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idEmail").getValue();
			var vcontactNo = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPhone").getValue();
			var vpurpose = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisPurp").getValue();
			var vorganisation = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisOrg").getValue();
			var vdate = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetDate").getValue();
			var vpark = this.getView().getModel("oHostModel").getProperty("/sParking");
			if (!vfirstName || !vlastName || !vemail || !vcontactNo || !vpurpose || !vorganisation || !vdate || !vpark) {
				MessageBox.alert("Please fill all the mandatory details");
			} else {
				this._oDialog.close();
				if (!this._oDialog1) {
					this._oDialog1 = sap.ui.xmlfragment("idPreRegBookRoom", "inc.inkthn.neo.NEO_VMS.fragments.Host.PreRegBookRoom", this);
				}
				this.getView().addDependent(this._oDialog1);
				this._oDialog1.open();
				var that = this;
				var sTime1 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetStart").getValue();
				var eTime2 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetEnd").getValue();
				var date1 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetDate").getValue();

				var sUrl = "/JAVA_SERVICE/employee/getAvailableRooms?begin=" + date1 + " " + sTime1 + "&end=" + date1 + " " + eTime2;
				var oHostModel = that.getOwnerComponent().getModel("oHostModel");
				$.ajax({
					url: sUrl,
					type: "GET",
					cache: false,
					async: true,
					dataType: "json",
					data: null,
				
					contentType: "application/json",
					success: function (oData) {
						oHostModel.setProperty("/AvailableRoom", oData);
					},
					error: function (e) {
						sap.m.MessageToast.show("Internal server Error");
					}
				});
			}
		},
		onSave: function () {
			var firstName = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idfirstName").getValue();
			var lastName = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idlastName").getValue();
			var email = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idEmail").getValue();
			var contactNo = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPhone").getValue();
			var personalIdType = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPerID").getValue();
			var identityNo = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPerIDNum").getValue();
			var purpose = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisPurp").getValue();
			var organisation = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisOrg").getValue();
			var date = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetDate").getValue();
			var beginTime = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetStart").getValue();
			var endTime = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetEnd").getValue();
			var room = sap.ui.core.Fragment.byId("idPreRegBookRoom", "idBookRoom").getValue();
			var roomId = room.split("=");
			var wifi = sap.ui.core.Fragment.byId("idPreRegBookRoom", "idwifi").getSelected();
			var ac = sap.ui.core.Fragment.byId("idPreRegBookRoom", "idAc").getSelected();
			var Snacks = sap.ui.core.Fragment.byId("idPreRegBookRoom", "idSnacks").getSelected();
			var f1 = "Wifi";
			var f2 = "Air Conditioner";
			var f3 = "Snacks and Bevarages";
			var facilities = [];
			if (wifi === true) {
				facilities.push(f1);
			}
			if (ac === true) {
				facilities.push(f2);
			}
			if (Snacks === true) {
				facilities.push(f3);
			}
			var Facility = facilities.toString();
			var eId = this.getView().getModel("oHostModel").getProperty("/eId");
			var i = roomId[2];
			var rId = parseInt(i, [0]);
			var typeId = 1;
			var park = this.getView().getModel("oHostModel").getProperty("/sParking");
			var parking = parseInt(park, [0]);
			var visitor = this.getView().getModel("oPreRegForm").getProperty("/visitor");
			var n = visitor.length;
			var i = 0;
			var x = 0;
			for (i; i < n; i++) {
				if (visitor[i].parkingStatus === "0") {
					x = 0;
				} else if (visitor[i].parkingStatus === "2") {
					x = 2;
				} else if (visitor[i].parkingStatus === "4") {
					x = 4;
				}
				visitor[i].parkingStatus = x;
			}

			var payload = {
				firstName: firstName,
				lastName: lastName,
				email: email,
				contactNo: contactNo,
				organisation: organisation,
				personalIdType: personalIdType,
				identityNo: identityNo,
				parking: parking,
				facilities: Facility,
				title: purpose,
				beginTime: beginTime,
				endTime: endTime,
				date: date,
				eId: eId,
				rId: rId,
				typeId: typeId,
			

				visitor: visitor

			};
			var sUrl = "/JAVA_SERVICE/employee/preRegister";
			$.ajax({
				url: sUrl,
				data: {
					"data": JSON.stringify(payload)
				},
				type: "POST",
				dataType: "json",
				success: function (data) {
					var that = this;
					if (data.mId === null) {
						MessageBox.alert("Registration Unsuccessful");
					} else {
						sap.m.MessageToast.show("Registration Successfull");

					}

				},
				error: function (err) {
					sap.m.MessageToast.show("Registration Failed");
				}
			});
			this._oDialog1.close();
			this.onRefreshPreReg();
		
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idfirstName").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idlastName").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idEmail").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPhone").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPerID").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idPerIDNum").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisPurp").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idVisOrg").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetDate").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetStart").setValue("");
			sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetEnd").setValue("");
			sap.ui.core.Fragment.byId("idPreRegBookRoom", "idBookRoom").setValue("");
			this.getView().getModel("oPreRegForm").setProperty("/visitor", []);

		},
		addVis: function () {
			var oPreRegForm = this.getView().getModel("oPreRegForm");
			var item = oPreRegForm.getProperty("/visitor");
			var obj = {
				"fName": "",
				"lName": "",
				"emailId": "",
				"phoneNo": "",
				"proofType": "",
				"idNo": "",
				"parkingStatus": ""
			};
			oPreRegForm.getData().visitor.push(obj);
			
			oPreRegForm.refresh();

		},
		onVisCancel: function (oEvent) {

			var oItemContextPath = oEvent.getSource().getBindingContext("oPreRegForm").getPath();
			var aPathParts = oItemContextPath.split("/");
			var iIndex = aPathParts[aPathParts.length - 1];

			var oJSONData = this.getView().getModel("oPreRegForm").getProperty("/visitor");
			oJSONData.splice(iIndex, 1);
			this.getView().getModel("oPreRegForm").setProperty("/visitor", oJSONData);

		},

		onAddVisible: function () {

			var visibility = this.getView().getModel("oViewModel").getProperty("/AddVisVisibility");
			if (visibility === false) {
				this.getView().getModel("oViewModel").setProperty("/AddVisVisibility", true);
			} else {
				this.getView().getModel("oViewModel").setProperty("/AddVisVisibility", false);
			}
		},
		//  TNT PAGE
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
		onLogOut: function () {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl = "/JAVA_SERVICE/employee/logout";
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
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

		// NOTIFICATION
		onNotificationPopover: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl = "/JAVA_SERVICE/employee/viewNotifications?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/Notification", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].name === "Delivery") {
							oHostModel.setProperty("/Notification/" + i + "/AcceptVisibility", true);

						} else {
							oHostModel.setProperty("/Notification/" + i + "/AcceptVisibility", false);
						}
					}

				}
			});
			var oButton = oEvent.getSource();
			if (!this._oPopover) {
				Fragment.load({
					name: "inc.inkthn.neo.NEO_VMS.fragments.Host.Notification",
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
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("oHostModel").getPath();
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			var oDel = sPath.split("/");
			var oDelitem = oDel[2];
			oHostModel.getProperty("/Notification").splice(oDelitem);
		},
		onItemClose: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
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
					var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oHostModel.getProperty("/eId");
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
							oHostModel.setProperty("/NotifCount", NotifCount);
						},
						type: "GET"
					});
				}
			});
		},
		onRejectPress: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var oItem = oEvent.getSource().getBindingContext("oHostModel").getPath();
			var x = oItem.split("/");
			var y = x[2];
			var Path = parseInt(y, 0);
			var list = that.getView().getModel("oHostModel").getProperty("/Notification");
			var data = list[Path];
			var nId = data.nId;
			var z = data.contents;
			var z1 = z.split(":");
			var z2 = z1[2];
			var dId = parseInt(z2, 0);

			var sUrl = "/JAVA_SERVICE/employee/rejectDelivery";
			var payload = {
				dId: dId
			};
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				type: "POST",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (odata) {
					if (odata.status === 200) {
						sap.m.MessageToast.show("Delivery Rejected Successfully");
						var sUrl1 = "/JAVA_SERVICE/employee/readNotifications";
						var payload1 = {
							nId: nId,
						};
						$.ajax({
							url: sUrl1,
							dataType: "json",
							data: payload1,
							type: "POST",
							error: function (err) {
								sap.m.MessageToast.show("Destination Failed");
							},
							success: function (data1) {
								var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oHostModel.getProperty("/eId");
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
									success: function (data2) {
										var NotifCount = data2.toString();
										oHostModel.setProperty("/NotifCount", NotifCount);
									},
									type: "GET"
								});
							}
						});
					}
				}
			});
		},
		onAcceptPress: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var oItem = oEvent.getSource().getBindingContext("oHostModel").getPath();
			var x = oItem.split("/");
			var y = x[2];
			var Path = parseInt(y, 0);
			var list = that.getView().getModel("oHostModel").getProperty("/Notification");
			var data = list[Path];
			var nId = data.nId;
			var z = data.contents;
			var z1 = z.split(":");
			var z2 = z1[2];
			var dId = parseInt(z2, 0);

			var sUrl = "/JAVA_SERVICE/employee/acceptDelivery";
			var payload = {
				dId: dId
			};
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				type: "POST",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (odata) {
					if (odata.status === 200) {
						sap.m.MessageToast.show(" Delivery Accepted Successfully");
						var sUrl1 = "/JAVA_SERVICE/employee/readNotifications";
						var payload1 = {
							nId: nId,
						};
						$.ajax({
							url: sUrl1,
							dataType: "json",
							data: payload1,
							type: "POST",
							error: function (err) {
								sap.m.MessageToast.show("Destination Failed");
							},
							success: function (data1) {
								var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oHostModel.getProperty("/eId");
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
									success: function (data2) {
										var NotifCount = data2.toString();
										oHostModel.setProperty("/NotifCount", NotifCount);
									},
									type: "GET"
								});
							}
						});
					}
				}
			});

		},

		// DASHBOARD
		onUpcoming: function () {

			this.getView().byId("onUpcoming").addStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl = "/JAVA_SERVICE/employee/getUpcomingMeetings?eId=" + oHostModel.getProperty("/eId") + "&date=" + oHostModel.getProperty(
				"/Date");
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
					var UpcomingCount = data.length;
					oHostModel.setProperty("/UpcomingCount", UpcomingCount);
					oHostModel.setProperty("/UpcomingMeeting", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/TotalVisitorVisibility", false);

		},
		onCheckedIn: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").addStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getCheckedInVisitors?eId=" + oHostModel.getProperty("/eId") + "&date=" + oHostModel.getProperty(
				"/Date");
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
					oHostModel.setProperty("/CheckedInCount", CheckedInCount);
					oHostModel.setProperty("/CheckedIn", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/TotalVisitorVisibility", false);

		},
		onCheckedOut: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").addStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getCheckedOutVisitors?eId=" + oHostModel.getProperty("/eId") + "&date=" + oHostModel.getProperty(
				"/Date");
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
					var CheckedOutCount = data.length;
					oHostModel.setProperty("/CheckedOutCount", CheckedOutCount);
					oHostModel.setProperty("/CheckedOut", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].status === 1) {
							oHostModel.setProperty("/CheckedOut/" + i + "/ButtonVisibility", true);
							oHostModel.setProperty("/CheckedOut/" + i + "/TextVisibility", false);

						} else {
								oHostModel.setProperty("/CheckedOut/" + i + "/ButtonVisibility", false);
							oHostModel.setProperty("/CheckedOut/" + i + "/TextVisibility", true);
						}
					}

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/TotalVisitorVisibility", false);

		},
		onTotalVisittor: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").addStyleClass("TilePress");
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl3 = "/JAVA_SERVICE/employee/getTotalVisitors?eId=" + oHostModel.getProperty("/eId");
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
				success: function (data) {
					var TotalVisitorCount = data.length;
					oHostModel.setProperty("/TotalVisitorCount", TotalVisitorCount);
					oHostModel.setProperty("/TotalVisitor", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].status === 1) {
							oHostModel.setProperty("/TotalVisitor/" + i + "/ButtonVisibilityT", true);
							oHostModel.setProperty("/TotalVisitor/" + i + "/TextVisibilityT", false);

						} else {
								oHostModel.setProperty("/TotalVisitor/" + i + "/ButtonVisibilityT", false);
							oHostModel.setProperty("/TotalVisitor/" + i + "/TextVisibilityT", true);
						}
					}

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/TotalVisitorVisibility", true);

		},

		//Meeting Requests
		onMeetingRequest: function () {

			this.getView().byId("onTileRequest").addStyleClass("TilePress");
			this.getView().byId("onTileOngoing").removeStyleClass("TilePress");

			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
					var OnSpotMeetingRequestCount = data.length;
					oHostModel.setProperty("/OnSpotMeetingRequestCount", OnSpotMeetingRequestCount);
					oHostModel.setProperty("/getOnSpotMeetingRequest", data);
				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/MeetingReqVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/OnGoingMeetingVisibility", false);

		},
		OnGoingMeeting: function () {
			this.getView().byId("onTileRequest").removeStyleClass("TilePress");
			this.getView().byId("onTileOngoing").addStyleClass("TilePress");

			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOngoingMeetings?eId=" + oHostModel.getProperty("/eId");
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
					var OnGoingMeetingCount = data.length;
					oHostModel.setProperty("/OnGoingMeetingCount", OnGoingMeetingCount);
					oHostModel.setProperty("/getOnGoingMeeting", data);
				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/MeetingReqVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/OnGoingMeetingVisibility", true);
		},
		onExtendMeeting: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var mId = odata.mId;
			that.getView().getModel("oHostModel").setProperty("/MeetingID", mId);
			if (!this._oDialog9) {
				this._oDialog9 = sap.ui.xmlfragment("idonExtendMeeting", "inc.inkthn.neo.NEO_VMS.fragments.Host.ExtendMeeting", this);
			}
			this.getView().addDependent(this._oDialog9);
			this._oDialog9.open();
		},
		onExtendTime: function () {
			var that = this;
			var mId = that.getView().getModel("oHostModel").getProperty("/MeetingID");
			var minutes = sap.ui.core.Fragment.byId("idonExtendMeeting", "idExtendTime").getValue();
			var item = {
				"mId": mId,
				"minutes": minutes
			};
			var sUrl = "/JAVA_SERVICE/employee/meetingExtension";
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data: item,
				success: function (oData) {
					if (oData.status === 200) {
						sap.m.MessageToast.show("Meeting Extended Successfully");
						that._oDialog9.close();
					}

				},
				error: function (e) {
					MessageBox.alert("Extension Failed");
					that._oDialog9.close();
				}

			});
			this.OnGoingMeeting();
		},
		onRemoveExtend: function () {
			this._oDialog9.close();
			this._oDialog9.destroy();
			this._oDialog9 = null;
		},
		onEndMeeting: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var mId = odata.mId;
			var sUrl = "/JAVA_SERVICE/employee/endMeeting";
			var item = {
				"mId": mId
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "json",
				async: true,
				data: item,
				success: function (oData) {
					if (oData.status === 200) {
						sap.m.MessageToast.show("Meeting Ended Successfully");
					}

				},
				error: function (e) {
					MessageBox.alert("Something happened wrong");
				}

			});
			this.OnGoingMeeting();
		},

		//BLACKLIST
		onEnterBlacklist: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl = "/JAVA_SERVICE/employee/addBlacklisted";
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
			var vId = that.getView().getModel("oHostModel").getProperty("/vId");
			var reason = that.getView().getModel("oHostModel").getProperty("/reason");
			var payload = {
				eId: eId,
				vId: vId,
				reason: reason
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
					if(data.status===200){
					sap.m.MessageToast.show("Blacklisted Successfully");
				    that.onCheckedOut();
				    that.onTotalVisittor();
					}
					else{
						sap.m.MessageToast.show("something Happened wrong");
					}
					var sUrl1 = "/JAVA_SERVICE/employee/getBlacklistedVisitors?eId=" + oHostModel.getProperty("/eId");
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
						success: function (odata) {
							oHostModel.setProperty("/GetBlacklisted", odata);

						},
						type: "GET"
					});
				}
			});
			this._oDialog2.close();
			this._oDialog2.destroy();
			this._oDialog2 = null;
			 
			this.onRefreshBlacklist();

		},
		onDoBlacklist: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var oItem = oEvent.getSource().getBindingContext("oHostModel").getPath();
			var x = oItem.split("/");
			var y = x[2];
			this.Path = parseInt(y, 0);
			
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var vId = odata.vId;
			that.getView().getModel("oHostModel").setProperty("/vId", vId);
			this.bFlag = true;
			if (!this._oDialog2) {
				this._oDialog2 = sap.ui.xmlfragment("idAddBlacklist", "inc.inkthn.neo.NEO_VMS.fragments.BlackList", this);
			}
			this.getView().addDependent(this._oDialog2);
			this._oDialog2.open();
			this.onRefreshBlacklist();
		},
		onRemoveBlacklist: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var bId = odata.bId;
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
			that.getView().getModel("oHostModel").setProperty("/bId", bId);
			var sUrl = "/JAVA_SERVICE/employee/requestBlacklistRemoval";
			var payload = {
				eId: eId,
				bId: bId
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
					MessageBox.alert("Request Raised Successfully");
				}
			});
			this.onRefreshBlacklist();
		},

		//PROFILE
		onRefreshPicture: function(){
			var that = this;
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var username = that.getView().getModel("oLoginModel").getProperty("/eId");
			var password = that.getView().getModel("oLoginModel").getProperty("/password");
			var sUrl1 = "/JAVA_SERVICE/employee/login2?username=" + username + "&password=" + password;
			$.ajax({
				url: sUrl1,
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
					var email2 = data.email;
					var image2 = data.image;
					var name2 = data.name;
					var contactNo2 = data.contactNo;
					that.getView().getModel("oHostModel").setProperty("/email", email2);
					that.getView().getModel("oHostModel").setProperty("/image", image2);
					that.getView().getModel("oHostModel").setProperty("/name", name2);
					that.getView().getModel("oHostModel").setProperty("/contactNo", contactNo2);
					oDialog.close();
				},
				type: "GET"
			});
		},
		onProfile: function (event) {
			var that = this;

			var name = this.getView().getModel("oHostModel").getProperty("/name");
			var email = this.getView().getModel("oHostModel").getProperty("/EMPemail");
			var image = this.getView().getModel("oHostModel").getProperty("/image");
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
						}
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover ProfileName PopImage ProfileBtns');
			oPopover.openBy(event.getSource());
		},
		onEditProfile: function () {
			if (!this._oDialog3) {
				this._oDialog3 = sap.ui.xmlfragment("idEditProfile", "inc.inkthn.neo.NEO_VMS.fragments.EditProfile", this);
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
					that.getView().getModel("oHostModel").setProperty("/email", email);
					that.getView().getModel("oHostModel").setProperty("/image", image);
					that.getView().getModel("oHostModel").setProperty("/name", name);
					that.getView().getModel("oHostModel").setProperty("/contactNo", contactNo);

				},
				type: "GET"
			});
		},
		onSaveProfile: function () {
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var that = this;
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
			var email = that.getView().getModel("oHostModel").getProperty("/email");
			var contactNo = that.getView().getModel("oHostModel").getProperty("/contactNo");
			var NewImage = that.getView().getModel("oHostModel").getProperty("/NewImage");
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
			var imageId = sap.ui.core.Fragment.byId("idEditProfile", "idEditPICTURE");
			imageId.setSrc(imageData);
			oView.getModel("oHostModel").setProperty("/NewImage", imageData);

		},
		onFail: function (message) {
			MessageBox.alert("Failed because: " + message);
		},

		//EXPAND FRAGMENT   
		onExpandUpcomingVis: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var mId = odata.mId;
			that.getView().getModel("oHostModel").setProperty("/CancelmId",mId);
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getUpcomingMeetings?eId=" + oHostModel.getProperty("/eId") + "&date=" + oHostModel.getProperty(
				"/Date");
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
					var result = data.find(function (e) {
						return e.mId === mId;
					});
					oHostModel.setProperty("/getUpcomingVisitorslist", result);
					

				},
				type: "GET"
			});
			if (!this._oDialog5) {
				this._oDialog5 = sap.ui.xmlfragment("idUpcomingvis", "inc.inkthn.neo.NEO_VMS.fragments.Host.UpcomingVisitorDetails", this);
			}
			this.getView().addDependent(this._oDialog5);
			this._oDialog5.open();

		},
		onExpandPreRegVis: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var mId = odata.mId;
		
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getPreregisterStatus?eId=" + oHostModel.getProperty("/eId");
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
					var result = data.find(function (e) {
						return e.mId === mId;
					});
					oHostModel.setProperty("/getExtraVisitors", result);
				

				},
				type: "GET"
			});
			if (!this._oDialog4) {
				this._oDialog4 = sap.ui.xmlfragment("idEditProfile", "inc.inkthn.neo.NEO_VMS.fragments.Host.ExtraVisitorDetails", this);
			}
			this.getView().addDependent(this._oDialog4);
			this._oDialog4.open();

		},
		onExpandMeetingReq: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var mId = odata.mId;
		
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
					var result = data.find(function (e) {
						return e.mId === mId;
					});
					oHostModel.setProperty("/getOnSpotExtraVisitors", result);
					
				},
				type: "GET"
			});
			if (!this._oDialog6) {
				this._oDialog6 = sap.ui.xmlfragment("idOnSpotExtra", "inc.inkthn.neo.NEO_VMS.fragments.Host.OnSpotExtraDetails", this);
			}
			this.getView().addDependent(this._oDialog6);
			this._oDialog6.open();
		},
		onMeetingCancel:function(){
			var that=this;
			var mId=that.getView().getModel("oHostModel").getProperty("/CancelmId");
			var payload = {
				mId: mId,
			};
			var sUrl= "/JAVA_SERVICE/employee/cancelMeeting";
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Meeting Cancelled Successfully");
							that._oDialog5.close();
					} else {
						sap.m.MessageToast.show("Something Happened Wrong");
					}
				},
				type: "POST"
			});
			this.onUpcoming();
		},

		//REFRESH PAGE
		onRefreshBlacklist: function () {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl = "/JAVA_SERVICE/employee/getBlacklistedVisitors?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/GetBlacklisted", data);

				},
				type: "GET"
			});
			
		},
		onRefreshMeetingReq: function () {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
					var OnSpotMeetingRequestCount = data.length;
					oHostModel.setProperty("/OnSpotMeetingRequestCount", OnSpotMeetingRequestCount);
					oHostModel.setProperty("/getOnSpotMeetingRequest", data);

				},
				type: "GET"
			});
		},
		onRefreshPreReg: function () {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getPreregisterStatus?eId=" + oHostModel.getProperty("/eId");
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
					oHostModel.setProperty("/getPreregister", data);

				},
				type: "GET"
			});
		},

		//CANCEL FRAGMENTS
		onCancel: function () {
			
			this._oDialog.close();
		},
		onBlacklistCancel: function () {
			this._oDialog2.close();
			this._oDialog2.destroy();
			this._oDialog2 = null;
		},
		onCancelProfile: function () {
			this._oDialog3.close();
			this._oDialog3.destroy();
			this._oDialog3 = null;
		},
		onExtraVisitorCancel: function () {
			this._oDialog4.close();
		},
		onUpcomingVisitorCancel: function () {
			this._oDialog5.close();
		},
		onOnSpotExtraDetailsCancel: function () {
			this._oDialog6.close();

		},
		onInformation: function () {
			MessageBox.information("You can not cancel this. Please select the room and Save!!!");
		},
		onRemoveAccept: function () {
			this._oDialog8.close();
			this._oDialog8.destroy();
			this._oDialog8 = null;
		},
		onRemoveReject: function () {
			this._oDialog7.close();
			this._oDialog7.destroy();
			this._oDialog7 = null;
		},

		// ON_SPOT REQUEST

		onRejectOnSpot: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var amId = odata.mId;
			this.getView().getModel("oHostModel").setProperty("/amId", amId);
			if (!this._oDialog7) {
				this._oDialog7 = sap.ui.xmlfragment("idOnSpotReject", "inc.inkthn.neo.NEO_VMS.fragments.Host.RejectMeeting", this);
			}
			this.getView().addDependent(this._oDialog7);
			this._oDialog7.open();

		},
		onAcceptOnSpot: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var odata = oEvent.getSource().getBindingContext("oHostModel").getObject();
			var amId = odata.mId;
			var date = odata.date;
			var beginTime = odata.beginTime;
			var endTime = odata.endTime;
			this.getView().getModel("oHostModel").setProperty("/amId", amId);

			//get rooms
			var sUrl = "/JAVA_SERVICE/employee/getAvailableRooms?begin=" + date + " " + beginTime + "&end=" + date + " " + endTime;
			$.ajax({
				url: sUrl,
				type: "GET",
				cache: false,
				async: true,
				dataType: "json",
				data: null,
				
				contentType: "application/json",
				success: function (oData) {
					oHostModel.setProperty("/AvailableRooms", oData);
				},
				error: function (e) {
					sap.m.MessageToast.show("Internal server Error");
				}
			});
			if (!this._oDialog8) {
				this._oDialog8 = sap.ui.xmlfragment("idOnSpotAccept", "inc.inkthn.neo.NEO_VMS.fragments.Host.AcceptMeeting", this);
			}
			this.getView().addDependent(this._oDialog8);
			this._oDialog8.open();
		},
		onAcceptSend: function (oEvent) {
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/acceptOnSpotVisitor";
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
			var room = sap.ui.core.Fragment.byId("idOnSpotAccept", "idBookRoom").getValue();
			var roomId = room.split("=");
			var i = roomId[2];
			var rId = parseInt(i, [0]);
			var mId = that.getView().getModel("oHostModel").getProperty("/amId");
			var comment = that.getView().getModel("oHostModel").getProperty("/Acceptmessage");
			var payload = {
				eId: eId,
				rId: rId,
				mId: mId,
				comment: comment
			};
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Meeting Approved Successfully");

						var oHostModel = that.getOwnerComponent().getModel("oHostModel");
						var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
							success: function (odata) {
								oHostModel.setProperty("/getOnSpotMeetingRequest", odata);

							},
							type: "GET"
						});
					} else {
						sap.m.MessageToast.show("Something Happened Wrong");
					}
				},
				type: "POST"
			});
			this._oDialog8.close();
			this._oDialog8.destroy();
			this._oDialog8 = null;
			this.onRefreshMeetingReq();
		},
		onRejectSend: function (oEvent) {
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/rejectOnSpotVisitor";
			var eId = that.getView().getModel("oHostModel").getProperty("/eId");
			var mId = that.getView().getModel("oHostModel").getProperty("/amId");
			var comment = that.getView().getModel("oHostModel").getProperty("/Acceptmessage");
			var payload = {
				eId: eId,
				mId: mId,
				comment: comment
			};
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Meeting Rejected ");
					var oHostModel = that.getOwnerComponent().getModel("oHostModel");
					var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oHostModel.getProperty("/eId");
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
							oHostModel.setProperty("/getOnSpotMeetingRequest", data);

						},
						type: "GET"
					});
				},
				type: "POST"
			});
			this._oDialog7.close();
			this._oDialog7.destroy();
			this._oDialog7 = null;
			this.onRefreshMeetingReq();
		},

		// SEARCHING  
		onTotalVisSearch: function (oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("idHostTotalVisitor");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onUpcomingSearch: function (oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("title", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("idHostUpcoming");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onCheckedInSearch: function (oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("idHostCheckedIn");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onCheckedOutSearch: function (oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("idHostCheckedOut");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onTotalVisSOrt: function () {

			var sSort = this.getView().getModel("oHostModel").getProperty("/TotalVisitor/organization");
			var oSorter = new Sorter(sSort);
			var oTable = this.byId("idHostTotalVisitor");
			var oBinding = oTable.getBinding("items");
			oBinding.sort(oSorter);

		}
	
       
	});

});