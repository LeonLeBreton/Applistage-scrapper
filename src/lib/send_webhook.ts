import { Stage } from "./appli_stage_fetch";
import { WebhookConfig } from "./load_config";

function formatDate(date: Date): string {
    const jours = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
    ];
    const mois = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];

    const jourSemaine = jours[date.getDay()];
    const jour = date.getDate();
    const moisNom = mois[date.getMonth()];
    const heures = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${jourSemaine} ${jour} ${moisNom} à ${heures}h${minutes}`;
}

function formatData(text: string, data: Stage): string {
    return text
        .replace(/{{subject}}/g, data.subject)
        .replace(/{{url}}/g, data.url)
        .replace(/{{creation_date}}/g, formatDate(data.creation_date))
        .replace(/{{company}}/g, data.company)
        .replace(/{{city}}/g, data.city)
        .replace(/{{department}}/g, data.department ?? "Inconnu");
}

export async function sendMultipleWebhook(
    config: WebhookConfig,
    data: Stage[]
) {
    if (data.length > 0) {
        sendWebhook(config, data[0]);
        for (let i = 1; i < data.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, config.TIMEOUT));
            sendWebhook(config, data[i]);
        }
    }
}

/**
 * Envoie une requête webhook
 * @param config : Configuration du webhook
 * @param data : Données à envoyer
 */
export async function sendWebhook(config: WebhookConfig, data: Stage) {
    const body = formatData(config.BODY, data);
    const headers: any = {
        "Content-Type": config.TYPE,
        ...config.HEADERS,
    };
    if (config.USERNAME || config.PASSWORD) {
        headers["Authorization"] = `Basic ${Buffer.from(
            `${config.USERNAME}:${config.PASSWORD}`
        ).toString("base64")}`;
    }

    await fetch(config.URL, {
        method: config.METHOD,
        body: body,
        headers: headers,
        credentials: "include",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }
            return response.text();
        })
        .catch((error) => {
            throw new Error(`Erreur lors de l'envoi du webhook: ${error}`);
        });
}
