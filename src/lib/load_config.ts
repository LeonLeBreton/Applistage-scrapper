import * as toml from '@iarna/toml';
import * as fs from 'fs';

/**
 * Type contenant la configuration pour AppliStage
 */
export type ApplistageConfig = {
    BASE_URL: string;
    USERNAME: string;
    PASSWORD: string;
    INTERVAL: number;
}

/**
 * Type contenant la configuration pour le webhook
 */
export type WebhookConfig = {
    CONFIG_NAME: string;
    URL: string;
    METHOD: string;
    BODY: string;
    TYPE: string;
    HEADERS: Record<string, string>;
    USERNAME: string | undefined;
    PASSWORD: string | undefined;
    TIMEOUT: number;
}

type AnyJson = {
    [key: string]: any;
}

/**
 * Type contenant la configuration générale
 */
export type Config = {
    applistage: ApplistageConfig;
    webhook: WebhookConfig[];
}

function getAllWebhookConfig(config: AnyJson): WebhookConfig[] {
    const webHookConf : WebhookConfig[] = [];
    for (const key in config) {
        const newWebhookConfig = {
            CONFIG_NAME: key,
            URL: config[key].URL,
            METHOD: config[key].METHOD,
            BODY: config[key].BODY,
            TYPE: config[key].TYPE,
            HEADERS: config[key].HEADERS,
            USERNAME: config[key].USERNAME,
            PASSWORD: config[key].PASSWORD,
            TIMEOUT: config[key].TIMEOUT
        };
        webHookConf.push(newWebhookConfig);
    }
    return webHookConf;
}

/**
 * Charge la configuration depuis un fichier TOML
 * @param path : Chemin du fichier de configuration
 * @returns : La configuration
 */
export function loadConfig(path : string): Config {
    const fileContent = fs.readFileSync(path, 'utf-8');
    const parsedConfig: AnyJson = toml.parse(fileContent);

    const config: Config = {
        applistage: {
            BASE_URL: parsedConfig.applistage.BASE_URL,
            USERNAME: parsedConfig.applistage.USERNAME,
            PASSWORD: parsedConfig.applistage.PASSWORD,
            INTERVAL: parsedConfig.applistage.INTERVAL,
        },
        webhook: getAllWebhookConfig(parsedConfig.webhook)
    };

    return config;
}