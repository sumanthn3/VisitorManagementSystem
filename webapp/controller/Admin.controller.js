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
	UIComponent, Filter, FilterOperator,formatter) {
	"use strict";
	var webSocket;
	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;
	var oView;
	return Controller.extend("inc.inkthn.neo.NEO_VMS.controller.Admin", {
		formatter: formatter,
		oView: null,
		onInit: function () {
			oView = this.getView();
			var comboData = {

				"sSelect": "",
				"UpcomingVisibility": true,
				"CheckedInVisibility": false,
				"CheckedOutVisibility": false,
				"FrequentVisitorVisibility": false,
				"FacilityVisibility": true,
				"MyVisitorsVisibility": false,
				"AddVisVisibility": false,
				"TextVisibility": false,
				"ButtonVisibility": true,
				"AcceptVisibility": false,
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
			this.getView().byId("navlist").setSelectedKey("adminDash");
			var oModel1 = new JSONModel(comboData);
			this.getView().setModel(oModel1, "oViewModel");
			var oModel2 = new JSONModel(this._data);
			this.getView().setModel(oModel2);
			var oModel4 = new JSONModel("model/VisitorDetails.json");
			this.getView().setModel(oModel4, "oPreRegForm");
			var oModel3 = new JSONModel("model/data.json");
			this.getView().setModel(oModel3, "oGlobalModel");
			var oAdminModel = this.getOwnerComponent().getModel("oAdminModel");
			this.getView().setModel(oAdminModel, "oAdminModel");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var today = new Date();
			var newdate = oDateFormat.format(today);
			this.getView().getModel("oAdminModel").setProperty("/Date", newdate);

			var meetingDate = new Date();
			this.getView().getModel("oAdminModel").setProperty("/meetingDate", meetingDate);
			var evacMessage = "Please Evacuate this building As soon as possible";
			this.getView().getModel("oAdminModel").setProperty("/evacMessage", evacMessage);
			//get Blacklisted

			var sUrl = "/JAVA_SERVICE/admin/getAllBlackListedVisitors";
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
					oAdminModel.setProperty("/GetBlacklisted", data);
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
					oAdminModel.setProperty("/getEmployeeList", data);
				},
				type: "GET"
			});

			//get Meeting Request

			var sUrl6 = "/JAVA_SERVICE/admin/getAllMeetingRequests";
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
					oAdminModel.setProperty("/getMeetingRequests", data);
				},
				type: "GET"
			});

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
					oAdminModel.setProperty("/getAllPresent", emp);
					oAdminModel.setProperty("/getAllPresent1", visitor);
					// sap.m.MessageToast.show("Refresh  Success");

				},
				type: "GET"
			});

			// FeedBack

			var sUrl2 = "/JAVA_SERVICE/admin/viewFeedbacks";
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
					oAdminModel.setProperty("/getFeedBack", data);
				},
				type: "GET"
			});
			//Total Visitors

			

			var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/NotifCount", NotifCount);
				},
				type: "GET"
			});

			//DashBoard

			this.onCheckedIn();
			this.onCheckedOut();
			this.onFrequentVisittor();
			this.onUpcoming();
           this.OnGoingMeeting();
           this.onMyVisitors();
           this.onFacilities();
			webSocket = new WebSocket("WSS://vms14p2002476963trial.hanatrial.ondemand.com/VMS/chat/" + oAdminModel.getProperty("/eId"));
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
				 
				var sUrl4 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oAdminModel.getProperty("/eId");
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
						oAdminModel.setProperty("/NotifCount", NotifCount);
					},
					type: "GET"
				});
			
			};
			
			var endDate = new Date();
			var eDate = oDateFormat.format(endDate);
			this.getView().getModel("oAdminModel").setProperty("/eDate", eDate);
			
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);
				var sDate = oDateFormat.format(startDate);
			this.getView().getModel("oAdminModel").setProperty("/sDate", sDate);
			this.onReports();
		},
		//date
		_data: {
			"date": new Date()
		},
		onDateChange: function () {
			var that = this;

			that.onCheckedIn();
			that.onCheckedOut();
			that.onFrequentVisittor();
			that.onUpcoming();
		},
		//DashBoard
		onUpcoming: function () {
			this.getView().byId("onUpcoming").addStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl = "/JAVA_SERVICE/admin/getAllUpcomingMeetings?eId=" + oAdminModel.getProperty("/eId") + "&date=" + oAdminModel.getProperty(
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
					oAdminModel.setProperty("/UpcomingCount", UpcomingCount);
					oAdminModel.setProperty("/UpcomingMeeting", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/FrequentVisitorVisibility", false);

		},
		onCheckedIn: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").addStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getCheckedInVisitors?eId=" + oAdminModel.getProperty("/eId") + "&date=" + oAdminModel.getProperty(
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
					oAdminModel.setProperty("/CheckedInCount", CheckedInCount);
					oAdminModel.setProperty("/CheckedIn", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/FrequentVisitorVisibility", false);

		},
		onCheckedOut: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").addStyleClass("TilePress");
			this.getView().byId("onTotalVis").removeStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/admin/getCheckedOutVisitors?eId=" + oAdminModel.getProperty("/eId") + "&date=" + oAdminModel.getProperty(
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
					oAdminModel.setProperty("/CheckedOutCount", CheckedOutCount);
					oAdminModel.setProperty("/CheckedOut", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].status === 1) {
							oAdminModel.setProperty("/CheckedOut/" + i + "/ButtonVisibility", true);
							oAdminModel.setProperty("/CheckedOut/" + i + "/TextVisibility", false);

						} else {
								oAdminModel.setProperty("/CheckedOut/" + i + "/ButtonVisibility", false);
							oAdminModel.setProperty("/CheckedOut/" + i + "/TextVisibility", true);
						}
					}

				},
				type: "GET"
			});

			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/FrequentVisitorVisibility", false);

		},
		onFrequentVisittor: function () {
			this.getView().byId("onUpcoming").removeStyleClass("TilePress");
			this.getView().byId("onCheckInTile").removeStyleClass("TilePress");
			this.getView().byId("onCheckOutTile").removeStyleClass("TilePress");
			this.getView().byId("onTotalVis").addStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl3 = "/JAVA_SERVICE/admin/getFrequentVisitors";
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
					oAdminModel.setProperty("/FrequentVisitors", data);

				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/UpcomingVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedInVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/CheckedOutVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/FrequentVisitorVisibility", true);

		},

		//Parking
		onParkingRequest: function () {
			this.getView().getModel("oViewModel").setProperty("/RoomRequestVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/ParkingRequestVisibility", true);
		},

		//Rooms
		onRoomRequest: function () {
			this.getView().getModel("oViewModel").setProperty("/RoomRequestVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/ParkingRequestVisibility", false);
		},

		// Reports
		onReports: function () {
			var that = this;
			var sdate =	this.getView().getModel("oAdminModel").getProperty("/sDate");
			var edate = 	this.getView().getModel("oAdminModel").getProperty("/eDate");
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/admin/report?begin=" + sdate + "&end=" + edate;
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
					var FrequentVisitorDec = odata[1];
					var FrequentVisitor = FrequentVisitorDec.toFixed(2);
					var FrequentVisitor1 = parseFloat(FrequentVisitor, 0);
					var BlacklistedDec = odata[2];
					var Blacklisted = BlacklistedDec.toFixed(2);
					var Blacklisted1 = parseFloat(Blacklisted, 0);
					var OthersDec = odata[3];
					var Others = OthersDec.toFixed(2);
					var Others1 = parseFloat(Others, 0);
					oAdminModel.setProperty("/DFrequentVisitor", FrequentVisitor1);
					oAdminModel.setProperty("/DBlacklisted", Blacklisted1);
					oAdminModel.setProperty("/DOthers", Others1);
					
				

				},
				type: "GET"
			});
			var sUrl3 = "/JAVA_SERVICE/admin/getData?begin=" + sdate + "&end=" + edate;
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
					oAdminModel.setProperty("/TotalVisitor", data);

				},
				type: "GET"
			});

		},

		//TNT Page
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
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl = "/JAVA_SERVICE/employee/logout";
			var eId = that.getView().getModel("oAdminModel").getProperty("/eId");
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

		//PROFILE
		onRefreshImage: function(){
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
					that.getView().getModel("oAdminModel").setProperty("/email", email);
					that.getView().getModel("oAdminModel").setProperty("/image", image);
					that.getView().getModel("oAdminModel").setProperty("/name", name);
					that.getView().getModel("oAdminModel").setProperty("/contactNo", contactNo);
						oDialog.close();
				},
				type: "GET"
			});
		},
		onProfile: function (event) {
			var that = this;
			var name = this.getView().getModel("oAdminModel").getProperty("/name");
			var email = this.getView().getModel("oAdminModel").getProperty("/EMPemail");
			var image = this.getView().getModel("oAdminModel").getProperty("/image");
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
			if (!this._oDialog5) {
				this._oDialog5 = sap.ui.xmlfragment("idAdminEditProfile", "inc.inkthn.neo.NEO_VMS.fragments.Admin.EditProfile", this);
			}
			this.getView().addDependent(this._oDialog5);
			this._oDialog5.open();
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
					that.getView().getModel("oAdminModel").setProperty("/email", email);
					that.getView().getModel("oAdminModel").setProperty("/image", image);
					that.getView().getModel("oAdminModel").setProperty("/name", name);
					that.getView().getModel("oAdminModel").setProperty("/contactNo", contactNo);

				},
				type: "GET"
			});
		},
		onSaveProfile: function () {
				var oDialog =new sap.m.BusyDialog();
			oDialog.open();
			var that = this;
			var eId = that.getView().getModel("oAdminModel").getProperty("/eId");
			var email = that.getView().getModel("oAdminModel").getProperty("/email");
			var contactNo = that.getView().getModel("oAdminModel").getProperty("/contactNo");
			var NewImage = that.getView().getModel("oAdminModel").getProperty("/NewImage");
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
						that.onRefreshImage();
					}

					that._oDialog5.close();

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
			var imageId = sap.ui.core.Fragment.byId("idAdminEditProfile", "idEditAdminPICTURE");
			imageId.setSrc(imageData);
			oView.getModel("oAdminModel").setProperty("/NewImage", imageData);

		},
		onFail: function (message) {
			MessageBox.alert("Failed because: " + message);
		},

		// SEARCHING  
		onFreqVisSearch: function (oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("hostName", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("idAdminFrequentVisitor");
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
			var oTable = this.byId("idAdminUpcoming");
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
			var oTable = this.byId("idAdminCheckedIn");
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
			var oTable = this.byId("idAdminCheckedOut");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onFreqVisSort: function () {

			var sSort = this.getView().getModel("oAdminModel").getProperty("/FrequentVisitors/organization");
			var oSorter = new Sorter(sSort);
			var oTable = this.byId("idAdminFrequentVisitor");
			var oBinding = oTable.getBinding("items");
			oBinding.sort(oSorter);

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
		},

		//EXPAND FRAGMENT   
		onExpandUpcomingVis: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
			that.getView().getModel("oAdminModel").setProperty("/CancelmId",mId);
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getAllUpcomingMeetings?eId=" + oAdminModel.getProperty("/eId") + "&date=" + oAdminModel.getProperty(
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
					oAdminModel.setProperty("/getUpcomingVisitorslist", result);
					// sap.m.MessageToast.show("Refresh  Success");

				},
				type: "GET"
			});
			if (!this._oDialog3) {
				this._oDialog3 = sap.ui.xmlfragment("idAdminUpcomingvis", "inc.inkthn.neo.NEO_VMS.fragments.Admin.UpcomingVisitorDetails", this);
			}
			this.getView().addDependent(this._oDialog3);
			this._oDialog3.open();

		},
		onExpandFreqVis: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var hostName = odata.hostName;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getFrequentVisitors";
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
						return e.hostName === hostName;
					});
					oAdminModel.setProperty("/getFreqVisitorslist", result);
				

				},
				type: "GET"
			});
			if (!this._oDialog2) {
				this._oDialog2 = sap.ui.xmlfragment("idAdminFreqvis", "inc.inkthn.neo.NEO_VMS.fragments.Admin.OnFreqVisitors", this);
			}
			this.getView().addDependent(this._oDialog2);
			this._oDialog2.open();
		},
		onExpandPreRegVis: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
			// that.getView().getModel("oHostModel").setProperty("/vId", vId);
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getPreregistredVisitors?eId=" + oAdminModel.getProperty("/selectedEid");
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
					oAdminModel.setProperty("/getExtraPreRegVisitors", result);
				

				},
				type: "GET"
			});
			if (!this._oDialog4) {
				this._oDialog4 = sap.ui.xmlfragment("idEditProfile", "inc.inkthn.neo.NEO_VMS.fragments.Admin.ExtraPreRegVisitorDetails", this);
			}
			this.getView().addDependent(this._oDialog4);
			this._oDialog4.open();

		},
		onExpandMeetingReq: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
		
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/getOnSpotExtraVisitors", result);
				

				},
				type: "GET"
			});
			if (!this._oDialog9) {
				this._oDialog9 = sap.ui.xmlfragment("idMeetReqExtra", "inc.inkthn.neo.NEO_VMS.fragments.Admin.OnSpotExtraDetails", this);
			}
			this.getView().addDependent(this._oDialog9);
			this._oDialog9.open();
		},
		onMeetingCancel:function(){
			var that=this;
			var mId=that.getView().getModel("oAdminModel").getProperty("/CancelmId");
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

		// NOTIFICATION
		onNotificationPopover: function (oEvent) {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl = "/JAVA_SERVICE/employee/viewNotifications?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/Notification", data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].name === "Delivery") {
							oAdminModel.setProperty("/Notification/" + i + "/AcceptVisibility", true);

						} else {
							oAdminModel.setProperty("/Notification/" + i + "/AcceptVisibility", false);
						}
					}

				}

			});
			var oButton = oEvent.getSource();
			if (!this._oPopover) {
				Fragment.load({
					name: "inc.inkthn.neo.NEO_VMS.fragments.Admin.Notification",
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
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("oAdminModel").getPath();
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			var oDel = sPath.split("/");
			var oDelitem = oDel[2];
			oAdminModel.getProperty("/Notification").splice(oDelitem);
		},
		onItemClose: function (oEvent) {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
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
					var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oAdminModel.getProperty("/eId");
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
							oAdminModel.setProperty("/NotifCount", NotifCount);
						},
						type: "GET"
					});
				}
			});
		},
		onListItemPress: function (oEvent) {

		},
		onRejectPress: function (oEvent) {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var oItem = oEvent.getSource().getBindingContext("oAdminModel").getPath();
			var x = oItem.split("/");
			var y = x[2];
			var Path = parseInt(y, 0);
			var list = that.getView().getModel("oAdminModel").getProperty("/Notification");
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
								var sUrl3 = "/JAVA_SERVICE/employee/noOfNotifications1?eId=" + oAdminModel.getProperty("/eId");
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
										oAdminModel.setProperty("/NotifCount", NotifCount);
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
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var oItem = oEvent.getSource().getBindingContext("oAdminModel").getPath();
			var x = oItem.split("/");
			var y = x[2];
			var Path = parseInt(y, 0);
			var list = that.getView().getModel("oAdminModel").getProperty("/Notification");
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
					
						that.onItemClose();
					}
				}
			});

		},

		//CANCEL FRAGMENTS
		onFreqVisitorCancel: function () {
			this._oDialog2.close();

		},
		onUpcomingVisitorCancel: function () {
			this._oDialog3.close();
		},

		onCancel: function () {

			this._oDialog.close();
		},
		onBlacklistCancel: function () {
			this._oDialog2.close();
			this._oDialog2.destroy();
			this._oDialog2 = null;
		},
		onCancelProfile: function () {
			this._oDialog5.close();
			this._oDialog5.destroy();
			this._oDialog5 = null;
		},
		onExtraVisitorCancel: function () {
			this._oDialog4.close();
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
		onOnSpotExtraDetailsCancel: function () {
			this._oDialog9.close();

		},

		//REFRESH PAGE
		onRefreshBlacklist: function () {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl = "/JAVA_SERVICE/admin/getAllBlackListedVisitors";
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
					oAdminModel.setProperty("/GetBlacklisted", data);
				},
				type: "GET"
			});

		},
		onRefreshFacilityReq: function () {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getAllMeetingRequests";
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
						var MeetingRequestsCount = data.length;
					oAdminModel.setProperty("/MeetingRequestsCount", MeetingRequestsCount);
					oAdminModel.setProperty("/getMeetingRequests", data);
				},
				type: "GET"
			});
		},
		onRefreshMyVisitorReq: function () {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/OnSpotMeetingRequestCount", OnSpotMeetingRequestCount);
					oAdminModel.setProperty("/getOnSpotMeetingRequest", data);
				},
				type: "GET"
			});
		},
		onRefreshPreReg: function () {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getPreregistredVisitors?eId=" + oAdminModel.getProperty("/selectedEid");
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
					oAdminModel.setProperty("/getPreregister", data);

				},
				type: "GET"
			});
		},
		onRefreshTotalVisitors: function () {
			var that = this;
			var sdate = this.getView().byId("sdate").getValue();
			var edate = this.getView().byId("edate").getValue();
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/admin/getData?begin=" + sdate + "&end=" + edate;

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
					oAdminModel.setProperty("/TotalVisitor", data);

				},
				type: "GET"
			});
		},

		//BlackList
		onRemoveBlacklist: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var bId = odata.bId;
			that.getView().getModel("oAdminModel").setProperty("/bId", bId);
			var sUrl = "/JAVA_SERVICE/admin/removeBlackListedVisitor";
			var payload = {
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
					sap.m.MessageToast.show("Removed Successfully");
				}
			});
			this.onRefreshBlacklist();
		},
		onEnterBlacklist: function () {
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/addBlacklisted";
			var eId = that.getView().getModel("oAdminModel").getProperty("/eId");
			var vId = that.getView().getModel("oAdminModel").getProperty("/vId");
			var reason = that.getView().getModel("oAdminModel").getProperty("/reason");
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
					}
					else{
						sap.m.MessageToast.show("something Happened wrong");
					}
				}
			});
			this._oDialog2.close();
			this._oDialog2.destroy();
			this._oDialog2 = null;
			this.onRefreshBlacklist();
		

		},
		onDoBlacklist: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var vId = odata.vId;
			that.getView().getModel("oAdminModel").setProperty("/vId", vId);
			this.bFlag = true;
			if (!this._oDialog2) {
				this._oDialog2 = sap.ui.xmlfragment("idAdminAddBlacklist", "inc.inkthn.neo.NEO_VMS.fragments.Admin.BlackList", this);
			}
			this.getView().addDependent(this._oDialog2);
			this._oDialog2.open();
			this.onRefreshBlacklist();
		},
		// PRE REGISTRATION
		onAdd: function () {
			this.bFlag = true;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("idAddVisitorFrag", "inc.inkthn.neo.NEO_VMS.fragments.Admin.PreRegForm", this);
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
			var vpark = this.getView().getModel("oAdminModel").getProperty("/sParking");
			if (!vfirstName || !vlastName || !vemail || !vcontactNo || !vpurpose || !vorganisation || !vdate || !vpark) {
				MessageBox.alert("Please fill all the mandatory details");
			} else {
				this._oDialog.close();
				if (!this._oDialog1) {
					this._oDialog1 = sap.ui.xmlfragment("idPreRegBookRoom", "inc.inkthn.neo.NEO_VMS.fragments.Admin.PreRegBookRoom", this);
				}
				this.getView().addDependent(this._oDialog1);
				this._oDialog1.open();
				var that = this;
				var sTime1 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetStart").getValue();
				var eTime2 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetEnd").getValue();
				var date1 = sap.ui.core.Fragment.byId("idAddVisitorFrag", "idMeetDate").getValue();

				var sUrl = "/JAVA_SERVICE/employee/getAvailableRooms?begin=" + date1 + " " + sTime1 + "&end=" + date1 + " " + eTime2;
				var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
				$.ajax({
					url: sUrl,
					type: "GET",
					cache: false,
					async: true,
					dataType: "json",
					data: null,
				
					contentType: "application/json",
					success: function (oData) {
						oAdminModel.setProperty("/AvailableRoom", oData);
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
			var eId = this.getView().getModel("oAdminModel").getProperty("/eId");
			var i = roomId[2];
			var rId = parseInt(i, [0]);
			var typeId = 1;
			var park = this.getView().getModel("oAdminModel").getProperty("/sParking");
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
						sap.m.MessageToast.show("Registration Successfully");
					}

				},
				error: function (err) {
					MessageBox.alert("Registration Failed");
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

		//Meeting Requests
		onFacilities: function () {
			this.getView().byId("onFacilities").addStyleClass("TilePress");
			this.getView().byId("onMyVisitors").removeStyleClass("TilePress");
			this.getView().byId("onTileOngoing").removeStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl1 = "/JAVA_SERVICE/admin/getAllMeetingRequests";
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
					
						var MeetingRequestsCount = data.length;
					oAdminModel.setProperty("/MeetingRequestsCount", MeetingRequestsCount);
					oAdminModel.setProperty("/getMeetingRequests", data);
				
				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/FacilityVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/MyVisitorsVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/OnGoingMeetingVisibility", false);
		},
		onMyVisitors: function () {
			this.getView().byId("onMyVisitors").addStyleClass("TilePress");
			this.getView().byId("onFacilities").removeStyleClass("TilePress");
			this.getView().byId("onTileOngoing").removeStyleClass("TilePress");
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/OnSpotMeetingRequestCount", OnSpotMeetingRequestCount);
					oAdminModel.setProperty("/getOnSpotMeetingRequest", data);
				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/FacilityVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/MyVisitorsVisibility", true);
			this.getView().getModel("oViewModel").setProperty("/OnGoingMeetingVisibility", false);
		},
		onAcceptFacilities: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
			var action = "accept";
			var payload = {
				mId: mId,
				action: action
			};
			var sUrl = "/JAVA_SERVICE/admin/manageMeetingRequest";
			$.ajax({
				url: sUrl,
				dataType: "json",
				data:payload,
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if(data.status===200){
					sap.m.MessageToast.show("Meeting Approved Successfully");
					}
					else {
						sap.m.MessageToast.show("Meeting Approval Unsuccessful");
					}
				},
				type: "POST"
			});
			this.onRefreshFacilityReq();
		},
		onRejectFacilities: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
			var action = "reject";
			var payload = {
				mId: mId,
				action: action
			};
			var sUrl = "/JAVA_SERVICE/admin/manageMeetingRequest";
			$.ajax({
				url: sUrl,
				dataType: "json",
				data: payload,
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
						if(data.status===200){
					sap.m.MessageToast.show("Meeting Rejected Successfully");
					}
					else {
						sap.m.MessageToast.show("Meeting Rejection Unsuccessful");
					}
					

				},
				type: "POST"
			});
			this.onRefreshFacilityReq();
		},
		OnGoingMeeting: function () {
			this.getView().byId("onMyVisitors").removeStyleClass("TilePress");
			this.getView().byId("onFacilities").removeStyleClass("TilePress");
			this.getView().byId("onTileOngoing").addStyleClass("TilePress");

			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var sUrl2 = "/JAVA_SERVICE/employee/getOngoingMeetings?eId=" + oAdminModel.getProperty("/eId");
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
					oAdminModel.setProperty("/OnGoingMeetingCount", OnGoingMeetingCount);
					oAdminModel.setProperty("/getOnGoingMeeting", data);
				},
				type: "GET"
			});
			this.getView().getModel("oViewModel").setProperty("/FacilityVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/MyVisitorsVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/OnGoingMeetingVisibility", true);
		},
		onExtendMeeting: function (oEvent) {
			var that = this;
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var mId = odata.mId;
			that.getView().getModel("oHostModel").setProperty("/MeetingID", mId);
			if (!this._oDialog10) {
				this._oDialog10 = sap.ui.xmlfragment("idonAdminExtendMeeting", "inc.inkthn.neo.NEO_VMS.fragments.Admin.ExtendMeeting", this);
			}
			this.getView().addDependent(this._oDialog10);
			this._oDialog10.open();
		},
		onExtendTime: function () {
			var that = this;
			var mId = that.getView().getModel("oHostModel").getProperty("/MeetingID");
			var minutes = sap.ui.core.Fragment.byId("idonAdminExtendMeeting", "idADExtendTime").getValue();
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
						that._oDialog10.close();
					}

				},
				error: function (e) {
					sap.m.MessageToast.show("Update Failed");
					that._oDialog10.close();
				}

			});
			this.OnGoingMeeting();
		},
		onRemoveExtend: function () {
			this._oDialog10.close();
			this._oDialog10.destroy();
			this._oDialog10 = null;
		},
		onEndMeeting: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
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
					sap.m.MessageToast.show("Update Failed");
				}

			});
			this.OnGoingMeeting();
		},

		// ON_SPOT REQUEST
		onRejectOnSpot: function (oEvent) {
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var amId = odata.mId;
			this.getView().getModel("oAdminModel").setProperty("/amId", amId);
			if (!this._oDialog7) {
				this._oDialog7 = sap.ui.xmlfragment("idOnSpotReject", "inc.inkthn.neo.NEO_VMS.fragments.Admin.RejectMeeting", this);
			}
			this.getView().addDependent(this._oDialog7);
			this._oDialog7.open();

		},
		onAcceptOnSpot: function (oEvent) {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var odata = oEvent.getSource().getBindingContext("oAdminModel").getObject();
			var amId = odata.mId;
			var date = odata.date;
			var beginTime = odata.beginTime;
			var endTime = odata.endTime;
			this.getView().getModel("oAdminModel").setProperty("/amId", amId);

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
					oAdminModel.setProperty("/AvailableRooms", oData);
				},
				error: function (e) {
					sap.m.MessageToast.show("Internal server Error");
				}
			});
			if (!this._oDialog8) {
				this._oDialog8 = sap.ui.xmlfragment("idOnSpotAccept", "inc.inkthn.neo.NEO_VMS.fragments.Admin.AcceptMeeting", this);
			}
			this.getView().addDependent(this._oDialog8);
			this._oDialog8.open();
		},
		onAcceptSend: function (oEvent) {
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/acceptOnSpotVisitor";
			var eId = that.getView().getModel("oAdminModel").getProperty("/eId");
			var room = sap.ui.core.Fragment.byId("idOnSpotAccept", "idBookRoom").getValue();
			var roomId = room.split("=");
			var i = roomId[2];
			var rId = parseInt(i, [0]);
			var mId = that.getView().getModel("oAdminModel").getProperty("/amId");
			var comment = that.getView().getModel("oAdminModel").getProperty("/Acceptmessage");
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
				type: "POST",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Meeting Approved Successfully");
						var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
						var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oAdminModel.getProperty("/eId");
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
								oAdminModel.setProperty("/getOnSpotMeetingRequest", odata);

							},
							type: "GET"
						});
					} else {
						sap.m.MessageToast.show("Meeting Approval Unsuccessfull");
					}
				}
			});

			this._oDialog8.close();
			this._oDialog8.destroy();
			this._oDialog8 = null;
			this.onRefreshMyVisitorReq();
		},
		onRejectSend: function (oEvent) {
			var that = this;
			var sUrl = "/JAVA_SERVICE/employee/rejectOnSpotVisitor";
			var eId = that.getView().getModel("oAdminModel").getProperty("/eId");
			var mId = that.getView().getModel("oAdminModel").getProperty("/amId");
			var comment = that.getView().getModel("oAdminModel").getProperty("/Acceptmessage");
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
					var oAdminModel = that.getOwnerComponent().getModel("oHostModel");
					var sUrl2 = "/JAVA_SERVICE/employee/getOnSpotRequests?eId=" + oAdminModel.getProperty("/eId");
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
							oAdminModel.setProperty("/getOnSpotMeetingRequest", data);

						},
						type: "GET"
					});
				},
				type: "POST"
			});
			this._oDialog7.close();
			this._oDialog7.destroy();
			this._oDialog7 = null;
			this.onRefreshMyVisitorReq();
		},

		//Evacuation
		onSelectEmployee: function () {
			if (!this._oDialog6) {
				this._oDialog6 = sap.ui.xmlfragment("idAdminEmployee", "inc.inkthn.neo.NEO_VMS.fragments.Admin.EvacuationEmp", this);
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
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");

		
			if (aContexts && aContexts.length) {

				var email = aContexts.map(function (oContext) {
					return oContext.getObject().email;
				});

			}
			this.getView().getModel("oAdminModel").setProperty("/empEmail", email);
		},
		onSelectAll: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var emp = that.getView().getModel("oAdminModel").getProperty("/getAllPresent");
			var vis = that.getView().getModel("oAdminModel").getProperty("/getAllPresent1");
			var total = emp.concat(vis);
			var list = [];
			var item;
			for (var i = 0; i < total.length; i++) {
				item = total[i];
				list.push(item.email);
			}
			var evacMessage = that.getView().getModel("oAdminModel").getProperty("/evacMessage");
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
					MessageBox.alert("Update Failed");

				}

			});
			that.getView().getModel("oAdminModel").setProperty("/evacMessage", "");
		},
		onSendSelected: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
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

			var evacMessage = that.getView().getModel("oAdminModel").getProperty("/evacMessage");
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
					MessageBox.alert("Update Failed");

				}

			});
			that.getView().getModel("oAdminModel").setProperty("/evacMessage", "");
		},

		//Downloads
		onDownloadPdf: function () {
			var sdate = this.getView().byId("sdate").getValue();
			var edate = this.getView().byId("edate").getValue();
			var that = this;
			var sUrl2 = "/JAVA_SERVICE/admin/downloadPdf?begin=" + sdate + "&end=" + edate;
			sap.m.URLHelper.redirect(sUrl2, true);

		
		},
		onDownloadExcel: function () {
			var sdate = this.getView().byId("sdate").getValue();
			var edate = this.getView().byId("edate").getValue();
			var sUrl2 = "/JAVA_SERVICE/admin/export?begin=" + sdate + "&end=" + edate;
			sap.m.URLHelper.redirect(sUrl2, true);

		},
		getVal: function (evt) {
			return sap.ui.getCore().byId(evt.getParameter('idbtn1')).getValue();
		},
		onDownload: function (event) {
			var that = this;

			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [

					new Button({
						text: "Export Pdf",
						type: ButtonType.Transparent,
						press: function (oEvent) {
							that.onDownloadPdf(oEvent);
						}
					}),
					new Button({
						text: 'Export Excel',
						type: ButtonType.Transparent,
						press: function (oEvent) {
							that.onDownloadExcel(oEvent);
						}
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover ');
			oPopover.openBy(event.getSource());
		}

	
	});

});