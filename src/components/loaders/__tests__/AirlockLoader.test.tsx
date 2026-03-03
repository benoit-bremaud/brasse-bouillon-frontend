import { render } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";
import { AirlockLoader } from "../AirlockLoader";

function createNoopAnimation(): Animated.CompositeAnimation {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  } as unknown as Animated.CompositeAnimation;
}

describe("AirlockLoader", () => {
  beforeEach(() => {
    jest
      .spyOn(Animated, "timing")
      .mockImplementation(() => createNoopAnimation());
    jest
      .spyOn(Animated, "loop")
      .mockImplementation(() => createNoopAnimation());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exposes accessibility role and custom label", () => {
    const { getByRole, getByLabelText } = render(
      <AirlockLoader accessibilityLabel="Chargement" />,
    );

    expect(getByRole("progressbar")).toBeTruthy();
    expect(getByLabelText("Chargement")).toBeTruthy();
  });

  it("uses Loading as default accessibility label", () => {
    const { getByLabelText } = render(<AirlockLoader />);

    expect(getByLabelText("Loading")).toBeTruthy();
  });
});
