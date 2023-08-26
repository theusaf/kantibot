// ==UserScript==
// @name           KAntibot4
// @name:ja        Kーアンチボット
// @namespace      http://tampermonkey.net/
// @homepage       https://theusaf.org
// @version        4.0.0
// @icon           https://cdn.discordapp.com/icons/641133408205930506/31c023710d468520708d6defb32a89bc.png
// @description    Remove all bots from a kahoot game.
// @description:es eliminar todos los bots de un Kahoot! juego.
// @description:ja Kahootゲームから全てのボットを出して。
// @author         theusaf
// @copyright      2018-2023, Daniel Lau (https://github.com/theusaf/kahoot-antibot)
// @supportURL     https://discord.gg/pPdvXU6
// @match          *://play.kahoot.it/*
// @exclude        *://play.kahoot.it/v2/assets/*
// @grant          none
// @inject-into    page
// @run-at         document-start
// @license        MIT
// ==/UserScript==

/*

MIT LICENSE TEXT

Copyright 2018-2023 theusaf

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * Special thanks to
 * - epicmines33
 * - stevehainesfib
 *
 * for helping with contribution and testing of this project
 */

const KANTIBOT_VERSION = GM_info.script.version,
  kantibotData: KAntibotData = {
    settings: {},
    runtimeData: {
      captchaIds: new Set(),
      controllerData: {},
      controllerNamePatternData: {},
      englishWordDetectionData: new Set(),
      killCount: 0,
      lastFakeLoginTime: 0,
      lastFakeUserID: null,
      lobbyLoadTime: 0,
      lockingGame: false,
      oldKillCount: 0,
      unverifiedControllerNames: [],
      verifiedControllerNames: new Set(),
      questionStartTime: 0,
      startLockElement: null,
      startLockInterval: null,
    },
    methods: {},
    kahootInternals: {
      methods: {},
      quizData: {},
      debugData: {},
    },
  } as unknown as KAntibotData;

function log(...args: any[]) {
  if (args.every((arg) => typeof arg === "string")) {
    console.log(`[KANTIBOT] - ${args.join(" ")}`);
  } else {
    console.log("[KANTIBOT]", ...args);
  }
}

function createObjectHook<E extends Object = Object>(
  target: E,
  prop: string,
  condition: (target: E, value: any) => boolean,
  callback: (target: E, value: any) => boolean
): void {
  (function recursiveHook() {
    Object.defineProperty(target, prop, {
      set(value) {
        delete target[prop as keyof E];
        this[prop] = value;
        if (!(condition(this, value) && callback(this, value))) {
          recursiveHook();
        }
      },
      configurable: true,
    });
  })();
}

const hooks: Record<string, Set<KAntibotHook>> = {};

function createMultiHook(prop: string) {
  createObjectHook(
    Object.prototype,
    prop,
    () => true,
    (target, value) => {
      const hookSet = hooks[prop];
      for (const hook of hookSet) {
        if (hook.condition(target, value)) {
          if (hook.callback(target, value)) {
            hookSet.delete(hook);
          }
        }
      }
      return false;
    }
  );
}

function addHook(hook: KAntibotHook) {
  if (hook.target) {
    createObjectHook(hook.target, hook.prop, hook.condition, hook.callback);
  } else {
    if (!hooks[hook.prop]) {
      hooks[hook.prop] = new Set();
      createMultiHook(hook.prop);
    }
    hooks[hook.prop].add(hook);
  }
}

