// Curated Unsplash photo IDs used as realistic sample photography for the
// prototype. Each ID below has been manually inspected to confirm it shows
// the right subject (truck, warehouse, boxes, signature, etc.) — in
// production these would be actual uploaded photos from Admin/driver.
const ids = {
  truckHighwayFront: "1601584115197-04ecc0da31d7", // white truck, front view, highway
  truckMountainRoad: "1519003722824-194d4455a60c", // truck on mountain road, rear view
  truckTrailerSunset: "1616432043562-3671ea2e5242", // semi trailer rear view, sunset
  truckCargoLoaded: "1580674285054-bed31e145f59", // van/truck cargo bay loaded with boxes
  warehouseAisles: "1553413077-190dd305871c", // warehouse racking aisles
  warehouseShelves: "1587293852726-70cdb56c2866", // warehouse shelves wide shot
  containerPortAerial: "1494412651409-8963ce7935a7", // aerial shipping container yard
  boxSingle: "1607166452427-7e4477079cb9", // single cardboard box, clean background
  boxesKraft: "1595246140625-573b715d11dc", // two small kraft boxes
  boxesStacked: "1586528116311-ad8dd3c8310d", // warehouse full of stacked boxes
  signatureDocument: "1554224155-6726b3ff858f", // hand signing document with calculator
  handshakeDelivery: "1521791136064-7986c2920216", // handshake, delivery handover
} as const;

function unsplash(id: string, w = 800, h = 600) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

export const photos = {
  barangDiterima: unsplash(ids.boxSingle),
  gudang: unsplash(ids.warehouseAisles),
  gudangWorker: unsplash(ids.warehouseShelves),
  truckWingboxA: unsplash(ids.truckHighwayFront),
  truckWingboxB: unsplash(ids.truckMountainRoad),
  truckCddA: unsplash(ids.truckCargoLoaded),
  truckCddB: unsplash(ids.truckTrailerSunset),
  transitLokasi: unsplash(ids.containerPortAerial),
  kendala: unsplash(ids.truckTrailerSunset),
  podBarang: unsplash(ids.boxesKraft),
  podSuratJalan: unsplash(ids.signatureDocument),
  podHandshake: unsplash(ids.handshakeDelivery),
  courier: unsplash(ids.boxesStacked),
};

export function photoThumb(url: string, size = 200) {
  return url.replace(/w=\d+&h=\d+/, `w=${size}&h=${size}`);
}
