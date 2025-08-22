import type { Weapon } from "@/types"

const defaultWeapon: Weapon = {
  entity_class: "Weapon",
  id: "",
  name: "",
  description: "",
  damage: 0,
  concealment: 0,
  reload_value: 0,
  category: "Autoloader Handguns",
  juncture: "Modern",
  mook_bonus: 0,
  kachunk: false,
  image_url: "",
  created_at: "",
  updated_at: "",
  image_positions: [],
}

export const derringer: Weapon = {
  ...defaultWeapon,
  name: "American Derringer Mini-Cop",
  id: "derringer",
  description:
    "Very small .357 Magnum which unlike other autoloaders takes 5 shots to reload.",
  damage: 11,
  concealment: 1,
  reload_value: 6,
  juncture: "Modern",
  mook_bonus: 0,
  category: "Autoloader Handguns",
  kachunk: false,
}

export const ak47: Weapon = {
  ...defaultWeapon,
  name: "AK-47",
  id: "ak47",
  description:
    "The classic Soviet assault rifle. There are a zillion of these around the world. You're especially likely to get shot at with them in nations that used to be Soviet clients or satellites.",
  damage: 13,
  concealment: 5,
  reload_value: 1,
  juncture: "Modern",
  mook_bonus: 2,
  category: "Rifles",
  kachunk: false,
}
