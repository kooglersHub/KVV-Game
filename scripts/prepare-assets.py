"""Create small local derivatives; keep the supplied PNG originals untouched."""
from pathlib import Path
from PIL import Image, ImageOps

output = Path('public/assets')
output.mkdir(parents=True, exist_ok=True)
for original, name, size in [
    ('IMG_0172.PNG', 'city', (550, 600)),
    ('IMG_0177.PNG', 'tram', (280, 190)),
    ('IMG_0178.PNG', 'bus', (280, 190)),
    ('IMG_0182.PNG', 'panorama', (1024, 472)),
]:
    image = Image.open(original).convert('RGB')
    ImageOps.contain(image, size).save(output / f'{name}.webp', 'WEBP', quality=84)
print('Prepared four KVV images.')
