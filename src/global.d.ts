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
    settings: {};
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
