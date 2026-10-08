import type { BlackjonRoute } from "./gameTypes";

export const BLACKJON_ROUTES: Record<BlackjonRoute, { label: string; description: string }> = {
  conspiracy: { label: "공모", description: "그 집착을 알아보고, 받아주는 관계" },
  erosion: { label: "침식", description: "밀어내지 못한 마음이 조금씩 양보하는 관계" },
  collision: { label: "충돌", description: "거절과 소유욕이 정면으로 부딪치는 관계" },
};
export const BLACKJON_ROUTE_IDS = Object.keys(BLACKJON_ROUTES) as BlackjonRoute[];

// 기존 캐릭터별 자동 저장/불러오기에 포함되는 seenEvents에 보관한다.
// 현재 선택은 하나만 활성화하고, 읽었던 장면 및 완료 기록은 지우지 않는다.
export function getBlackjonRoute(events: Record<string, boolean>): BlackjonRoute | null {
  return BLACKJON_ROUTE_IDS.find((route) => events[`blackjon_route_${route}`]) ?? null;
}

export function selectBlackjonRoute(events: Record<string, boolean>, selected: BlackjonRoute): Record<string, boolean> {
  return {
    ...events,
    ...Object.fromEntries(BLACKJON_ROUTE_IDS.map((route) => [`blackjon_route_${route}`, route === selected])),
  };
}

// 장면 입장 기록이 아닌 완독 기록과 현재 선택을 함께 확인한다.
export function getBlackjonBranchLockReason(id: string, events: Record<string, boolean>): string | null {
  const isCollision12 = id.startsWith("blackjon_ep12_collision_");
  const route = isCollision12 ? "collision" : BLACKJON_ROUTE_IDS.find((branch) => id.startsWith(`blackjon_ep11_${branch}_`));
  if (!route) return null;
  const label = BLACKJON_ROUTES[route].label;
  const previousEpisode = isCollision12 ? 11 : 10;
  if (!events[`blackjon_ep${previousEpisode}_${route}_complete`]) return `흑존 ${previousEpisode}화 ${label} 결말 완독 필요`;
  if (getBlackjonRoute(events) !== route) return `10화에서 ${label} 루트를 선택하세요`;
  return null;
}
