import type { RiverChallengeOutcome } from "./riverChoiceRules";

export const RIVER_CHALLENGE_ROUTES: Record<RiverChallengeOutcome, {
  choice: string;
  trait: "valentia" | "cautela";
  reply: string;
  descent: string;
}> = {
  current: {
    choice: "Entrar en la corriente sin miedo.",
    trait: "valentia",
    reply: "El limón entra en la corriente sin miedo. Los espíritus reconocen su valentía y lo acompañan mientras el agua lo conduce hacia el fondo del río.",
    descent: "Los Espíritus del Río le recuerdan que debe reunir las diez semillas para volver a casa. El limón se entrega a la corriente y ellos lo acompañan en su descenso hasta el fondo, donde aguarda la siguiente semilla entre peces y raíces sumergidas.",
  },
  shore: {
    choice: "Retirarme hacia la orilla y esperar.",
    trait: "cautela",
    reply: "El limón se retira hacia la orilla con cautela. Los espíritus respetan su decisión y abren las aguas ante él: un camino tranquilo le permite descender al fondo del río sin entrar en la corriente.",
    descent: "Los Espíritus del Río le recuerdan que debe reunir las diez semillas para volver a casa. El limón espera junto a la orilla; ellos abren las aguas y le ofrecen un paso tranquilo hasta el fondo, donde aguarda la siguiente semilla. Su cautela le permite continuar por otro camino.",
  },
};
