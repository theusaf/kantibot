declare global {

  interface KAntibotHook {
    target?: any;
    prop: string;
    condition: (target: any, value: any) => boolean;
    callback: (target: any, value: any) => boolean;
  }

  interface KAntibotData {
    settings: {};
    kahootInternals: {
      globalFuncs: Record<string, CallableFunction>;
      globalQuizData: {};
    };
  }

  interface Window {
    aSetOfEnglishWords: Set<string>;
    antibotData: KAntibotData;
    kantibotEnabled: boolean;
    antibotAdditionalScripts: string[];
  }

}

export {};
