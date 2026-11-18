// Generates public/data/vanilla-erekir-v8.json from Mindustry source constants
// (core/src/mindustry/content/Blocks.java, master). Rates are per second at 100%.
// Drill formulas: BeamDrill = size * 60 / drillTime; BurstDrill = size^2 * 60 / drillTime
// (x drillMultipliers); WallCrafter = size * 60 / drillTime (1 sand per wall tile).
// Heat is modelled as a resource: a crafter needing N heat consumes N "heat", a heater
// producing N heat outputs N "heat" — building counts then come out right.
import fs from "fs";

const out = process.argv[2];
const img = (row, col) => ({ row, col });

const items = [
  ["beryllium", "Beryllium", "item", img(1, 2)],
  ["tungsten", "Tungsten", "item", img(1, 3)],
  ["graphite", "Graphite", "item", img(0, 5)],
  ["sand", "Sand", "item", img(0, 4)],
  ["silicon", "Silicon", "item", img(0, 11)],
  ["oxide", "Oxide", "item", img(1, 4)],
  ["carbide", "Carbide", "item", img(1, 5)],
  ["thorium", "Thorium", "item", img(0, 10)],
  ["phase-fabric", "Phase fabric", "item", img(0, 13)],
  ["surge-alloy", "Surge alloy", "item", img(0, 14)],
  ["water", "Water", "fluid", img(2, 0)],
  ["slag", "Slag", "fluid", img(2, 1)],
  ["arkycite", "Arkycite", "fluid", img(2, 4)],
  ["ozone", "Ozone", "fluid", img(2, 6)],
  ["hydrogen", "Hydrogen", "fluid", img(2, 7)],
  ["nitrogen", "Nitrogen", "fluid", img(2, 8)],
  ["cyanogen", "Cyanogen", "fluid", img(2, 9)],
  ["neoplasm", "Neoplasm", "fluid", img(2, 5)],
  ["heat", "Heat", "heat", img(9, 13)],
  ["power", "Power", "power", img(1, 6)],
];

// Cliff crushers mine sand from walls; output scales with the wall's sand attribute
// (Blocks.java environment region). Affinity efficiency = attribute - 1 (additive bonus).
const walls = [
  ["stone-wall", "Stone wall", 1, img(5, 10)],
  ["regolith-wall", "Regolith wall", 1, img(5, 11)],
  ["rhyolite-wall", "Rhyolite wall", 1, img(5, 12)],
  ["dune-wall", "Dune wall", 2, img(5, 13)],
  ["sand-wall", "Sand wall", 2, img(5, 14)],
  ["yellow-stone-wall", "Yellow stone wall", 1.5, img(6, 10)],
  ["red-stone-wall", "Red stone wall", 1.5, img(6, 11)],
  ["beryllic-stone-wall", "Beryllic stone wall", 1.2, img(6, 12)],
  ["carbon-wall", "Carbon wall", 0.7, img(6, 13)],
  ["ferric-stone-wall", "Ferric stone wall", 0.5, img(6, 14)],
];
const wallAffinities = walls.map(([id, , attr]) => ({ id, efficiency: +(attr - 1).toFixed(2) }));

