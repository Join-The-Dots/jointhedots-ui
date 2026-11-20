import { IconFontCollection } from "../collections/font.tsx"
import { registerIconCollection } from "../Icon.tsx"
import "font-awesome/css/font-awesome.min.css"

registerIconCollection("fa", new IconFontCollection("fa fa-"))
