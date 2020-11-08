function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0){
				costs[j] = j;
			}
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1)){
						newValue = Math.min(Math.min(newValue,lastValue),costs[j]) + 1;
					}
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0){
			costs[s2.length] = lastValue;
		}
	}
	return costs[s2.length];
}
module.exports = class{
	constructor(options){
		if(!options){options = {};}
		this.isUsingNamerator = (options && options.namerator);
		this.cachedUsernames = [];
		this.confirmedPlayers = [];
		this.cachedData = {};
		this.loggedPlayers = {};
		this.specialData = {
			startTime: 0,
			lastFakeLogin: 0,
			lastFakeUserID: 0,
			lastFakeUserName: "",
			config:{
				timeout: options.timeout || false,
				looksRandom: options.looksRandom || true,
				banFormat1: options.banFormat1 || true,
				additionalQuestionTime: options.additionalQuestionTime || 0,
				percent: options.percent || 0.6,
				ddos: options.ddos || 0
			}
		};
		this.messageId = (options && options.mid) || 0;
		this.clientId = (options && options.clientId) || null;
		this.pin = (options && options.pin) || null;
		this.timer = setInterval(()=>{
			for(let i in this.cachedUsernames){
				if(this.cachedUsernames[i].time <= 0 && !this.cachedUsernames[i].banned && !this.confirmedPlayers.includes(this.cachedUsernames[i].name)){
					this.confirmedPlayers.push(this.cachedUsernames[i].name);
					continue;
				}
				if(this.cachedUsernames[i].time <= -20){
					this.cachedUsernames.splice(i,1);
					continue;
				}
				this.cachedUsernames[i].time--;
			}
		},1000);
		this.TFATimer = setInterval(()=>{
			for(let i in this.cachedData){
				this.cachedData[i].tries = 0;
			}
		},10000);
		this.oldamount = 0;
		this.kickedamount = 0;
		this.locked = false;
		this.DDOSInterval = setInterval(()=>{
			this.oldamount = this.kickedamount;
		},20e3);
	}
	handle(message,type,socket){
		const data = JSON.parse(message)[0];
		this.messageId = data.id || this.messageId;
		if(type == "send"){
			const data = JSON.parse(message)[0];
			if(data.data && !data.data.id){
				return false;
			}
			if(data.data && data.data.id  == 2){
				this.specialData.startTime = Date.now();
			}
			if(!this.pin){
				if(data.data && data.data.gameid){
					this.pin = data.data.gameid;
				}
			}
		}else{
			if(!this.locked){
				if(!!(+this.specialData.config.ddos) && (this.kickedamount - this.oldamount) > (+this.specialData.config.ddos/3)){
					this.locked = true;
					// LOCK THE GAME!
					setTimeout(()=>{
						socket.send(JSON.stringify([{
							channel: "/service/player",
							clientId: this.clientId,
							data: {
								gameid: this.pin,
								type: "lock"
							},
							ext: {},
							id: ++this.messageId
						}]));
					},1e3);
					setTimeout(()=>{
						this.locked = false;
						// UNLOCK GAME
						socket.send(JSON.stringify([{
							channel: "/service/player",
							clientId: this.clientId,
							data: {
								gameid: this.pin,
								type: "unlock"
							},
							ext: {},
							id: ++this.messageId
						}]));
					},60e3);
				}
			}
			if(data.id == 1){
				this.clientId = data.clientId;
			}
			if(data.data && data.data.type == "joined"){
				return this.determineEvil(data.data,socket) || this.specialBotDetector(data.data.type,data.data,socket);
			}else if(data.data && data.data.id == 45){
				if(Date.now() - this.specialData.startTime < 500 && this.specialData.config.timeout){
					return true;
				}
				// if player just recently joined (within 1 second)
				if(this.cachedData[data.data.cid] && Date.now() - this.cachedData[data.data.cid].loginTime < 1000){
					const packet = this.createKickPacket(data.data.cid);
					socket.send(JSON.stringify(packet));
					delete this.cachedData[data.data.cid];
					return true;
				}
			}else if(data.data && data.data.id == 50){
				this.cachedData[data.data.cid].tries++;
				if(this.cachedData[data.data.cid].tries > 3){
					const kicker = this.createKickPacket(data.data.cid);
					socket.send(JSON.stringify(kicker));
					this.cachedUsernames.forEach(o=>{
						if(o.id == this.specialData.lastFakeUserID){
							o.banned = true;
							o.time = 10;
							return;
						}
					});
					delete this.cachedData[data.data.cid];
					return true;
				}
			}else if(data.data && data.data.id == 18){
				return this.teamBotDetector(JSON.parse(data.data.content),data.data.cid,socket);
			}
		}
	}
	teamBotDetector(team,cid,socket){
		let kick = false;
		if(team.length == 0 || team.indexOf("") != -1 || team.indexOf("Player 1") != -1){
			kick = true;
		}
		if(kick){
			const packet = this.createKickPacket(cid);
			socket.send(JSON.stringify(packet));
			let name = "";
			delete this.cachedData[cid];
			this.cachedUsernames.forEach(o=>{
				name = o.name;
				if(o.id == cid){
					o.banned = true;
					o.time = 10;
					return;
				}
			});
			return true;
		}else{
			return false;
		}
	}
	// for names like KaHOotSmaSH
	looksRandom(name){
		// assumes player names have either all caps, no caps, or up to 3 capital letters or weird endings
		return !/(^(([^A-Z\n]*)?[A-Z]?([^A-Z\n]*)?){0,3}$)|^([A-Z]*)$/.test(name);
	}
	// for names like AmazingRobot32
	isFakeValid(name){
		return /^([A-Z][a-z]+){2}\d{1,2}$/.test(name) || /^[A-Z][^A-Z]+?(\d[a-z]+\d*?)$/.test(name);
	}
	similarity(s1, s2) {
		// remove numbers from name if name is not only a number
		if(isNaN(s1) && typeof(s1) != "object" && !this.isUsingNamerator){
			s1 = s1.replace(/[0-9]/mg,"");
		}
		if(isNaN(s2) && typeof(s2) != "object" && !this.isUsingNamerator){
			s2 = s2.replace(/[0-9]/mg,"");
		}
		if(!s2){
			return 0;
		}
		// if is a number of the same length
		if(s1){
			if(!isNaN(s2) && !isNaN(s1) && s1.length == s2.length){
				return 1;
			}
		}
		// apply namerator rules
		if(this.isUsingNamerator){
			if(!/^([A-Z][a-z]+){2,3}$/.test(s2)){
				return -1;
			}
		}
		if(!s1){
			return;
		}
		// ignore case
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();
		var longer = s1;
		var shorter = s2;
		// begin math to determine this.similarity
		if (s1.length < s2.length) {
			longer = s2;
			shorter = s1;
		}
		var longerLength = longer.length;
		if (longerLength == 0) {
			return 1.0;
		}
		return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
	}
	createKickPacket(id){
		this.messageId++;
		this.kickedamount++;
		return [{
			channel: "/service/player",
			clientId: this.clientId,
			id: String(Number(this.messageId)),
			data: {
				cid: String(id),
				content: JSON.stringify({
					kickCode: 1
				}),
				gameid: this.pin,
				host: "play.kahoot.it",
				id: 10,
				type: "message"
			},
			ext: {}
		}];
	}
	determineEvil(player,socket){
		if(this.cachedUsernames.length == 0){
			if(this.similarity(null,player.name) == -1){
				var packet = this.createKickPacket(player.cid);
				socket.send(JSON.stringify(packet));
				delete this.cachedData[player.cid];
				return true;
			}
			this.cachedUsernames.push({name: player.name, id:player.cid, time: 10, banned: false});
			this.loggedPlayers[player.cid] = true;
		}else{
			var removed = false;
			if(this.similarity(null,player.name) == -1){
				removed = true;
				var packet1 = this.createKickPacket(player.cid);
				socket.send(JSON.stringify(packet1));
				delete this.cachedData[player.cid];
				return true;
			}
			for(var i in this.cachedUsernames){
				if(this.confirmedPlayers.includes(this.cachedUsernames[i].name)){
					continue;
				}
				if(this.similarity(this.cachedUsernames[i].name,player.name) >= this.percent){
					removed = true;
					let packet1 = this.createKickPacket(player.cid);
					socket.send(JSON.stringify(packet1));
					if(!this.cachedUsernames[i].banned){
						var packet2 = this.createKickPacket(this.cachedUsernames[i].id);
						this.cachedUsernames[i].banned = true;
						socket.send(JSON.stringify(packet2));
					}
					this.cachedUsernames[i].time = 10;
					delete this.cachedData[player.cid];
					delete this.cachedData[this.cachedUsernames[i].id];
					return true;
				}
			}
			if(!removed){
				this.cachedUsernames.push({name: player.name,id: player.cid, time: 10, banned: false});
				this.loggedPlayers[player.cid] = true;
			}
		}
	}
	specialBotDetector(type,data,socket){
		switch (type) {
		case "joined":
			// if looks random
			if(this.specialData.config.looksRandom){
				if(this.looksRandom(data.name)){
					const packet = this.createKickPacket(data.cid);
					socket.send(JSON.stringify(packet));
					this.cachedUsernames.forEach(o=>{
						if(o.id == data.cid){
							o.banned = true;
							o.time = 10;
							return;
						}
					});
					return true;
				}
			}
			if(!this.cachedData[data.cid] && !isNaN(data.cid) && Object.keys(data).length <= 5 && data.name.length < 16){ //if the id has not been cached yet or is an invalid id, and they are not a bot :p
				this.cachedData[data.cid] = {
					tries: 0,
					loginTime: Date.now()
				};
			}else{
				const packet = this.createKickPacket(data.cid);
				socket.send(JSON.stringify(packet));
				this.cachedUsernames.forEach(o=>{
					if(o.id == data.cid){
						o.banned = true;
						o.time = 10;
						return;
					}
				});
				return true;
			}
			if(!this.isUsingNamerator){
				if(this.isFakeValid(data.name)){
					if(Date.now() - this.specialData.lastFakeLogin < 5000){
						if(this.cachedData[this.specialData.lastFakeUserID]){ // to get the first guy
							const packet = this.createKickPacket(this.specialData.lastFakeUserID);
							socket.send(JSON.stringify(packet));
							delete this.cachedData[this.specialData.lastFakeUserID]; this.cachedUsernames.forEach(o=>{
								if(o.id == this.specialData.lastFakeUserID){
									o.banned = true;
									o.time = 10;
									return;
								}
							});
						}
						const packet = this.createKickPacket(data.cid);
						socket.send(JSON.stringify(packet));
						delete this.cachedData[data.cid];
						this.cachedUsernames.forEach(o=>{
							if(o.id == data.cid){
								o.banned = true;
								return;
							}
						});
						this.specialData.lastFakeLogin = Date.now();
						this.specialData.lastFakeUserID = data.cid;
						this.specialData.lastFakeUserName = data.name;
						return true;
					}
					this.specialData.lastFakeLogin = Date.now();
					this.specialData.lastFakeUserID = data.cid;
					this.specialData.lastFakeUserName = data.name;
				}
			}
			break;
		}
	}
};
