# IUT Vannes - Applistage Scrapper

## Webhook
- {{subject}} : Nom du stage
- {{url}} : Lien vers la page du stage
- {{creation_date}} : Date de création de l'offre
- {{company}} :  Nom de l'entreprise
- {{city}} : Ville de l'entreprise
- {{department}} : Departement de l'entreprise

## Ajouter un nouveau webhook

Dans le fichier "config.toml", ajouter une nouvelle entrée dans la section "webhook" :

```toml
[webhook]
[webhooks.first_webhook_name] # Nom du webhook, nom après le point
URL = ""            # URL du webhook | Obligatoire
METHOD = "POST"     # Méthode HTTP | Obligatoire
TYPE = "text/plain" # Type de contenu | Obligatoire
BODY = ""           # Corps de la requête | Obligatoire, voir le README pour plus d'informations
HEADERS = {}        # En-têtes de la requête
USERNAME = ""       # Nom d'utilisateur
PASSWORD = ""       # Mot de passe
TIMEOUT = 0         # Délai d'attente

[webhook.second_webhook_name] # Nom du webhook, nom après le point
URL = ""            # URL du webhook | Obligatoire
METHOD = "POST"     # Méthode HTTP | Obligatoire
TYPE = "text/plain" # Type de contenu | Obligatoire
BODY = ""           # Corps de la requête | Obligatoire, voir le README pour plus d'informations
HEADERS = {}        # En-têtes de la requête
USERNAME = ""       # Nom d'utilisateur
PASSWORD = ""       # Mot de passe
TIMEOUT = 0         # Délai d'attente
```


## Exemple de Webhook
### Discord
```toml
[webhook.discord]
URL = "https://discord.com/api/webhooks/xxxxx"
METHOD = "POST"
BODY = '{"username": "Appli-Stage", "content": "{{subject}} - Entreprise : {{company}} dans la ville de {{city}} (département : {{department}})\nLien : {{url}}, crée le {{creation_date}} "}'
TYPE = "application/json"
HEADERS = {}
USERNAME = ""
PASSWORD = ""
TIMEOUT = 1000
```

## Utilisation avec Docker
Pour utiliser ce projet avec Docker, vous pouvez lancer le conteneur avec l'image suivante :

```sh
docker run --rm -v $(pwd)/config.toml:/app/config.toml ghcr.io/leonlebreton/applistage-scrapper:latest
```

Le fichier de configuration est le même que cité précédemment.