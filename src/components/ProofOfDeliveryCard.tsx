import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { ProofOfDelivery } from "../types";
import { formatJam, formatTanggalPanjang } from "../utils/format";
import { ImageLightbox, PhotoThumb } from "./ImageLightbox";

export function ProofOfDeliveryCard({ pod }: { pod: ProofOfDelivery }) {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
      <ImageLightbox
        src={lightbox?.src ?? null}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
      <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-100 px-4 py-3 sm:px-5">
        <CheckCircle2 size={20} className="text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Proof of Delivery</p>
          <p className="text-xs text-emerald-700">Barang telah diterima</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold tracking-wide text-white">
          DELIVERED
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Tanggal &amp; Waktu</dt>
            <dd className="font-medium text-slate-800">
              {formatTanggalPanjang(pod.tanggal)}
              <br />
              {formatJam(pod.jam)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Lokasi</dt>
            <dd className="font-medium text-slate-800">{pod.lokasi}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Diterima oleh</dt>
            <dd className="font-medium text-slate-800">{pod.namaPenerima}</dd>
          </div>
        </dl>

        {pod.catatan && (
          <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-600">{pod.catatan}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Foto Barang Diterima</p>
            <PhotoThumb
              src={pod.fotoBarang}
              alt="Foto barang diterima"
              className="aspect-square w-full"
              onClick={() => setLightbox({ src: pod.fotoBarang, caption: "Foto barang diterima" })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Surat Jalan (Ditandatangani)</p>
            <PhotoThumb
              src={pod.fotoSuratJalan}
              alt="Foto surat jalan yang sudah ditandatangani"
              className="aspect-square w-full"
              onClick={() =>
                setLightbox({ src: pod.fotoSuratJalan, caption: "Surat jalan ditandatangani" })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
