/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * KintsugiBrain — A stylized brain emblem with gold Kintsugi repair lines.
 * Kintsugi (金継ぎ) is the Japanese art of repairing broken pottery with gold lacquer,
 * treating breakage and repair as part of an object's history rather than something to disguise.
 * Here it symbolises self-improvement: embracing flaws and forging them into strength.
 */

import { useId } from "react";

interface KintsugiBrainProps {
  className?: string;
  size?: number;
}

export default function KintsugiBrain({
  className = "",
  size = 32,
}: KintsugiBrainProps) {
  const uid = useId().replace(/:/g, "");
  const goldId = `kg-${uid}`;
  const fillId = `bf-${uid}`;
  const glowId = `gl-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kintsugi Brain — Self-Improvement"
    >
      <defs>
        {/* Kintsugi gold gradient */}
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#F5D061" />
        </linearGradient>
        {/* Brain fill gradient — dark with subtle purple tint */}
        <radialGradient id={fillId} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#2D1B4E" />
          <stop offset="70%" stopColor="#1A0F2E" />
          <stop offset="100%" stopColor="#0D0619" />
        </radialGradient>
        {/* Glow filter for gold lines */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Brain outer silhouette — two hemispheres */}
      <g>
        {/* Left hemisphere */}
        <path
          d="M32 6 C18 6 8 16 8 30 C8 38 12 44 16 48 C20 52 26 54 32 54 C30 54 24 52 20 48 C16 44 12 38 12 30 C12 16 22 10 32 10 Z"
          fill={`url(#${fillId})`}
          stroke={`url(#${goldId})`}
          strokeWidth="1.2"
        />
        {/* Right hemisphere */}
        <path
          d="M32 6 C46 6 56 16 56 30 C56 38 52 44 48 48 C44 52 38 54 32 54 C34 54 40 52 44 48 C48 44 52 38 52 30 C52 16 42 10 32 10 Z"
          fill={`url(#${fillId})`}
          stroke={`url(#${goldId})`}
          strokeWidth="1.2"
        />
      </g>

      {/* Central fissure — longitudinal cerebral fissure with gold */}
      <line
        x1="32"
        y1="8"
        x2="32"
        y2="54"
        stroke={`url(#${goldId})`}
        strokeWidth="1.5"
        filter={`url(#${glowId})`}
      />

      {/* Kintsugi crack lines — gold-filled fissures through the brain */}
      <g
        filter={`url(#${glowId})`}
        stroke={`url(#${goldId})`}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left hemisphere cracks */}
        <path d="M18 22 L14 28 L16 34 L12 40" />
        <path d="M24 14 L20 20 L22 26" />
        <path d="M14 18 L10 24 L14 32" />
        <path d="M20 38 L16 44 L18 50" />

        {/* Right hemisphere cracks */}
        <path d="M46 20 L50 26 L48 32 L52 38" />
        <path d="M40 14 L44 20 L42 26" />
        <path d="M50 16 L54 22 L50 30" />
        <path d="M44 36 L48 42 L46 48" />

        {/* Cross-hemisphere connecting cracks */}
        <path d="M28 18 L32 22 L36 18" />
        <path d="M26 34 L32 38 L38 34" />
        <path d="M24 44 L32 48 L40 44" />
      </g>

      {/* Cortical folds (gyri/sulci) — brain texture lines in subtle gold */}
      <g
        stroke={`url(#${goldId})`}
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      >
        {/* Left folds */}
        <path d="M16 14 C18 12 22 12 24 14" />
        <path d="M12 22 C14 20 18 20 20 22" />
        <path d="M14 34 C16 32 20 32 22 34" />
        <path d="M16 46 C18 44 22 44 24 46" />
        {/* Right folds */}
        <path d="M48 14 C46 12 42 12 40 14" />
        <path d="M52 22 C50 20 46 20 44 22" />
        <path d="M50 34 C48 32 44 32 42 34" />
        <path d="M48 46 C46 44 42 44 40 46" />
      </g>

      {/* Small gold nodes at crack intersections — like Kintsugi joint points */}
      <g fill={`url(#${goldId})`}>
        <circle cx="32" cy="22" r="1" />
        <circle cx="32" cy="38" r="1" />
        <circle cx="32" cy="48" r="1" />
        <circle cx="14" cy="28" r="0.8" />
        <circle cx="16" cy="34" r="0.8" />
        <circle cx="20" cy="20" r="0.8" />
        <circle cx="50" cy="26" r="0.8" />
        <circle cx="48" cy="32" r="0.8" />
        <circle cx="44" cy="20" r="0.8" />
      </g>

      {/* Subtle outer glow ring */}
      <circle
        cx="32"
        cy="30"
        r="28"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}
