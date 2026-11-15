export const sizes = {
  PP: { slices: "8 a 10 pedaços", price: "R$ 165", diameter: "12 cm" },
  P: { slices: "15 a 18 pedaços", price: "R$ 220", diameter: "16 cm" },
  M: { slices: "25 a 30 pedaços", price: "R$ 295", diameter: "20 cm" },
  G: { slices: "40 a 45 pedaços", price: "Sob consulta", diameter: "25 cm" },
};

export type SizeKey = keyof typeof sizes;
