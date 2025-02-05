export type Default_APP_Stage = 'PROD' | 'INT' | 'TEST' | 'LA Beta'

export interface StageConfig {
    key: string
    apiEndpoint: string
    authBearerKey: string
}

const defaultStageKey: Default_APP_Stage = 'PROD'

export const DEFAULT_STAGE: StageConfig = {
    key: defaultStageKey,
    apiEndpoint: 'https://api.opentransportdata.swiss/ojp2020',
    authBearerKey: '57c5dbbbf1fe4d00010000186ba6e4bb4be543a9b4e40d2d6495592b',
}

export const FARES_API_DEFAULT_STAGE: StageConfig = {
    key: defaultStageKey,
    apiEndpoint: 'https://api.opentransportdata.swiss/ojpfare',
    authBearerKey: 'OJPFare_Key',
}
