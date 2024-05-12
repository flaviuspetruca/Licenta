export const PORT = 3001;
export const AUDIO_BACKEND = "http://localhost:8443";

export const HOLDS_PATH = "src/configs/holds.json";
export const HOLDS_DESCRIPTIONS_PATH = "src/configs/holds_descriptions.json";
export const IMAGE_HOLDS_PATH = "assets/holds";
export const AUDIO_PATH = "assets/audio";
export const TMP_AUDIO_PATH = "assets/tmp";
export const NEXT_POSITION_AUDIO = "next_position.mp3";
export const END_AUDIO = "end_of_track.mp3";

export const CELL_EDGE_SIZE = 30; // DISTANCE BETWEEN CENTERS OF TWO CELLS
export const CLOSE_LIMIT_DISTANCE = Math.sqrt(2 * Math.pow(CELL_EDGE_SIZE, 2));
export const FAR_LIMIT_DISTANCE = Math.sqrt(Math.pow(2 * CELL_EDGE_SIZE, 2) + Math.pow(CELL_EDGE_SIZE, 2));

export const PANEL_HEIGHT = 10;
export const PANEL_WIDTH = 15;

export const AZURE_ACCOUNT = process.env.AZURE_ACCOUNT || "";
export const AZURE_KEY = process.env.AZURE_KEY || "";
export const AZURE_TMP = process.env.AZURE_CONTAINER_TMP || "";
export const AZURE_ASSETS = process.env.AZURE_CONTAINER_ASSETS || "";
