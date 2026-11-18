export type Settings = {
  theme: "dark" | "light";
  mode: string;
  displayRate: "second" | "minute" | "hour";
  lang: string;
  /** Add the generators needed to power every building to the chain. */
  includePower: boolean;
  gameSettings: GameSettings;
};

export type GameSettings = {
  items: Record<string, string>;
  belts: Record<string, string>;
  beacons: Record<string, string | null>;
  affinitiesBoosts: Record<string, Record<string, string | null>>;
};
