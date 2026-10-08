# Spécifications V2.1

Version cible : 2.1. Contrats et validations locales uniquement.

## Périmètre

Étendre la configuration économique de la V2 et réduire les coûts de ses contrats : master, courbe, minter, wallet jetton, collector, splitter et buyback & burn.

Livrables : contrats et tests/simulations Acton. Frontend, SDK, DAO, rewards holders et nouvelles formules de courbe sont hors périmètre.

## Configuration au lancement

Le contrat doit accepter des valeurs personnalisées, sans imposer les presets V2.

| Paramètre | Exigence |
| --- | --- |
| Seuil de migration | Montant libre de 500 à 10 000 GRAM inclus, exprimé en unités minimales |
| Supply initiale | Quantité positive en unités minimales, représentable sur 120 bits |
| Frais créateur | 0 à 1 000 bps (0 à 10 % inclus), uniquement par pas de 10 bps (0,1 %) |
| Part vendue avant migration | 1 à 9 999 bps de la supply initiale |
| Limites par achat public | 0 désactive chaque limite ; sinon 1 à 10 000 bps de supply initiale |

Les paramètres sont immuables après création. Le dev buy doit laisser des tokens et une quantité positive de liquidité après arrondis ; sinon la création est refusée avant déploiement. Les limites d'achat public portent sur les tokens reçus et ne s'appliquent pas au dev buy.

Les arrondis doivent permettre un premier achat respectant les limites. Chaque achat doit conserver assez de tokens pour une migration réalisable. Le minimum technique de montant acheté reste 0,01 TON.

Toute configuration invalide doit être refusée avant le déploiement des contrats du token. Les bornes doivent découler des contraintes économiques et techniques, sans réintroduire une liste fermée de presets.

## Courbe et migration

- Conserver la formule `x × y = k` de la V2.
- Déterminer la réserve virtuelle à partir de la supply, du seuil et de la part vendue choisie ; le prix initial en découle.
- Calculer les tokens nécessaires à la pool à partir des réserves finales, après déduction des frais de migration.
- Conserver le prix marginal de fin de courbe à l'ouverture de la pool, à l'arrondi entier près.
- Refuser les configurations dont les réserves ne permettent pas de financer la migration et la liquidité prévue.
- Définir et exposer la répartition complète de la supply : tokens vendus, liquidité et reliquat.

La part vendue cible correspond à un seuil atteint exactement. Comme en V2, un achat peut dépasser ce seuil ; la migration utilise les réserves réellement atteintes. Le reliquat reste dans le wallet de la courbe.

## Optimisation du gas

- Réduire les calculs, chargements, sérialisations et dérivations d'adresses inutiles sur les sept contrats.
- Mesurer le gas avant/après avec les mêmes scénarios et la même configuration Acton.
- Distinguer les gains d'optimisation du coût des validations nécessaires aux paramètres ouverts.
- Conserver les flows V2. Aucun nouveau système de remboursement du gas, de suivi des payeurs ou de règlement des budgets.

## Garanties V2 conservées

Dev buy confirmé avant ouverture publique, frais protocole de 1 % sur la courbe, frais créateur fixes, modes bénéficiaires/buyback existants, liquidité initiale verrouillée, frais de migration de 20 TON après confirmation et absence d'upgrade du code.

## Critères d'acceptation

- Les simulations Acton couvrent des configurations hors presets V2, les valeurs limites et les configurations refusées.
- Les tests vérifient les prix, la répartition de supply, la migration et les garanties V2 conservées.
- Les coûts avant/après sont comparés avec la même configuration réseau et les mêmes scénarios ; toute régression est identifiée et justifiée.
- Les tests vérifient que les protections, remboursements existants et droits aux frais V2 sont conservés.

## Financement

Le budget de création reste celui de la V2 : 1 TON hors dev buy. Pour les seuils trop faibles pour alimenter l'enveloppe de migration de 0,8 TON par les frais protocole, le lancement finance le déficit indiqué dans le preview.

La migration conserve le prélèvement de 10 % des frais protocole, plafonné à 1,5 TON, et les 20 TON prélevés après confirmation. Les règles V2 de conservation et de retour des fonds restent en place.
