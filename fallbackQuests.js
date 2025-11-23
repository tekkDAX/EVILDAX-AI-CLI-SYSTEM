// src/config/fallbackQuests.js
// This file provides a static set of quests for development and testing.
// It's used when the "Sparmodus" (local fallback) is enabled to avoid API costs.

export const fallbackQuests = [
  {
    "id": "fallback-001",
    "title": "Lokale Daten-Anomalie",
    "description": "Ein seltsames Signal stört die lokalen Subraum-Kommunikationsrelais. Wir müssen die Quelle finden, bevor das gesamte System ausfällt. Die Daten deuten auf einen alten Server-Knoten im Alpha-Sektor hin.",
    "moralChallenge": "Die Daten könnten wertvoll oder gefährlich sein. Bergen Sie sie zur Analyse oder löschen Sie sie, um jedes Risiko zu vermeiden?",
    "faction": "Stellar Federation",
    "requirements": "Keine besonderen Anforderungen.",
    "minLevel": 1,
    "sector": "alpha",
    "npcName": "Sys-Admin Eva",
    "dialogue": "Operator, wir haben ein Problem. Ein Geist in der Maschine. Finden Sie ihn.",
    "outcomes": [
      {
        "description": "Server-Knoten sicher herunterfahren und Daten zur Analyse an die Föderation übergeben.",
        "status": "success",
        "rewards": {
          "xp": 50,
          "credits": 100,
          "morality": 5,
          "reputation": { "faction": "Stellar Federation", "change": 10 }
        }
      },
      {
        "description": "Den Server-Knoten mit einem EMP-Impuls aus der Ferne zerstören, um die Anomalie schnell zu beseitigen.",
        "status": "success",
        "rewards": {
          "xp": 30,
          "credits": 50,
          "morality": -10,
          "reputation": { "faction": "Stellar Federation", "change": -5 }
        }
      }
    ]
  },
  {
    "id": "fallback-002",
    "title": "Der Preis des Fortschritts",
    "description": "Ein Wissenschaftler des Jupiter-Kollektivs hat einen neuen KI-Algorithmus entwickelt, der das Potenzial hat, die Energieeffizienz um 300% zu steigern. Das Mars-Konglomerat will die Technologie um jeden Preis.",
    "moralChallenge": "Schützen Sie das geistige Eigentum des Kollektivs oder verkaufen Sie es an den Meistbietenden für einen schnellen Profit?",
    "faction": "Jupiter Collective",
    "requirements": "Ein grundlegendes Verständnis von Unternehmensethik.",
    "minLevel": 2,
    "sector": "gamma",
    "npcName": "Dr. Aris Thorne",
    "dialogue": "Meine Forschung ist nicht zu verkaufen! Aber das Konglomerat hört einfach nicht zu. Helfen Sie mir!",
    "outcomes": [
      {
        "description": "Die Forschungsdaten an das Kollektiv zurückgeben und ihre sichere Übertragung gewährleisten.",
        "status": "success",
        "rewards": {
          "xp": 75,
          "credits": 200,
          "morality": 15,
          "reputation": { "faction": "Jupiter Collective", "change": 15 },
          "item": {
            "id": "item-fallback-01",
            "name": "Effizienz-Algorithmus",
            "description": "Ein Daten-Chip, der einen revolutionären Energieeffizienz-Algorithmus enthält.",
            "type": "Data-Chip",
            "icon": "chip"
          }
        }
      },
      {
        "description": "Die Daten heimlich an einen Agenten des Mars-Konglomerats verkaufen.",
        "status": "success",
        "rewards": {
          "xp": 40,
          "credits": 1500,
          "morality": -15,
          "reputation": { "faction": "Jupiter Collective", "change": -20 }
        }
      }
    ]
  },
  {
    "id": "fallback-003",
    "title": "Unternehmens-Sabotage",
    "description": "Ein Frachter des Mars-Konglomerats, der illegale Cyberwaffen transportiert, ist im Beta-Sektor gestrandet. Dies ist eine Gelegenheit, ihre Operationen zu stören.",
    "moralChallenge": "Melden Sie den Frachter den Behörden der Föderation oder nutzen Sie die Gelegenheit, um die Waffen für sich selbst zu 'bergen'?",
    "faction": "Mars Conglomerate",
    "minLevel": 1,
    "sector": "beta",
    "npcName": "Anonymer Tippgeber",
    "dialogue": "Wenn Sie schnell sind, können Sie dem Konglomerat einen empfindlichen Schlag versetzen. Der Frachter 'Fortune's Folly' ist ungeschützt.",
    "outcomes": [
      {
        "description": "Die Koordinaten des Frachters an die Sicherheit der Föderation weiterleiten.",
        "status": "success",
        "rewards": {
          "xp": 60,
          "credits": 150,
          "morality": 10,
          "reputation": { "faction": "Mars Conglomerate", "change": -10 }
        }
      },
      {
        "description": "Die Waffenkisten aus dem Frachter stehlen, bevor jemand etwas bemerkt.",
        "status": "failure",
        "rewards": {
          "xp": 20,
          "credits": -100,
          "morality": -10,
          "reputation": { "faction": "Mars Conglomerate", "change": 5 }
        }
      }
    ]
  }
];