export type RioFishColor = "verde" | "azul" | "rojo" | "amarillo";

export const RIO_FISH_COLORS: readonly RioFishColor[] = ["verde", "azul", "rojo", "amarillo"];

export function recordBlackFishReply(readReplies: readonly RioFishColor[], color: RioFishColor) {
  const newlyRead = !readReplies.includes(color);
  const replies = newlyRead ? [...readReplies, color] : [...readReplies];
  return {
    replies,
    newlyRead,
    allRead: RIO_FISH_COLORS.every(reply => replies.includes(reply)),
  };
}
