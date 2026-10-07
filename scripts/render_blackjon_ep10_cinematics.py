"""Render the episode 10 motion-comic cutscenes from imagegen keyframes.

Requires ffmpeg with libx264 and Noto Sans CJK. This assembles still-art keyframes
with camera movement, dissolves and captions; it is not generative character video.
Run from any directory: python3 scripts/render_blackjon_ep10_cinematics.py
"""
from pathlib import Path
import subprocess

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
ROUTES = {
    'conspiracy': ('공모', '저 이제 안 참아도 되는 거죠.'),
    'erosion': ('침식', '내일도 계시는 거죠.'),
    'collision': ('충돌', '그래서 제가 아직 할 일이 많네요.'),
}


def render(route, title, caption):
    paths = [PUBLIC / f'blackjon_ep10_{route}.png', PUBLIC / 'blackjon_ep10_face.png', PUBLIC / f'blackjon_ep10_{route}_dark.png']
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
    for path, duration in zip(paths, [2.4, 3.6, 4.6]):
        command += ['-loop', '1', '-framerate', '24', '-t', str(duration), '-i', str(path)]
    filters = []
    for index, (zoom, speed) in enumerate([(1, .00045), (1, .00035), (1.0235, .00045)]):
        filters.append(
            f'[{index}:v]scale=1440:2160,setsar=1,'
            f"zoompan=z='{zoom}+on*{speed}':x='iw/2-iw/zoom/2':y='ih*.35-ih/zoom*.35':d=1:s=720x1080:fps=24,"
            f'format=yuv420p,setpts=PTS-STARTPTS,fps=24[v{index}]'
        )
    filters += [
        '[v0][v1]xfade=transition=fade:duration=0.8:offset=1.6,fps=24[mix]',
        '[mix][v2]xfade=transition=fade:duration=0.8:offset=4.4,'
        'vignette=angle=PI/5,fade=t=in:st=0:d=0.4,'
        "drawbox=x=0:y=62:w=iw:h=155:color=black@0.5:t=fill:enable='gte(t,5.4)',"
        f"drawtext=fontfile={FONT}:text='{title}':fontcolor=0xf2d9e7:fontsize=42:x=(w-tw)/2:y=82:alpha='min(1,max(0,(t-5.4)/0.7))',"
        f"drawtext=fontfile={FONT}:text='{caption}':fontcolor=white:fontsize=29:x=(w-tw)/2:y=154:alpha='min(1,max(0,(t-5.9)/0.7))'[out]",
    ]
    command += ['-filter_complex_threads', '1', '-filter_complex', ';'.join(filters), '-map', '[out]', '-t', '9', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(PUBLIC / f'blackjon_ep10_{route}.mp4')]
    subprocess.run(command, check=True)
    print(f'Rendered {route}: 9 seconds, 720x1080, 24 fps', flush=True)


if __name__ == '__main__':
    for route, (title, caption) in ROUTES.items():
        render(route, title, caption)
