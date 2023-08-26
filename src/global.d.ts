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
      services: any;
      gameCore: any;
      gameDetails: any;
      gameConstructors: any;
      methods: Record<string, CallableFunction>;
      quizData: any;
      userData: any;
      settings: any;
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
