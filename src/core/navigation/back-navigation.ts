import { Href } from "expo-router";

export type BackNavigationRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

type NavigateBackWithFallbackOptions = {
  strategy?: "history-first" | "fallback-first";
};

export function navigateBackWithFallback(
  router: BackNavigationRouter,
  fallbackHref: Href,
  options: NavigateBackWithFallbackOptions = {},
) {
  if (options.strategy === "fallback-first") {
    router.replace(fallbackHref);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
