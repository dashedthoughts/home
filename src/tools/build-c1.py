# Builds src/game/track/c1.json from the OpenStreetMap relation 4256008 (Shuto Expressway Inner Circular Route, C1).
# Data © OpenStreetMap contributors, ODbL 1.0. Usage: python3 -I tools/build-c1.py <relation-full.json> <out.json>
import json, math, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
nodes = {e['id']: e for e in d['elements'] if e['type'] == 'node'}
ways = {e['id']: e for e in d['elements'] if e['type'] == 'way'}
rel = [e for e in d['elements'] if e['type'] == 'relation'][0]
LAT0 = 35.6770; LON0 = 139.7570   # roughly the Imperial Palace: the middle of the loop
KX = 111320 * math.cos(math.radians(LAT0)); KY = 110940
def xy(nid):
    n = nodes[nid]; return ((n['lon'] - LON0) * KX, (n['lat'] - LAT0) * KY)
report = {}
def stitch(role):
    segs = [ways[m['ref']] for m in rel['members'] if m['type'] == 'way' and m['role'] == role]
    # oneway ways: chain by matching last node -> first node
    by_start = {}
    for w in segs: by_start.setdefault(w['nodes'][0], []).append(w)
    ends = {w['nodes'][-1] for w in segs}
    best = []
    for start in segs:
        used = {start['id']}; chain = [start]; cur = start['nodes'][-1]
        while True:
            nxt = [w for w in by_start.get(cur, []) if w['id'] not in used]
            if not nxt: break
            w = nxt[0]; used.add(w['id']); chain.append(w); cur = w['nodes'][-1]
        if len(chain) > len(best): best = chain
        if len(best) == len(segs): break
    return best, len(segs)
res = {}
for role in ('Outer directions', 'Inner directions'):
    chain, n = stitch(role)
    pts = []; flags = []
    for w in chain:
        t = w.get('tags', {})
        f = (1 if t.get('tunnel') == 'yes' else 0, 1 if t.get('bridge') == 'yes' else 0, int(t.get('layer', 0) or 0), int(t.get('lanes', 2) or 2))
        for i, nid in enumerate(w['nodes']):
            if pts and i == 0: continue
            pts.append(xy(nid)); flags.append(f)
    closed = math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1])
    length = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
    res[role] = (pts, flags, len(chain), n, closed, length)
    report[role] = dict(ways_used=len(chain), ways_total=n, gap_to_close_m=round(closed, 1), length_m=round(length))
print(json.dumps(report, indent=1))
role = min(res, key=lambda r: res[r][4])   # the direction that closes into a loop
pts, flags, *_ = res[role]
if math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1]) > 1: pts.append(pts[0]); flags.append(flags[-1])
# resample every STEP metres
STEP = 10.0
cum = [0.0]
for a, b in zip(pts, pts[1:]): cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
total = cum[-1]; N = int(total // STEP)
rs = []; rf = []; j = 0
for i in range(N):
    s = i * STEP
    while cum[j + 1] < s: j += 1
    t = (s - cum[j]) / max(1e-9, cum[j + 1] - cum[j])
    rs.append((pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t)); rf.append(flags[j])
# smooth positions a little (OSM nodes are sparse on straights, dense in bends), then heading and curvature
def smooth(a, k):
    n = len(a); o = []
    for i in range(n):
        sx = sy = 0
        for q in range(-k, k + 1): p = a[(i + q) % n]; sx += p[0]; sy += p[1]
        o.append((sx / (2 * k + 1), sy / (2 * k + 1)))
    return o
sm = smooth(rs, 2)
head = [math.atan2(sm[(i + 1) % N][0] - sm[i - 1][0], sm[(i + 1) % N][1] - sm[i - 1][1]) for i in range(N)]  # 0 = north, clockwise positive
curv = []
for i in range(N):
    dh = head[(i + 2) % N] - head[i - 2]
    while dh > math.pi: dh -= 2 * math.pi
    while dh < -math.pi: dh += 2 * math.pi
    curv.append(dh / (4 * STEP))   # rad per metre; + = bending right
# named junctions / interchanges on the loop (motorway_junction nodes)
junc = []
idx = {}
for i, p in enumerate(rs): idx.setdefault((round(p[0] / 30), round(p[1] / 30)), i)
for e in d['elements']:
    if e['type'] == 'node' and e.get('tags', {}).get('highway') == 'motorway_junction':
        x, y = xy(e['id']); bi = min(range(N), key=lambda i: (rs[i][0] - x) ** 2 + (rs[i][1] - y) ** 2)
        if math.hypot(rs[bi][0] - x, rs[bi][1] - y) < 40:
            t = e['tags']; junc.append(dict(s=round(bi * STEP), name=t.get('name', ''), en=t.get('name:en', ''), ref=t.get('ref', '')))
junc.sort(key=lambda j: j['s'])
turn = sum(c * STEP for c in curv)
out_d = dict(
    source='OpenStreetMap relation 4256008, Shuto Expressway Inner Circular Route (C1). Data (c) OpenStreetMap contributors, ODbL 1.0.',
    direction=role, step=STEP, length=round(N * STEP), origin=dict(lat=LAT0, lon=LON0),
    x=[round(p[0], 1) for p in rs], y=[round(p[1], 1) for p in rs],
    curv=[round(c * 1e5) for c in curv],            # 1e-5 rad/m
    tunnel=''.join(str(f[0]) for f in rf), bridge=''.join(str(f[1]) for f in rf),
    layer=[f[2] for f in rf], lanes=[f[3] for f in rf], junctions=junc)
json.dump(out_d, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
rmin = min(1 / abs(c) for c in curv if abs(c) > 1e-6)
print('direction', role, 'length', out_d['length'], 'total turn deg', round(math.degrees(turn)), 'tightest radius m', round(rmin), 'tunnel m', out_d['tunnel'].count('1') * STEP, 'bridge m', out_d['bridge'].count('1') * STEP)
print('junctions', len(junc)); print([(j['s'], j['name'], j['en'], j['ref']) for j in junc])
