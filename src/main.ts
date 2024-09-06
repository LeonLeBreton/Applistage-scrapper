import dotenv from "dotenv";
import { ILogObj, Logger } from "tslog";
import { AppliStageFetch, Stage, StageDiff } from "./lib/appli_stage_fetch";
import { Config, loadConfig, WebhookConfig } from "./lib/load_config";
import { sendMultipleWebhook, sendWebhook } from "./lib/send_webhook";
dotenv.config();
const logger: Logger<ILogObj> = new Logger();

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getWebHookConfigName(webhookConfig : WebhookConfig[]) : string[] {
    return webhookConfig.map((config) => config.CONFIG_NAME);
}

async function send_test_webhook(config: Config) {
    // Envoie un test sur le webhook
    const testStage: Stage = {
        subject: "Test",
        url: "https://example.com",
        creation_date: new Date(),
        company: "Test",
        city: "Test",
        department: "Test",
    };

    try {
        await sendWebhook(config.webhook, testStage);
        logger.info("WebHook de test envoyé");
    } catch (error) {
        throw new Error("Envoie du test au webhook impossible : " + error);
    }
}

(async () => {
    try {
        let webhookTest = true;
        if (process.env.DISABLE_WEBHOOK_TEST === "true") {
            webhookTest = false;
        }
        if (!process.env.APPLISTAGE_CONFIG_PATH) {
            throw new Error(
                "APPLISTAGE_CONFIG_PATH is not defined in .env file or environment variables"
            );
        }
        const config: Config = loadConfig(process.env.APPLISTAGE_CONFIG_PATH);
        logger.info("Webhook chargé : " + getWebHookConfigName(config.webhook).join(", "));
        logger.debug("Le debug est activé");
        if (webhookTest) {
            send_test_webhook(config);
        }

        const appliStageFetch = new AppliStageFetch(
            config.applistage.BASE_URL,
            config.applistage.USERNAME,
            config.applistage.PASSWORD
        );
        try {
            await appliStageFetch.fetchStages();
            logger.info("Récupération initial des stages réussis")
        } catch (error) {
            throw new Error(
                "Récupération initial des stages impossible : " + error
            );
        }
        while (true) {
            await sleep(config.applistage.INTERVAL);
            let data : StageDiff | null = null;
            try {
                data = await appliStageFetch.fetchNewStages();
            } catch (error) {
                logger.warn("Impossible de récupérer les stages : " + error);
            }
            if (data && data.diffList.length > 0) {
                try {
                    await sendMultipleWebhook(config.webhook, data.diffList);
                } catch {
                    logger.warn(
                        "Impossible d'envoyer les nouveaux stages au webhook"
                    );
                }
                logger.info(data.diffList.length + " nouveau(x) stage(s)");
            } else {
                logger.info("Pas de nouveau stage");
                logger.debug(data);
            }
        }
    } catch (error) {
        logger.error(error);
    }
})();
