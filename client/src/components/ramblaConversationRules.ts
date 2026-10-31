export type RamblaPath = "pacifico" | "drastico";
export type RamblaOutcome = 1 | 2;

export type RamblaChoice = {
  label: string;
  path: RamblaPath;
  gesture?: "roll-back" | "citrus-hop";
};

export type RamblaQuestion = {
  npc: string;
  dialogue: string;
  choices: RamblaChoice[];
};

export const RAMBLA_CONVERSATION: RamblaQuestion[] = [
  {
    npc: "Líder encapuchado",
    dialogue: "¿Qué es la alegría, qué es la risa, cuando las llamas siempre están ardiendo? Envueltos en la oscuridad, ¿no buscarían una luz?",
    choices: [
      { label: "«La luz no se busca solo con los ojos, sino con el calor que compartimos.»", path: "pacifico" },
      { label: "«Yo solo soy una fruta intentando no asarme aquí. ¿Podemos ir al grano?»", path: "drastico" },
      { label: "(Guardar silencio y rodar un poco hacia atrás para huir de la vista.)", path: "drastico", gesture: "roll-back" },
    ],
  },
  {
    npc: "Segundo encapuchado",
    dialogue: "Tu piel refleja el brillo de la hoguera, pero dime, pequeño cítrico: ¿es tu interior dulce néctar o amarga defensa contra las sombras?",
    choices: [
      { label: "«Tengo amargura por fuera para proteger lo dulce de adentro, como la vida misma.»", path: "pacifico" },
      { label: "«Tengo tanto ácido que si me tocas, te arderán los dedos.»", path: "drastico" },
      { label: "«Pregúntale al fuego lo que quiera saber.»", path: "drastico" },
    ],
  },
  {
    npc: "Tercer encapuchado · desde lo alto de la colina",
    dialogue: "Si el árbol que te dio la vida supiera el destino que te aguarda en este círculo, ¿te habría dejado caer al suelo o te habría retenido en sus ramas?",
    choices: [
      { label: "«Todo fruto cae cuando está listo para cumplir su propósito, incluso si ese propósito es este misterio.»", path: "pacifico" },
      { label: "«Me habría guardado en una canasta lejos de ustedes y de este fuego absurdo.»", path: "drastico" },
      { label: "(Dar un pequeño bote y exhalar una bocanada de vapor cítrico sin responder.)", path: "drastico", gesture: "citrus-hop" },
    ],
  },
];

export function resolveRamblaOutcome(pacificPoints: number, drasticPoints: number): RamblaOutcome {
  if (pacificPoints >= 2) return 1;
  if (drasticPoints >= 2) return 2;
  return pacificPoints > drasticPoints ? 1 : 2;
}
