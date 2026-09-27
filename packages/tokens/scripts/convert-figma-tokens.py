import json, re, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PKG_ROOT = os.path.dirname(SCRIPT_DIR)
SRC = os.path.join(PKG_ROOT, "figma-export")
OUT = os.path.join(PKG_ROOT, "src")

FILES = {
    "color_primitive": "1__Color_Primitive_Variables.json",
    "color_semantic": "2__Color_Semantic_Variables.json",
    "size_primitive": "3__Size_Primitive_Variables.json",
    "size_semantic": "4__Size_Semantic_Variables.json",
    "typography_primitive": "5__Primitive_Typography.json",
    "typography_semantic": "6__Semantic_Typography_Variables.json",
}

def load(key):
    with open(os.path.join(SRC, FILES[key])) as f:
        return json.load(f)

data = {k: load(k) for k in FILES}

# ---- Build a global variable id -> variable record index (across ALL files) ----
id_index = {}
for key, d in data.items():
    for v in d["variables"]:
        id_index[v["id"]] = {"var": v, "source": key}

def slug(s):
    s = s.strip().lower()
    s = s.replace(",", "-")
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\-]", "", s)
    # NOTE: deliberately NOT collapsing repeated dashes here. Figma uses
    # a double-dash prefix (e.g. "padding--2xs") as its own naming
    # convention for a distinct "negative" variant of a token — separate
    # from "padding-2xs" (positive). Collapsing "--" to "-" silently
    # merged these two different tokens under one name, so whichever
    # was processed last clobbered the other (this is how Badge ended up
    # with -2px where it needed +4px). If a genuine multi-dash artifact
    # ever needs cleanup, do it per-case, not globally.
    return s.strip("-")

def path_parts(name):
    return [slug(p) for p in name.split("/") if slug(p)]

def set_nested(tree, parts, value):
    node = tree
    for p in parts[:-1]:
        node = node.setdefault(p, {})
    node[parts[-1]] = value

def rgba_to_css(c):
    r = round(c["r"] * 255)
    g = round(c["g"] * 255)
    b = round(c["b"] * 255)
    a = c.get("a", 1)
    if a >= 0.999:
        return "#{:02x}{:02x}{:02x}".format(r, g, b)
    return "rgba({}, {}, {}, {})".format(r, g, b, round(a, 3))

def ref_path(var_id, mode_hint=None):
    """Return a Style Dictionary reference string for a primitive variable id."""
    rec = id_index.get(var_id)
    if rec is None:
        return None
    v = rec["var"]
    source = rec["source"]
    top = {
        "color_primitive": "color",
        "size_primitive": "size",
        "typography_primitive": "typography",
    }.get(source)
    if top is None:
        return None
    parts = [top] + path_parts(v["name"])
    return "{" + ".".join(parts) + "}"

# =========================================================
# 1. COLOR PRIMITIVE
# =========================================================
color_primitive = {}
for v in data["color_primitive"]["variables"]:
    mode_id = list(v["valuesByMode"].keys())[0]
    resolved = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
    parts = ["color"] + path_parts(v["name"])
    set_nested(color_primitive, parts, {"value": rgba_to_css(resolved)})

# =========================================================
# 2. SIZE PRIMITIVE
# =========================================================
# type: "dimension" tells Style Dictionary's built-in sizePx/sizeRem
# transforms to append units. Without it, numeric size tokens are
# emitted as bare numbers in CSS (e.g. "40" instead of "40px"), which
# is invalid wherever the property expects a length.
size_primitive = {}
for v in data["size_primitive"]["variables"]:
    mode_id = list(v["valuesByMode"].keys())[0]
    val = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
    parts = ["size"] + path_parts(v["name"])
    set_nested(size_primitive, parts, {"value": val, "type": "dimension"})

# =========================================================
# 3. TYPOGRAPHY PRIMITIVE
# =========================================================
# The "weight/*" variables in Figma store the *style name* used to pick
# the font file (e.g. "SemiBold"), not a CSS-valid font-weight. CSS
# needs the numeric weight, so we map it here. (The "italic/*" family
# is left untouched — it's not referenced by any semantic token yet,
# and italic is a font-style axis, not a weight axis, so it will need
# its own handling whenever it's actually wired up.)
WEIGHT_TO_CSS = {
    "thin": "100",
    "extralight": "200",
    "light": "300",
    "regular": "400",
    "medium": "500",
    "semibold": "600",
    "bold": "700",
    "extrabold": "800",
    "black": "900",
}

typography_primitive = {}
for v in data["typography_primitive"]["variables"]:
    mode_id = list(v["valuesByMode"].keys())[0]
    val = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
    parts = ["typography"] + path_parts(v["name"])
    if parts[1] == "weight" and isinstance(val, str):
        key = slug(val)
        val = WEIGHT_TO_CSS.get(key, val)
    set_nested(typography_primitive, parts, {"value": val})

