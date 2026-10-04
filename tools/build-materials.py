# The ground's material library: scanned CC0 surfaces (Poly Haven; ambientCG's ice), one per
# material class of the terrain (src/render/materials.js), made into the three images per class the
# terrain shader reads (rgb only: a canvas premultiplies alpha, and where the height was 0 the colour
# would go with it):
#   <class>_a.webp  the scan's albedo over its mean, x0.4 (the world sim's colour stays the ground's
#                   colour; the scan gives its structure: x2.5 in the shader, mean 1)
#   <class>_n.webp  r, g: normal x, y (OpenGL); b: roughness
#   <class>_h.webp  r: height (1st..99th percentile to 0..1); g: ambient occlusion
# every class drawn as one tile of TILE_M metres (it divides the detail period, 4096 m), SIZE px.
#   python3 tools/build-materials.py            (downloads into assets/materials/src/, gitignored)
import io, json, os, sys, urllib.request, zipfile
from PIL import Image
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'materials')
SRC = os.path.join(ROOT, 'src')
SIZE, TILE_M = 1024, 2.0

# class, source, asset, the scan's size across (m)
CLASSES = [
    ('igneous',   'ph', 'rock_face',          2.38),   # granite, andesite
    ('basalt',    'ph', 'dark_rock',          2.42),
    ('layered',   'ph', 'rock_06',            1.5),    # sandstone, shale
    ('carbonate', 'ph', 'marble_rock_01',     2.0),    # limestone, chalk
    ('gravel',    'ph', 'dry_river_pebbles',  2.0),    # alluvium
    ('regolith',  'ph', 'moon_01',            3.1),
    ('sand',      'ph', 'sand_03',            2.0),    # quartz, coral, black sand
    ('crust',     'ph', 'mud_cracked_dry_03', 1.5),    # salt flats, playas
    ('soil',      'ph', 'dirt',               2.0),
    ('cover',     'ph', 'sparse_grass',       2.0),    # the ground under plants
    ('snow',      'ph', 'snow_02',            2.0),
    ('ice',       'acg', 'Ice002',            2.0),
]


def fetch(url, path):
    if os.path.exists(path): return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print('  get', url)
    req = urllib.request.Request(url, headers={'User-Agent': 'starseed-materials'})
    with urllib.request.urlopen(req) as r, open(path + '.part', 'wb') as f: f.write(r.read())
    os.replace(path + '.part', path)


def maps_ph(asset):
    d = os.path.join(SRC, asset)
    out = {}
    for key, name in [('diff', 'diff'), ('nor', 'nor_gl'), ('arm', 'arm'), ('disp', 'disp')]:
        p = os.path.join(d, f'{asset}_{name}_1k.jpg')
        fetch(f'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{asset}/{asset}_{name}_1k.jpg', p)
        out[key] = p
    return out


def maps_acg(asset):
    d = os.path.join(SRC, asset)
    z = os.path.join(d, f'{asset}_1K-JPG.zip')
    fetch(f'https://ambientcg.com/get?file={asset}_1K-JPG.zip', z)
    with zipfile.ZipFile(z) as zf:
        names = zf.namelist()
        pick = lambda tag: next(n for n in names if n.endswith(f'_{tag}.jpg'))
        out = {}
        for key, tag in [('diff', 'Color'), ('nor', 'NormalGL'), ('rough', 'Roughness'), ('disp', 'Displacement')]:
            p = os.path.join(d, os.path.basename(pick(tag)))
            if not os.path.exists(p): open(p, 'wb').write(zf.read(pick(tag)))
            out[key] = p
        ao = [n for n in names if n.endswith('_AmbientOcclusion.jpg')]
        if ao:
            p = os.path.join(d, os.path.basename(ao[0]))
            if not os.path.exists(p): open(p, 'wb').write(zf.read(ao[0]))
            out['ao'] = p
    return out


def load(p, mode):
    return np.asarray(Image.open(p).convert(mode), dtype=np.float64) / 255.0


def retile(a, size_m):
    """a seamless scan -> SIZE px, shown as one TILE_M tile (scaled, not cropped: a crop isn't seamless;
    a 1.5 m scan drawn a third larger, a 3.1 m one a third smaller: the grain still reads)"""
    im = Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8).squeeze())
    out = np.asarray(im.resize((SIZE, SIZE), Image.LANCZOS), dtype=np.float64) / 255.0
    return out if out.ndim == a.ndim else out[..., None]


