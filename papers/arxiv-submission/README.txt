# Genesis: Physically Grounded Multi-Agent Artificial Life Simulation
## arXiv Submission Package

**Author:** Vinay Khosya  
**Contact:** vinayroyale123@gmail.com  
**Portal:** https://genesis.vinaykhosya.com  
**Categories:** cs.NE (primary), cs.MA, q-bio.PE

## Contents

- monograph.tex   : Complete LaTeX source (self-contained, no external figures)
- README.txt      : This file

This submission is entirely self-contained and requires no external images,
bibliography files, or custom class/style files.

## Compilation

Two pdflatex passes are sufficient (no BibTeX step required):

  pdflatex monograph.tex
  pdflatex monograph.tex

The document uses only standard TeX Live / MiKTeX packages:
  inputenc, fontenc, lmodern, geometry, amsmath, amssymb,
  booktabs, tabularx, adjustbox, hyperref, xcolor, microtype,
  parskip, titlesec, authblk, abstract, enumitem, array,
  longtable, tikz, pgfplots

All figures are rendered inline with TikZ/pgfplots.
The bibliography uses the thebibliography environment directly.

## Notes

- Seed 1720, Engine v1.5.0, Schema phase8.4
- Compiled and verified from a clean directory (no auxiliary files present)
- Output: 16 pages, ~434 KB

## License

Code: MIT License  
Paper & Data: CC BY 4.0
