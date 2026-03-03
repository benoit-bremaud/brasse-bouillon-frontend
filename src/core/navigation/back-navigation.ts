import { Href } from "expo-router";

export type BackNavigationRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

export function navigateBackWithFallback(
  router: BackNavigationRouter,
  fallbackHref: Href,
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
