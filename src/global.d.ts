declare global {
  interface KPayload {
    type: string;
    payload: any;
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
    onMessage: (socket: KWebSocket, event: MessageEvent) => void;
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

  interface KQuestion {
    choices: KChoice[];
    layout?: string;
    points?: boolean;
    pointsMultiplier?: number;
    image?: string;
    questionFormat?: number;
    media?: any[];
    imageMetadata?: {
      width: number;
      height: number;
      id?: string;
      contentType?: string;
      resources?: string;
    };
    question: string;
    time: number;
    type: string;
    isKAntibotQuestion?: boolean;
    kantibotQuestionType?: "captcha" | "counterCheats";
    kantibotCaptchaCorrectIndex?: number;
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

  interface KSettings {
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
    isGhost?: boolean;
    hasLeft?: boolean;
  }

  interface KGameCore extends Record<string, unknown> {
    controllers: Record<string, KController>;
    currentQuestionTimer: number;
    gameMode: string;
    isLocked: boolean;
    kickedControllers: unknown[];
    pin: string;
    playList: string[];
    quiz: KQuiz;
    startTime: number;
    selectedGameMode: string;
    ghostModeType: string;
    playAgainMode: string;
    gameBlockTalkTimer: number;
    currentQuestionIntroTime: number;
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
    settingsTypes: Record<keyof KAntibotSettings, string>;
    settings: KAntibotSettings;
    methods: Record<string, CallableFunction>;
    runtimeData: {
      captchaIds: Set<string>;
      controllerData: Record<
        string,
        {
          loginTime: number;
          twoFactorAttempts: number;
        }
      >;
      controllerNamePatternData: Record<string, any>;
      englishWordDetectionData: Set<any>;
      killCount: number;
      lastFakeLoginTime: number;
      lastFakeUserID: string;
      lobbyLoadTime: number;
      lockingGame: boolean;
      oldKillCount: number;
      unverifiedControllerNames: {
        time: number;
        name: string;
        banned: boolean;
        cid: string;
      }[];
      verifiedControllerNames: Set<string>;
      questionStartTime: number;
      startLockElement: HTMLElement | null;
      startLockInterval: number;
      countersElement: HTMLDivElement;
      currentQuestionActualTime: number;
      kantibotModifiedQuiz: KQuiz;
    };
    kahootInternals: {
      answerDetails: unknown;
      debugData: Record<string, unknown>;
      gameCore: KGameCore;
      gameDetails: unknown;
      gameConstructors: unknown;
      methods: Record<string, CallableFunction>;
      quizData: KQuiz;
      userData: unknown;
      services: KServices;
      settings: KSettings;
      socket: WebSocket;
      socketHandler: KWebSocket;
      apparentCurrentQuestion: KQuestion;
      apparentCurrentQuestionIndex: number;
    };
  }

  interface Window {
    antibotAdditionalScripts: CallableFunction[];
    aSetOfEnglishWords?: Set<string>;
    randomName?: {
      first: Set<string>;
      middle: Set<string>;
      last: Set<string>;
    };
    kantibotData: KAntibotData;
    kantibotEnabled: boolean;
    kantibotVersion: string;
    kantibotAddHook: (hook: KAntibotHook) => void;
  }
}

export {};