// Main logic
const METHODS = {
  capitalize(text: string) {
    text = text.toLowerCase();
    return text[0].toUpperCase() + text.slice(1);
  },
  similarity(s1: string, s2: string): number | null {
    // remove numbers from name if name is not only a number
    if (isNaN(+s1) && typeof s1 !== "object" && !METHODS.isUsingNamerator()) {
      s1 = s1.replace(/[0-9]/gm, "");
    }
    if (isNaN(+s2) && typeof s2 !== "object" && !METHODS.isUsingNamerator()) {
      s2 = s2.replace(/[0-9]/gm, "");
    }
    if (!s2) {
      return 0;
    }
    // if is a number of the same length
    if (s1) {
      if (!isNaN(+s2) && !isNaN(+s1) && s1.length === s2.length) {
        return 1;
      }
    }
    // apply namerator rules
    if (METHODS.isUsingNamerator()) {
      if (!METHODS.isValidNameratorName(s2)) {
        return -1;
      } else {
        // safe name
        return 0;
      }
    }
    if (!s1) {
      return null;
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
    return (
      (longerLength - METHODS.editDistance(longer, shorter)) / longerLength
    );
  },
  isValidNameratorName(name: string): boolean {
    const firstNames = [
        "Adorable",
        "Agent",
        "Agile",
        "Amazing",
        "Amazon",
        "Amiable",
        "Amusing",
        "Aquatic",
        "Arctic",
        "Awesome",
        "Balanced",
        "Bold",
        "Brave",
        "Bright",
        "Bronze",
        "Captain",
        "Caring",
        "Champion",
        "Charming",
        "Cheerful",
        "Classy",
        "Clever",
        "Creative",
        "Cute",
        "Dandy",
        "Daring",
        "Dazzled",
        "Decisive",
        "Diligent",
        "Diplomat",
        "Doctor",
        "Dynamic",
        "Eager",
        "Elated",
        "Epic",
        "Excited",
        "Expert",
        "Fabulous",
        "Fast",
        "Fearless",
        "Flying",
        "Focused",
        "Friendly",
        "Funny",
        "Fuzzy",
        "Genius",
        "Gentle",
        "Giving",
        "Glad",
        "Glowing",
        "Golden",
        "Great",
        "Groovy",
        "Happy",
        "Helpful",
        "Hero",
        "Honest",
        "Inspired",
        "Jolly",
        "Joyful",
        "Kind",
        "Knowing",
        "Legend",
        "Lively",
        "Lovely",
        "Lucky",
        "Magic",
        "Majestic",
        "Melodic",
        "Mighty",
        "Mountain",
        "Mystery",
        "Nimble",
        "Noble",
        "Polite",
        "Power",
        "Prairie",
        "Proud",
        "Purple",
        "Quick",
        "Radiant",
        "Rapid",
        "Rational",
        "Rockstar",
        "Rocky",
        "Royal",
        "Shining",
        "Silly",
        "Silver",
        "Smart",
        "Smiling",
        "Smooth",
        "Snowy",
        "Soaring",
        "Social",
        "Space",
        "Speedy",
        "Stellar",
        "Sturdy",
        "Super",
        "Swift",
        "Tropical",
        "Winged",
        "Wise",
        "Witty",
        "Wonder",
        "Zany",
      ],
      lastNames = [
        "Alpaca",
        "Ant",
        "Badger",
        "Bat",
        "Bear",
        "Bee",
        "Bison",
        "Boa",
        "Bobcat",
        "Buffalo",
        "Bunny",
        "Camel",
        "Cat",
        "Cheetah",
        "Chicken",
        "Condor",
        "Crab",
        "Crane",
        "Deer",
        "Dingo",
        "Dog",
        "Dolphin",
        "Dove",
        "Dragon",
        "Duck",
        "Eagle",
        "Echidna",
        "Egret",
        "Elephant",
        "Elk",
        "Emu",
        "Falcon",
        "Ferret",
        "Finch",
        "Fox",
        "Frog",
        "Gator",
        "Gazelle",
        "Gecko",
        "Giraffe",
        "Glider",
        "Gnu",
        "Goat",
        "Goose",
        "Gorilla",
        "Griffin",
        "Hamster",
        "Hare",
        "Hawk",
        "Hen",
        "Horse",
        "Ibex",
        "Iguana",
        "Impala",
        "Jaguar",
        "Kitten",
        "Koala",
        "Lark",
        "Lemming",
        "Lemur",
        "Leopard",
        "Lion",
        "Lizard",
        "Llama",
        "Lobster",
        "Macaw",
        "Meerkat",
        "Monkey",
        "Mouse",
        "Newt",
        "Octopus",
        "Oryx",
        "Ostrich",
        "Otter",
        "Owl",
        "Panda",
        "Panther",
        "Pelican",
        "Penguin",
        "Pigeon",
        "Piranha",
        "Pony",
        "Possum",
        "Puffin",
        "Quail",
        "Rabbit",
        "Raccoon",
        "Raven",
        "Rhino",
        "Rooster",
        "Sable",
        "Seal",
        "SeaLion",
        "Shark",
        "Sloth",
        "Snail",
        "Sphinx",
        "Squid",
        "Stork",
        "Swan",
        "Tiger",
        "Turtle",
        "Unicorn",
        "Urchin",
        "Wallaby",
        "Wildcat",
        "Wolf",
        "Wombat",
        "Yak",
        "Yeti",
        "Zebra",
      ],
      nameMatch = name.match(/[A-Z][a-z]+(?=[A-Z])/);
    if (nameMatch === null || !firstNames.includes(nameMatch[0])) {
      return false;
    }
    const lastName = name.replace(nameMatch[0], "");
    if (!lastNames.includes(lastName)) {
      return false;
    }
    return true;
  },
  isFakeValid(name: string): boolean {
    if (!METHODS.isUsingNamerator() && METHODS.isValidNameratorName(name)) {
      return true;
    }
    if (METHODS.getSetting("blocknum") && /\d/.test(name)) {
      return true;
    }
    if (METHODS.getSetting("forceascii") && /[^\d\s\w_-]/.test(name)) {
      return true;
    }
    return /(^([A-Z][a-z]+){2,3}\d{1,2}$)|(^([A-Z][^A-Z\n]+?)+?(\d[a-z]+\d*?)$)|(^[a-zA-Z]+\d{4,}$)/.test(
      name
    );
  },
  editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }
    return costs[s2.length];
  },
  isUsingNamerator(): boolean {
    return METHODS.getKahootSetting<boolean>("namerator");
  },
  getPatterns(text: string): string {
    const isLetter = (char: string) => {
        return /\p{L}/u.test(char);
      },
      isUppercaseLetter = (char: string) => {
        return char.toUpperCase() === char;
      },
      isNumber = (char: string) => {
        return /\p{N}/u.test(char);
      };
    let output = "",
      mode = null,
      count = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let type = null;
      if (isLetter(char)) {
        if (isUppercaseLetter(char)) {
          type = "C";
        } else {
          type = "L";
        }
      } else if (isNumber(char)) {
        type = "D";
      } else {
        // special character
        type = "U";
      }
      if (type !== mode) {
        if (mode !== null) {
          output += Math.floor(count / 3);
        }
        count = 0;
        mode = type;
        output += type;
      } else {
        count++;
        if (i === text.length - 1) {
          output += Math.floor(count / 3);
        }
      }
    }
    return output;
  },
  blacklist(name: string): boolean {
    const list = METHODS.getSetting("wordblock", []);
    for (let i = 0; i < list.length; i++) {
      if (list[i] === "") {
        continue;
      }
      if (name.toLowerCase().indexOf(list[i].toLowerCase()) !== -1) {
        return true;
      }
    }
    return false;
  },
  getKahootSetting<T>(id: string): T {
    return kantibotData.kahootInternals.settings[id];
  },
  // TODO: Revise when we change settings.
  getSetting(id: string, fallback: any = null) {
    if (typeof kantibotData.settings[id] !== "undefined") {
      return kantibotData.settings[id];
    }
    const elem = document.querySelector<HTMLInputElement>(
      `#antibot.config.${id}`
    ) as HTMLInputElement;
    if (elem.value === "") {
      if (elem.nodeName === "TEXTAREA") {
        return fallback ?? [];
      }
      if (elem.type === "checkbox") {
        return fallback ?? false;
      }
      if (elem.type === "number") {
        return fallback ?? 0;
      }
      return fallback ?? "";
    } else {
      return elem.type === "checkbox"
        ? elem.checked
        : elem.nodeName === "TEXTAREA"
        ? elem.value.split("\n")
        : elem.type === "number"
        ? +elem.value
        : elem.value;
    }
  },
  setSetting(id: string, value: any) {
    const elem = document.querySelector<HTMLInputElement>(
      `#antibot.config.${id}`
    ) as HTMLInputElement;
    if (elem.type === "checkbox") {
      value = !!value;
      elem.checked = value;
    } else if (Array.isArray(value)) {
      elem.value = value.join("\n");
    } else if (elem.type === "number") {
      value = +value;
      elem.value = value;
    } else {
      value = `${value}`;
      elem.value = value;
    }
    // in case of certain things
    if (elem.nodeName === "TEXTAREA" && typeof value === "string") {
      value = value.split("\n");
    }
    const localConfig = JSON.parse(window.localStorage.antibotConfig || "{}");
    localConfig[id] = value;
    window.localStorage.antibotConfig = JSON.stringify(localConfig);
    kantibotData.settings[id] = value;
  },
  extraQuestionSetup(quiz: KQuiz): void {
    if (METHODS.getSetting("counterCheats")) {
      quiz.questions.push({
        question:
          "[ANTIBOT] - This poll is for countering Kahoot cheating sites.",
        time: 5000,
        type: "survey",
        isAntibotQuestion: true,
        choices: [{ answer: "OK", correct: true }],
      });
    }
    if (METHODS.getSetting("enableCAPTCHA")) {
      const answers = ["red", "blue", "yellow", "green"],
        images = [
          "361bdde0-48cd-4a92-ae9f-486263ba8529", // red
          "9237bdd2-f281-4f04-b4e5-255e9055a194", // blue
          "d25c9d13-4147-4056-a722-e2a13fbb4af9", // yellow
          "2aca62f2-ead5-4197-9c63-34da0400703a", // green
        ],
        imageIndex = Math.floor(Math.random() * answers.length);
      quiz.questions.splice(0, 0, {
        question: `[ANTIBOT] - CAPTCHA: Please select ${answers[imageIndex]}`,
        time: 30000,
        type: "quiz",
        isAntibotQuestion: true,
        AntibotCaptchaCorrectIndex: imageIndex,
        choices: [
          { answer: "OK" },
          { answer: "OK" },
          { answer: "OK" },
          { answer: "OK" },
        ],
        image: "https://media.kahoot.it/" + images[imageIndex],
        imageMetadata: {
          width: 512,
          height: 512,
          id: images[imageIndex],
          contentType: "image/png",
          resources: "",
        },
        points: false,
      });
    }
  },
  kahootAlert(notice: string): void {
    // See `showNotificationBar` in kahoot code
    // Currently unaccessible?
    alert(notice);
  },
  kickController(id: string, reason = "", fallbackController: any): void {
    const controller = METHODS.getControllerById(id) ?? fallbackController,
      name =
        (controller?.name?.length ?? 0) > 30
          ? controller?.name?.substring(0, 30) + "..."
          : controller?.name,
      banishedCachedData =
        kantibotData.runtimeData.unverifiedControllerNames.find(
          (controller) => {
            return controller.cid === id;
          }
        );
    log(`Kicked ${name || id}${reason ? ` - ${reason}` : ""}`);
    METHODS.sendData("/service/player", {
      cid: `${id}`,
      content: JSON.stringify({
        kickCode: 1,
        quizType: "quiz",
      }),
      gameid: METHODS.getPin(),
      host: "play.kahoot.it",
      id: 10,
      type: "message",
    });
    kantibotData.runtimeData.killCount++;
    if (banishedCachedData) {
      banishedCachedData.banned = true;
      banishedCachedData.time = 10;
    }
    // Removed to reduce the amount of memory consumed.
    // if (controller) {antibotData.kahootInternals.kahootCore.game.core.kickedControllers.push(controller);}
    delete METHODS.getControllers()[id];
    delete kantibotData.runtimeData.controllerData[id];
  },

  isEventJoinEvent(event: KSocketEvent): boolean {
    return event.data?.type === "joined";
  },

  isEventAnswerEvent(event: KSocketEvent): boolean {
    return event.data?.id === 45;
  },

  isEventTwoFactorEvent(event: KSocketEvent): boolean {
    return event.data?.id === 50;
  },

  isEventTeamJoinEvent(event: KSocketEvent): boolean {
    return event.data?.id === 18;
  },

  batchData(callback: CallableFunction): void {
    return kantibotData.kahootInternals.services.network.websocketInstance.batch(
      callback
    );
  },

  lockGame(): void {
    kantibotData.runtimeData.lockingGame = true;
    METHODS.sendData("/service/player", {
      gameid: METHODS.getPin(),
      type: "lock",
    });
  },

  unlockGame(): void {
    METHODS.sendData("/service/player", {
      gameid: METHODS.getPin(),
      type: "unlock",
    });
  },

  isLocked(): boolean {
    return kantibotData.kahootInternals.gameCore.isLocked;
  },

  getCurrentQuestionIndex(): number {
    return kantibotData.kahootInternals.services.game.navigation
      .currentGameBlockIndex;
  },

  getQuizData(): KQuiz {
    return kantibotData.kahootInternals.quizData;
  },

  getPin(): string {
    return kantibotData.kahootInternals.gameCore.pin;
  },

  getControllerById(id: string): KController {
    return METHODS.getControllers()[id];
  },

  getControllers(): Record<string, KController> {
    return kantibotData.kahootInternals.gameCore.controllers;
  },

  sendData(channel: string, data: any): void {
    return kantibotData.kahootInternals.services.network.websocketInstance.publish(
      channel,
      data
    );
  },
};
kantibotData.methods = METHODS;