# Manual override: Figma's font-family variables still say "Inter" (the
# Figma file hasn't been updated), but Theya's real source of truth is
# the self-hosted Sora (see packages/tokens/fonts/fonts.css and the
# @font-face rule it declares) — "Clash Grotesk" was a leftover from an
# unrelated reference design system and never had a matching @font-face
# in this package, so it silently fell back to the browser default.
# Keeping this override here means re-running convert.py after a fresh
# Figma export won't silently revert the font. Update this (or the
# Figma variable itself) if the typeface changes again.
FONT_FAMILY_OVERRIDES = {
    "heading": "Sora",
    "body": "Sora",
}
for key, value in FONT_FAMILY_OVERRIDES.items():
    if key in typography_primitive.get("typography", {}).get("font-family", {}):
        typography_primitive["typography"]["font-family"][key]["value"] = value

# =========================================================
# 4. COLOR SEMANTIC (two modes: default / dark)
# =========================================================
color_semantic_modes = data["color_semantic"]["modes"]  # {"27991:1":"default","28001:0":"dark"}
mode_id_to_label = {k: v.lower() for k, v in color_semantic_modes.items()}

color_semantic = {label: {} for label in mode_id_to_label.values()}
unresolved_aliases = []

for v in data["color_semantic"]["variables"]:
    parts = ["color"] + path_parts(v["name"])
    for mode_id, raw in v["valuesByMode"].items():
        label = mode_id_to_label[mode_id]
        if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
            r = ref_path(raw["id"])
            if r is None:
                unresolved_aliases.append((v["name"], raw["id"]))
                resolved = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
                set_nested(color_semantic[label], parts, {"value": rgba_to_css(resolved)})
            else:
                set_nested(color_semantic[label], parts, {"value": r})
        else:
            # literal value (rare)
            set_nested(color_semantic[label], parts, {"value": raw})

# =========================================================
# 5. SIZE SEMANTIC (single mode)
# =========================================================
size_semantic = {}
for v in data["size_semantic"]["variables"]:
    parts = ["size"] + path_parts(v["name"])
    mode_id = list(v["valuesByMode"].keys())[0]
    raw = v["valuesByMode"][mode_id]
    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        r = ref_path(raw["id"])
        if r is None:
            resolved = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
            set_nested(size_semantic, parts, {"value": resolved, "type": "dimension"})
        else:
            set_nested(size_semantic, parts, {"value": r, "type": "dimension"})
    else:
        set_nested(size_semantic, parts, {"value": raw, "type": "dimension"})

# =========================================================
# 6. TYPOGRAPHY SEMANTIC (single mode, composite: font/weight/size/lineheight/letterspacing)
# =========================================================
typography_semantic = {}
for v in data["typography_semantic"]["variables"]:
    parts = ["typography"] + path_parts(v["name"])
    mode_id = list(v["valuesByMode"].keys())[0]
    raw = v["valuesByMode"][mode_id]
    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        r = ref_path(raw["id"])
        if r is None:
            resolved = v["resolvedValuesByMode"][mode_id]["resolvedValue"]
            set_nested(typography_semantic, parts, {"value": resolved})
        else:
            set_nested(typography_semantic, parts, {"value": r})
    else:
        set_nested(typography_semantic, parts, {"value": raw})

# Manual override: design feedback on the Button component said Semibold
# (600) felt too heavy at button sizes and letters were crowding —
# dropped to Medium (500) with a touch of positive tracking. Figma's
# button text styles still say Semibold/0 tracking; update this (or the
# Figma text styles) if that changes again.
BUTTON_TYPOGRAPHY_OVERRIDES = {
    "weight": "{typography.weight.medium}",
    "letter-spacing": "{size.size0-5}",
}
for size_key in ("l", "m", "s"):
    node = typography_semantic.get("typography", {}).get("button", {}).get(size_key)
    if node:
        for prop, value in BUTTON_TYPOGRAPHY_OVERRIDES.items():
            if prop in node:
                node[prop]["value"] = value

# =========================================================
# WRITE OUT
# =========================================================
os.makedirs(f"{OUT}/primitive", exist_ok=True)
os.makedirs(f"{OUT}/semantic", exist_ok=True)

def write(path, obj):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
    print("wrote", path, "-", len(json.dumps(obj)), "bytes")

write(f"{OUT}/primitive/color.json", color_primitive)
write(f"{OUT}/primitive/size.json", size_primitive)
write(f"{OUT}/primitive/typography.json", typography_primitive)

for label, tree in color_semantic.items():
    write(f"{OUT}/semantic/color.{label}.json", tree)

write(f"{OUT}/semantic/size.json", size_semantic)
write(f"{OUT}/semantic/typography.json", typography_semantic)

print()
print("Unresolved aliases (fell back to literal resolved value):", len(unresolved_aliases))
for name, vid in unresolved_aliases[:20]:
    print(" -", name, "->", vid)