const buildings = [
  { id: "plasma-bore", name: "Plasma bore", power: 9, image: img(10, 8),
    optionalEnhancements: { booster: [{ id: "hydrogen", speed: 2.5, perSec: 0.25 }] } },
  { id: "large-plasma-bore", name: "Large plasma bore", power: 48, image: img(10, 9),
    optionalEnhancements: { booster: [{ id: "nitrogen", speed: 2.5, perSec: 3 }] } },
  { id: "impact-drill", name: "Impact drill", power: 160, image: img(10, 6),
    optionalEnhancements: { booster: [{ id: "ozone", speed: 1.6, perSec: 3 }] } },
  { id: "eruption-drill", name: "Eruption drill", power: 360, image: img(11, 4),
    optionalEnhancements: { booster: [{ id: "cyanogen", speed: 1.6, perSec: 0.75 }] } },
  { id: "cliff-crusher", name: "Cliff crusher", power: 11, image: img(11, 12),
    optionalEnhancements: { affinities: wallAffinities } },
  { id: "large-cliff-crusher", name: "Large cliff crusher", power: 60, image: img(11, 13),
    optionalEnhancements: { booster: [{ id: "graphite", speed: 1.6, perSec: 0.75 }], affinities: wallAffinities } },
  { id: "silicon-arc-furnace", name: "Silicon arc furnace", power: 300, image: img(10, 0) },
  { id: "electrolyzer", name: "Electrolyzer", power: 60, image: img(11, 1) },
  { id: "atmospheric-concentrator", name: "Atmospheric concentrator", power: 120, image: img(11, 6) },
  { id: "oxidation-chamber", name: "Oxidation chamber", power: 30, image: img(11, 2) },
  { id: "carbide-crucible", name: "Carbide crucible", power: 120, image: img(10, 1) },
  { id: "surge-crucible", name: "Surge crucible", power: 90, image: img(10, 11) },
  { id: "cyanogen-synthesizer", name: "Cyanogen synthesizer", power: 120, image: img(11, 5) },
  { id: "phase-synthesizer", name: "Phase synthesizer", power: 480, image: img(10, 13) },
  { id: "reinforced-pump", name: "Reinforced pump", image: img(11, 3) },
  { id: "vent-condenser", name: "Vent condenser", power: 30, image: img(11, 0) },
  { id: "turbine-condenser", name: "Turbine condenser", image: img(13, 13) },
  { id: "pyrolysis-generator", name: "Pyrolysis generator", image: img(13, 14) },
  { id: "neoplasia-reactor", name: "Neoplasia reactor", image: img(10, 14) },
  { id: "chemical-combustion-chamber", name: "Chemical combustion chamber", image: img(2, 11) },
  { id: "flux-reactor", name: "Flux reactor", image: img(2, 12) },
  { id: "electric-heater", name: "Electric heater", power: 100, image: img(10, 2) },
  { id: "slag-heater", name: "Slag heater", image: img(10, 7) },
  { id: "phase-heater", name: "Phase heater", image: img(10, 12) },
];

const io = (pairs) => pairs.map(([id, perSec]) => ({ id, perSec }));
const b = (id, input, output) => ({ id, ...(input.length && { input: io(input) }), output: io(output) });

// Shared multi-output / mining recipes
const bore = (item) => b("plasma-bore", [], [[item, 0.75]]);
const largeBore = (item) => b("large-plasma-bore", [["hydrogen", 0.5]], [[item, 1.8]]);
const electrolyzer = b("electrolyzer", [["water", 10]], [["ozone", 4], ["hydrogen", 6]]);
const oxidation = b("oxidation-chamber", [["beryllium", 0.5], ["ozone", 2]], [["oxide", 0.5], ["heat", 5]]);
// Generators: power is in power units/s (powerProduction per tick * 60)
const neoplasia = b("neoplasia-reactor", [["arkycite", 80], ["water", 10], ["phase-fabric", "1/3"]], [["power", 8400], ["neoplasm", 20], ["heat", 60]]);
const turbine = b("turbine-condenser", [], [["power", 180], ["water", 5]]);
const pyrolysis = b("pyrolysis-generator", [["slag", 20], ["arkycite", 40]], [["power", 1400], ["water", 20]]);
const pump = (fluid) => b("reinforced-pump", [["hydrogen", 1.5]], [[fluid, 80]]);

