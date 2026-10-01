/**
 * Asset paths untuk Services dan Journey steps.
 * Semua gambar dari /assets folder project.
 */

export const ASSETS_PATH = "/assets";

export const serviceAssets: Record<string, string> = {
  ltl: `${ASSETS_PATH}/ltl.png`,
  ftl: `${ASSETS_PATH}/ftl.png`,
  fcl: `${ASSETS_PATH}/fcl.png`,
  lcl: `${ASSETS_PATH}/lcl.png`,
  "air-express": `${ASSETS_PATH}/air-express.png`,
  procargo: `${ASSETS_PATH}/pro-cargo.png`,
};

export const journeyAssets: Record<string, string> = {
  order: `${ASSETS_PATH}/1-order.png`,
  pickup: `${ASSETS_PATH}/2-pickup-loading.png`,
  transit: `${ASSETS_PATH}/3-ontheway.png`,
  update: `${ASSETS_PATH}/4-realtime-update.png`,
  arrived: `${ASSETS_PATH}/5-tiba.png`,
  delivered: `${ASSETS_PATH}/6-serahterima.png`,
};
