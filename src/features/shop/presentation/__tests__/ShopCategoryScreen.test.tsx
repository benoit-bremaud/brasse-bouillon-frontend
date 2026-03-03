import { fireEvent, render, screen } from "@testing-library/react-native";

import { ShopCategoryScreen } from "@/features/shop/presentation/ShopCategoryScreen";
import React from "react";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
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

describe("ShopCategoryScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockReplace.mockClear();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(false);
  });

  it("renders empty state for invalid category", () => {
    render(<ShopCategoryScreen categoryParam="invalid-category" />);

    expect(screen.getByText("Catégorie inconnue")).toBeTruthy();
    expect(screen.getByText("Catégorie invalide")).toBeTruthy();
  });

  it("renders category header for valid category", () => {
    render(<ShopCategoryScreen categoryParam="malts" />);

    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Pale, Munich, Pilsner, Vienne...")).toBeTruthy();
  });

  it("renders coming soon message with category name", () => {
    render(<ShopCategoryScreen categoryParam="houblons" />);

    expect(
      screen.getByText(/Bientôt disponible : commande en ligne de houblons/),
    ).toBeTruthy();
  });

  it("renders mock products for a valid category", () => {
    render(<ShopCategoryScreen categoryParam="malts" />);

    expect(screen.getByText("Pilsner - Viking Malt")).toBeTruthy();
    expect(screen.getByText("Munich - Weyermann")).toBeTruthy();
  });

  it("renders 'À venir' badge on mock products", () => {
    render(<ShopCategoryScreen categoryParam="kits" />);

    expect(screen.getByText("Kit Beginner IPA")).toBeTruthy();
    expect(screen.getAllByText("À VENIR").length).toBeGreaterThan(0);
  });

  it("has back button to shop", () => {
    render(<ShopCategoryScreen categoryParam="levures" />);

    const backButton = screen.getByLabelText("Retour à la boutique");
    fireEvent.press(backButton);

    expect(mockReplace).toHaveBeenCalledWith("/(app)/shop");
  });

  it("uses history back when available from shop category back button", () => {
    mockCanGoBack.mockReturnValueOnce(true);

    render(<ShopCategoryScreen categoryParam="levures" />);

    const backButton = screen.getByLabelText("Retour à la boutique");
    fireEvent.press(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
