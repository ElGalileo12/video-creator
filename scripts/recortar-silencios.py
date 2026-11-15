"""Recorta los silencios de la voz de un proyecto (gratis): deja 0,06 s al final de cada frase y acorta
los silencios internos largos. Corre los tiempos de las palabras en tiempos.json y en la memoria de voces.
Uso: python3 scripts/recortar-silencios.py <proyecto> [escena=segundos ...]   (segundos = silencio interno a dejar)
Después: pnpm voz <proyecto> (sale «sin cambios», gratis). Se puede repetir: siempre parte de los originales,
que guarda en .cache/voz/<proyecto>/originales/."""
import json, os, re, shutil, subprocess, sys

raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
proyecto = sys.argv[1]
excepciones = {}  # escena -> lista de silencios a dejar, en orden (o un número para todos)
for a in sys.argv[2:]:
    k, v = a.split('=')
    excepciones[k] = [float(x) for x in v.split(',')]

FINAL = 0.06
UMBRAL = 0.33
DEJAR = 0.26

rt = f'{raiz}/proyectos/{proyecto}/tiempos.json'
t = json.load(open(rt))
memoria = f'{raiz}/.cache/voz/{proyecto}'
originales = f'{memoria}/originales'
os.makedirs(originales, exist_ok=True)


def ffmpeg(*args):
    return subprocess.run(['pnpm', 'exec', 'remotion', 'ffmpeg', '-hide_banner', *args], cwd=raiz, capture_output=True, text=True)


for e in t['escenas']:
    mp3 = f"{raiz}/public/{e['audio']}"
    orig = f"{originales}/{e['firma']}.mp3"
    if not os.path.exists(orig):
        shutil.copyfile(mp3, orig)
        shutil.copyfile(f"{memoria}/{e['firma']}.json", f"{originales}/{e['firma']}.json")
    datos = json.load(open(f"{originales}/{e['firma']}.json"))
    salida = ffmpeg('-i', orig, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-').stderr
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', salida).group(3))
    inicios = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', salida)]
    finales = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', salida)]
    fin_voz = datos['finVoz']
    quitar = []  # (desde, hasta) en el audio original
    internos = 0
    for s, f in zip(inicios, finales):
        if f >= min(dur, fin_voz) - 0.06:  # silencio del final (el mp3 puede terminar unos ms antes)
            quitar.append((s + FINAL, 99))
            continue
        lista = excepciones.get(e['id'])
        dejar = (lista[internos] if internos < len(lista) else lista[-1]) if lista else DEJAR
        internos += 1
        if f - s > max(UMBRAL, dejar + 0.04):
            quitar.append((s + dejar / 2, f - dejar / 2))
    if not quitar:
        print(e['id'], 'sin recortes')
        continue

    def mover(x):
        corrido = 0
        for a, b in quitar:
            if x >= b:
                corrido += b - a
            elif x > a:
                return a - corrido
        return x - corrido

    # Tramos que se conservan
    tramos, cursor = [], 0.0
    for a, b in quitar:
        tramos.append((cursor, a))
        cursor = b
    if cursor < 99:
        tramos.append((cursor, 99))
    filtro = ''.join(f'[0:a]atrim={a:.3f}:{min(b, 60):.3f},asetpts=PTS-STARTPTS[t{i}];' for i, (a, b) in enumerate(tramos))
    filtro += ''.join(f'[t{i}]' for i in range(len(tramos))) + f'concat=n={len(tramos)}:v=0:a=1[s]'
    tmp = f'{originales}/tmp.mp3'
    r = ffmpeg('-y', '-i', orig, '-filter_complex', filtro, '-map', '[s]', '-c:a', 'libmp3lame', '-b:a', '128k', tmp)
    if r.returncode:
        print(r.stderr[-800:])
        sys.exit(1)
    shutil.copyfile(tmp, mp3)
    shutil.copyfile(tmp, f"{memoria}/{e['firma']}.mp3")
    os.remove(tmp)
    palabras = [{'texto': p['texto'], 'inicio': round(mover(p['inicio']), 3), 'fin': round(mover(p['fin']), 3)} for p in datos['palabras']]
    nuevo_fin = round(mover(fin_voz), 3)
    palabras[-1]['fin'] = min(palabras[-1]['fin'], nuevo_fin)
    e['palabras'] = palabras
    e['finVoz'] = nuevo_fin
    json.dump({'palabras': palabras, 'finVoz': nuevo_fin}, open(f"{memoria}/{e['firma']}.json", 'w'), ensure_ascii=False)
    print(f"{e['id']:12s} {fin_voz:5.2f} → {nuevo_fin:5.2f} s")

json.dump(t, open(rt, 'w'), ensure_ascii=False, indent=2)
open(rt, 'a').write('\n')