const localConfig = JSON.parse(
  window.localStorage.kantibotConfig ??
    window.localStorage.antibotConfig ??
    "{}"
);
for (const setting in localConfig) {
  try {
    const current = METHODS.getSetting(setting);
    METHODS.setSetting(setting, localConfig[setting] ?? current);
  } catch {
    /* ignored */
  }
}

// Apply hooks

const KANTIBOT_HOOKS: Record<string, KAntibotHook> = {
  startQuizFunction: {
    prop: "startQuiz",
    condition: (target, value) =>
      typeof value === "function" && target.isGameReady,
    callback: (target, value) => {
      kantibotData.kahootInternals.gameDetails = target;
      kantibotData.kahootInternals.methods.startQuiz = value;
      kantibotData.kahootInternals.userData = target.currentUser;
      kantibotData.kahootInternals.settings = target.gameOptions;
      return true;
    },
  },
  gameCore: {
    prop: "core",
    condition: (_, value) => !!value?.quiz,
    callback: (_, value) => {
      kantibotData.kahootInternals.gameCore = value;
      kantibotData.kahootInternals.quizData = value.quiz;
      return false;
    },
  },
  gameInformation: {
    prop: "game",
    condition: (target, value) =>
      typeof value === "object" &&
      typeof target.features === "object" &&
      typeof target.router === "object",
    callback: (target) => {
      kantibotData.kahootInternals.services = target;
      return false;
    },
  },
  answersData: {
    prop: "answers",
    condition: (_, value) => !!value.answerMaps,
    callback: (_, value) => {
      kantibotData.kahootInternals.anwerDetails = value;
      return false;
    },
  },
  socket: {
    prop: "onMessage",
    condition: (target, value) =>
      typeof value === "function" &&
      typeof target.reset === "function" &&
      typeof target.onOpen === "function",
    callback: (target, value) => {
      target.onMessage = function (socket: WebSocket, message: MessageEvent) {
        kantibotData.kahootInternals.socket = socket;
        value.call(target, socket, message);
      };
      return true;
    },
  },
  twoFactor: {
    prop: "twoFactorAuth",
    condition: (_, value) => typeof value === "function",
    callback: (target, value) => {
      kantibotData.kahootInternals.gameConstructors = target;
      target.twoFactorAuth = (input: any, payload: KPayload) => {
        const result = value.call(target, input, payload);
        if (payload.type === "player/two-factor-auth/RESET") {
          result.counter = 9; // TODO: Make this configurable
        }
        return result;
      };
      return true;
    },
  },
  questionTime: {
    prop: "core",
    condition: (_, value) => typeof value === "function",
    callback: (target, value) => {
      target.core = function (input: any, payload: KPayload) {
        const result = value.call(target, input, payload);
        if (payload.type === "player/game/SET_QUESTION_TIMER") {
          console.log("SET QUESTION TIMER", result);
          // modify `currentQuestionTimer` (and `startTime`?) to make the question time longer
        }
        return result;
      };
      return true;
    },
  },
  questionTimeAnswerFix: {
    prop: "answers",
    condition: (_, value) => typeof value === "function",
    callback: (target, value) => {
      target.answers = function (input: any, payload: KPayload) {
        const result = value.call(target, input, payload);
        if (payload.type === "features/game-blocks/SET_SCORES") {
          console.log("SETTING SCORES", result);
          // modify `correct` to fix for the question time
        }
        return result;
      };
      return true;
    },
  },
  settings: {
    prop: "children",
    condition: (target, value) =>
      Array.isArray(value) &&
      value.length > 8 &&
      typeof target.isOpen === "boolean",
    callback: (target) => {
      // TODO: Inject!!!
      return false;
    },
  },
  react: {
    prop: "createElement",
    condition: (_, value) => typeof value === "function",
    callback: (target) => {
      window.React = target;
      return true;
    },
  },
};

