import { colors } from "@/config/theme";
import { StoreCell } from "@/types/domain";

const categoryGroups = {
  drinks: new Set([
    "categories.alcohol",
    "categories.beer",
    "categories.other_drinks",
    "categories.energy_drinks",
    "categories.coffee",
    "categories.tea",
  ]),
  fresh: new Set([
    "categories.vegetables",
    "categories.meat",
    "categories.milk",
    "categories.dairy",
    "categories.seafood",
    "categories.fruits",
    "categories.fish",
    "categories.eggs",
  ]),
  pantry: new Set([
    "categories.organic",
    "categories.flours",
    "categories.legumes",
    "categories.canned_food",
    "categories.mayonnaise",
    "categories.butters",
    "categories.cooking_oil",
    "categories.vinegar",
    "categories.pasta",
    "categories.savory_snacks",
    "categories.sauces",
    "categories.dried_goods",
  ]),
  snacks: new Set([
    "categories.biscuits",
    "categories.muesli",
    "categories.sweets",
    "categories.ice_cream",
    "categories.chocolate",
    "categories.nuts",
  ]),
  home: new Set([
    "categories.other",
    "categories.toys",
    "categories.non_food",
    "categories.diy",
    "categories.cleaning",
  ]),
};

export const mapPalette = {
  drinks: "#4CA3C7",
  fresh: "#57A86E",
  pantry: "#C99A3A",
  snacks: "#C65F8D",
  home: "#8675C2",
};

export const mapLegendSections = [
  {
    key: "departments",
    titleKey: "map.legendDepartments",
    items: [
      { key: "drinks", labelKey: "map.legendDrinks", color: mapPalette.drinks },
      { key: "fresh", labelKey: "map.legendFresh", color: mapPalette.fresh },
      { key: "pantry", labelKey: "map.legendPantry", color: mapPalette.pantry },
      { key: "snacks", labelKey: "map.legendSnacks", color: mapPalette.snacks },
      { key: "home", labelKey: "map.legendHome", color: mapPalette.home },
    ],
  },
  {
    key: "store",
    titleKey: "map.legendStorePoints",
    items: [
      { key: "checkout", labelKey: "map.legendCheckout", color: colors.checkout },
      { key: "self-checkout", labelKey: "map.legendSelfCheckout", color: colors.selfCheckout },
      { key: "entry", labelKey: "map.legendEntry", color: colors.entry },
      { key: "exit", labelKey: "map.legendExit", color: colors.exit },
      { key: "blocked", labelKey: "map.legendBlocked", color: colors.blocked },
    ],
  },
  {
    key: "route",
    titleKey: "map.legendNavigation",
    items: [{ key: "route", labelKey: "map.legendRoute", color: colors.route }],
  },
] as const;

export function getCellColor(cell: StoreCell) {
  switch (cell.category) {
    case "entry":
      return colors.entry;
    case "exit":
      return colors.exit;
    case "blocked_path":
      return colors.blocked;
    case "normal_checkout":
      return colors.checkout;
    case "self_checkout":
      return colors.selfCheckout;
    default:
      return getProductCategoryColor(cell.category);
  }
}

function getProductCategoryColor(category: string) {
  if (categoryGroups.drinks.has(category)) {
    return mapPalette.drinks;
  }

  if (categoryGroups.fresh.has(category)) {
    return mapPalette.fresh;
  }

  if (categoryGroups.pantry.has(category)) {
    return mapPalette.pantry;
  }

  if (categoryGroups.snacks.has(category)) {
    return mapPalette.snacks;
  }

  if (categoryGroups.home.has(category)) {
    return mapPalette.home;
  }

  return colors.aisle;
}
