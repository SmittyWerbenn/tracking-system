interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export function QRCode({ data, size = 180, className = "" }: QRCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    data,
  )}`;
  return (
    <img
      src={src}
      alt={`QR Code menuju ${data}`}
      width={size}
      height={size}
      className={`rounded-lg border border-slate-200 bg-white p-1 ${className}`}
    />
  );
}
