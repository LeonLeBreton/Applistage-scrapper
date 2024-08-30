import dotenv from "dotenv";
import { ILogObj, Logger } from "tslog";
import { AppliStageFetch, Stage } from "./lib/appli_stage_fetch";
import { Config, loadConfig } from "./lib/load_config";
import { sendMultipleWebhook, sendWebhook } from "./lib/send_webhook";
dotenv.config();

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
    const logger: Logger<ILogObj> = new Logger();

    try {
        if (!process.env.APPLISTAGE_CONFIG_PATH) {
            throw new Error(
                "APPLISTAGE_CONFIG_PATH is not defined in .env file or environment variables"
            );
        }
        const config: Config = loadConfig(process.env.APPLISTAGE_CONFIG_PATH);

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
        } catch {
            throw new Error("Envoie du test au webhook impossible");
        }
        const appliStageFetch = new AppliStageFetch(
            config.applistage.BASE_URL,
            config.applistage.USERNAME,
            config.applistage.PASSWORD
        );
        try {
            const t = await appliStageFetch.fetchStages();
            await sendMultipleWebhook(config.webhook, t)
            
            logger.info("Récupération initial des stages réussis")
        } catch (error) {
            throw new Error(
                "Récupération initial des stages impossible : " + error
            );
        }
        while (true) {
            sleep(config.applistage.INTERVAL);
            let data = null;
            try {
                data = await appliStageFetch.fetchNewStages();
            } catch (error) {
                logger.warn("Impossible de récupérer les stages : " + error);
            }
            if (data && data.length > 0) {
                try {
                    await sendMultipleWebhook(config.webhook, data);
                } catch {
                    logger.warn(
                        "Impossible d'envoyer les nouveaux stages au webhook"
                    );
                }
                logger.info(data.length + " nouveau(x) stage(s)");
            }
        }
    } catch (error) {
        logger.error(error);
    }
})();
