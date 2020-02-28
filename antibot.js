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
    constructor(message,options){
    this.percent = (options && options.per) || 0.6;
    this.isUsingNamerator = (options && options.namerator) || false;
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
        timeout: false,
        looksRandom: true
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
  }
  handle(message,type){
    if(type == "send"){

    }else{

    }
  }
  // for names like KaHOotSmaSH
  looksRandom(name){
    // assumes player names have either all caps, no caps, or up to 3 capital letters
    if(name.replace(/[A-Z]/gm,"").length == 0){
      return false;
    }
    if(name.replace(/[a-z]/gm,"").length == 0){
      return false;
    }
    if(name.length - name.replace(/[A-Z]/gm,"").length < 4){
      return false;
    }
    return true;
  }
  // for names like AmazingRobot32
  isFakeValid(name){
    let caps = name.length - name.replace(/[A-Z]/g, '').length;
    if(caps !== 2){ /*has less than 2 or more than 2 capitals*/
      return false;
    }
    if (name.substr(0,1).replace(/[A-Z]/g,'').length === 1){/*first char is not a capital*/
      return false;
    }
    if (name.substr(1,2).replace(/[A-Z]/g,'').length != 2){/*next few char have capitals*/
      return false;
    }
    if(name.substr(name.length -2,2).replace(/[A-Z]/g,'').length !== 2){ /*last few char have acapital*/
      return false;
    }
    if(name.replace(/([a-z]|[0-9])/ig,'').length > 0){ /*hasnon-letter/number chars*/
      return false;
    }
    return true;
  }
  similarity(s1, s2) {
    // remove numbers from name if name is not only a number
    if(!isNaN(s1) && typeof(s1) != "object" && !this.isUsingNamerator){
      s1 = s1.replace(/[0-9]/mg,"");
    }
    if(!isNaN(s2) && typeof(s2) != "object" && !this.isUsingNamerator){
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
      let caps = s2.length - s2.replace(/[A-Z]/g, '').length;
      if(caps !== 2){ /*has less than 2 or more than 2 capitals*/
        return -1;
      }
      if (s2.substr(0,1).replace(/[A-Z]/g,'').length === 1){/*first char is not a capital*/
        return -1;
      }
      if (s2.substr(1,2).replace(/[A-Z]/g,'').length != 2){/*next few char have capitals*/
        return -1;
      }
      if(s2.substr(s2.length -2,2).replace(/[A-Z]/g,'').length !== 2){ /*last few char have acapital*/
        return -1;
      }
      if(s2.replace(/[a-z]/ig,'').length > 0){ /*hasnon-letter chars*/
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
    // begin math to determine similarity
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
    messageId++;
    return [{
      channel: "/service/player",
      clientId: clientId,
      id: String(Number(messageId)),
      data: {
        cid: String(id),
        content: JSON.stringify({
          kickCode: 1,
          quizType: "quiz"
        }),
        gameid: pin,
        host: "play.kahoot.it",
        id: 10,
        type: "message"
      },
      ext: {}
    }];
  }
  determineEvil(player,socket){
    if(this.cachedUsernames.length == 0){
      if(similarity(null,player.name) == -1){
        var packet = createKickPacket(player.cid);
        socket.send(JSON.stringify(packet));
        console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
        const c = document.getElementById("killcount");
        if(c){
          c.innerHTML = Number(c.innerHTML) + 1;
        }
        delete this.cachedData[player.cid];
        throw "[ANTIBOT] - Bot banned. Dont add";
      }
      this.cachedUsernames.push({name: player.name, id:player.cid, time: 10, banned: false});
      this.loggedPlayers[player.cid] = true;
    }else{
      var removed = false;
      for(var i in this.cachedUsernames){
        if(this.confirmedPlayers.includes(this.cachedUsernames[i].name)){
          continue;
        }
        if(similarity(this.cachedUsernames[i].name,player.name) == -1){
          removed = true;
          var packet1 = createKickPacket(player.cid);
          socket.send(JSON.stringify(packet1));
          console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
          const c = document.getElementById("killcount");
          if(c){
            c.innerHTML = Number(c.innerHTML) + 1;
          }
          delete this.cachedData[player.cid];
          throw "[ANTIBOT] - Bot banned. Dont add";
        }
        if(similarity(this.cachedUsernames[i].name,player.name) >= percent){
          removed = true;
          let packet1 = createKickPacket(player.cid);
          socket.send(JSON.stringify(packet1));
          if(!this.cachedUsernames[i].banned){
            var packet2 =createKickPacket(this.cachedUsernames[i].id);
            this.cachedUsernames[i].banned = true;
            socket.send(JSON.stringify(packet2));
            clickName(this.cachedUsernames[i].name);
            const c = document.getElementById("killcount");
            if(c){
              c.innerHTML = Number(c.innerHTML) + 1;
            }
          }
          this.cachedUsernames[i].time = 10;
          console.warn(`[ANTIBOT] - Bots ${player.name} and ${this.cachedUsernames[i].name} have been banished`);
          const c = document.getElementById("killcount");
          if(c){
            c.innerHTML = Number(c.innerHTML) + 1;
          }
          delete this.cachedData[player.cid];
          delete this.cachedData[this.cachedUsernames[i].id];
          throw "[ANTIBOT] - Bot banned. Dont add";
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
      case 'joined':
      // if looks random
      if(this.specialData.config.looksRandom){
        if(looksRandom(data.name)){
          const packet = createKickPacket(data.cid);
          socket.send(JSON.stringify(packet));
          const c = document.getElementById("killcount");
          if(c){
            c.innerHTML = Number(c.innerHTML) + 1;
          }
          this.cachedUsernames.forEach(o=>{
            if(o.id == data.cid){
              o.banned = true;
              o.time = 10;
              return;
            }
          });
          throw `[ANTIBOT] - Bot ${data.name} banned; name too random.`;
        }
      }
      if(!this.cachedData[data.cid] && !isNaN(data.cid) && Object.keys(data).length <= 5 && data.name.length < 16){ //if the id has not been cached yet or is an invalid id, and they are not a bot :p
        this.cachedData[data.cid] = {
          tries: 0,
          loginTime: Date.now()
        };
      }else{
        const packet = createKickPacket(data.cid);
        socket.send(JSON.stringify(packet));
        console.warn(`[ANTIBOT] - Bot ${data.name} has been banished, clearly a bot from kahootsmash or something`);
        this.cachedUsernames.forEach(o=>{
          if(o.id == data.cid){
            o.banned = true;
            o.time = 10;
            return;
          }
        });
        const c = document.getElementById("killcount");
        if(c){
          c.innerHTML = Number(c.innerHTML) + 1;
        }
        throw "[ANTIBOT] - Bot banned. Dont add";
      }
      if(!this.isUsingNamerator){
        if(isFakeValid(data.name)){
          if(Date.now() - this.specialData.lastFakeLogin < 5000){
            if(this.cachedData[this.specialData.lastFakeUserID]){ // to get the first guy
              const packet = createKickPacket(this.specialData.lastFakeUserID);
              socket.send(JSON.stringify(packet));
              clickName(this.specialData.lastFakeUserName);
              delete this.cachedData[this.specialData.lastFakeUserID]; this.cachedUsernames.forEach(o=>{
                if(o.id == this.specialData.lastFakeUserID){
                  o.banned = true;
                  o.time = 10;
                  return;
                }
              });
            }
            const packet = createKickPacket(data.cid);
            socket.send(JSON.stringify(packet));
            delete this.cachedData[data.cid];
            this.cachedUsernames.forEach(o=>{
              if(o.id == data.cid){
                o.banned = true;
                return;
              }
            });
            const c = document.getElementById("killcount");
            if(c){
              c.innerHTML = Number(c.innerHTML) + 1;
            }
            this.specialData.lastFakeLogin = Date.now();
            this.specialData.lastFakeUserID = data.cid;
            this.specialData.lastFakeUserName = data.name;
            throw `[ANTIBOT] - Banned bot ${data.name}; their name is suspicious, likely a bot.`;
          }
          this.specialData.lastFakeLogin = Date.now();
          this.specialData.lastFakeUserID = data.cid;
          this.specialData.lastFakeUserName = data.name;
        }
      }
      break;
    }
  }
  this.sendHandler = function(data){
    data = JSON.parse(data)[0];
    if(data.data){
      if(!data.data.id){
        return;
      }
      switch (data.data.id) {
        case 2:
        this.specialData.startTime = Date.now();
        break;
      }
    }
  }
  this.globalMessageListener = function(e,t){
    this.e = e;
    if(!this.e.webSocket.oldSend){
      this.e.webSocket.oldSend = this.e.webSocket.send;
      this.e.webSocket.send = function(data){
        this.sendHandler(data);
        this.e.webSocket.oldSend(data);
      }
    }
    /*console.log(e); from testing: e[.webSocket] is the websocket*/
    var data = JSON.parse(t.data)[0];
    /*console.log(data);*/
    messageId = data.id ? data.id : messageId;
    /*if the message is the first message, which contains important clientid data*/
    if(data.id == 1){
      clientId = data.clientId;
    }
    try{
      pin = pin ? pin : Number(document.querySelector("[data-functional-selector=\"game-pin\"]").innerHTML);
      if(Number(document.querySelector("[data-functional-selector=\"game-pin\"]").innerHTML) != pin){
        pin = Number(document.querySelector("[data-functional-selector=\"game-pin\"]").innerHTML);
      }
    }catch(err){}
    /*if the message is a player join message*/
    if(data.data ? data.data.type == "joined" : false){
      console.warn("[ANTIBOT] - determining evil...");
      determineEvil(data.data,e.webSocket);
      specialBotDetector(data.data.type,data.data,e.webSocket);
    }
    /*if the message is a player leave message*/
    if(data.data ? data.data.type == "left" : false){
    }
    if(data.data ? data.data.id == 45 : false){
      // if player answers
      if(Date.now() - this.specialData.startTime < 500 && this.specialData.config.timeout){
        throw "[ANTIBOT] - Answer was too quick!";
      }
      // if player just recently joined (within 1 second)
      if(this.cachedData[data.data.cid] && Date.now() - this.cachedData[data.data.cid].loginTime < 1000){
        const packet = createKickPacket(data.data.cid);
        this.e.webSocket.send(JSON.stringify(packet));
        const c = document.getElementById("killcount");
        if(c){
          c.innerHTML = Number(c.innerHTML) + 1;
        }
        delete this.cachedData[data.data.cid];
        throw `[ANTIBOT] - Bot with id ${data.data.cid} banned. Answered too quickly after joining.`;
      }
    }
    if(data.data ? data.data.id == 50 : false){
      this.cachedData[data.data.cid].tries++;
      if(this.cachedData[data.data.cid].tries > 3){
        const kicker = createKickPacket(data.data.cid);
        e.webSocket.send(JSON.stringify(kicker));
        const name = this.cachedUsernames.filter(o=>{return o.id == data.data.cid}).length ? this.cachedUsernames.filter(o=>{return o.id == data.data.cid})[0].name : "bot";
        console.warn(`[ANTIBOT] - Bot ${name} banished. Seen spamming 2FA`);
        this.cachedUsernames.forEach(o=>{
          if(o.id == this.specialData.lastFakeUserID){
            o.banned = true;
            o.time = 10;
            return;
          }
        });
        delete this.cachedData[data.data.cid];
        const c = document.getElementById("killcount");
        if(c){
          c.innerHTML = Number(c.innerHTML) + 1;
        }
      }
    }
  };
};
