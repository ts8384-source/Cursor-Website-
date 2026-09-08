import katex from 'katex'

/** House unicode → TeX so older ```eq blocks still render under KaTeX. */
export function unicodeMathToTex(raw: string): string {
  return raw
    .replaceAll('ψ', '\\psi')
    .replaceAll('φ', '\\varphi')
    .replaceAll('ϕ', '\\phi')
    .replaceAll('γ', '\\gamma')
    .replaceAll('δ', '\\delta')
    .replaceAll('α', '\\alpha')
    .replaceAll('β', '\\beta')
    .replaceAll('λ', '\\lambda')
    .replaceAll('μ', '\\mu')
    .replaceAll('σ', '\\sigma')
    .replaceAll('Σ', '\\sum')
    .replaceAll('≈', '\\approx')
    .replaceAll('≠', '\\neq')
    .replaceAll('≤', '\\le')
    .replaceAll('≥', '\\ge')
    .replaceAll('·', '\\cdot')
    .replaceAll('×', '\\times')
    .replaceAll('→', '\\to')
    .replaceAll('−', '-')
    .replaceAll('–', '-')
}

export function renderKatex(tex: string, displayMode: boolean): { html: string; ok: boolean } {
  const source = /\\[a-zA-Z]/.test(tex) ? tex : unicodeMathToTex(tex)
  try {
    return {
      html: katex.renderToString(source, {
        throwOnError: false,
        displayMode,
        strict: 'ignore',
        output: 'html',
      }),
      ok: true,
    }
  } catch {
    return { html: '', ok: false }
  }
}
