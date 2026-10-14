"""Otimiza as imagens de um app para a página de testadores (WebP, menores que os PNG originais).

Uso (a partir da raiz de cabure-pages), apontando para o repositório rummiclock:
  python3 tools/images.py ../rummiclock/docs/loja rummiclock/img
Gera: banner.webp (1200x300), icon.webp (192x192) e shot-<n>.webp (540x960, capturas em português).
"""
import sys
from pathlib import Path

from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

Image.open(src / "banner-formulario-teste-fechado.png").convert("RGB").resize((1200, 300), Image.LANCZOS).save(
    out / "banner.webp", quality=85, method=6
)
Image.open(src / "icone-512.png").convert("RGB").resize((192, 192), Image.LANCZOS).save(
    out / "icon.webp", quality=90, method=6
)
for name in ("01-inicio", "02-partida", "03-estouro", "04-resultado", "05-ajustes", "06-placar"):
    Image.open(src / "capturas" / "pt" / f"pt-{name}.png").convert("RGB").resize((540, 960), Image.LANCZOS).save(
        out / f"shot-{name}.webp", quality=82, method=6
    )
