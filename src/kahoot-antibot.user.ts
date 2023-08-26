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
    kahootInternals: {
      methods: {},
      quizData: {},
      debugData: {},
    },
  } as KAntibotData;

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
      return true;
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
