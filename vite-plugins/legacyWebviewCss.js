// Rewrites the final CSS bundle so it works in old Android WebViews (e.g. the
// Android 11 kiosk, whose system WebView cannot be updated).
//
// Tailwind v4 emits CSS that needs Chrome 99+ (@layer, @property, :where(),
// the `translate` property, svh units). Older WebViews silently drop those
// rules, so utilities like `absolute`, `hidden` and `pointer-events-none`
// stop applying and the map can collapse to zero height.
// This runs on the built CSS only, so the dev server is unaffected.
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";

const BROWSERS = ["chrome >= 64", "android >= 64"];

// Tailwind ships @property initial values inside an @supports block aimed at
// Safari/Firefox. Old Chrome lacks @property too, so always apply them.
function unwrapPropertyFallbacks(root) {
  root.walkAtRules("supports", (rule) => {
    if (rule.params.includes("margin-trim")) rule.replaceWith(rule.nodes);
  });
}

// svh/dvh/lvh need Chrome 108; add a plain vh declaration before each one.
function viewportUnitFallbacks(root) {
  root.walkDecls((decl) => {
    if (/\d[sdl]vh\b/.test(decl.value)) {
      decl.cloneBefore({ value: decl.value.replace(/(\d)[sdl]vh\b/g, "$1vh") });
    }
  });
}

// The `translate:` property needs Chrome 104 (Tailwind uses it to centre
// elements and slide panels off-screen). Emit an equivalent `transform:` that
// only applies where `translate` is unsupported, so modern browsers are
// unaffected.
function translateFallbacks(root) {
  const fallbacks = [];
  root.walkDecls("translate", (decl) => {
    const rule = decl.parent;
    if (rule.type !== "rule") return;
    let wrapped = rule.clone({ nodes: [] }).append({
      prop: "transform",
      value: "translate(var(--tw-translate-x,0),var(--tw-translate-y,0))",
    });
    // Keep any wrapping @media so breakpoint variants still apply.
    for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) {
      if (p.name === "media") wrapped = p.clone({ nodes: [] }).append(wrapped);
    }
    fallbacks.push(wrapped);
  });
  if (fallbacks.length) {
    root.append(postcss.atRule({ name: "supports", params: "not (translate:0)", nodes: fallbacks }));
  }
}

// :where() needs Chrome 88 and has no polyfill; :is() can be expanded by
// postcss-preset-env. This only raises specificity slightly.
function whereToIs(root) {
  root.walkRules((rule) => {
    if (rule.selector.includes(":where(")) {
      rule.selector = rule.selector.replace(/:where\(/g, ":is(");
    }
  });
}

const webviewFallbacks = () => ({
  postcssPlugin: "webview-fallbacks",
  Once(root) {
    unwrapPropertyFallbacks(root);
    viewportUnitFallbacks(root);
    translateFallbacks(root);
    whereToIs(root);
  },
});
webviewFallbacks.postcss = true;

export default function legacyWebviewCss() {
  return {
    name: "legacy-webview-css",
    apply: "build",
    enforce: "post",
    async generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".css")) continue;
        const result = await postcss([
          webviewFallbacks(),
          postcssPresetEnv({
            browsers: BROWSERS,
            // Colours, media ranges and nesting are already lowered by Vite's
            // CSS minifier; only add what it can't do.
            stage: false,
            features: {
              "cascade-layers": true,
              "is-pseudo-class": { onComplexSelector: "warning" },
            },
          }),
        ]).process(String(file.source), { from: file.fileName });
        file.source = result.css;
      }
    },
  };
}