def ripples(size, rng=np.random.default_rng(7)):
    """sand's wind ripples over one tile, seamless: crests across x, ~TILE_M/16 apart, sinuous, the
    lee side steeper than the stoss, a few joins where a crest forks; returns height (0..1) and its
    slopes (per tile width)"""
    y, x = np.mgrid[0:size, 0:size] / size
    tau = 2 * np.pi
    # (a smooth seamless warp: a few low harmonics of the tile)
    warp = np.zeros_like(x)
    for (kx, ky) in [(1, 1), (2, 1), (1, 3), (3, 2), (2, 4)]:
        a, b = rng.uniform(0, tau, 2)
        warp += rng.uniform(0.15, 0.45) / (kx + ky) * np.sin(tau * (kx * x + ky * y) + a) * np.cos(tau * ky * y + b)
    ph = 16 * x + 1.5 * warp + 0.3 * np.sin(tau * 2 * y + 0.7) + 0.2 * np.sin(tau * 5 * y + 2.1)
    # (forks: pairs of opposite phase windings, a crest ending or splitting at each; their 3x3 images
    # summed so the tile stays seamless)
    for _ in range(7):
        cx, cy = rng.uniform(0, 1, 2)
        dx, dy = rng.uniform(-0.06, 0.06, 2)
        for sgn, ox, oy in [(1, cx, cy), (-1, cx + dx + 0.03, cy + dy + 0.05)]:
            for ix in (-1, 0, 1):
                for iy in (-1, 0, 1):
                    ph += sgn * np.arctan2(y - oy - iy, x - ox - ix) / tau
    f = ph - np.floor(ph)
    # (asymmetric: up the stoss over 70% of the spacing, down the lee over 30%)
    h = np.where(f < 0.7, f / 0.7, (1 - f) / 0.3)
    h = 0.5 - 0.5 * np.cos(np.pi * h)
    gy, gx = np.gradient(h)
    return h, gx * size, gy * size


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def build(name, src, asset, size_m):
    m = maps_ph(asset) if src == 'ph' else maps_acg(asset)
    diff = srgb_to_lin(retile(load(m['diff'], 'RGB'), size_m))
    nor = retile(load(m['nor'], 'RGB'), size_m)
    if 'arm' in m:
        arm = retile(load(m['arm'], 'RGB'), size_m)
        ao, rough = arm[..., 0], arm[..., 1]
    else:
        rough = retile(load(m['rough'], 'L')[..., None], size_m)[..., 0]
        ao = retile(load(m['ao'], 'L')[..., None], size_m)[..., 0] if 'ao' in m else np.ones_like(rough)
    disp = retile(load(m['disp'], 'L')[..., None], size_m)[..., 0]
    if name == 'sand':
        # sand's own structure is its wind's ripples (the scan's is trampled lumps): ripple normals,
        # the scan's grain over them, and the ripples as its height
        h, gx, gy = ripples(SIZE)
        k = 0.008   # (ripple height over the tile: ~1.6 cm on a 12.5 cm spacing)
        rx, ry = -gx * k * 2.0, -gy * k * 2.0
        sx, sy = (nor[..., 0] * 2 - 1) * 0.35, (nor[..., 1] * 2 - 1) * 0.35
        nx, ny = rx + sx, ry + sy
        nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.05, 1))
        l = np.sqrt(nx * nx + ny * ny + nz * nz)
        nor = np.dstack([nx / l * 0.5 + 0.5, ny / l * 0.5 + 0.5, nz / l * 0.5 + 0.5])
        disp = 0.75 * h + 0.25 * disp
    mean = diff.reshape(-1, 3).mean(axis=0)
    # (by its luminance, with a third of its own colour's variation: per channel, a dark or strongly
    # tinted scan's thin channels (dark_rock's blue, 0.009) were mostly its noise, multiplied up)
    lw = np.array([0.2126, 0.7152, 0.0722])
    lum = diff @ lw
    lr = lum / max(float(mean @ lw), 1e-6)
    ratio = (0.7 * lr[..., None] + 0.3 * diff / np.maximum(mean, 1e-3)) * 0.4
    clipped = float((ratio > 1).mean())
    ratio = np.clip(ratio, 0, 1)
    lo, hi = np.percentile(disp, 1), np.percentile(disp, 99)
    height = np.clip((disp - lo) / max(hi - lo, 1e-6), 0, 1)
    n = np.dstack([nor[..., 0], nor[..., 1], rough])
    hm = np.dstack([height, ao, height])
    save = lambda a, tag, q: Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB').save(os.path.join(ROOT, f'{name}_{tag}.webp'), quality=q, method=6)
    save(ratio, 'a', 92); save(n, 'n', 94); save(hm, 'h', 92)
    return {'class': name, 'source': 'Poly Haven' if src == 'ph' else 'ambientCG', 'asset': asset, 'license': 'CC0',
            'meanAlbedo': [round(float(x), 4) for x in mean], 'roughness': round(float(rough.mean()), 3), 'clipped': round(clipped, 4)}


if __name__ == '__main__':
    os.makedirs(ROOT, exist_ok=True)
    only = sys.argv[1:]
    info = []
    for c in CLASSES:
        if only and c[0] not in only: continue
        print(c[0], c[2])
        info.append(build(*c))
    if not only:
        json.dump({'tileM': TILE_M, 'size': SIZE, 'classes': info}, open(os.path.join(ROOT, 'materials.json'), 'w'), indent=1)
    print('done')
