export type APP_Stage = 'PROD' | 'INT' | 'TEST' | 'LA Beta'

export interface StageConfig {
    key: APP_Stage
    apiEndpoint: string
    authBearerKey: string
}

export const DEFAULT_STAGE: StageConfig = {
    key: 'PROD',
    apiEndpoint: 'https://api.opentransportdata.swiss/ojp2020',
    authBearerKey: '57c5dbbbf1fe4d00010000186ba6e4bb4be543a9b4e40d2d6495592b',
}
