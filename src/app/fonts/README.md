# Fonts

All files are latin subsets with a variable weight axis, self-hosted so that
`next build` never reaches the network.

| File | Family | Axis | Source |
| --- | --- | --- | --- |
| `inter-latin.woff2` | Inter | 100–900, normal | `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2` |
| `cormorant-garamond-latin.woff2` | Cormorant Garamond | 300–700, normal | `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2` |
| `nerd-symbols.woff2` | Symbols Nerd Font | 400, subset | Only the decorative glyphs used by the logo badges |

Why not `next/font/google`: it downloads the font from `fonts.gstatic.com` while
building. When that request fails, Turbopack reports
`Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`
and the build fails, which is what turned CI red on a commit that had nothing to
do with fonts. Keeping the files here makes the build reproducible and offline.

To update a family, download the new latin subset from the Google Fonts CSS API
(`https://fonts.googleapis.com/css2?family=<Family>:wght@<range>&display=swap`,
desktop `User-Agent`, the `/* latin */` block) and replace the file; the
variable names in `src/app/layout.tsx` must stay `--font-inter` and
`--font-cormorant` because `src/app/globals.css` maps them to `--font-sans` and
`--font-display`.

Both families are licensed under the SIL Open Font License 1.1.
