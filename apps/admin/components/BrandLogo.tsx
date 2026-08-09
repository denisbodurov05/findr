function MapMarkerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="h-8 w-8 text-red-500" aria-hidden="true">
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.774-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
    </svg>
  );
}

export function BrandLogo() {
  return (
    <div className="flex items-center justify-center gap-0.5" aria-label="Findr">
      <span className="text-3xl font-bold text-slate-900">F</span>
      <span className="-mt-1 inline-flex"><MapMarkerIcon /></span>
      <span className="text-3xl font-bold text-slate-900">NDR</span>
    </div>
  );
}
