import { useId } from 'react';

/** Original vector counterpart of the procedural model, also available without WebGL. */
export default function SignaturePoster({ exploded = false, className }: { exploded?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 640 680" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="115" y1="60" x2="428" y2="556" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8e979c" /><stop offset=".19" stopColor="#f8f8f4" /><stop offset=".34" stopColor="#d2d7d7" /><stop offset=".48" stopColor="#707b83" /><stop offset=".73" stopColor="#bcc5c7" /><stop offset="1" stopColor="#59636c" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="425" y1="100" x2="300" y2="529" gradientUnits="userSpaceOnUse">
          <stop stopColor="#faf9f0" /><stop offset=".23" stopColor="#acb9bf" /><stop offset=".54" stopColor="#d4dddf" /><stop offset=".71" stopColor="#6c808d" /><stop offset="1" stopColor="#37424a" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="113" y1="0" x2="470" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#596671" /><stop offset=".45" stopColor="#252e36" /><stop offset="1" stopColor="#5e6c77" /></linearGradient>
        <linearGradient id={`${id}-glass`} x1="363" y1="166" x2="320" y2="469" gradientUnits="userSpaceOnUse"><stop stopColor="#b5d0d9" stopOpacity=".7" /><stop offset="1" stopColor="#456671" stopOpacity=".45" /></linearGradient>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#151719" stopOpacity=".2" /><stop offset="1" stopColor="#151719" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="328" cy="615" rx="225" ry="32" fill={`url(#${id}-shadow)`} />
      <path d="M147 148L281 138L367 422L448 151L510 161L388 568L321 590Z" fill="#20282d" />
      <g transform={exploded ? 'translate(-45 -20)' : undefined}>
        <path d="M89 101L211 88L381 535L330 581L293 563Z" fill={`url(#${id}-edge)`} />
        <path d="M88 101L188 113L352 548L309 574L284 559Z" fill={`url(#${id}-metal)`} stroke="#d3d9d8" strokeWidth="1.6" />
        <path d="M109 120L126 122L295 527L285 541Z" fill="#68747c" opacity=".55" />
        <path d="M133 130L153 132L305 516L297 532Z" fill="#222d34" />
        <path d="M138 132L151 134L300 514L297 522Z" fill="#434f58" />
        <path d="M167 138L323 542" stroke="#f5f5ed" strokeOpacity=".67" strokeWidth="2" />
        <path d="M187 137L339 535" stroke="#f1ac5a" strokeWidth="3.3" />
        <g fill="#1b252c" stroke="#c8d0d1" strokeWidth="1.5"><circle cx="117" cy="133" r="4" /><circle cx="192" cy="310" r="4" /><circle cx="282" cy="532" r="4" /></g>
      </g>
      <g transform={exploded ? 'translate(52 -9)' : undefined}>
        <path d="M416 106L506 144L362 553L310 574Z" fill={`url(#${id}-edge)`} />
        <path d="M416 106L478 134L346 545L310 574Z" fill={`url(#${id}-right)`} stroke="#cad8db" strokeWidth="1.6" />
        <path d="M432 143L448 150L332 522L324 540Z" fill="#27343c" />
        <path d="M432 147L440 153L330 519L326 528Z" fill={`url(#${id}-glass)`} stroke="#b5ced6" strokeWidth="1" />
        <path d="M418 142L304 531" stroke="#eeae62" strokeWidth="2.5" />
        <path d="M467 144L344 527" stroke="#eff7f5" strokeWidth="2" />
        <g fill="#1b252c" stroke="#dce4e5" strokeWidth="1.5"><circle cx="457" cy="156" r="3.8" /><circle cx="391" cy="363" r="3.5" /><circle cx="341" cy="518" r="3.5" /></g>
      </g>
      <path d="M287 481L313 549L333 516" stroke="#e6ad67" strokeWidth="2.5" />
    </svg>
  );
}