const recipes = {
  beryllium: [bore("beryllium"), largeBore("beryllium"),
    b("impact-drill", [["water", 10]], [["beryllium", "8/3"]]),
    b("eruption-drill", [["hydrogen", 4]], [["beryllium", "32/3"]])],
  graphite: [bore("graphite"), largeBore("graphite")],
  tungsten: [largeBore("tungsten"),
    b("impact-drill", [["water", 10]], [["tungsten", "4/3"]]),
    b("eruption-drill", [["hydrogen", 4]], [["tungsten", "16/3"]])],
  thorium: [largeBore("thorium"), b("eruption-drill", [["hydrogen", 4]], [["thorium", "16/3"]])],
  sand: [b("cliff-crusher", [], [["sand", "12/11"]]), b("large-cliff-crusher", [["hydrogen", 1]], [["sand", 3.75]])],
  silicon: [b("silicon-arc-furnace", [["graphite", 1.2], ["sand", 4.8]], [["silicon", 4.8]])],
  oxide: [oxidation],
  carbide: [b("carbide-crucible", [["tungsten", "32/9"], ["graphite", "16/3"], ["heat", 40]], [["carbide", "16/9"]])],
  "surge-alloy": [b("surge-crucible", [["silicon", 4], ["slag", 160], ["heat", 40]], [["surge-alloy", "4/3"]])],
  "phase-fabric": [b("phase-synthesizer", [["thorium", 4], ["sand", 12], ["ozone", 8], ["heat", 32]], [["phase-fabric", 2]])],
  water: [b("vent-condenser", [], [["water", 30]]), pump("water"), turbine, pyrolysis],
  slag: [pump("slag")],
  arkycite: [pump("arkycite")],
  ozone: [electrolyzer],
  hydrogen: [electrolyzer],
  nitrogen: [b("atmospheric-concentrator", [["heat", 24]], [["nitrogen", 16]])],
  cyanogen: [b("cyanogen-synthesizer", [["graphite", 3], ["arkycite", 160], ["heat", 20]], [["cyanogen", 12]])],
  neoplasm: [neoplasia],
  power: [turbine,
    b("chemical-combustion-chamber", [["ozone", 2], ["arkycite", 40]], [["power", 550]]),
    pyrolysis,
    b("flux-reactor", [["cyanogen", 9], ["heat", 150]], [["power", 18000]]),
    neoplasia],
  heat: [b("electric-heater", [], [["heat", 3]]), b("slag-heater", [["slag", 40]], [["heat", 8]]),
    b("phase-heater", [["phase-fabric", 0.125]], [["heat", 15]]), oxidation, neoplasia],
};

const data = {
  items: items.map(([id, name, category, image]) => ({
    id, name, category, image,
    producedBy: (recipes[id] ?? []).map((r) => r.id),
  })),
  belts: [
    { id: "duct", name: "Duct", speed: 15, image: img(14, 9), transportType: "item" },
    { id: "surge-conveyor", name: "Surge conveyor", speed: 50, image: img(14, 10), transportType: "item" },
    { id: "reinforced-conduit", name: "Reinforced conduit", speed: 640, image: img(14, 11), transportType: "fluid" },
  ],
  buildings,
  beacons: [],
  tiles: [{ id: "other", name: "Other", image: img(0, 0) },
    ...walls.map(([id, name, , image]) => ({ id, name, image }))],
  recipes: Object.entries(recipes).map(([id, bs]) => ({ id, buildings: bs })),
};

// Sanity: every referenced id exists
const itemIds = new Set(data.items.map((i) => i.id));
const bIds = new Set(buildings.map((x) => x.id));
for (const r of data.recipes) for (const x of r.buildings) {
  if (!bIds.has(x.id)) throw new Error("unknown building " + x.id);
  for (const s of [...(x.input ?? []), ...x.output]) if (!itemIds.has(s.id)) throw new Error("unknown item " + s.id);
}
const tileIds = new Set(data.tiles.map((t) => t.id));
for (const x of buildings) for (const a of x.optionalEnhancements?.affinities ?? [])
  if (!tileIds.has(a.id)) throw new Error("unknown tile " + a.id);
for (const x of buildings) for (const bo of x.optionalEnhancements?.booster ?? [])
  if (!itemIds.has(bo.id)) throw new Error("unknown booster " + bo.id);

fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log("items", data.items.length, "buildings", buildings.length, "recipes", data.recipes.length);
