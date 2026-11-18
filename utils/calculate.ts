import { Settings } from "@/types";
import { getBeacon, getRecipe } from "./data";
import { getBuildingForItem } from "./settings";

export function calculateItemsPerSecond(
  objective: string,
  buildings: number,
  settings: Settings
) {
  return calculateProductionPerSecond(objective, settings) * buildings;
}

export function calculateBuildings(
  objective: string,
  productsPerSec: number,
  settings: Settings
) {
  return productsPerSec / calculateProductionPerSecond(objective, settings);
}

function calculateProductionPerSecond(objective: string, settings: Settings) {
  const recipe = getRecipe(objective, settings.mode);
  const building = getBuildingForItem(objective, settings);

  let perSec = recipe
    .getOutput(building.getId())
    ?.find((v) => v.id === objective)?.perSec;
  if (!perSec) return 0;

  const beacon = getBeacon(
    settings.gameSettings.beacons[objective] + "",
    settings.mode
  );
  perSec += perSec * beacon.getSpeed();

  const affinity =
    settings.gameSettings.affinitiesBoosts[objective]?.[building.getId()];
  perSec +=
    perSec *
    (building.getAffinities()?.find((v) => v.id === affinity)?.efficiency ?? 0);

  const boost =
    settings.gameSettings.affinitiesBoosts[objective]?.[building.getId()];
  perSec *= building.getBooster()?.find((v) => v.id === boost)?.speed ?? 1;

  return perSec;
}

export type CalcPath = { id: string; amount: number }[];

/**
 * Recipe loops (e.g. water -> reinforced pump -> hydrogen -> electrolyzer -> water)
 * are followed until the extra demand per pass becomes negligible, so totals
 * converge to the exact answer. A loop whose demand does not shrink each pass
 * can never break even, so it is cut off at its first repeat.
 */
export function shouldStopAtCycle(path: CalcPath, id: string, amount: number) {
  const earlier = path.filter((p) => p.id === id);
  if (earlier.length === 0) return false;
  if (amount < 1e-9) return true;
  return earlier.some((p) => amount >= p.amount);
}

/** True when power generation is on and this planet's data has generators. */
export function isPowerEnabled(settings: Settings) {
  return (
    settings.includePower &&
    getRecipe("power", settings.mode).getId() === "power"
  );
}

/**
 * Adds the generator chain for a production chain's power draw.
 * `totalPower` reads the current total draw; `addPower` adds a generator subtree
 * for an amount of power. The generators' own suppliers draw power too, so this
 * repeats for the extra draw until it is negligible — or stops if the extra keeps
 * growing (a setup whose generators can't pay for their own fuel chain).
 */
export function addPowerGeneration(
  settings: Settings,
  totalPower: () => number,
  addPower: (amount: number) => void
) {
  if (!isPowerEnabled(settings)) return;
  let accounted = 0;
  let previousExtra = Infinity;
  for (let i = 0; i < 100; i++) {
    const total = totalPower();
    const extra = total - accounted;
    if (extra < 1e-6 || extra >= previousExtra) return;
    addPower(extra);
    accounted = total;
    previousExtra = extra;
  }
}
