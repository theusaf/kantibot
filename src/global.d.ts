declare global {
  interface KPayload {
    type: string;
    payload: Object;
  }

  interface KAntibotHook {
    target?: any;
    prop: string;
    condition: (target: any, value: any) => boolean;
    callback: (target: any, value: any) => boolean;
  }

  interface KSocketEventData extends Record<string, any> {
    id?: number;
    type?: string;
    content?: string;
  }

  interface KSocketEvent extends Record<string, any> {
    data?: KSocketEventData;
  }

  interface KWebsocketInstance extends Record<string, CallableFunction> {
    batch: (callback: CallableFunction) => void;
    publish: (topic: string, payload: any) => void;
  }

  interface KAntibotWebSocket extends WebSocket {
    oldSend?: (data: any) => void;
  }

  interface KWebSocket {
    webSocket: KAntibotWebSocket;
  }

  interface KServices {
    network: {
      transport: string;
      websocketInstance: KWebsocketInstance;
      amplitudeRecoveryTimes: unknown[];
    };
    game: {
      core: KGameCore;
      navigation: {
        currentGameBlockIndex: number;
        currentQuizIndex: number;
        isMenuOpen: boolean;
        page: string;
        state: string;
      };
    };
  }

  interface KChoice extends Record<string, any> {
    answer: string;
    correct?: boolean;
  }

  interface KQuestion extends Record<string, any> {
    choices: KChoice[];
    layout?: string;
    points?: boolean;
    pointsMultiplier?: number;
    question: string;
    time: number;
    type: string;
  }

  interface KQuiz extends Record<string, any> {
    creator: string;
    creator_username: string;
    questions: KQuestion[];
    quizType: string;
    slug: string;
    type: string;
    uuid: string;
  }

  interface KSettings extends Record<string, any> {
    automaticallyProgressGame: boolean;
    avatars: boolean;
    gameBlockTalk: boolean;
    loginRequired: boolean;
    namerator: boolean;
    participantId: boolean;
    playerBitmoji: boolean;
    provideControllerExtensiveData: boolean;
    randomAnswers: boolean;
    randomQuestions: boolean;
    smartPractice: boolean;
    twoFactorAuth: boolean;
  }

  interface KController extends Record<string, any> {
    name?: string;
    cid?: string;
  }

  interface KGameCore extends Record<string, any> {
    controllers: Record<string, KController>;
    currentQuestionTimer: number;
    gameMode: string;
    isLocked: boolean;
    kickedControllers: any[];
    liveGameId: string;
    pin: string;
    playList: string[];
    quiz: KQuiz;
    startTime: number;
  }

  interface KAntibotSettings {
    timeout: boolean;
    looksRandom: boolean;
    blockformat1: boolean;
    blockservice1: boolean;
    blocknum: boolean;
    forceascii: boolean;
    patterns: boolean;
    teamtimeout: number;
    twoFactorTime: number;
    percent: number;
    wordblock: string;
    ddos: number;
    start_lock: number;
    counters: boolean;
    counterCheats: boolean;
    enableCAPTCHA: boolean;
    reduceFalsePositives: boolean;
  }

  interface KAntibotData {
    settings: KAntibotSettings;
    methods: {};
    runtimeData: {
      captchaIds: Set<string>;
      controllerData: Record<string, any>;
      controllerNamePatternData: Record<string, any>;
      englishWordDetectionData: Set<any>;
      killCount: number;
      lastFakeLoginTime: number;
      lastFakeUserID: string;
      lobbyLoadTime: number;
      lockingGame: boolean;
      oldKillCount: number;
      unverifiedControllerNames: any[];
      verifiedControllerNames: Set<string>;
      questionStartTime: number;
      startLockElement: HTMLElement | null;
      startLockInterval: number;
      countersElement: HTMLDivElement;
    };
    kahootInternals: {
      anwerDetails: any;
      debugData: Record<string, any>;
      gameCore: KGameCore;
      gameDetails: any;
      gameConstructors: any;
      methods: Record<string, CallableFunction>;
      quizData: KQuiz;
      userData: any;
      services: KServices;
      settings: KSettings;
      socket: WebSocket;
    };
  }

  interface Window {
    aSetOfEnglishWords?: Set<string>;
    randomName?: {
      first: Set<string>;
      middle: Set<string>;
      last: Set<string>;
    };
    kantibotData: KAntibotData;
    kantibotEnabled: boolean;
    kantibotVersion: string;
    kantibotAdditionalScripts: string[];
    kantibotAddHook: (hook: KAntibotHook) => void;
  }
}

export {};
