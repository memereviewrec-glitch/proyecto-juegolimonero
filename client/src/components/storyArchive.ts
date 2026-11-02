export type JaguarEndingId = "empatia" | "enigmas" | "valentia" | "pesadilla";

export const JAGUAR_ENDINGS: readonly {
  id: JaguarEndingId;
  title: string;
  summary: string;
  artwork: string;
}[] = [
  {
    id: "empatia",
    title: "El Jaguar escucha",
    summary: "La empatía del limón atraviesa la furia. El Jaguar deja de rugir y revela la verdad del sueño.",
    artwork: "/jaguar-ending-empatia.webp",
  },
  {
    id: "enigmas",
    title: "La respuesta bajo la primera respuesta",
    summary: "El limón resuelve los enigmas y el Jaguar revela su rostro de dios del conocimiento.",
    artwork: "/jaguar-ending-enigmas.webp",
  },
  {
    id: "valentia",
    title: "El limón se mantiene en pie",
    summary: "El limón resiste la prueba física y descubre la verdad del sueño.",
    artwork: "/jaguar-ending-valentia.webp",
  },
  {
    id: "pesadilla",
    title: "Los sueños son semillas",
    summary: "El limón despierta bajo su cama y encuentra la semilla que había estado allí todo el tiempo.",
    artwork: "/jaguar-ending-pesadilla.webp",
  },
];

export type RewriteChapterId = "dawn" | "rambla" | "river" | "river-challenge" | "hummingbird" | "jaguar";

export const REWRITE_CHAPTERS: readonly {
  id: RewriteChapterId;
  title: string;
  description: string;
}[] = [
  { id: "dawn", title: "Ventana al sendero", description: "Reelegir entre silbar y escuchar a los pájaros." },
  { id: "rambla", title: "Rambla", description: "Cambiar la ruta de los encapuchados; una ruta nueva pedirá rehacer la respuesta del río." },
  { id: "river", title: "Espíritus del río", description: "Reelegir la conversación por la ruta vigente de Rambla." },
  { id: "river-challenge", title: "El reto del río", description: "Reelegir la decisión de la prueba de la corriente." },
  { id: "hummingbird", title: "El colibrí", description: "Reelegir cómo responde Limón a su miedo." },
  { id: "jaguar", title: "El Jaguar", description: "Recalcular las estadísticas vigentes y volver a probar el encuentro." },
];
