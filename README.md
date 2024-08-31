# IUT Vannes - Applistage Scrapper

## Webhook
- {{subject}} : Nom du stage
- {{url}} : Lien vers la page du stage
- {{creation_date}} : Date de création de l'offre
- {{company}} :  Nom de l'entreprise
- {{city}} : Ville de l'entreprise
- {{department}} : Departement de l'entreprise

## Ajouter un nouveau webhook

Dans le fichier "config.toml", ajouter une nouvelle entrée dans la section "webhooks" :

```toml
[webhooks]
[webhooks.first_webhook_name] # Nom du webhook, nom après le point
URL = ""            # URL du webhook | Obligatoire
METHOD = "POST"     # Méthode HTTP | Obligatoire
TYPE = "text/plain" # Type de contenu | Obligatoire
BODY = ""           # Corps de la requête | Obligatoire, voir le README pour plus d'informations
HEADERS = {}        # En-têtes de la requête
USERNAME = ""       # Nom d'utilisateur
PASSWORD = ""       # Mot de passe
TIMEOUT = 0         # Délai d'attente

[webhooks.second_webhook_name] # Nom du webhook, nom après le point
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
[webhooks.discord]
URL = "https://discord.com/api/webhooks/xxxxx"
METHOD = "POST"
BODY = '{"username": "Appli-Stage", "content": "{{subject}} - Entreprise : {{company}} dans la ville de {{city}} (département : {{department}})\nLien : {{url}}, crée le {{creation_date}} "}'
TYPE = "application/json"
HEADERS = {}
USERNAME = ""
PASSWORD = ""
TIMEOUT = 1000
```