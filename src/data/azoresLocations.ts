export const azoresIslands = [
  "Santa Maria",
  "São Miguel",
  "Terceira",
  "Graciosa",
  "São Jorge",
  "Pico",
  "Faial",
  "Flores",
  "Corvo"
];

// Optional pre-filled hierarchy (Ilha -> Concelho -> Freguesia -> Lugar[])
export const initialAzoresHierarchy: Record<string, Record<string, Record<string, string[]>>> = {
  "São Miguel": {
    "Ponta Delgada": {},
    "Ribeira Grande": {
      "Calhetas": [],
      "Pico da Pedra": [],
      "Rabo de Peixe": ["Areias"],
      "Santa Barbara": [],
      "Ribeira Seca": [],
      "Conceição (Ribeira Grande)": [],
      "Matriz (Ribeira Grande)": [],
      "Ribeirinha": [],
      "Porto Formoso": [],
      "São Brás": [],
      "Maia": ["Gorreana", "Calços", "Lombinha da Maia"],
      "Lomba da Maia": ["Burgete"],
      "Fenais da Ajuda": [],
      "Lomba da São Pedro": []
    },
    "Nordeste": {},
    "Povoação": {},
    "Vila Franca do Campo": {},
    "Lagoa": {}
  }
};
