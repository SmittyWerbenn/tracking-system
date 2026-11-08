import type { Env } from "./types";
import { Errors } from "./http";
import { optString } from "./validate";

export type ArmadaType = "internal" | "sewa";

export interface ArmadaAssignment {
  armadaType: ArmadaType;
  /** Master Armada unit - always null for sewa. */
  truckId: string | null;
  truckStatus: string | null;
  /** Internal: snapshot of trucks.nomor_unit. Sewa: free text typed by ops. */
  vehiclePlate: string | null;
  /** Sewa only: optional free-text note. */
  driverName: string | null;
  /** Internal only: the registered driver of the unit. */
  driverId: string | null;
}

/**
 * Reads the armada fields of a create/edit request and applies the rules:
 *  - internal: the unit must exist in Master Armada (by truckId, or by plate = nomor_unit).
 *              No unit = unassigned, i.e. it goes to the driver "Pesanan Terbuka" pool.
 *  - sewa:     plate is required free text; driver name optional; never a truck/driver id.
 * Only call when the request carries armadaType / truckId / vehiclePlate.
 */
export async function resolveArmada(env: Env, body: Record<string, unknown>): Promise<ArmadaAssignment> {
  const rawType = optString(body, "armadaType") ?? "internal";
  if (rawType !== "internal" && rawType !== "sewa") {
    throw Errors.badRequest('Field "armadaType" harus salah satu dari: internal, sewa.');
  }
  const truckIdIn = optString(body, "truckId");
  const plateIn = optString(body, "vehiclePlate");

  if (rawType === "sewa") {
    if (truckIdIn) throw Errors.badRequest("Armada sewa tidak boleh memakai unit dari Master Armada.");
    const plate = plateIn?.replace(/\s+/g, " ").toUpperCase();
    if (!plate) throw Errors.badRequest("Plat nomor armada sewa wajib diisi.");
    if (plate.length > 20) throw Errors.badRequest("Plat nomor maksimal 20 karakter.");
    const driverName = optString(body, "driverName")?.replace(/\s+/g, " ") ?? null;
    if (driverName && driverName.length > 100) throw Errors.badRequest("Nama driver maksimal 100 karakter.");
    return { armadaType: "sewa", truckId: null, truckStatus: null, vehiclePlate: plate, driverName, driverId: null };
  }

  if (!truckIdIn && !plateIn) {
    return { armadaType: "internal", truckId: null, truckStatus: null, vehiclePlate: null, driverName: null, driverId: null };
  }
  const truck = truckIdIn
    ? await env.DB.prepare(`SELECT id, nomor_unit, status, driver_id FROM trucks WHERE id = ? AND deleted_at IS NULL`).bind(truckIdIn).first<TruckRow>()
    : await env.DB.prepare(`SELECT id, nomor_unit, status, driver_id FROM trucks WHERE nomor_unit = ? COLLATE NOCASE AND deleted_at IS NULL`).bind(plateIn).first<TruckRow>();
  if (!truck) throw Errors.badRequest("Plat nomor armada internal harus terdaftar di Master Armada.");
  return { armadaType: "internal", truckId: truck.id, truckStatus: truck.status, vehiclePlate: truck.nomor_unit, driverName: null, driverId: truck.driver_id };
}

interface TruckRow { id: string; nomor_unit: string; status: string; driver_id: string | null }
