import * as cheerio from "cheerio";
import { fetch } from "cross-fetch";

/**
 * Interface pour représenter un stage
 */
export type Stage = {
    subject: string;
    url: string;
    creation_date: Date;
    company: string;
    city: string;
    department: string | undefined;
};

/**
 * Classe pour récupérer les stages depuis l'application AppliStage
 */
export class AppliStageFetch {
    private _url: string;
    private _username: string;
    private _password: string;
    private _cookies: string | null = null;
    private _oldList: Stage[] | undefined;

    /**
     * Constructeur de la classe AppliStageFetch
     *
     * @param base_url : URL de base de Applistage
     * @param username : Nom d'utilisateur pour se connecter
     * @param password : Mot de passe pour se connecter
     */
    constructor(base_url: string, username: string, password: string) {
        if (!base_url || !username || !password) {
            throw new Error("Les paramètres ne peuvent pas être vides !");
        }
        this._url = base_url;
        this._username = username;
        this._password = password;
    }

    /**
     * Permet de récupérer les cookies de session
     * @returns : Le cookie de session
     */
    private async getCookies() {
        try {
            // Préparer les paramètres du corps de la requête
            const params: URLSearchParams = new URLSearchParams();
            params.append("id", this._username);
            params.append("pass", this._password);

            // Effectuer la requête POST avec fetch
            const response: Response = await fetch(
                this._url + "/index.php/connection/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded", // Type du contenu
                    },
                    body: params, // Le corps de la requête avec les paramètres
                    credentials: "include", // Inclure les cookies existants dans la requête
                }
            );

            // Vérifier si la requête a réussi
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }

            const pageContent = await response.text();
            if (
                pageContent.includes("Identifiant ou mot de passe non valide.")
            ) {
                throw new Error("Identifiant ou mot de passe non valide.");
            }

            // Récupérer l'en-tête 'Set-Cookie'
            const cookies = response.headers.get("Set-Cookie");
            return cookies;
        } catch (error) {
            throw new Error(
                `Erreur lors de la récupération des cookies: ${error}`
            );
        }
    }

    /**
     * Vérifier si les cookies de session sont encore valides, sinon les récupérer à nouveau
     */
    private async checkCookies() {
        // Vérifier si les cookies sont déjà récupérés
        if (this._cookies === null) {
            this._cookies = await this.getCookies();
        } else {
            // Vérifier si les cookies sont encore valides
            const response: Response = await fetch(
                this._url + "/index.php/student/workplacement/infosStages",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded", // Type du contenu
                        Cookie: this._cookies ?? "", // Les cookies de la session
                    },
                    credentials: "include", // Inclure les cookies existants dans la requête
                }
            );

            const page_content: string = await response.text();
            // Si les cookies ne sont plus valides, les récupérer à nouveau
            if (page_content.includes("Accès non autorisé")) {
                this._cookies = await this.getCookies();
            }
        }
    }

    /**
     * Filtre les données de la page pour récupérer les stages
     * @param data : Le contenu de la page
     * @returns Une liste des stages
     */
    private filterData(data: string): Stage[] {
        const $ = cheerio.load(data);
        const stageList: Stage[] = [];

        $(".tableListStudent > tbody > tr").each((index, element) => {
            if (index !== 0) {
                const subject = $(element)
                    .find("td:nth-child(1)")
                    .text()
                    .trim();
                const url =
                    $(element).find("td:nth-child(1) > a").attr("href") ?? "";
                const creation_date = new Date(
                    $(element).find("td:nth-child(2)").text().trim()
                );
                const company = $(element)
                    .find("td:nth-child(3)")
                    .text()
                    .trim();

                const city_departement = $(element)
                    .find("td:nth-child(4)")
                    .text();
                const city = city_departement.split("(")[0].trim();
                const department = city_departement
                    .split("(")[1]
                    ?.split(")")[0]
                    .trim();

                const stage: Stage = {
                    subject,
                    url,
                    creation_date,
                    company,
                    city,
                    department,
                };

                stageList.push(stage);
            }
        });

        return stageList;
    }

    public async fetchStages() {
        await this.checkCookies();

        const response: Response = await fetch(
            this._url + "/index.php/student/workplacement/listWorkplacement",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: this._cookies ?? "",
                },
                credentials: "include",
            }
        );

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut: ${response.status}`);
        }

        // Récupérer le contenu de la réponse
        const content = await response.text();
        this._oldList = this.filterData(content);
        return this._oldList;
    }

    get oldList(): Stage[] | undefined {
        return this._oldList;
    }

    private static diffStageList(oldList: Stage[], newList: Stage[]): Stage[] {
        const oldUrls = oldList.map((stage) => stage.url);
        return newList.filter((stage) => !oldUrls.includes(stage.url));
    }

    public async fetchNewStages(): Promise<Stage[]> {
        if (this._oldList === undefined) {
            return await this.fetchStages();
        }
        const oldList = this._oldList;
        const newList = await this.fetchStages();
        return AppliStageFetch.diffStageList(oldList, newList);
    }
}
