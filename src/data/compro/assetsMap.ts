/**
 * Asset paths untuk Services dan Journey steps.
 * Semua gambar dari /assets folder project.
 */

export const ASSETS_PATH = "/assets";

export const serviceAssets: Record<string, string> = {
  ltl: `${ASSETS_PATH}/ltl.webp`,
  ftl: `${ASSETS_PATH}/ftl.webp`,
  fcl: `${ASSETS_PATH}/fcl.webp`,
  lcl: `${ASSETS_PATH}/lcl.webp`,
  "air-express": `${ASSETS_PATH}/air-express.webp`,
  procargo: `${ASSETS_PATH}/pro-cargo.webp`,
};

export const journeyAssets: Record<string, string> = {
  order: `${ASSETS_PATH}/1-order.webp`,
  pickup: `${ASSETS_PATH}/2-pickup.webp`,
  transit: `${ASSETS_PATH}/3-ontheway.webp`,
  update: `${ASSETS_PATH}/4-realtime-update.webp`,
  arrived: `${ASSETS_PATH}/5-tiba.webp`,
  delivered: `${ASSETS_PATH}/6-serahterima.webp`,
};
