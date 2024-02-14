export type Default_APP_Stage = 'PROD' | 'INT' | 'TEST' | 'LA Beta';
export interface StageConfig {
    key: string;
    apiEndpoint: string;
    authBearerKey: string;
}
export declare const DEFAULT_STAGE: StageConfig;
