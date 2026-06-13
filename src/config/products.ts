export interface Product {
  id: string;
  name: string;
  description: string;
  /** Print area in mm */
  printWidthMm: number;
  printHeightMm: number;
  /** Export resolution in pixels (300 DPI) */
  exportWidthPx: number;
  exportHeightPx: number;
  /** Display canvas size (px) */
  canvasWidth: number;
  canvasHeight: number;
  mockupImage: string;
  color: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "mug-ceramic",
    name: "Kubek ceramiczny",
    description: "Klasyczny kubek ceramiczny 330 ml",
    printWidthMm: 210,
    printHeightMm: 95,
    exportWidthPx: 2480,
    exportHeightPx: 1122,
    canvasWidth: 720,
    canvasHeight: 326,
    mockupImage: "/products/kubek.webp",
    color: "bg-amber-50",
  },
  {
    id: "cup-plastic",
    name: "Kubek z nakrętką 300ml",
    description: "Kubek plastikowy z nakrętką",
    printWidthMm: 250,
    printHeightMm: 90,
    exportWidthPx: 2953,
    exportHeightPx: 1063,
    canvasWidth: 720,
    canvasHeight: 259,
    mockupImage: "/products/kubek-z-nakretka.webp",
    color: "bg-blue-50",
  },
  {
    id: "bottle-sport",
    name: "Bidon sportowy",
    description: "Butelka sportowa 500 ml",
    printWidthMm: 200,
    printHeightMm: 140,
    exportWidthPx: 2362,
    exportHeightPx: 1654,
    canvasWidth: 720,
    canvasHeight: 504,
    mockupImage: "/products/bidon.webp",
    color: "bg-green-50",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
