"""Package the prebuilt game without development dependencies or source PNGs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

output = Path('release')
output.mkdir(exist_ok=True)
files = list(Path('dist').rglob('*')) + [
    Path('scripts/serve.mjs'), Path('Start-Windows.cmd'), Path('Start-Pi.sh'),
    Path('README.md'), Path('THIRD_PARTY.md'), Path('public/PHASER-LICENSE.md'),
]
with ZipFile(output / 'KVV-Weichenheld.zip', 'w', ZIP_DEFLATED) as archive:
    for file in files:
        if file.is_file():
            archive.write(file, file.as_posix())
print(output / 'KVV-Weichenheld.zip')
