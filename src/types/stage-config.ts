export type APP_Stage = 'PROD' | 'INT' | 'TEST' | 'LA Beta'

export interface StageConfig {
    key: APP_Stage
    apiEndpoint: string
    authBearerKey: string
}

