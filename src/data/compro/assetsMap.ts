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

/** Fleet photos (served from /assets, files live in public/assets). */
export const fleetAssets = {
  "pickup-bak": `${ASSETS_PATH}/pickup-bak.webp`,
  "pickup-box": `${ASSETS_PATH}/pickup-box.webp`,
  "blind-van": `${ASSETS_PATH}/blind-van.webp`,
  "cde-bak-triway": `${ASSETS_PATH}/cde-bak-triway.webp`,
  "cdd-bak-sentral": `${ASSETS_PATH}/cdd-bak-sentral.webp`,
  "cdd-bak-triway": `${ASSETS_PATH}/cdd-bak-triway.webp`,
  "cdd-box-long": `${ASSETS_PATH}/cdd-box-long.webp`,
  "cdd-losbak": `${ASSETS_PATH}/cdd-losbak.webp`,
  "cdd-wingbox": `${ASSETS_PATH}/cdd-wingbox.webp`,
  "fuso-box": `${ASSETS_PATH}/fuso-box.webp`,
  "fuso-triway": `${ASSETS_PATH}/fuso-triway.webp`,
  "fuso-losbak": `${ASSETS_PATH}/fuso-losbak.webp`,
  "fuso-wingbox": `${ASSETS_PATH}/fuso-wingbox.webp`,
  "fuso-refer-termoking": `${ASSETS_PATH}/fuso-refer-termoking.webp`,
  "tronton-bak-triway": `${ASSETS_PATH}/tronton-bak-triway.webp`,
  "tronton-losbak": `${ASSETS_PATH}/tronton-losbak.webp`,
  "tronton-wingbox": `${ASSETS_PATH}/tronton-wingbox.webp`,
  "tronton-refer-termoking": `${ASSETS_PATH}/tronton-refer-termoking.webp`,
  "trailer-20ft": `${ASSETS_PATH}/trailer-20ft.webp`,
  "trailer-40ft": `${ASSETS_PATH}/trailer-40ft.webp`,
  "trailer-big-mama-wingbox": `${ASSETS_PATH}/trailer-big-mama-wingbox.webp`,
  lowbed: `${ASSETS_PATH}/lowbed.webp`,
  dolly: `${ASSETS_PATH}/dolly.webp`,
} as const;

/** Single image containing every client logo (assets/clients.webp, served from public/assets). */
export const clientsAsset = `${ASSETS_PATH}/clients.webp`;
