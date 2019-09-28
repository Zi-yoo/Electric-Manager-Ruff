'use strict';

$.ready(function (error) {
	if (error) {
		console.log(error);
		return;
	}

	var http = require("http");

	//Human Infrared Sensor
	var HIS1 = $('#HIS1');
	//var HIS2 = $('#HIS2');
	//var HIS3 = $('#HIS3');
	//Relay
	var R1 = $('#R1');
	//var R2 = $('#R2');
	//var R3 = $('#R3');
	//Current Sensor
	var CS1 = $('#CS1');
	//var CS2 = $('#CS2');
	//var CS3 = $('#CS3');

	//电流值
	var power1 = 0;
	//var power2 = 0;
	//var power3 = 0;
	//relay 状态
	var status1 = 0;
	//var status2 = 0;
	//var status3 = 0;
	//是否有人
	var mode1 = 0;
	//var mode2 = 0;
	//var mode3 = 0;
	//服务器设置
	var serverMode1 = 0;
	//var serverMode2 = 0;
	//var serverMode3 = 0;
	//高功耗
	var high = 7.5;

	$('#led-r').turnOn();

	R1.turnOn();
	//R2.turnOn();
	//R3.turnOn();

	// 有人
	HIS1.on('presence', function () {
		//console.log('Precense.');
		//$('#led-r').turnOn();
		//Relay.turnOn();

		//buzzer.turnOn(function() {
		//	console.log('buzzer turned on');
		//});
		mode1 = 1;

	});

	// 无人
	HIS1.on('absence', function () {
		//console.log('Absence.');
		//$('#led-r').turnOff();
		mode1 = 0;
	});
	/*
		HIS2.on('presence', function() {
			//console.log('Precense.');
			//$('#led-r').turnOn();
			//Relay.turnOn();
	
			//buzzer.turnOn(function() {
			//	console.log('buzzer turned on');
			//});
			mode2 = 1;
	
		});
	
		HIS2.on('absence', function() {
			//console.log('Absence.');
			//$('#led-r').turnOff();
			mode2 = 0;
		});*/

	var mainloop1 = function () {

		CS1.getCurrent(function (error, current) {
			if (error) {
				console.log(error);
				return;
			}

			//由于内部上拉，1.8的值需要舍弃掉
			if (current > 17) {
				CS1.getCurrent(function (error, current) {
					if (error) {
						console.log(error);
						return;
					}
					if (current > 17) {
						power1 = 0
					} else {
						power1 = current;
					}
				});
			} else {
				power1 = current;
			}
			//console.log('current1 is ', power1, ' A.');
		});

		//if (mode == 0) {
		//	Relay.turnOff();
		//} else if (mode == 1) {
		//	Relay.turnOn();
		//}

		R1.isOn(function (error, state) {
			if (error) {
				console.log(error);
				return;
			}
			if (state) {
				status1 = 1;
			} else {
				status1 = 0;
			}
		});

		//console.log("mode1 " + mode1);
		//console.log("status1 " + status1);
		//console.log("current " + current);

		//请求服务器状态

		http.get('http://javacloud.bmob.cn/391373278e6ec6a0/dataupload?floor=' + 1 + '&room=' + 1 + '&power=' + power1 + '&status=' + status1 + '&mode=' + mode1, function (res) {
			console.log("Got response: " + res.statusCode);
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				serverMode1 = chunk;
				console.log("serverMode1 is " + serverMode1);
			});

		}).on('error', function (e) {
			console.log("Got error: " + e.message);
		});

		//处理
		if (status1 == 0 && serverMode1 == 1) {
			R1.turnOn();
		} else if (status1 == 1 && serverMode1 == 0) {
			R1.turnOff();
		} else if (serverMode1 == 2) {
			if (mode1 == 1) {
				if (status1 == 0) {
					R1.turnOn();
				}
			} else if (mode1 == 0) {
				console.log("no man   " + power1 + high);
				if (power1 >= high) {
					//	//buzzer
					console.log("close relay ");
					R1.turnOff();
				}
			}
		}

	}

	setInterval(mainloop1, 2*1000);
	/*
		var mainloop2 = function() {
	
			CS2.getCurrent(function(error, current) {
				if (error) {
					console.log(error);
					return;
				}
	
				//由于内部上拉，1.8的值需要舍弃掉
				if (current > 17) {
					CS2.getCurrent(function(error, current) {
						if (error) {
							console.log(error);
							return;
						}
						if (current > 17) {
							power2 = 0
						} else {
							power2 = current;
						}
					});
				}else{
					power2 = current;
				}
				//console.log('current2 is ', power2, ' A.');
			});
	
	
			//if (mode == 0) {
			//	Relay.turnOff();
			//} else if (mode == 1) {
			//	Relay.turnOn();
			//}
	
			R2.isOn(function(error, state) {
				if (error) {
					console.log(error);
					return;
				}
				if (state) {
					status2 = 1;
				} else {
					status2 = 0;
				}
			});
	
			//console.log("mode2 " + mode2);
			//console.log("status2 " + status2);
			//console.log("current " + current);
	
			//请求服务器状态
	
				console.log("Got response: " + res.statusCode);
				res.setEncoding('utf8');
				res.on('data', function(chunk) {
					serverMode2 = chunk;
					//console.log("serverMode2 is " + serverMode2);
				});
	
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
	
			//处理
			if (status2 == 0 && serverMode2 == 1) {
				R2.turnOn();
			} else if (status2 == 1 && serverMode2 == 0) {
				R2.turnOff();
			} else if (serverMode2 == 2) {
				if (mode2 == 1) {
					if (status2 == 0) {
						R2.turnOn();
					}
				} else if (mode2 == 0) {
					//console.log("no man   " + current + high);
					//if (current >= high) {
					//	//buzzer
					//	console.log("close relay ");
					//	//R2.turnOff();
					//}
				}
			}
	
		}
	
		setInterval(mainloop2, 1000);
		*/




});

$.end(function () {
	$('#led-r').turnOff();
});