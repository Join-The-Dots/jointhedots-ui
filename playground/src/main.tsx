import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "@jointhedots/theme"
import "@jointhedots/icon/bootstrap"
import "@jointhedots/icon/font-awesome"
import "@jointhedots/icon/flag-icons"
import "@jointhedots/icon/salesforce"
import { DarkTheme, LightTheme, LocalTheme } from "@jointhedots/theme"
import { Icon } from "@jointhedots/icon"
import { Button, ButtonIcon } from "@jointhedots/button"
import { InputData, TextInput } from "@jointhedots/input"
import {
   ItemRowRich,
   Menu,
   OverflowStack,
   Popup,
   Stack,
   openContextualMenu,
   openDialog,
} from "@jointhedots/layout"
import "./app.css"

function App() {
   const [light, setLight] = useState(false)
   const [lastAction, setLastAction] = useState("nothing yet — try the demos")
   useEffect(() => {
      document.body.className = light ? "theme-light" : "theme-dark"
   }, [light])
   return <LocalTheme theme={light ? LightTheme : DarkTheme}>
      <header>
         <h1><Icon name="standard:einstein[badge,info]" size="lg" /> Join.The.Dots UI</h1>
         <ButtonIcon
            icon={light ? "bi:moon-stars-fill" : "bi:sun-fill"}
            hoveredIcon={light ? "bi:sun-fill" : "bi:moon-stars-fill"}
            size="lg"
            title="Toggle theme"
            onClick={() => setLight(!light)}
         />
      </header>

      <p className="last-action">
         <Icon name="bi:terminal" /> last action: <b>{lastAction}</b>
      </p>

      <Section title="Icons — one string, composed glyphs" hint='name="bi:zap[primary]|utility:einstein[badge,info]"'>
         {[
            "bi:house-door-fill[primary]",
            "bi:bell|badge:3",
            "bi:envelope|badge:new",
            "bi:exclamation-triangle-fill[badge,error]",
            "flag:fr", "flag:jp", "avatar:Jean Dupont", "avatar:marie-c",
            "standard:account", "utility:salesforce_page", "fa:github",
            "bi:zap[primary]|utility:einstein[badge,info]",
         ].map(name => (
            <div key={name} className="tile" title={name} onClick={() => setLastAction(`icon "${name}"`)}>
               <Icon size="5.0em" name={name} />
            </div>
         ))}
      </Section>

      <Section title="Buttons — SLDS variants, tooltips, hover swap" hint="variant / tooltip / hoveredIcon / inverse icons">
         <Stack gap={8}>
            <Button label="Deploy" icon="bi:rocket-takeoff" variant="brand" onClick={() => setLastAction("deployed!")} />
            <Button label="Delete" icon="bi:trash" iconPosition="right" variant="destructive" />
            <Button label="Just a link" variant="link" />
            <Button icon="bi:question-circle" variant="icon" iconVariant="border"
               tooltip={<span>Everything is a <b>name string</b> away</span>} />
            <ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" title="hover me" />
            <ButtonIcon icon="bi:gear" hoveredIcon="bi:gear-fill" variant="watermark" size="lg" />
         </Stack>
      </Section>

      <Section title="Inputs — driven by a JSON schema" hint="the schema decides the widget, onChange coerces the type">
         <DemoForms onAction={setLastAction} />
      </Section>

      <Section title="Layout — panels, menus, dialogs from anywhere" hint="await openDialog(…) / openContextualMenu(…) / hover previews">
         <DemoLayout onAction={setLastAction} />
      </Section>
   </LocalTheme>
}

function DemoForms({ onAction }: { onAction: (msg: string) => void }) {
   const [name, setName] = useState("Einstein")
   const [level, setLevel] = useState<number>(2)
   const [flavor, setFlavor] = useState("vanilla")
   return <Stack gap={10} vertical>
      <TextInput label="Agent name" value={name} onChange={v => { setName(v); onAction(`name = "${v}"`) }} />
      <InputData
         value={level}
         schema={{ type: "integer" }}
         icon="utility:layers"
         onChange={v => { setLevel(v); onAction(`level = ${v} (a number, not a string)`) }}
         tooling={[{ icon: "bi:arrow-clockwise", onClick: () => { setLevel(1); onAction("level reset") } }]}
      />
      <InputData
         value={flavor}
         schema={{ type: "string", enum: ["vanilla", "chocolate", "mint"] }}
         icon="bi:cup-straw"
         onChange={v => { setFlavor(v); onAction(`flavor = ${v}`) }}
      />
   </Stack>
}

function DemoLayout({ onAction }: { onAction: (msg: string) => void }) {
   const askName = async () => {
      const name = await openDialog<string>(resolve => <AskName initial="Ada" onDone={resolve} />)
      onAction(name ? `dialog resolved: "${name}"` : "dialog cancelled")
   }
   const openMenu = (e: React.MouseEvent) => {
      e.stopPropagation()
      openContextualMenu(e, close => (
         <div>
            <Menu.Section title="Org">
               <Menu.Item name="Inspect" icon="bi:search" onClick={() => { close(); onAction("inspect") }} />
               <Menu.Item name="Rename…" icon="bi:pencil" onClick={() => { close(); askName() }} />
               <Menu.Separator />
               <Menu.Item name="Delete" icon="bi:trash[error]" onClick={() => { close(); onAction("deleted") }} />
            </Menu.Section>
         </div>
      ))
   }
   return <Stack gap={16}>
      <Button label="Ask a question…" icon="bi:chat-dots" variant="outline-brand" onClick={askName} />
      <Button label="Open a menu" icon="bi:list" variant="neutral" onClick={openMenu} />
      <Popup content={<div className="popup-hint"><Icon name="bi:lightbulb" /> a panel, just by hovering</div>}>
         <Button label="Hover me" icon="bi:info-circle" variant="neutral" />
      </Popup>
      <ul className="items">
         <ItemRowRich
            name="Production org"
            icon="standard:account"
            summary="EU45 — hover me for live metrics"
            content={<div className="popup-hint"><Icon name="bi:activity" /> 1 284 093 API calls today</div>}
            onActivate={() => onAction('activated "Production org"')}
            tooling={[{ name: "Settings", icon: "bi:sliders", onActivate: () => onAction("org settings") }]}
         />
         <ItemRowRich
            name="Sandbox"
            icon="bi:box[secondary]"
            summary="refreshed 2 days ago"
            onActivate={label => onAction(`activated "${label.name}"`)}
         />
      </ul>
      <OverflowStack>
         {Array.from({ length: 10 }, (_, i) => (
            <ButtonIcon key={i} icon={`bi:${i}-circle`} title={`action ${i}`} onClick={() => onAction(`action ${i}`)} />
         ))}
      </OverflowStack>
   </Stack>
}

function AskName({ initial, onDone }: { initial: string, onDone: (name: string) => void }) {
   const [name, setName] = useState(initial)
   return <Stack gap={10} padding={16} vertical>
      <TextInput label="What is the new name?" value={name} onChange={setName} />
      <Stack>
         <Button label="Cancel" variant="neutral" onClick={() => onDone(undefined)} />
         <Button label="Rename" variant="brand" icon="bi:check-lg" onClick={() => onDone(name)} />
      </Stack>
   </Stack>
}

function Section(props: { title: string, hint?: string, children: React.ReactNode }) {
   return <section>
      <h2>{props.title}</h2>
      {props.hint && <p className="hint">{props.hint}</p>}
      {props.children}
   </section>
}

createRoot(document.getElementById("root")).render(<App />)
