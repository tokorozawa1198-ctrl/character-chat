"""
검은 배경 제거 + 엣지 페더링 스크립트
- 이미지 네 모서리에서 flood-fill로 연결된 배경(어두운 픽셀)을 투명화
- 알파 채널 가장자리에 Gaussian 블러를 적용해 경계선을 부드럽게 처리
- 캐릭터 내부의 어두운 색은 건드리지 않음
"""

import sys
from pathlib import Path
from PIL import Image, ImageFilter
from collections import deque

# 배경으로 판단할 밝기 임계값 (0~255). 높일수록 더 넓은 범위를 배경으로 처리
THRESHOLD = 40
# 가장자리에서 시작하는 flood-fill 샘플 간격
EDGE_SAMPLE_STEP = 4
# 알파 채널 블러 반경 (높을수록 경계가 더 흐릿하게 / 1.0~2.5 권장)
FEATHER_RADIUS = 1.5


def is_background(r: int, g: int, b: int) -> bool:
    """R/G/B 모두 THRESHOLD 이하면 배경으로 판단"""
    return r <= THRESHOLD and g <= THRESHOLD and b <= THRESHOLD


def remove_black_bg(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    visited = [[False] * height for _ in range(width)]
    queue = deque()

    # 가장자리 픽셀 중 배경인 픽셀을 시작점으로 등록
    edges = []
    for x in range(0, width, EDGE_SAMPLE_STEP):
        edges += [(x, 0), (x, height - 1)]
    for y in range(0, height, EDGE_SAMPLE_STEP):
        edges += [(0, y), (width - 1, y)]
    # 네 코너는 반드시 포함
    edges += [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]

    for x, y in edges:
        if 0 <= x < width and 0 <= y < height and not visited[x][y]:
            r, g, b, a = pixels[x, y]
            if is_background(r, g, b):
                visited[x][y] = True
                queue.append((x, y))

    # BFS flood-fill: 배경 픽셀을 완전 투명으로
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and not visited[nx][ny]:
                r, g, b, a = pixels[nx, ny]
                if is_background(r, g, b):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # --- 알파 채널 페더링 ---
    # RGB는 그대로 두고, 알파 채널만 블러 처리해 경계를 자연스럽게
    r_ch, g_ch, b_ch, a_ch = img.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=FEATHER_RADIUS))
    img = Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))

    img.save(dst, "PNG")
    print(f"  OK: {src.name}")


def main():
    targets = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else []

    if not targets:
        print("사용법: python remove_bg.py <파일 또는 폴더> ...")
        sys.exit(1)

    files: list[Path] = []
    for t in targets:
        if t.is_dir():
            files += sorted(t.glob("*.png"))
        elif t.is_file():
            files.append(t)

    if not files:
        print("처리할 PNG 파일이 없습니다.")
        sys.exit(1)

    print(f"총 {len(files)}개 파일 처리 시작...\n")
    for f in files:
        try:
            remove_black_bg(f, f)  # 원본 덮어쓰기
        except Exception as e:
            print(f"  FAIL: {f.name}: {e}")

    print("\n완료!")


if __name__ == "__main__":
    main()
