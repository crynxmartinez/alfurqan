import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: ["node_modules/**", ".next/**", "prisma/**"],
  },
  {
    rules: {
      // Flags the standard "fetch on mount" useEffect pattern used
      // throughout this app's client components as an error; treated as a
      // warning here rather than rewriting every data-loading component.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
