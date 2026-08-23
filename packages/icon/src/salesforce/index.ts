import { IconSVGInnerCollection } from "../collections/svg-inner"
import { registerIconCollection } from "../Icon"
// The only Salesforce stylesheet kept: it colors the sprite glyphs (.slds-icon-standard-* etc.)
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css"
import utility_symbols_svg from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg"
import standard_symbols_svg from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg"
import custom_symbols_svg from "@salesforce-ux/design-system/assets/icons/custom-sprite/svg/symbols.svg"
import action_symbols_svg from "@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg"
import doctype_symbols_svg from "@salesforce-ux/design-system/assets/icons/doctype-sprite/svg/symbols.svg"

registerIconCollection(
   "utility",
   new IconSVGInnerCollection(
      utility_symbols_svg,
      utility_symbols_svg,
      (e) => `slds-icon-utility-${e.name.replace("_", "-")} ${e.className}`,
   ),
)

registerIconCollection(
   "standard",
   new IconSVGInnerCollection(
      standard_symbols_svg,
      standard_symbols_svg,
      (e) => `slds-icon slds-icon-standard-${e.name.replace("_", "-")} ${e.className}`,
   ),
)

registerIconCollection(
   "custom",
   new IconSVGInnerCollection(
      custom_symbols_svg,
      custom_symbols_svg,
      (e) => `slds-icon slds-icon-custom-${e.name.replace("_", "-")} ${e.className}`,
   ),
)

registerIconCollection(
   "action",
   new IconSVGInnerCollection(
      action_symbols_svg,
      action_symbols_svg,
      (e) => `slds-icon slds-icon-action-${e.name.replace("_", "-")} ${e.className}`,
   ),
)

registerIconCollection(
   "doctype",
   new IconSVGInnerCollection(
      doctype_symbols_svg,
      doctype_symbols_svg,
      (e) => `slds-icon slds-icon-doctype-${e.name.replace("_", "-")} ${e.className}`,
   ),
)
