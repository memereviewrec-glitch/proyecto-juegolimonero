export const PHYSICAL_SEED_COLORS = {
  ventana: {
    body: "#efc547",
    highlight: "#fff0a2",
    leaf: "#79964b",
    outline: "#473a34",
    name: "dorado",
  },
  raices: {
    body: "#7fbc61",
    highlight: "#d6f09d",
    leaf: "#37845b",
    outline: "#2c3a30",
    name: "verde",
  },
  rambla: {
    body: "#56cdc1",
    highlight: "#d1fff5",
    leaf: "#4f9b6c",
    outline: "#2c3c3d",
    name: "turquesa",
  },
  "espiritus-del-rio": {
    body: "#9edbd4",
    highlight: "#efffe8",
    leaf: "#5b9c92",
    outline: "#304957",
    name: "plateada",
  },
} as const;

export type PhysicalSeedId = keyof typeof PHYSICAL_SEED_COLORS;

export function getPhysicalSeedId(songId: string): PhysicalSeedId | null {
  switch (songId) {
    case "ventana":
    case "raices":
    case "rambla":
    case "espiritus-del-rio":
      return songId;
    default:
      return null;
  }
}
