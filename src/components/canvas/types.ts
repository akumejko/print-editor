export type ToolSection = "text" | "assets" | "upload" | null;

export interface SelectedObjState {
  type: "text" | "image" | "other";
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  angle?: number;
  bold?: boolean;
  italic?: boolean;
  opacity?: number;
}
