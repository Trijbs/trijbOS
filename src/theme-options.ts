export const accentOptions = [
  { id: "mint", label: "Mint", value: "#7bf7bf" },
  { id: "amber", label: "Amber", value: "#ffb86c" },
  { id: "violet", label: "Violet", value: "#9b8cff" },
  { id: "rose", label: "Rose", value: "#ff7a9f" },
  { id: "cyan", label: "Cyan", value: "#6fd3ff" },
] as const;

export const wallpaperOptions = [
  {
    id: "aurora-grid",
    label: "Aurora Grid",
    value:
      "radial-gradient(circle at 20% 20%, rgba(123, 247, 191, 0.35), transparent 28%), radial-gradient(circle at 80% 10%, rgba(90, 140, 255, 0.28), transparent 30%), linear-gradient(135deg, #0f1720 0%, #1d2834 52%, #28364d 100%)",
  },
  {
    id: "ember-haze",
    label: "Ember Haze",
    value:
      "radial-gradient(circle at 15% 15%, rgba(255, 196, 125, 0.35), transparent 20%), radial-gradient(circle at 80% 25%, rgba(255, 110, 110, 0.2), transparent 25%), linear-gradient(145deg, #241820 0%, #42293f 55%, #8a5b54 100%)",
  },
  {
    id: "deep-nebula",
    label: "Deep Nebula",
    value:
      "radial-gradient(circle at 30% 30%, rgba(116, 215, 255, 0.26), transparent 24%), radial-gradient(circle at 70% 20%, rgba(144, 255, 208, 0.2), transparent 24%), linear-gradient(135deg, #08141c 0%, #163040 50%, #284a56 100%)",
  },
] as const;
