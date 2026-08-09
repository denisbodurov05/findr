import { describe, expect, it, jest } from "@jest/globals";

import { getProductsByCategory } from "./productService";

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
});
