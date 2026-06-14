const CANVAS_WIDTH = 720;
const PRINT_DPI = 300;

interface ProductConfig {
  id: string;
  name: string;
  description: string;
  /** Physical print area in mm */
  printWidthMm: number;
  printHeightMm: number;
  mockupImage: string;
  color: string;
}

export interface Product extends ProductConfig {
  /** Derived: export resolution at 300 DPI */
  exportWidthPx: number;
  exportHeightPx: number;
  /** Derived: display canvas size maintaining aspect ratio */
  canvasWidth: number;
  canvasHeight: number;
}

function toProduct(c: ProductConfig): Product {
  return {
    ...c,
    exportWidthPx: Math.round((c.printWidthMm / 25.4) * PRINT_DPI),
    exportHeightPx: Math.round((c.printHeightMm / 25.4) * PRINT_DPI),
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: Math.round(CANVAS_WIDTH * (c.printHeightMm / c.printWidthMm)),
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "mug-ceramic",
    name: "Kubek ceramiczny",
    description: "Klasyczny kubek ceramiczny 330 ml",
    printWidthMm: 250,
    printHeightMm: 95,
    mockupImage: "/products/kubek.webp",
    color: "bg-amber-50",
  },
  {
    id: "cup-plastic",
    name: "Kubek z nakrętką 300ml",
    description: "Kubek plastikowy z nakrętką",
    printWidthMm: 250,
    printHeightMm: 90,
    mockupImage: "/products/kubek-z-nakretka.webp",
    color: "bg-blue-50",
  },
  {
    id: "bottle-sport",
    name: "Bidon sportowy",
    description: "Butelka sportowa 500 ml",
    printWidthMm: 230,
    printHeightMm: 170,
    mockupImage: "/products/bidon.webp",
    color: "bg-green-50",
  },
].map(toProduct);

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
