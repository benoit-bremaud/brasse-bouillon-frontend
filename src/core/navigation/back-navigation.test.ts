import {
  BackNavigationRouter,
  navigateBackWithFallback,
} from "@/core/navigation/back-navigation";

function createRouter(canGoBack: boolean): {
  router: BackNavigationRouter;
  back: jest.Mock;
  replace: jest.Mock;
} {
  const back = jest.fn();
  const replace = jest.fn();

  return {
    router: {
      canGoBack: () => canGoBack,
      back,
      replace,
    },
    back,
    replace,
  };
}

describe("navigateBackWithFallback", () => {
  it("uses router.back when history is available", () => {
    const { router, back, replace } = createRouter(true);

    navigateBackWithFallback(router, "/(app)/dashboard");

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it("uses router.replace fallback when history is unavailable", () => {
    const { router, back, replace } = createRouter(false);

    navigateBackWithFallback(router, "/(app)/dashboard");

    expect(replace).toHaveBeenCalledWith("/(app)/dashboard");
    expect(back).not.toHaveBeenCalled();
  });

  it("uses router.replace when fallback-first strategy is requested", () => {
    const { router, back, replace } = createRouter(true);

    navigateBackWithFallback(router, "/(app)/dashboard", {
      strategy: "fallback-first",
    });

    expect(replace).toHaveBeenCalledWith("/(app)/dashboard");
    expect(back).not.toHaveBeenCalled();
  });
});
