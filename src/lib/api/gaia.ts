/**
 * Gaia TAP placeholder wrapper.
 *
 * Live queries against the ESA Gaia archive (https://gea.esac.esa.int/tap-server/tap)
 * are planned for v2 — the archive supports anonymous synchronous ADQL queries,
 * but result sets need careful pagination and typed parsing, so the MVP ships
 * the query builder + types only. Nothing here fakes live data.
 */

export interface GaiaStar {
  sourceId: string;
  ra: number;
  dec: number;
  parallaxMas: number;
  gMag: number;
  bpRp: number;
}

export const GAIA_TAP_ENDPOINT = "https://gea.esac.esa.int/tap-server/tap/sync";

/** Build an ADQL cone-search around (ra, dec) in degrees. */
export function buildGaiaConeQuery(ra: number, dec: number, radiusDeg = 0.5, limit = 100): string {
  return `
SELECT TOP ${limit} source_id, ra, dec, parallax, phot_g_mean_mag, bp_rp
FROM gaiadr3.gaia_source
WHERE 1 = CONTAINS(POINT('ICRS', ra, dec),
                   CIRCLE('ICRS', ${ra}, ${dec}, ${radiusDeg}))
  AND parallax > 0
ORDER BY phot_g_mean_mag ASC`.trim();
}

export const GAIA_STATUS = {
  implemented: false,
  note: "Placeholder wrapper — query builder ready, live TAP execution planned for v2 (see docs/roadmap.md).",
} as const;
