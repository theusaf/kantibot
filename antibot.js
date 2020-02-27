const code = ()=>{
      const percent = 0.6;
      // create watermark
      const container = document.createElement("div");
      container.id = "antibotwtr";
      const waterMark = document.createElement("p");
      waterMark.innerHTML = "v2.6.7 @theusaf";
      const botText = document.createElement("p");
      botText.innerHTML = "0";
      botText.id = "killcount";
      const menu = document.createElement("details");
      menu.innerHTML = `<summary>config</summary>
      <input type="checkbox" id="antibot.config.timeout"></input>
      <label id="antibot.config.timeoutlbl" onclick="window.specialData.config.timeout = !window.specialData.config.timeout;if(!localStorage.antibotConfig){localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(localStorage.antibotConfig);a.timeout = window.specialData.config.timeout;localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.timeout" title="Blocks answers that are sent before 0.5 seconds after the question starts">Min Answer Timeout</label>
      <input type="checkbox" id="antibot.config.looksRandom" checked="checked"></input>
      <label id="antibot.config.lookrandlbl" onclick="window.specialData.config.looksRandom = !window.specialData.config.looksRandom;if(!localStorage.antibotConfig){localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(localStorage.antibotConfig);a.looksRandom = window.specialData.config.looksRandom;localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.looksRandom" title="Blocks names that seem 'random', such as 'OmEGaboOt'">Block Random Names</label>`;
      const styles = document.createElement("style");
      styles.type = "text/css";
      styles.innerHTML = `#antibotwtr{
        position: fixed;
        bottom: 100px;
        right: 100px;
        font-size: 1rem;
        opacity: 0.4;
        transition: opacity 0.4s;
      }
      #antibotwtr:hover{
        opacity: 1;
      }
      #antibotwtr p{
        display: inline-block;
      }
      #killcount{
        margin-left: 0.25rem;
        background: black;
        border-radius: 0.5rem;
        color: white;
      }
      #antibotwtr details{
        background: grey;
      }
      #antibotwtr input{
        display: none;
      }
      #antibotwtr label{
        color: red;
        display: block;
      }
      #antibotwtr input:checked+label{
        color: green;
      }`;
      container.append(waterMark,botText,menu);
      setTimeout(function(){
        if(document.body.innerText.split("\n").length < 8){ // assume broken. (just the water mark)
          const temp = document.createElement("template");
          temp.innerHTML = `<div style="color: red; position: fixed; left: 0; top: 0; font-size: 2rem;line-height:2rem">
            <h1>[ANTIBOT] - Detected broken page. I haven't actually foud a way to fix this issue completely yet, so do one of the following:</h1>
            <hr/>
            <h1>Go back to <a href="https://create.kahoot.it/details/${location.search.split("quizId=")[1].split("&")[0]}">the kahoot launch screen</a>.</h1><br/>
            <h1>Clear the cache of this page and then reload.</h1><br/>
            <h1>Disable Kahoot AntiBot, reload the page, then re-enable Kahoot Antibot and reload the page again</h1>
          </div>`;
          document.body.append(temp.content.cloneNode(true));
          delete localStorage["kahoot-quizPins"];
        }
      },2000);
      document.body.append(container,styles);
      window.isUsingNamerator = false;
      window.cachedUsernames = [];
      window.confirmedPlayers = [];
      window.cachedData = {};
      window.loggedPlayers = {};
      window.specialData = {
        startTime: 0,
        lastFakeLogin: 0,
        lastFakeUserID: 0,
        lastFakeUserName: "",
        config:{
          timeout: false,
          looksRandom: true
        }
      };
      // loading localStorage info
      if(localStorage.antibotConfig){
        const a = JSON.parse(localStorage.antibotConfig);
        if(a.timeout){
          const t = document.getElementById("antibot.config.timeoutlbl");
          if(t){
            t.click();
          }
        }
        if(!a.looksRandom){
          const t = document.getElementById("antibot.config.lookrandlbl");
          if(t){
            t.click();
          }
        }
      }
      var messageId = 0;
      var clientId = null;
      var pin = null;
      // for names like KaHOotSmaSH
      function looksRandom(name){
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
      function isFakeValid(name){
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
      function similarity(s1, s2) {
        // remove numbers from name if name is not only a number
        if(!isNaN(s1) && typeof(s1) != "object" && !window.isUsingNamerator){
          s1 = s1.replace(/[0-9]/mg,"");
        }
        if(!isNaN(s2) && typeof(s2) != "object" && !window.isUsingNamerator){
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
        if(window.isUsingNamerator){
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
      function setup(){
        var launch_button =document.querySelectorAll("[data-functional-selector=\"launch-button\"]")[0];
        if(launch_button){
          console.warn("[ANTIBOT] - launch button found!");
        }else{
          setTimeout(setup,1000);
        }
      }
      setup();
      function clickName(name){
        const names = document.querySelectorAll("[data-functional-selector=player-name]");
        names.forEach(o=>{
          if(o.innerText == name){
            return o.click();
          }
        });
      }
      function createKickPacket(id){
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
      function determineEvil(player,socket){
        if(window.cachedUsernames.length == 0){
          if(similarity(null,player.name) == -1){
            var packet = createKickPacket(player.cid);
            socket.send(JSON.stringify(packet));
            console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
            const c = document.getElementById("killcount");
            if(c){
              c.innerHTML = Number(c.innerHTML) + 1;
            }
            delete window.cachedData[player.cid];
            throw "[ANTIBOT] - Bot banned. Dont add";
          }
          window.cachedUsernames.push({name: player.name, id:player.cid, time: 10, banned: false});
          window.loggedPlayers[player.cid] = true;
        }else{
          var removed = false;
          for(var i in window.cachedUsernames){
            if(window.confirmedPlayers.includes(window.cachedUsernames[i].name)){
              continue;
            }
            if(similarity(window.cachedUsernames[i].name,player.name) == -1){
              removed = true;
              var packet1 = createKickPacket(player.cid);
              socket.send(JSON.stringify(packet1));
              console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
              const c = document.getElementById("killcount");
              if(c){
                c.innerHTML = Number(c.innerHTML) + 1;
              }
              delete window.cachedData[player.cid];
              throw "[ANTIBOT] - Bot banned. Dont add";
            }
            if(similarity(window.cachedUsernames[i].name,player.name) >= percent){
              removed = true;
              let packet1 = createKickPacket(player.cid);
              socket.send(JSON.stringify(packet1));
              if(!window.cachedUsernames[i].banned){
                var packet2 =createKickPacket(window.cachedUsernames[i].id);
                window.cachedUsernames[i].banned = true;
                socket.send(JSON.stringify(packet2));
                clickName(window.cachedUsernames[i].name);
                const c = document.getElementById("killcount");
                if(c){
                  c.innerHTML = Number(c.innerHTML) + 1;
                }
              }
              window.cachedUsernames[i].time = 10;
              console.warn(`[ANTIBOT] - Bots ${player.name} and ${window.cachedUsernames[i].name} have been banished`);
              const c = document.getElementById("killcount");
              if(c){
                c.innerHTML = Number(c.innerHTML) + 1;
              }
              delete window.cachedData[player.cid];
              delete window.cachedData[window.cachedUsernames[i].id];
              throw "[ANTIBOT] - Bot banned. Dont add";
            }
          }
          if(!removed){
            window.cachedUsernames.push({name: player.name,id: player.cid, time: 10, banned: false});
            window.loggedPlayers[player.cid] = true;
          }
        }
      }
      function specialBotDetector(type,data,socket){
        switch (type) {
          case 'joined':
          // if looks random
          if(window.specialData.config.looksRandom){
            if(looksRandom(data.name)){
              const packet = createKickPacket(data.cid);
              socket.send(JSON.stringify(packet));
              const c = document.getElementById("killcount");
              if(c){
                c.innerHTML = Number(c.innerHTML) + 1;
              }
              window.cachedUsernames.forEach(o=>{
                if(o.id == data.cid){
                  o.banned = true;
                  o.time = 10;
                  return;
                }
              });
              throw `[ANTIBOT] - Bot ${data.name} banned; name too random.`;
            }
          }
          if(!window.cachedData[data.cid] && !isNaN(data.cid) && Object.keys(data).length <= 5 && data.name.length < 16){ //if the id has not been cached yet or is an invalid id, and they are not a bot :p
            window.cachedData[data.cid] = {
              tries: 0,
              loginTime: Date.now()
            };
          }else{
            const packet = createKickPacket(data.cid);
            socket.send(JSON.stringify(packet));
            console.warn(`[ANTIBOT] - Bot ${data.name} has been banished, clearly a bot from kahootsmash or something`);
            window.cachedUsernames.forEach(o=>{
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
          if(!window.isUsingNamerator){
            if(isFakeValid(data.name)){
              if(Date.now() - window.specialData.lastFakeLogin < 5000){
                if(window.cachedData[window.specialData.lastFakeUserID]){ // to get the first guy
                  const packet = createKickPacket(window.specialData.lastFakeUserID);
                  socket.send(JSON.stringify(packet));
                  clickName(window.specialData.lastFakeUserName);
                  delete window.cachedData[window.specialData.lastFakeUserID]; window.cachedUsernames.forEach(o=>{
                    if(o.id == window.specialData.lastFakeUserID){
                      o.banned = true;
                      o.time = 10;
                      return;
                    }
                  });
                }
                const packet = createKickPacket(data.cid);
                socket.send(JSON.stringify(packet));
                delete window.cachedData[data.cid];
                window.cachedUsernames.forEach(o=>{
                  if(o.id == data.cid){
                    o.banned = true;
                    return;
                  }
                });
                const c = document.getElementById("killcount");
                if(c){
                  c.innerHTML = Number(c.innerHTML) + 1;
                }
                window.specialData.lastFakeLogin = Date.now();
                window.specialData.lastFakeUserID = data.cid;
                window.specialData.lastFakeUserName = data.name;
                throw `[ANTIBOT] - Banned bot ${data.name}; their name is suspicious, likely a bot.`;
              }
              window.specialData.lastFakeLogin = Date.now();
              window.specialData.lastFakeUserID = data.cid;
              window.specialData.lastFakeUserName = data.name;
            }
          }
          break;
        }
      }
      var timer = setInterval(function(){
        for(let i in window.cachedUsernames){
          if(window.cachedUsernames[i].time <= 0 && !window.cachedUsernames[i].banned && !window.confirmedPlayers.includes(window.cachedUsernames[i].name)){
            window.confirmedPlayers.push(window.cachedUsernames[i].name);
            continue;
          }
          if(window.cachedUsernames[i].time <= -20){
            window.cachedUsernames.splice(i,1);
            continue;
          }
          window.cachedUsernames[i].time--;
        }
      },1000);
      const TFATimer = setInterval(()=>{
        for(let i in window.cachedData){
          window.cachedData[i].tries = 0;
        }
      },10000);
      window.sendHandler = function(data){
        data = JSON.parse(data)[0];
        if(data.data){
          if(!data.data.id){
            return;
          }
          switch (data.data.id) {
            case 2:
              window.specialData.startTime = Date.now();
              break;
          }
        }
      }
      window.globalMessageListener = function(e,t){
        window.e = e;
        if(!window.e.webSocket.oldSend){
          window.e.webSocket.oldSend = window.e.webSocket.send;
          window.e.webSocket.send = function(data){
            window.sendHandler(data);
            window.e.webSocket.oldSend(data);
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
          if(Date.now() - window.specialData.startTime < 500 && window.specialData.config.timeout){
            throw "[ANTIBOT] - Answer was too quick!";
          }
          // if player just recently joined (within 1 second)
          if(window.cachedData[data.data.cid] && Date.now() - window.cachedData[data.data.cid].loginTime < 1000){
            const packet = createKickPacket(data.data.cid);
            window.e.webSocket.send(JSON.stringify(packet));
            const c = document.getElementById("killcount");
            if(c){
              c.innerHTML = Number(c.innerHTML) + 1;
            }
            delete window.cachedData[data.data.cid];
            throw `[ANTIBOT] - Bot with id ${data.data.cid} banned. Answered too quickly after joining.`;
          }
        }
        if(data.data ? data.data.id == 50 : false){
          window.cachedData[data.data.cid].tries++;
          if(window.cachedData[data.data.cid].tries > 3){
            const kicker = createKickPacket(data.data.cid);
            e.webSocket.send(JSON.stringify(kicker));
            const name = window.cachedUsernames.filter(o=>{return o.id == data.data.cid}).length ? window.cachedUsernames.filter(o=>{return o.id == data.data.cid})[0].name : "bot";
            console.warn(`[ANTIBOT] - Bot ${name} banished. Seen spamming 2FA`);
            window.cachedUsernames.forEach(o=>{
              if(o.id == window.specialData.lastFakeUserID){
                o.banned = true;
                o.time = 10;
                return;
              }
            });
            delete window.cachedData[data.data.cid];
            const c = document.getElementById("killcount");
            if(c){
              c.innerHTML = Number(c.innerHTML) + 1;
            }
          }
        }
      };
    };
