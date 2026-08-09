import { describe, expect, it, jest } from "@jest/globals";

import { getProductsByCategory } from "./productService";
import { getPath } from "./routingService";
import { getStoreLabel } from "../features/store/storeLabel";

describe("mobile API normalization", () => {
  it("normalizes numeric product IDs returned by the API", async () => {
    const api = {
      get: jest.fn().mockResolvedValue({
        data: {
          Produce: [
            {
              productId: 42,
              name: "Apples",
              image: "https://example.test/apple.png",
            },
          ],
        },
      }),
    };

    await expect(getProductsByCategory(api, 3)).resolves.toEqual({
      Produce: [
        {
          productId: "42",
          name: "Apples",
          image: "https://example.test/apple.png",
          imageUri: "https://example.test/apple.png",
        },
      ],
    });
    expect(api.get).toHaveBeenCalledWith("/products/grouped-by-categories/store/3");
  });

  it("formats pathfinding IDs for the API and normalizes the response", async () => {
    const api = {
      get: jest.fn().mockResolvedValue({
        data: {
          path: ["E", "P42", "X"],
          sorted: [
            {
              productId: 42,
              name: "Apples",
              image: null,
            },
          ],
        },
      }),
    };

    await expect(getPath(api, ["42"], 7)).resolves.toEqual({
      path: ["E", "P42", "X"],
      sorted: [
        {
          productId: "42",
          name: "Apples",
          image: null,
          imageUri: undefined,
        },
      ],
    });
    expect(api.get).toHaveBeenCalledWith("/pathfind/7", {
      params: { products: "P42" },
    });
  });

  it("labels stores using their API name and ID", () => {
    expect(getStoreLabel({ id: 3, name: "Central Market" })).toBe("Central Market (#3)");
  });
});
