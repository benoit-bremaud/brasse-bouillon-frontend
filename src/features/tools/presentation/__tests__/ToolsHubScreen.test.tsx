import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { ToolsHubScreen } from "../ToolsHubScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      canGoBack: mockCanGoBack,
    }),
  };
});

describe("ToolsHubScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(false);
  });

  it("renders calculator hub title and known calculator topics", () => {
    render(<ToolsHubScreen />);

    expect(screen.getByText("Calculateurs")).toBeTruthy();
    expect(screen.getByText("Alcool & Densité")).toBeTruthy();
    expect(screen.getByText("Couleur")).toBeTruthy();
    expect(screen.getByText("Le Puits 💧")).toBeTruthy();
  });

  it("opens a calculator card action", () => {
    render(<ToolsHubScreen />);

    const cardAction = screen.getByLabelText(
      "Ouvrir le calculateur Alcool & Densité",
    );

    fireEvent.press(cardAction);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "fermentescibles" },
    });
  });

  it("uses dashboard fallback when pressing header back without history", () => {
    render(<ToolsHubScreen />);

    fireEvent.press(screen.getByLabelText("Retour à l'accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard");
  });

  it("always navigates to dashboard from header back", () => {
    mockCanGoBack.mockReturnValueOnce(true);

    render(<ToolsHubScreen />);

    fireEvent.press(screen.getByLabelText("Retour à l'accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard");
    expect(mockBack).not.toHaveBeenCalled();
  });
});
