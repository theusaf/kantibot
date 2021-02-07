// ==UserScript==
// @name         Kahoot AntiBot
// @namespace    http://tampermonkey.net/
// @version      2.15.3
// @icon         https://cdn.discordapp.com/icons/641133408205930506/31c023710d468520708d6defb32a89bc.png
// @description  Remove all bots from a kahoot game.
// @author       theusaf
// @copyright    2018-2021, Daniel Lau (https://github.com/theusaf/kahoot-antibot)
// @match        *://play.kahoot.it/*
// @exclude      *://play.kahoot.it/v2/assets/*
// @grant        none
// @run-at       document-start
// @license      MIT; https://opensource.org/licenses/MIT
// ==/UserScript==

if(window.fireLoaded || (window.parent && window.parent.page)){
  throw "[ANTIBOT] - page is loaded";
}
if(window.localStorage.extraCheck){
  console.log("[ANTIBOT] - Detected PIN Checker");
}
if(window.localStorage.kahootThemeScript){
  console.log("[ANTIBOT] - Detected KonoSuba Theme");
}
document.write("[ANTIBOT] - Patching Kahoot. Please wait. If this screen stays blank for long periods of time, please force reload or clear your cache.");
window.url = window.location.href;
window.page = new XMLHttpRequest();
window.page.open("GET",window.url);
window.page.send();
window.page.onload = ()=>{
  const scriptURL = window.page.response.match(/><\/script><script .*?vendors.*?><\/script>/mg)[0].substr(9).split("src=\"")[1].split("\"")[0],
    script2 = window.page.response.match(/\/v2\/assets\/js\/main.*?(?=")/mg)[0];
  let originalPage = window.page.response.replace(/><\/script><script .*?vendors.*?><\/script>/mg,"></script>");
  originalPage = originalPage.replace(/\/v2\/assets\/js\/main.*?(?=")/mg,"data:text/javascript,");
  const script = new XMLHttpRequest();
  script.open("GET","https://play.kahoot.it/"+scriptURL);
  script.send();
  script.onload = ()=>{
    const patchedScriptRegex = /\.onMessage=function\([a-z],[a-z]\)\{/mg,
      letter1 = script.response.match(patchedScriptRegex)[0].match(/[a-z](?=,)/g)[0],
      letter2 = script.response.match(patchedScriptRegex)[0].match(/[a-z](?=\))/g)[0],
      patchedScript = script.response.replace(script.response.match(patchedScriptRegex)[0],`.onMessage=function(${letter1},${letter2}){window.globalMessageListener(${letter1},${letter2});`),
      code = ()=>{
        const windw = window.parent;
        window.windw = windw;
        // create watermark
        const container = document.createElement("div");
        container.id = "antibotwtr";
        const waterMark = document.createElement("p");
        waterMark.innerHTML = "v2.15.3 @theusaf";
        const botText = document.createElement("p");
        botText.innerHTML = "0";
        botText.id = "killcount";
        const menu = document.createElement("details");
        menu.innerHTML = `<summary>config</summary>
        <div id="antibot-settings">
          <!-- Timeout -->
          <div>
            <input type="checkbox" id="antibot.config.timeout"></input>
            <label id="antibot.config.timeoutlbl" onclick="windw.specialData.config.timeout = !windw.specialData.config.timeout;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.timeout = windw.specialData.config.timeout;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.timeout" title="Blocks answers that are sent before 0.5 seconds after the question starts">Min Answer Timeout</label>
          </div>
          <!-- Random Names -->
          <div>
            <input type="checkbox" id="antibot.config.looksRandom" checked="checked"></input>
            <label id="antibot.config.lookrandlbl" onclick="windw.specialData.config.looksRandom = !windw.specialData.config.looksRandom;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.looksRandom = windw.specialData.config.looksRandom;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.looksRandom" title="Blocks names that seem 'random', such as 'OmEGaboOt'">Block Random Names</label>
          </div>
          <!-- Blocking Format 1 -->
          <div>
            <input type="checkbox" id="antibot.config.blockformat1" checked="checked"></input>
            <label id="antibot.config.blockformat1lbl" onclick="windw.specialData.config.banFormat1 = !windw.specialData.config.banFormat1;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.banFormat1 = windw.specialData.config.banFormat1;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.blockformat1" title="Blocks names using the format [First][random char][Last]">Block format First[._-,etc]Last</label>
          </div>
          <!-- Blocking kahootflood.weebly.com -->
          <div>
            <input type="checkbox" id="antibot.config.blockservice1"></input>
            <label onclick="windw.specialData.config.blockservice1 = !windw.specialData.config.blockservice1;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.blockservice1 = windw.specialData.config.blockservice1;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.blockservice1" title="A special filter focused on kahootflood.weebly.com">Block kahootflood.weebly.com</label>
          </div>
          <!-- Block Numbers -->
          <div>
            <input type="checkbox" id="antibot.config.blocknum"></input>
            <label onclick="windw.specialData.config.blocknum = !windw.specialData.config.blocknum;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.blocknum = windw.specialData.config.blocknum;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.blocknum" title="Marks names with numbers as suspicious. If multiple players join with numbers in their name in a short amount of time, they will be banned.">Block Numbers</label>
          </div>
          <!-- Block Non-Ascii -->
          <div>
            <input type="checkbox" id="antibot.config.forceascii"></input>
            <label onclick="windw.specialData.config.forceascii = !windw.specialData.config.forceascii;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.forceascii = windw.specialData.config.forceascii;windw.localStorage.antibotConfig = JSON.stringify(a);" for="antibot.config.forceascii" title="Marks names with non-alphanumeric characters as suspicious and bans them if multiple join.">Force Alphanumeric</label>
          </div>
          <!-- Additional Question Time -->
          <div>
            <label class="antibot-input" for="antibot.config.teamtimeout" title="Add extra seconds to the question.">Additional Question Time</label>
            <input type="number" step="1" value="0" id="antibot.config.teamtimeout" onchange="windw.specialData.config.additionalQuestionTime = Number(document.getElementById('antibot.config.teamtimeout').value);if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.teamtime = windw.specialData.config.additionalQuestionTime;windw.localStorage.antibotConfig = JSON.stringify(a);">
          </div>
          <!-- Percent -->
          <div>
            <label class="antibot-input" for="antibot.config.percent" title="Specify the match percentage.">Match Percent</label>
            <input type="number" step="0.1" value="0.6" id="antibot.config.percent" onchange="windw.specialData.config.percent = Number(document.getElementById('antibot.config.percent').value);if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.percent = windw.specialData.config.percent;windw.localStorage.antibotConfig = JSON.stringify(a);">
          </div>
          <!-- Custom Word Block -->
          <div>
            <label class="antibot-input" for="antibot.config.wordblock" title="Add a custom word blacklist. Click the box to open. Unfocus to close. Separate by new lines.">Word Blacklist</label>
            <textarea type="checkbox" id="antibot.config.wordblock" onchange="windw.specialData.config.wordblock = document.getElementById('antibot.config.wordblock').value.split('\\n');
              if(!windw.localStorage.antibotConfig){
                windw.localStorage.antibotConfig = JSON.stringify({});
              }
              const a = JSON.parse(windw.localStorage.antibotConfig);
              a.wordblock = windw.specialData.config.wordblock;
              localStorage.antibotConfig = JSON.stringify(a);"
              onclick="this.className = 'antibot-textarea';"
              onblur="this.className = '';"></textarea>
          </div>
          <!-- DDOS -->
          <div>
            <label class="antibot-input" for="antibot.config.ddos" title="Specify the number of bots/minute to lock the game. Set it to 0 to disable.">Auto Lock Threshold</label>
            <input type="number" step="1" value="0" id="antibot.config.ddos" onchange="windw.specialData.config.ddos = Number(document.getElementById('antibot.config.ddos').value);if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.ddos = windw.specialData.config.ddos;windw.localStorage.antibotConfig = JSON.stringify(a);">
          </div>
          <!-- Auto-Start-Lock -->
          <div>
            <label class="antibot-input" for="antibot.config.start_lock" title="Specify the maximum time in seconds for a lobby to stay open after a player joins. Setting this to 0 will disable it.">Lobby Auto-Start Time</label>
            <input type="number" step="1" value="0" id="antibot.config.start_lock" onchange="windw.specialData.config.start_lock = Number(document.getElementById('antibot.config.start_lock').value);if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.start_lock = windw.specialData.config.start_lock;windw.localStorage.antibotConfig = JSON.stringify(a);">
          </div>
          <!-- Toggling Streak Bonus -->
          <div>
            <input type="checkbox" id="antibot.config.streakBonus" onchange="windw.specialData.config.streakBonus = Number(document.getElementById('antibot.config.streakBonus').checked ? 1 : 2);if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.streakBonus = windw.specialData.config.streakBonus;localStorage.antibotConfig = JSON.stringify(a);alert('When modifying this option, reload the page for it to take effect')">
            <label for="antibot.config.streakBonus" title="Toggle the Streak Bonus.">Toggle Streak Bonus</label>
          </div>
          <!-- Show Antibot Counters -->
          <div>
            <input type="checkbox" id="antibot.config.counters" onchange="windw.specialData.config.counters = document.getElementById('antibot.config.counters').checked;if(!windw.localStorage.antibotConfig){windw.localStorage.antibotConfig = JSON.stringify({});}const a = JSON.parse(windw.localStorage.antibotConfig);a.counters = windw.specialData.config.counters;localStorage.antibotConfig = JSON.stringify(a);">
            <label for="antibot.config.counters" title="Shows Antibot Countdowns (Lobby Auto-Start/Auto-Lock)">Show Antibot Timers</label>
          </div>
          <!-- Counter cheats -->
          <div>
            <input type="checkbox" id="antibot.config.counterCheats" onchange="windw.specialData.config.counterCheats = document.getElementById('antibot.config.counterCheats').checked;
              if(!windw.localStorage.antibotConfig){
                windw.localStorage.antibotConfig = JSON.stringify({});
              }
              const a = JSON.parse(windw.localStorage.antibotConfig);
              a.counterCheats = windw.specialData.config.counterCheats;
              localStorage.antibotConfig = JSON.stringify(a);
              if(a.counterCheats){
                // enable cheats
                alert('Changes may only take effect upon reload.');
              }else{
                // disable anti-cheat
                const q = windw.specialData.globalQuizData.questions;
                if(q[q.length - 1].isAntibotQuestion){
                  q.splice(-1,1);
                  delete windw.specialData.kahootCore.game.navigation.questionIndexMap[q.length];
                }
              }">
            <label for="antibot.config.counterCheats" title="Adds an additional 5 second question at the end to counter cheats. Note: Changing this mid-game may break the game.">Counter Kahoot Cheats</label>
          </div>
          <!-- CAPTCHA -->
          <div>
            <input type="checkbox" id="antibot.config.enableCAPTCHA" onchange="windw.specialData.config.enableCAPTCHA = document.getElementById('antibot.config.enableCAPTCHA').checked;
              if(!windw.localStorage.antibotConfig){
                windw.localStorage.antibotConfig = JSON.stringify({});
              }
              const a = JSON.parse(windw.localStorage.antibotConfig);
              a.enableCAPTCHA = windw.specialData.config.enableCAPTCHA;
              localStorage.antibotConfig = JSON.stringify(a);
              if(a.enableCAPTCHA){
                // enable captcha
                alert('Changes may only take effect upon reload.');
              }else{
                // disable captcha
                const q = windw.specialData.globalQuizData.questions;
                if(q[0].isAntibotQuestion){
                  q.splice(0,1);
                  delete windw.specialData.kahootCore.game.navigation.questionIndexMap[q.length];
                }
              }">
            <label for="antibot.config.enableCAPTCHA" title="Adds a 30 second poll at the start of the quiz. If players don't answer it correctly, they get banned. Note: Changing this mid-game may break the game.">Enable CAPTCHA</label>
          </div>
        </div>`;
        const counters = document.createElement("div");
        counters.id = "antibot-counters";
        const styles = document.createElement("template");
        styles.innerHTML = `<style>
          #antibotwtr{
            position: fixed;
            bottom: 100px;
            right: 100px;
            font-size: 1rem;
            opacity: 0.4;
            transition: opacity 0.4s;
            z-index: 5000;
            background: white;
            text-align: center;
            border-radius: 0.5rem;
          }
          #antibotwtr summary{
            text-align: left;
          }
          #antibotwtr:hover{
            opacity: 1;
          }
          #antibotwtr p{
            display: inline-block;
          }
          #antibotwtr p:first-child{
            font-weight: 600;
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
          #antibotwtr input[type="checkbox"]{
            display: none;
          }
          #antibotwtr label{
            color: black;
            font-weight: 600;
            display: block;
            background: #c60929;
            border-radius: 0.5rem;
            height: 100%;
            word-break: break-word;
          }
          #antibotwtr .antibot-input{
            height: calc(100% - 1.5rem);
            background: #864cbf;
            color: white;
          }
          #antibotwtr input,textarea{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1rem;
            border-radius: 0.25rem;
            border: solid 1px black;
            font-family: "Montserrat", sans-serif;
            resize: none;
          }
          #antibotwtr input:checked+label{
            background: #26890c;
          }
          #antibot-settings{
            display: flex;
            flex-wrap: wrap;
            max-width: 25rem;
            max-height: 24rem;
            overflow: auto;
          }
          #antibot-settings > div{
            flex: 1;
            max-width: 33%;
            min-width: 33%;
            min-height: 6rem;
            box-sizing: border-box;
            position: relative;
            border: solid 0.5rem transparent;
          }
          #antibot-counters{
            position: absolute;
            right: 10rem;
            top: 11rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            pointer-events: none;
          }
          #antibot-counters div{
            background: rgba(0,0,0,0.5);
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .antibot-count-num{
            display: block;
            text-align: center;
          }
          .antibot-count-desc{
            text-align: center;
            font-size: 1.25rem;
            display: block;
          }
          .antibot-textarea{
            position: fixed;
            width: 40rem;
            height: 30rem;
            margin: auto;
            left: 0;
            top: 0;
            margin-left: calc(50% - 20rem);
            z-index: 1;
            font-size: 1.5rem;
            font-weight: bold;
          }
        </style>`;
        container.append(waterMark,botText,menu);
        setTimeout(function(){
          if(document.body.innerText.split("\n").length < 8){ // assume broken. (just the water mark)
            const temp = document.createElement("template");
            temp.innerHTML = `<div id="antibot-broken-page" style="color: red; position: fixed; left: 0; top: 0; font-size: 1.25rem;line-height:1.75rem">
            <h2>[ANTIBOT] - Detected broken page. This message may appear due to slow internet. It will dissapear once the page loads. If the page doesn't load, try one of the following:</h2>
            <hr/>
            <h2>Reload the page</h2>
            <h2>Go back to <a href="https://create.kahoot.it/details/${location.search.split("quizId=")[1].split("&")[0]}">the kahoot launch screen</a>.</h2><br/>
            <h2>Clear the cache of this page and then reload.</h2><br/>
            <h2>Disable Kahoot AntiBot, reload the page, then re-enable Kahoot Antibot and reload the page again</h2>
          </div>`;
            document.body.append(temp.content.cloneNode(true));
            const RemoveBroke = setInterval(()=>{
              if(document.body.innerText.split("\n").length >= 20){
                clearInterval(RemoveBroke);
                document.getElementById("antibot-broken-page").outerHTML = "";
              }
            },1000);
          }
        },2000);
        document.body.append(container,styles.content.cloneNode(true),counters);
        const killcount = document.getElementById("killcount");
        windw.isUsingNamerator = false;
        windw.cachedUsernames = [];
        windw.confirmedPlayers = new Set;
        windw.cachedData = {};
        windw.loggedPlayers = {};
        windw.specialData = {
          /**
           * extraQuestionSetup - Modifies quiz data (anti-cheat, bot-captcha)
           *
           * @param {Object} quiz The quiz to be modified
           */
          extraQuestionSetup: (quiz)=>{
            if(windw.specialData.config.counterCheats){
              quiz.questions.push({
                question:"[ANTIBOT] - This poll is for countering Kahoot cheating sites.",
                time:5000,
                type:"survey",
                isAntibotQuestion:true,
                choices:[{answer:"OK",correct:true}]
              });
            }
            if(windw.specialData.config.enableCAPTCHA){
              const answers = ["red","blue","yellow","green"],
                images = [
                  "361bdde0-48cd-4a92-ae9f-486263ba8529", // red
                  "9237bdd2-f281-4f04-b4e5-255e9055a194", // blue
                  "d25c9d13-4147-4056-a722-e2a13fbb4af9", // yellow
                  "2aca62f2-ead5-4197-9c63-34da0400703a" // green
                ],
                imageIndex = Math.floor(Math.random() * answers.length);
              quiz.questions.splice(0,0,{
                question: `[ANTIBOT] - CAPTCHA: Please select ${answers[imageIndex]}`,
                time: 30000,
                type: "quiz",
                isAntibotQuestion: true,
                AntibotCaptchaCorrectIndex: imageIndex,
                choices:[{answer:"OK"},{answer:"OK"},{answer:"OK"},{answer:"OK"}],
                image: "https://media.kahoot.it/" + images[imageIndex],
                imageMetadata: {
                  width: 512,
                  height: 512,
                  id: images[imageIndex],
                  contentType: "image/png",
                  resources: ""
                },
                points: false
              });
            }
          },
          startTime: 0, // The question start time
          lastFakeLogin: 0, // The time when the last "fake valid" joined
          lastFakeUserID: 0, // The id of the last "fake valid"
          lastFakeUserName: "", // The name of the last "fake valid"
          config:{
            timeout: false, // Minimum 0.5s answer time
            blocknum: false, // Ban all numbers
            looksRandom: true, // Ban "random" names
            banFormat1: true, // Ban bots like Doctor_Robot123
            additionalQuestionTime: null, // Adds time to a question
            percent: 0.6, // The name match percent
            streakBonus: 2, // Whether to enable streak points
            ddos: 0, // Whether to auto-lock quizzes
            start_lock: 0, // Time until auto-start activates
            counters: false, // Shows antibot counters
            forceascii: false, // Forces alpha-numeric characters
            blockservice1: false, // Special filters against kahootflood.weebly.com
            counterCheats: false, // Counters cheats by adding an extra question
            enableCAPTCHA: false, // Adds a captcha
            wordblock: []
          },
          inLobby: true, // Whether in the lobby
          lobbyLoadTime: 0, // The time the first player joined the lobby
          lockInterval: null, // The lock interval
          kahootCore: null, // Kahoot's core data
          globalFuncs: null, // Useful functions (starting quiz, etc)
          CAPTCHA_IDS: new Set, // Players that answered the captcha
          blockService1Data: new Set // Bots that are suspicious in blockservice1
        };
        // loading localStorage info
        if(windw.localStorage.antibotConfig){
          const a = JSON.parse(windw.localStorage.antibotConfig);
          if(a.timeout){
            const t = document.getElementById("antibot.config.timeoutlbl");
            if(t){
              t.click();
            }
          }
          if(a.blocknum){
            const t = document.getElementById("antibot.config.blocknum");
            t.checked = true;
            windw.specialData.config.blocknum = true;
          }
          if(!a.looksRandom){
            const t = document.getElementById("antibot.config.lookrandlbl");
            if(t){
              t.click();
            }
          }
          if(a.teamtime){
            document.getElementById("antibot.config.teamtimeout").value = Number(a.teamtime);
            windw.specialData.config.additionalQuestionTime = Number(a.teamtime);
          }
          if(a.percent){
            document.getElementById("antibot.config.percent").value = Number(a.percent);
            windw.specialData.config.percent = Number(a.percent);
          }
          if(!a.banFormat1){
            document.getElementById("antibot.config.blockformat1").checked = false;
            windw.specialData.config.banFormat1 = false;
          }
          if(a.streakBonus === 1){
            document.getElementById("antibot.config.streakBonus").checked = true;
            windw.specialData.config.streakBonus = 1;
          }
          if(a.ddos){
            document.getElementById("antibot.config.ddos").value = +a.ddos;
            windw.specialData.config.ddos = +a.ddos;
          }
          if(a.start_lock){
            document.getElementById("antibot.config.start_lock").value = +a.start_lock;
            windw.specialData.config.start_lock = +a.start_lock;
          }
          if(a.counters){
            document.getElementById("antibot.config.counters").checked = true;
            windw.specialData.config.counters = true;
          }
          if(a.forceascii){
            document.getElementById("antibot.config.forceascii").checked = true;
            windw.specialData.config.forceascii = true;
          }
          if(a.blockservice1){
            document.getElementById("antibot.config.blockservice1").checked = true;
            windw.specialData.config.blockservice1 = true;
          }
          if(a.counterCheats){
            document.getElementById("antibot.config.counterCheats").checked = true;
            windw.specialData.config.counterCheats = true;
          }
          if(a.enableCAPTCHA){
            document.getElementById("antibot.config.enableCAPTCHA").checked = true;
            windw.specialData.config.enableCAPTCHA = true;
          }
          if(a.wordblock){
            document.getElementById("antibot.config.wordblock").value = a.wordblock.join("\n");
            windw.specialData.config.wordblock = a.wordblock;
          }
        }
        let messageId = 0,
          clientId = null,
          pin = null;

        /**
         * isValidNameratorName - Checks whether a name is a valid namerator name
         *
         * @param  {String} name The name
         * @returns {Boolean} Whether it is a valid namerator name
         */
        function isValidNameratorName(name){
          const First = ["Adorable","Agent","Agile","Amazing","Amazon","Amiable","Amusing","Aquatic","Arctic","Awesome","Balanced","Blue","Bold","Brave","Bright","Bronze","Captain","Caring","Champion","Charming","Cheerful","Classy","Clever","Creative","Cute","Dandy","Daring","Dazzled","Decisive","Diligent","Diplomat","Doctor","Dynamic","Eager","Elated","Epic","Excited","Expert","Fabulous","Fast","Fearless","Flying","Focused","Friendly","Funny","Fuzzy","Genius","Gentle","Giving","Glad","Glowing","Golden","Great","Green","Groovy","Happy","Helpful","Hero","Honest","Inspired","Jolly","Joyful","Kind","Knowing","Legend","Lively","Lovely","Lucky","Magic","Majestic","Melodic","Mighty","Mountain","Mystery","Nimble","Noble","Polite","Power","Prairie","Proud","Purple","Quick","Radiant","Rapid","Rational","Rockstar","Rocky","Royal","Shining","Silly","Silver","Smart","Smiling","Smooth","Snowy","Soaring","Social","Space","Speedy","Stellar","Sturdy","Super","Swift","Tropical","Winged","Wise","Witty","Wonder","Yellow","Zany"],
            Last = ["Alpaca","Ant","Badger","Bat","Bear","Bee","Bison","Boa","Bobcat","Buffalo","Bunny","Camel","Cat","Cheetah","Chicken","Condor","Crab","Crane","Deer","Dingo","Dog","Dolphin","Dove","Dragon","Duck","Eagle","Echidna","Egret","Elephant","Elk","Emu","Falcon","Ferret","Finch","Fox","Frog","Gator","Gazelle","Gecko","Giraffe","Glider","Gnu","Goat","Goose","Gorilla","Griffin","Hamster","Hare","Hawk","Hen","Horse","Ibex","Iguana","Impala","Jaguar","Kitten","Koala","Lark","Lemming","Lemur","Leopard","Lion","Lizard","Llama","Lobster","Macaw","Meerkat","Monkey","Mouse","Newt","Octopus","Oryx","Ostrich","Otter","Owl","Panda","Panther","Pelican","Penguin","Pigeon","Piranha","Pony","Possum","Puffin","Quail","Rabbit","Raccoon","Raven","Rhino","Rooster","Sable","Seal","SeaLion","Shark","Sloth","Snail","Sphinx","Squid","Stork","Swan","Tiger","Turtle","Unicorn","Urchin","Wallaby","Wildcat","Wolf","Wombat","Yak","Yeti","Zebra"],
            F = name.match(/[A-Z][a-z]+(?=[A-Z])/);
          if(F === null || !First.includes(F)){
            return false;
          }
          const L = name.replace(F,"");
          if(!Last.includes(L)){
            return false;
          }
          return true;
        }
        /**
         * blacklist - Checks if the name has words on the blacklist
         *
         * @param  {String} name The name
         * @returns {Boolean} If it violates the blacklist
         */
        function blacklist(name){
          const list = windw.specialData.config.wordblock;
          for(let i = 0; i < list.length; i++){
            if(list[i] === ""){
              continue;
            }
            if(name.toLowerCase().indexOf(list[i].toLowerCase()) !== -1){
              return true;
            }
          }
          return false;
        }
        /**
         * looksRandom - Blocks names like "KaHOotSmaSH"
         *
         * @param  {String} name The name of the controller
         * @returns {Boolean} Whether it looks "random"
         */
        function looksRandom(name){
          // Assumes player names have either all caps, no caps, or up to 3 capital letters
          return !/(^(([^A-Z\n]*)?[A-Z]?([^A-Z\n]*)?){0,3}$)|^([A-Z]*)$/.test(name);
        }
        /**
         * isFakeValid - Marks suspicious names that are not 100% bots, but could be.
         *
         * @example AmazingRabbit32
         *
         * @param  {String} name The name of the controller
         * @returns {Boolean} Whether the name is "suspicious"
         */
        function isFakeValid(name){
          if(!windw.isUsingNamerator && isValidNameratorName(name)){
            return true;
          }
          if(windw.specialData.config.blocknum && /\d/.test(name)){
            return true;
          }
          if(windw.specialData.config.forceascii && /[^\d\s\w_-]/.test(name)){
            return true;
          }
          return /(^([A-Z][a-z]+){2,3}\d{1,2}$)|(^([A-Z][^A-Z\n]+?)+?(\d[a-z]+\d*?)$)|(^[a-zA-Z]+\d{4,}$)/.test(name);
        }
        /**
         * similarity - Checks the similarity between names and other stuff
         *
         * @param  {String} s1 The name of the first player
         * @param  {String} s2 The name of the second player
         * @returns {Number} The percent match between the players. if -1 is returned, its due to a different issue.
         */
        function similarity(s1, s2) {
          // remove numbers from name if name is not only a number
          if(isNaN(s1) && typeof(s1) !== "object" && !windw.isUsingNamerator){
            s1 = s1.replace(/[0-9]/mg,"");
          }
          if(isNaN(s2) && typeof(s2) !== "object" && !windw.isUsingNamerator){
            s2 = s2.replace(/[0-9]/mg,"");
          }
          if(!s2){
            return 0;
          }
          // if is a number of the same length
          if(s1){
            if(!isNaN(s2) && !isNaN(s1) && s1.length === s2.length){
              return 1;
            }
          }
          // apply namerator rules
          if(windw.isUsingNamerator){
            if(isValidNameratorName(s2)){
              return -1;
            }
          }
          if(!s1){
            return;
          }
          // ignore case
          s1 = s1.toLowerCase();
          s2 = s2.toLowerCase();
          let longer = s1,
            shorter = s2;
          // begin math to determine similarity
          if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
          }
          const longerLength = longer.length;
          if (longerLength === 0) {
            return 1.0;
          }
          return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
        }
        /**
         * editDistance - Used in similarity
         *
         * @param  {String} s1 String 1
         * @param  {String} s2 String 2
         * @returns {Number} "Distance" to match
         */
        function editDistance(s1, s2) {
          s1 = s1.toLowerCase();
          s2 = s2.toLowerCase();

          const costs = new Array();
          for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
              if (i === 0){
                costs[j] = j;
              }
              else {
                if (j > 0) {
                  let newValue = costs[j - 1];
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
        /**
         * createKickPacket - Creates a packet to kick the player
         *
         * @param  {String} id The id of the bot
         * @returns {Object} A kick packet
         */
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
        /**
         * determineEvil - Checks the similarity between players and stuff
         * Moved the name length check here to fix a severe issue!
         *
         * @param  {Object} player The controller
         * @param  {WebSocket} socket The websocket
         */
        function determineEvil(player,socket){
          if(isNaN(player.cid) || Object.keys(player).length > 5 || player.name.length >= 16){ //if the id has not been cached yet or is an invalid id, and they are not a bot :p
            if(windw.cachedData[player.cid]){ // now allowing reconnection
              return;
            }
            const packet = createKickPacket(player.cid);
            socket.send(JSON.stringify(packet));
            if(player.name.length >= 50){
              player.name = "[Name-Too-Long] - " + player.name.length;
            }
            console.warn(`[ANTIBOT] - Bot ${player.name} has been banished - invalid packet/name`);
            killcount.innerHTML = +killcount.innerHTML + 1;
            throw "[ANTIBOT] - Bot banned. Dont add";
          }
          if(windw.cachedUsernames.length === 0){
            if(similarity(null,player.name) === -1){
              const packet = createKickPacket(player.cid);
              socket.send(JSON.stringify(packet));
              console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
              killcount.innerHTML = +killcount.innerHTML + 1;
              delete windw.cachedData[player.cid];
              throw "[ANTIBOT] - Bot banned. Dont add";
            }
            windw.cachedUsernames.push({name: player.name, id:player.cid, time: 10, banned: false});
            windw.loggedPlayers[player.cid] = true;
          }else{
            let removed = false;
            if(similarity(null,player.name) === -1){
              removed = true;
              const packet1 = createKickPacket(player.cid);
              socket.send(JSON.stringify(packet1));
              console.warn(`[ANTIBOT] - Bot ${player.name} has been banished`);
              killcount.innerHTML = +killcount.innerHTML + 1;
              delete windw.cachedData[player.cid];
              throw "[ANTIBOT] - Bot banned. Dont add";
            }
            for(const i in windw.cachedUsernames){
              if(windw.confirmedPlayers.has(windw.cachedUsernames[i].name)){
                continue;
              }
              if(similarity(windw.cachedUsernames[i].name,player.name) >= windw.specialData.config.percent){
                removed = true;
                const packet1 = createKickPacket(player.cid);
                socket.send(JSON.stringify(packet1));
                if(!windw.cachedUsernames[i].banned){
                  const packet2 =createKickPacket(windw.cachedUsernames[i].id);
                  windw.cachedUsernames[i].banned = true;
                  socket.send(JSON.stringify(packet2));
                  delete windw.specialData.kahootCore.game.core.controllers[windw.cachedUsernames[i].id];
                  killcount.innerHTML = +killcount.innerHTML + 1;
                }
                windw.cachedUsernames[i].time = 10;
                console.warn(`[ANTIBOT] - Bots ${player.name} and ${windw.cachedUsernames[i].name} have been banished`);
                killcount.innerHTML = +killcount.innerHTML + 1;
                delete windw.cachedData[player.cid];
                delete windw.cachedData[windw.cachedUsernames[i].id];
                throw "[ANTIBOT] - Bot banned. Dont add";
              }
            }
            if(!removed){
              windw.cachedUsernames.push({name: player.name,id: player.cid, time: 10, banned: false});
              windw.loggedPlayers[player.cid] = true;
            }
          }
        }
        /**
         * specialBotDetector - Checks other information
         *
         * @param  {String} type The type of action
         * @param  {Object} data The controller
         * @param  {WebSocket} socket The websocket
         */
        function specialBotDetector(type,data,socket){
          switch (type) {
            case "joined":
              if(blacklist(data.name)){
                const packet = createKickPacket(data.cid);
                socket.send(JSON.stringify(packet));
                killcount.innerHTML = +killcount.innerHTML + 1;
                const banned = windw.cachedUsernames.find(o=>{
                  return o.id === data.cid;
                });
                if(banned){
                  banned.banned = true;
                  banned.time = 10;
                }
                throw `[ANTIBOT] - Bot ${data.name} banned; name violates blacklist`;
              }
              // if looks random
              if(windw.specialData.config.looksRandom){
                if(looksRandom(data.name)){
                  const packet = createKickPacket(data.cid);
                  socket.send(JSON.stringify(packet));
                  killcount.innerHTML = +killcount.innerHTML + 1;
                  const banned = windw.cachedUsernames.find(o=>{
                    return o.id === data.cid;
                  });
                  if(banned){
                    banned.banned = true;
                    banned.time = 10;
                  }
                  throw `[ANTIBOT] - Bot ${data.name} banned; name too random.`;
                }
              }
              // if ban format 1 is enabled
              if(windw.specialData.config.banFormat1){
                if(/[a-z0-9]+[^a-z0-9\s][a-z0-9]+/gi.test(data.name)){
                  const packet = createKickPacket(data.cid);
                  socket.send(JSON.stringify(packet));
                  killcount.innerHTML = +killcount.innerHTML + 1;
                  const banned = windw.cachedUsernames.find(o=>{
                    return o.id === data.cid;
                  });
                  if(banned){
                    banned.banned = true;
                    banned.time = 10;
                  }
                  throw `[ANTIBOT] - Bot ${data.name} banned; Name matches format [F][R][L].`;
                }
              }
              // special filters for kahootflood.weebly.com
              if(windw.specialData.config.blockservice1){
                if(data.name.replace(/[ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ]/g,"").length / data.name.length < 0.5){
                  const packet = createKickPacket(data.cid);
                  socket.send(JSON.stringify(packet));
                  killcount.innerHTML = +killcount.innerHTML + 1;
                  const banned = windw.cachedUsernames.find(o=>{
                    return o.id === data.cid;
                  });
                  if(banned){
                    banned.banned = true;
                    banned.time = 10;
                  }
                  throw `[ANTIBOT] - Bot ${data.name} banned; likely from kahootflood.weebly.com.`;
                }
                if((windw.aSetOfEnglishWords || new Set).has(data.name)){
                  // check if being spammed
                  windw.specialData.blockService1Data.add(data);
                  setTimeout(()=>{
                    windw.specialData.blockService1Data.delete(data);
                  },3e3);
                  if(windw.specialData.blockService1Data.size >= 10){
                    // probably being spammed.
                    for(const bot of windw.specialData.blockService1Data){
                      if(bot.banned){
                        continue;
                      }
                      const p = createKickPacket(bot.cid);
                      socket.send(JSON.stringify(p));
                      killcount.innerHTML = +killcount.innerHTML + 1;
                      const banned = windw.cachedUsernames.find(o=>{
                        return o.id === data.cid;
                      });
                      if(banned){
                        banned.banned = true;
                        banned.time = 10;
                      }
                      delete windw.cachedData[bot.cid];
                      delete windw.specialData.kahootCore.game.core.controllers[bot.cid];
                      if(windw.specialData.blockService1Data.size >= 10){
                        windw.specialData.blockService1Data.delete(bot);
                      }else{
                        bot.banned = true;
                      }
                    }
                    throw "[ANTIBOT] - Bots banned. Likely from kahootflood.weebly.com. Don't add.";
                  }
                }
                if(windw.randomName){
                  const names = data.name.match(/([A-Z][a-z]+(?=[A-Z]|[^a-zA-Z]|$))/g);
                  if(names !== null){
                    for(let i = 0; i < names.length; i++){
                      if(windw.randomName.first.has(names[i]) || windw.randomName.middle.has(names[i]) || windw.randomName.last.has(names[i])){
                        windw.specialData.blockService1Data.add(data);
                        setTimeout(()=>{
                          windw.specialData.blockService1Data.delete(data);
                        },3e3);
                        if(windw.specialData.blockService1Data.size >= 10){
                          // probably being spammed.
                          for(const bot of windw.specialData.blockService1Data){
                            if(bot.banned){
                              continue;
                            }
                            const p = createKickPacket(bot.cid);
                            socket.send(JSON.stringify(p));
                            killcount.innerHTML = +killcount.innerHTML + 1;
                            const banned = windw.cachedUsernames.find(o=>{
                              return o.id === data.cid;
                            });
                            if(banned){
                              banned.banned = true;
                              banned.time = 10;
                            }
                            delete windw.cachedData[bot.cid];
                            delete windw.specialData.kahootCore.game.core.controllers[bot.cid];
                            if(windw.specialData.blockService1Data.size >= 10){
                              windw.specialData.blockService1Data.delete(bot);
                            }else{
                              bot.banned = true;
                            }
                          }
                          throw "[ANTIBOT] - Bots banned. Likely from kahootflood.weebly.com. Don't add.";
                        }
                        break;
                      }
                    }
                  }
                }
              }
              if(!windw.isUsingNamerator){
                if(isFakeValid(data.name)){
                  if(Date.now() - windw.specialData.lastFakeLogin < 5000){
                    if(windw.cachedData[windw.specialData.lastFakeUserID]){ // to get the first guy
                      const packet = createKickPacket(windw.specialData.lastFakeUserID);
                      socket.send(JSON.stringify(packet));
                      delete windw.kahootCore.game.core.controllers[windw.specialData.lastFakeUserID];
                      delete windw.cachedData[windw.specialData.lastFakeUserID];
                      const banned = windw.cachedUsernames.find(o=>{
                        return o.id === windw.specialData.lastFakeUserID;
                      });
                      if(banned){
                        banned.banned = true;
                        banned.time = 10;
                      }
                    }
                    const packet = createKickPacket(data.cid);
                    socket.send(JSON.stringify(packet));
                    delete windw.cachedData[data.cid];
                    const banned = windw.cachedUsernames.find(o=>{
                      return o.id === data.cid;
                    });
                    if(banned){
                      banned.banned = true;
                      banned.time = 10;
                    }
                    killcount.innerHTML = +killcount.innerHTML + 1;
                    windw.specialData.lastFakeLogin = Date.now();
                    windw.specialData.lastFakeUserID = data.cid;
                    windw.specialData.lastFakeUserName = data.name;
                    throw `[ANTIBOT] - Banned bot ${data.name}; their name is suspicious, likely a bot.`;
                  }
                  windw.specialData.lastFakeLogin = Date.now();
                  windw.specialData.lastFakeUserID = data.cid;
                  windw.specialData.lastFakeUserName = data.name;
                }
              }
              break;
          }
        }
        /**
         * teamBotDetector - Checks the team of a client
         *
         * @param  {Array} team The team members
         * @param  {String} cid The cid of the controller
         * @param  {WebSocket} socket The websocket
         */
        function teamBotDetector(team,cid,socket){
          if(team.length === 0 || team.indexOf("") !== -1 || team.indexOf("Player 1") !== -1 || team.join("") === "Youjustgotbotted" /* kahootflood.weebly.com */){
            const packet = createKickPacket(cid);
            socket.send(JSON.stringify(packet));
            killcount.innerHTML = +killcount.innerHTML + 1;
            let name = "";
            delete windw.cachedData[cid];
            const banned = windw.cachedUsernames.find(o=>{
              return o.id === cid;
            });
            if(banned){
              banned.banned = true;
              banned.time = 10;
              name = banned.name;
            }
            throw `[ANTIBOT] - Bot ${name} banned; invalid team members.`;
          }
        }
        // Cache Manager Timer
        setInterval(function(){
          for(const i in windw.cachedUsernames){
            if(windw.cachedUsernames[i].time <= 0 && !windw.cachedUsernames[i].banned && !windw.confirmedPlayers.has(windw.cachedUsernames[i].name)){
              windw.confirmedPlayers.add(windw.cachedUsernames[i].name);
              continue;
            }
            if(windw.cachedUsernames[i].time <= -20){
              windw.cachedUsernames.splice(i,1);
              continue;
            }
            windw.cachedUsernames[i].time--;
          }
        },1e3);
        // 2 Factor Auth Timer
        setInterval(()=>{
          for(const i in windw.cachedData){
            windw.cachedData[i].tries = 0;
          }
        },10e3);
        /**
         * sendHandler - Checks the outgoing messages
         *
         * @param  {String} data The message
         * @param  {Object} e The socket
         */
        windw.sendHandler = function(data,e){
          data = JSON.parse(data)[0];
          if(data.data){
            if(!data.data.id){
              return;
            }
            switch (data.data.id) {
              case 2:
                // question start
                windw.specialData.startTime = Date.now();
                windw.specialData.CAPTCHA_IDS = new Set;
                break;
              case 5:
                // restart
                windw.specialData.inLobby = true;
                windw.specialData.lobbyLoadTime = 0;
                break;
              case 10:
                if(data.data.content === "{}"){
                  windw.specialData.inLobby = true;
                  windw.specialData.lobbyLoadTime = 0;
                }
                break;
              case 9:
                // start
                windw.specialData.inLobby = false;
                if(windw.specialData.StartLockElem){
                  clearInterval(windw.specialData.StartLockInterval);
                  windw.specialData.StartLockElem.outerHTML = "";
                  windw.specialData.StartLockElem = null;
                }
                break;
              case 4:
                // question end
                if(windw.specialData.kahootCore.game.navigation.currentGameBlockIndex === 0
                  && windw.specialData.globalQuizData.questions[0].isAntibotQuestion){
                  // boot all who did not answer
                  const controllers = windw.specialData.kahootCore.game.core.controllers,
                    answeredControllers = windw.specialData.CAPTCHA_IDS;
                  setTimeout(()=>{
                    for(const id in controllers){
                      if(controllers[id].isGhost || controllers[id].hasLeft){
                        continue;
                      }
                      if(!answeredControllers.has(id)){
                        const pack = createKickPacket(id);
                        e.webSocket.send(JSON.stringify(pack));
                        killcount.innerHTML = +killcount.innerHTML + 1;
                        console.error(`[ANTIBOT] - Bot ${controllers[id].name} banned. Did not answer the CAPTCHA.`);
                        delete windw.cachedData[data.data.cid];
                        delete controllers[id];
                      }
                    }
                  },250);
                  // Prevent auto-lock from activating from this
                  oldamount = +killcount.innerHTML;
                }
                break;
            }
          }
        };
        let ExtraCheck2 = function(){};
        try{
          if(windw.localStorage.extraCheck2){
            ExtraCheck2 = new Function("return " + windw.localStorage.extraCheck2)();
          }
        }catch(e){/* Likely doesn't exist */}
        let oldamount = 0,
          locked = false;
        setInterval(()=>{
          oldamount = +killcount.innerHTML;
        },20e3);
        /**
         * globalMessageListener - Checks the incoming messages
         *
         * @param  {Object} e The socket
         * @param  {Object} t The incoming message
         */
        window.globalMessageListener = function(e,t){
          try{ExtraCheck2(e,t);}catch(e){console.error("[ANTIBOT] - Execution of PIN-CHECKER Failed: " + e);}
          windw.e = e;
          if(!windw.e.webSocket.oldSend){
            windw.e.webSocket.oldSend = windw.e.webSocket.send;
            windw.e.webSocket.send = function(data){
              windw.sendHandler(data,e);
              windw.e.webSocket.oldSend(data);
            };
          }
          try{pin = windw.specialData.kahootCore.game.core.pin;}catch(e){/* Pin doesn't exist yet */}
          // check DDOS
          if(!locked && pin){
            if(!!(+windw.specialData.config.ddos) && (+killcount.innerHTML - oldamount) > (+windw.specialData.config.ddos/3)){
              locked = true;
              // LOCK THE GAME!
              // 2.12.0 - Repeats every 0.25 seconds until the game is actually locked.
              const lockPacket = [{
                channel: "/service/player",
                clientId,
                data: {
                  gameid: pin,
                  type: "lock"
                },
                ext: {},
                id: ++messageId
              }];
              e.webSocket.send(JSON.stringify(lockPacket));
              windw.specialData.lockInterval = setInterval(()=>{
                lockPacket.id = ++messageId;
                e.webSocket.send(JSON.stringify(lockPacket));
              },250);
              console.log("[ANTIBOT] - Detected bot spam. Locking game for 1 minute.");
              if(windw.specialData.config.counters){
                const ddoscount = document.createElement("div");
                let int = 60;
                ddoscount.innerHTML = `<span class="antibot-count-num">60</span>
              <span class="antibot-count-desc">Until Unlock</span>`;
                counters.append(ddoscount);
                const countTimer = setInterval(()=>{
                  ddoscount.querySelector(".antibot-count-num").innerHTML = --int;
                  if(int <= 0){
                    clearInterval(countTimer);
                    ddoscount.outerHTML = "";
                  }
                },1e3);
              }
              setTimeout(()=>{
                locked = false;
                clearInterval(windw.specialData.lockInterval);
                // UNLOCK GAME
                console.log("[ANTIBOT] - Unlocking game.");
                e.webSocket.send(JSON.stringify([{
                  channel: "/service/player",
                  clientId,
                  data: {
                    gameid: pin,
                    type: "unlock"
                  },
                  ext: {},
                  id: ++messageId
                }]));
              },60e3);
            }
          }
          const data = JSON.parse(t.data)[0];
          messageId = data.id ? data.id : messageId;
          /*if the message is the first message, which contains important clientid data*/
          if(data.id === "1"){
            clientId = data.clientId;
          }
          /*if the message is a player join message*/
          if(data.data && data.data.type === "joined"){
            console.warn("[ANTIBOT] - determining evil...");
            determineEvil(data.data,e.webSocket);
            specialBotDetector(data.data.type,data.data,e.webSocket);
            // Player was not banned.
            windw.cachedData[data.data.cid] = {
              tries: 0,
              loginTime: Date.now()
            };
            if(windw.specialData.inLobby && windw.specialData.config.start_lock !== 0 && windw.specialData.globalFuncs && windw.specialData.globalFuncs.gameOptions.automaticallyProgressGame){
              if(windw.specialData.lobbyLoadTime === 0){
                windw.specialData.lobbyLoadTime = Date.now();
                if(windw.specialData.config.counters){
                  const c = document.createElement("div");
                  c.innerHTML = `<span class="antibot-count-num">${Math.round((windw.specialData.config.start_lock - (Date.now() - windw.specialData.lobbyLoadTime)/1000))}</span>
                <span class="antibot-count-desc">Until Auto-Start</span>`;
                  const i = setInterval(()=>{
                    let t = Math.round((windw.specialData.config.start_lock - (Date.now() - windw.specialData.lobbyLoadTime)/1000));
                    if(t < 0){
                      t = "Please Wait...";
                    }
                    c.querySelector(".antibot-count-num").innerHTML = t;
                  },1e3);
                  counters.append(c);
                  windw.specialData.StartLockElem = c;
                  windw.specialData.StartLockInterval = i;
                }
              }
              if(Date.now() - windw.specialData.lobbyLoadTime > windw.specialData.config.start_lock * 1000){
                // max time passed, just start the darn thing!
                const {controllers} = windw.specialData.globalFuncs;
                if(controllers.filter((controller)=>{
                  return !controller.isGhost && !controller.hasLeft;
                }).length === 0){
                  // The only current player in the lobby.
                  windw.specialData.lobbyLoadTime = Date.now();
                }else{
                  windw.specialData.globalFuncs.startQuiz();
                  if(windw.specialData.StartLockElem){
                    clearInterval(windw.specialData.StartLockInterval);
                    windw.specialData.StartLockElem.outerHTML = "";
                    windw.specialData.StartLockElem = null;
                  }
                }
              }
            }
          }else if(data.data && data.data.id === 45){
            // if player answers
            if(windw.specialData.kahootCore.game.navigation.currentGameBlockIndex === 0
              && windw.specialData.globalQuizData.questions[0].isAntibotQuestion){
              windw.specialData.CAPTCHA_IDS.add(data.data.cid);
              // if incorrect answer
              let choice = -1;
              try{
                choice = JSON.parse(data.data.content).choice;
              }catch(e){/* Likely invalid answer */}
              if(choice !== windw.specialData.globalQuizData.questions[0].AntibotCaptchaCorrectIndex){
                // BAN!
                const packet = createKickPacket(data.data.cid);
                e.webSocket.send(JSON.stringify(packet));
                console.error(`[ANTIBOT] - Bot ${(windw.specialData.kahootCore.game.core.controllers[data.data.cid] || {}).name} banned. Failed the captcha.`);
                delete windw.cachedData[data.data.cid];
                delete windw.specialData.kahootCore.game.core.controllers[data.data.cid];
                killcount.innerHTML = +killcount.innerHTML + 1;
                oldamount = +killcount.innerHTML;
              }
            }
            if(Date.now() - windw.specialData.startTime < 500 && windw.specialData.config.timeout){
              throw "[ANTIBOT] - Answer was too quick!";
            }
            // if player just recently joined (within 1 second)
            if(windw.cachedData[data.data.cid] && Date.now() - windw.cachedData[data.data.cid].loginTime < 1000){
              const packet = createKickPacket(data.data.cid);
              windw.e.webSocket.send(JSON.stringify(packet));
              killcount.innerHTML = +killcount.innerHTML + 1;
              delete windw.cachedData[data.data.cid];
              delete windw.specialData.kahootCore.game.core.controllers[data.data.cid];
              throw `[ANTIBOT] - Bot with id ${data.data.cid} banned. Answered too quickly after joining.`;
            }
          }else if(data.data && data.data.id === 50){
            windw.cachedData[data.data.cid].tries++;
            if(windw.cachedData[data.data.cid].tries > 3){
              const kicker = createKickPacket(data.data.cid);
              e.webSocket.send(JSON.stringify(kicker));
              const name = windw.cachedUsernames.filter(o=>{return o.id === data.data.cid;}).length ? windw.cachedUsernames.filter(o=>{return o.id === data.data.cid;})[0].name : "bot";
              console.warn(`[ANTIBOT] - Bot ${name} banished. Seen spamming 2FA`);
              const banned = windw.cachedUsernames.find(o=>{
                return o.id === windw.specialData.lastFakeUserID;
              });
              if(banned){
                banned.banned = true;
                banned.time = 10;
              }
              delete windw.specialData.kahootCore.game.core.controllers[data.data.cid];
              delete windw.cachedData[data.data.cid];
              killcount.innerHTML = +killcount.innerHTML + 1;
            }
          }else if(data.data && data.data.id === 18) {
            teamBotDetector(JSON.parse(data.data.content),data.data.cid,e.webSocket);
          }else if(data.data && data.data.status === "LOCKED"){
            clearInterval(windw.specialData.lockInterval);
          }
        };
        // remove loaded modules (allows turning off things to be a bit easier)
        delete localStorage.kahootThemeScript;
        delete localStorage.extraCheck;
        delete localStorage.extraCheck2;
      },
      mainScript = new XMLHttpRequest();
    mainScript.open("GET","https://play.kahoot.it/"+script2);
    mainScript.send();
    mainScript.onload = ()=>{
      let sc = mainScript.response;
      // Access the namerator option
      const nr = /=[a-z]\.namerator/gm,
        letter = sc.match(nr)[0].match(/[a-z](?=\.)/g)[0];
      sc = sc.replace(sc.match(nr)[0],`=(()=>{console.log(${letter}.namerator);windw.isUsingNamerator = ${letter}.namerator;return ${letter}.namerator})()`);
      // Access the currentQuestionTimer and change the question time
      const cqtr = /currentQuestionTimer:[a-z]\.payload\.questionTime/gm,
        letter2 = sc.match(cqtr)[0].match(/[a-z](?=\.payload)/g)[0];
      sc = sc.replace(sc.match(cqtr)[0],`currentQuestionTimer:${letter2}.payload.questionTime + (()=>{return (windw.specialData.config.additionalQuestionTime * 1000) || 0})()`);
      // Access the "NoStreakPoints", allowing it to be enabled
      const nsr = /[a-zA-Z]{2}\.NoStreakPoints/gm;
      sc = sc.replace(sc.match(nsr)[0],"windw.specialData.config.streakBonus || 2"); // yes = 1, no = 2
      // Access the StartQuiz function. Also gains direct access to the controllers!
      const sq = /=[a-zA-Z]\.startQuiz/gm,
        letter4 = sc.match(sq)[0].match(/[a-zA-Z](?=\.)/g)[0];
      sc = sc.replace(sc.match(sq)[0],`=(()=>{
        windw.specialData.globalFuncs = ${letter4};
        return ${letter4}.startQuiz})()`);
      // Access the fetched quiz information. Allows the quiz to be modified when the quiz is fetched!
      const fqr = /RETRIEVE_KAHOOT_ERROR",[\w\d]{2}=function\([a-z]\){return Object\([\w$\d]{2}\.[a-z]\)\([\w\d]{2},{response:[a-z]}\)}/gm,
        letter5 = sc.match(fqr)[0].match(/response:[a-z]/g)[0].split(":")[1],
        fqrt = sc.match(fqr)[0];
      sc = sc.replace(fqrt,`RETRIEVE_KAHOOT_ERROR",${fqrt.split("RETRIEVE_KAHOOT_ERROR\",")[1].split("response:")[0]}response:(()=>{
        windw.specialData.globalQuizData = ${letter5};
        windw.specialData.extraQuestionSetup(${letter5});
        return ${letter5};
      })()})}`);
      // Access the core data
      const cr = /[a-z]\.game\.core/m,
        letter6 = sc.match(cr)[0].match(/[a-z](?=\.game)/)[0];
      sc = sc.replace(cr,`(()=>{
        if(typeof windw !== "undefined"){
          windw.specialData.kahootCore = ${letter6};
        }
        return ${letter6}.game.core;
      })()`);
      let changed = originalPage.split("</body>");

      /**
       * ExternalLibrary - Note: This script requires https://raw.githubusercontent.com/theusaf/a-set-of-english-words/master/index.js
       * - This is a script that loads 275k english words into a set. (about 30MB ram?)
       * @see https://github.com/theusaf/a-set-of-english-words
       */
      const ExternalLibrary = new XMLHttpRequest;
      ExternalLibrary.open("GET","https://raw.githubusercontent.com/theusaf/a-set-of-english-words/master/index.js");
      ExternalLibrary.send();
      ExternalLibrary.onload = ExternalLibrary.onerror = function(){
        let ext = "";
        if(ExternalLibrary.readyState === 4 && ExternalLibrary.status === 200){
          ext = ExternalLibrary.responseText;
        }
        const ExternalLibrary2 = new XMLHttpRequest;
        ExternalLibrary2.open("GET","https://raw.githubusercontent.com/theusaf/random-name/master/names.js");
        ExternalLibrary2.send();
        ExternalLibrary2.onload = ExternalLibrary2.onerror = function(){
          let ext2 = "";
          if(ExternalLibrary2.readyState === 4 && ExternalLibrary2.status === 200){
            ext2 = ExternalLibrary2.responseText;
          }
          changed = `${changed[0]}<script>${patchedScript}</script><script>${sc}</script><script>try{(${window.localStorage.kahootThemeScript})();}catch(err){}try{(${window.localStorage.extraCheck})();}catch(err){}window.setupAntibot = ${code.toString()};window.parent.fireLoaded = window.fireLoaded = true;window.setupAntibot();try{${ext};window.parent.aSetOfEnglishWords = window.aSetOfEnglishWords;}catch(e){}try{${ext2};window.parent.randomName = window.randomName;}catch(e){}</script></body>${changed[1]}`;
          console.log("[ANTIBOT] - loaded");
          document.open();
          document.write("<style>body{margin:0;}iframe{border:0;width:100%;height:100%;}</style><iframe src=\"about:blank\"></iframe>");
          document.close();
          window.stop();
          const doc = document.querySelector("iframe");
          doc.contentDocument.write(changed);
          document.title = doc.contentDocument.title;
        };
      };
    };
  };
};
