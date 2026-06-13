export interface PresetAsset {
  id: string;
  label: string;
  src: string;
}

export const PRESET_ASSETS: PresetAsset[] = [
  { id: "star", label: "Gwiazdka", src: "/assets/star.svg" },
  { id: "heart", label: "Serce", src: "/assets/heart.svg" },
  { id: "crown", label: "Korona", src: "/assets/crown.svg" },
  { id: "lightning", label: "Błyskawica", src: "/assets/lightning.svg" },
  { id: "paw", label: "Łapa", src: "/assets/paw.svg" },
  { id: "sun", label: "Słońce", src: "/assets/sun.svg" },
  { id: "flower", label: "Kwiat", src: "/assets/flower.svg" },
  { id: "diamond", label: "Diament", src: "/assets/diamond.svg" },
  { id: "arrow", label: "Strzałka", src: "/assets/arrow.svg" },
  { id: "shield", label: "Tarcza", src: "/assets/shield.svg" },
  { id: "wave", label: "Fala", src: "/assets/wave.svg" },
  { id: "circle-dots", label: "Okrąg", src: "/assets/circle-dots.svg" },
];

export const FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
  { value: "Dancing Script", label: "Dancing Script" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lato", label: "Lato" },
  { value: "Raleway", label: "Raleway" },
];
