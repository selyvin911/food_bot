/// <reference types="astro/client" />

/** Build-time configuration, read from .env. Never exposed to the client. */
interface ImportMetaEnv {
  readonly FOOD_TRACKER_TOKEN?: string;
  readonly BOARD_DATE?: string;
  readonly BOARD_WEEK_RENDER?: string;
  readonly BOARD_CALORIE_GOAL?: string;
  readonly BOARD_CARB_TARGET?: string;
  readonly BOARD_PROTEIN_TARGET?: string;
  readonly BOARD_FAT_TARGET?: string;
  readonly BOARD_OFFLINE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
