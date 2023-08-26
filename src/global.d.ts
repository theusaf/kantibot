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

  interface KSocketEvent extends Record<string, any> {
    data?: {
      id?: number;
      type?: string;
    };
  }

  interface KWebsocketInstance extends Record<string, CallableFunction> {
    batch: (callback: CallableFunction) => void;
    publish: (topic: string, payload: any) => void;
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

  interface KAntibotData {
    settings: Record<string, any>;
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
      startLockElement: HTMLElement;
      startLockInterval: number;
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
    kantibotAdditionalScripts: string[];
    kantibotAddHook: (hook: KAntibotHook) => void;
  }
}

export {};