for (const hook of Object.values(KANTIBOT_HOOKS)) {
  if (hook.target) {
    createObjectHook(hook.target, hook.prop, hook.condition, hook.callback);
  } else {
    addHook(hook);
  }
}

// Exposing KAntibot information to the window
window.kantibotData = kantibotData;
window.kantibotAdditionalScripts = [];
window.kantibotEnabled = true;
window.kantibotAddHook = addHook;

/**
 * External Libraries
 * Note: This script requires https://raw.githubusercontent.com/theusaf/a-set-of-english-words/master/index.js
 * - This is a script that loads 275k english words into a set. (about 30MB ram?)
 * @see https://github.com/theusaf/a-set-of-english-words
 *
 * Also, it requires https://raw.githubusercontent.com/theusaf/random-name/master/names.js
 * - Loads a bunch of names into sets.
 * @see https://raw.githubusercontent.com/theusaf/random-name
 *
 * If these get removed or fail to load, this should not break the service, but will cause certain features to not work
 */
const requiredAssets = [
  "https://cdn.jsdelivr.net/gh/theusaf/a-set-of-english-words@c1ab78ece625138cae66fc32feb18f293ff49001/index.js",
  "https://cdn.jsdelivr.net/gh/theusaf/random-name@3047117dc088740f018cb9a3ec66b5ef20ea52bd/names.js",
];

for (const asset of requiredAssets) {
  import(asset).catch(() => {
    console.warn(`Failed to load ${asset}`);
  });
}
