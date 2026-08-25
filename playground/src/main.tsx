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
import { InputData, TextInputSchema } from "@jointhedots/input"
import {
   ItemIcon,
   ItemRowRich,
   ItemRowShort,
   LabelButton,
   LabelProps,
   LabelSelected,
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

      <Section title="Icons — one string, composed glyphs" hint='name="bi:lightning-fill[primary]|utility:einstein[badge,info]"'>
         {[
            "bi:house-door-fill[primary]",
            "bi:bell|label:3[badge]",
            "bi:envelope|label:new[badge]",
            "bi:exclamation-triangle-fill[badge,error]",
            "flag:fr", "flag:jp", "avatar:Jean Dupont", "avatar:marie-c",
            "standard:account", "utility:salesforce_page", "fa:github",
            "bi:lightning-fill|utility:einstein[badge,info]",
         ].map(name => (
            <Popup key={name} className="tile-wrap" content={<span className="tile-hint">{name}</span>}>
               <div className="tile" title={name} onClick={() => setLastAction(`icon "${name}"`)}>
                  <Icon size="5.0em" name={name} />
               </div>
            </Popup>
         ))}
      </Section>

      <Section title="Icons — sizes, flags, corners" hint="size=xs|sm|md|lg|raw · flags=primary|success|warning|error|… · badge corners RT/LT/RB/LB">
         <div className="demo-card">
            <div className="demo-row">
               <span className="row-caption">sizes</span>
               {(["xs", "sm", "md", "lg", "3em"] as const).map(size => (
                  <span className="icon-sizes" key={size} title={`size="${size}"`}>
                     <Icon name="bi:star-fill" size={size} />
                  </span>
               ))}
            </div>
            <div className="demo-row">
               <span className="row-caption">color flags</span>
               {["primary", "success", "warning", "error", "secondary"].map(flag => (
                  <span className="icon-sizes" key={flag} title={`[${flag}]`} onClick={() => setLastAction(`flag "${flag}"`)}>
                     <Icon name={`bi:circle-fill[${flag}]`} size="md" />
                  </span>
               ))}
            </div>
            <div className="demo-row">
               <span className="row-caption">badge corners</span>
               {["RT", "LT", "RB", "LB"].map(corner => (
                  <span className="icon-sizes" key={corner} title={`[badge,${corner}]`}>
                     <Icon name={`bi:person-workspace|label:![${corner},error]`} size="lg" />
                  </span>
               ))}
               <span className="icon-sizes" title="[badge,info]"><Icon name="bi:folder|label:42[badge,info]" size="lg" /></span>
            </div>
            <div className="demo-row">
               <span className="row-caption">css vars</span>
               <span className="icon-sizes" title="label:EU[--jtd-avatar-bg=#0e639c]"><Icon name="label:EU[--jtd-avatar-bg=#0e639c]" size="md" /></span>
               <span className="icon-sizes" title="blank & unknown"><Icon name="blank" size="md" /><Icon name="nope:ghost" size="md" /></span>
            </div>
         </div>
      </Section>

      <Section title="Buttons — the full palette" hint="neutral · primary · outline-primary · success · warning · error · text-error · link · base">
         <div className="demo-card">
            <div className="demo-row">
               <Button label="Neutral" icon="bi:sliders" variant="neutral" onClick={() => setLastAction("neutral")} />
               <Button label="Primary" icon="bi:rocket-takeoff" variant="primary" onClick={() => setLastAction("deployed!")} />
               <Button label="Outline" icon="bi:chat-dots" variant="outline-primary" onClick={() => setLastAction("outline")} />
               <Button label="Approve" icon="bi:check-lg" iconPosition="right" variant="success" onClick={() => setLastAction("approved")} />
            </div>
            <div className="demo-row">
               <Button label="Retry" icon="bi:exclamation-triangle" variant="warning" onClick={() => setLastAction("retrying…")} />
               <Button label="Delete" icon="bi:trash" iconPosition="right" variant="error" onClick={() => setLastAction("deleted")} />
               <Button label="Forget it" variant="text-error" onClick={() => setLastAction("forgotten")} />
               <Button label="Just a link" variant="link" onClick={() => setLastAction("link")} />
               <Button label="Base" variant="base" onClick={() => setLastAction("base")} />
            </div>
             <div className="demo-row">
                <span className="row-caption">disabled</span>
                <Button label="Primary" icon="bi:rocket-takeoff" variant="primary" disabled />
                <Button label="Warning" variant="warning" disabled />
                <Button label="Neutral" variant="neutral" disabled />
             </div>
             <div className="demo-row">
                <span className="row-caption">size</span>
                {(["xs", "sm", "md", "lg"] as const).map(size => (
                   <Button key={size} label="Save" icon="bi:save" size={size} variant="neutral" onClick={() => setLastAction(`saved (${size})`)} />
                ))}
                <Button label="A link" variant="link" size="xs" onClick={() => setLastAction("xs link")} />
             </div>
         </div>
      </Section>

        <Section title="Buttons — icon affordances" hint='variant="icon" × iconVariant · size · tooltip · ButtonIcon variants & faded hover swap'>
         <div className="demo-card">
            <div className="demo-row">
               <span className="row-caption">iconVariant</span>
               <Button icon="bi:gear" variant="icon" title="bare" onClick={() => setLastAction("bare gear")} />
               <Button icon="bi:gear" variant="icon" iconVariant="container" title="container" onClick={() => setLastAction("container gear")} />
               <Button icon="bi:gear" variant="icon" iconVariant="border" title="border" onClick={() => setLastAction("border gear")} />
               <Button icon="bi:gear" variant="icon" iconVariant="border-filled" title="border-filled" onClick={() => setLastAction("border-filled gear")} />
               <Button icon="bi:gear" variant="icon" iconVariant="primary" title="primary" onClick={() => setLastAction("primary gear")} />
            </div>
             <div className="demo-row">
                <span className="row-caption">size</span>
                {(["xs", "sm", "md", "lg"] as const).map(size => (
                   <Button key={size} icon="bi:person" variant="icon" iconVariant="container" size={size} title={`container ${size}`} onClick={() => setLastAction(`icon ${size}`)} />
                ))}
             </div>
            <div className="demo-row">
               <span className="row-caption">tooltip</span>
               <Button icon="bi:question-circle" variant="icon" iconVariant="border"
                  tooltip={<span>Everything is a <b>name string</b> away</span>} />
               <Button label="Hover for help" variant="neutral" icon="bi:info-circle"
                  tooltip={<span>Rich tooltip: <b>bold</b>, <i>italic</i>, any node</span>} />
            </div>
             <div className="demo-row">
                <span className="row-caption">ButtonIcon</span>
                <ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" title="hover me — swap is crossfaded" onClick={() => setLastAction("star toggled")} />
                <ButtonIcon icon="bi:check2-circle" hoveredIcon="bi:check2-all" variant="primary" size="lg" title="primary pill" onClick={() => setLastAction("primary pill")} />
                <ButtonIcon icon="bi:bookmark" hoveredIcon="bi:bookmark-fill" variant="neutral" size="lg" title="neutral pill" onClick={() => setLastAction("neutral pill")} />
                <ButtonIcon icon="bi:gear" hoveredIcon="bi:gear-fill" variant="watermark" size="lg" title="watermark" onClick={() => setLastAction("watermark")} />
             </div>
         </div>
      </Section>

      <Section title="Inputs — every schema widget" hint="the schema decides the widget, onChange coerces the type">
         <DemoForms onAction={setLastAction} />
      </Section>

       <Section title="Inputs — sizes" hint="size=xs|sm|md|lg — same declinations as icons and buttons; the composite carries the metrics">
         <DemoInputSizes onAction={setLastAction} />
      </Section>

      <Section title="Inputs — text types & composed form" hint="TextInputSchema(placeholder, type) · fields assembled in a card">
         <DemoTextInputs onAction={setLastAction} />
         <DemoConnectionCard onAction={setLastAction} />
      </Section>

      <Section title="Items — minimal | outlined variants" hint="variant prop — same rows, quiet chrome vs boxed chrome">
         <DemoItems onAction={setLastAction} />
      </Section>

      <Section title="Items — selection states, decorations, tooling" hint="LabelSelected flags · shape/badge decorations · optional tooling overflow">
          <DemoItemStates onAction={setLastAction} />
       </Section>

      <Section title="Items — long labels" hint="textOverflow=wrap (default) | truncate — truncate keeps a fixed row height">
          <DemoItemOverflow onAction={setLastAction} />
      </Section>

      <Section title="Items — atoms & toolbars" hint="ItemIcon · LabelButton · tooling strips">
         <DemoItemAtoms onAction={setLastAction} />
      </Section>

      <Section title="Layout — panels, menus, dialogs from anywhere" hint="await openDialog(…) / openContextualMenu(…) / submenus / hover previews">
         <DemoLayout onAction={setLastAction} />
      </Section>
   </LocalTheme>
}

function DemoForms({ onAction }: { onAction: (msg: string) => void }) {
   const [name, setName] = useState("Einstein")
   const [level, setLevel] = useState<number>(2)
   const [ratio, setRatio] = useState<number>(1.5)
   const [flavor, setFlavor] = useState("vanilla")
   const [priority, setPriority] = useState("high")
   const [notes, setNotes] = useState("Investigate the anomaly on EU45.")
   const [dryRun, setDryRun] = useState(true)
   return <div className="demo-grid">
      <div className="demo-card">
         <InputData
            label="Agent name"
            value={name}
            schema={TextInputSchema("e.g. Einstein", "text")}
            onChange={v => { setName(v); onAction(`name = "${v}"`) }}
         />
         <InputData
            value={level}
            schema={{ type: "integer" }}
            icon="utility:layers"
            onChange={v => { setLevel(v); onAction(`level = ${v} (a number, not a string)`) }}
            tooling={[{
               name: "Reset level",
               icon: "bi:arrow-clockwise",
               summary: "back to level 1",
               onActivate: () => { setLevel(1); onAction("level reset") },
            }]}
         />
         <InputData
            label="Compression ratio"
            value={ratio}
            schema={{ type: "number" }}
            icon="bi:cone-striped"
            onChange={v => { setRatio(v); onAction(`ratio = ${v}`) }}
         />
      </div>
      <div className="demo-card">
         <InputData
            label="Flavor"
            value={flavor}
            schema={{ type: "string", enum: ["vanilla", "chocolate", "mint"] }}
            icon="bi:cup-straw"
            onChange={v => { setFlavor(v); onAction(`flavor = ${v}`) }}
         />
         <InputData
            label="Deploy priority"
            value={priority}
            schema={{ type: "string", enum: ["blocker", "high", "normal", "low"] }}
            icon="bi:flag"
            onChange={v => { setPriority(v); onAction(`priority = ${v}`) }}
         />
         <InputData
            label="Dry run"
            value={dryRun}
            schema={{ type: "boolean" }}
            onChange={v => { setDryRun(v); onAction(`dry run = ${v} (a boolean)`) }}
         />
      </div>
      <div className="demo-card">
         <InputData
            label="Run notes"
            value={notes}
            schema={{ type: "string", format: "textarea" }}
            icon="bi:journal-text"
            onChange={v => { setNotes(v); onAction(`notes (${v.length} chars)`) }}
            tooling={[{
               name: "Clear notes",
               icon: "bi:eraser",
               summary: "empty the notes",
               onActivate: () => { setNotes(""); onAction("notes cleared") },
            }, {
               name: "Insert template",
               icon: "bi:file-earmark-richtext",
               summary: "pre-filled investigation skeleton",
               optional: true,
               onActivate: () => { setNotes("## Context\n## Steps\n## Outcome"); onAction("template inserted") },
            }]}
         />
      </div>
   </div>
}

function DemoInputSizes({ onAction }: { onAction: (msg: string) => void }) {
   const [text, setText] = useState("scaled field")
   const [flavor, setFlavor] = useState("mint")
   const [watch, setWatch] = useState(false)
   return <div className="demo-grid">
      {(["xs", "sm", "md", "lg"] as const).map(size => (
          <div className="demo-card" key={size}>
             <InputData
                label={`size="${size}"`}
                value={text}
                schema={TextInputSchema("type here…", "text")}
                icon="bi:text-cursor"
                size={size}
                onChange={v => { setText(v); onAction(`${size} = "${v}"`) }}
             />
             <div className="demo-row">
                <Button label="Go" icon="bi:play" size={size} variant="primary" onClick={() => onAction(`${size} go`)} />
                <Button label="Cancel" size={size} variant="neutral" onClick={() => onAction(`${size} cancel`)} />
                <Button icon="bi:gear" variant="icon" iconVariant="border" size={size} title="settings" onClick={() => onAction(`${size} settings`)} />
             </div>
             <InputData
                value={flavor}
                schema={{ type: "string", enum: ["vanilla", "chocolate", "mint"] }}
                icon="bi:cup-straw"
                size={size}
                onChange={v => { setFlavor(v); onAction(`${size} flavor = ${v}`) }}
             />
             <InputData
                value={watch}
                schema={{ type: "boolean" }}
                size={size}
                onChange={v => { setWatch(v); onAction(`${size} watch = ${v}`) }}
             />
          </div>
      ))}
   </div>
}

function DemoTextInputs({ onAction }: { onAction: (msg: string) => void }) {
   const [secret, setSecret] = useState("")
   const [email, setEmail] = useState("")
   const [query, setQuery] = useState("")
   const [phone, setPhone] = useState("")
   return <div className="demo-grid">
      <div className="demo-card">
         <InputData label="API token" value={secret} schema={TextInputSchema("paste your token", "password")} onChange={v => { setSecret(v); onAction(`token (${v.length} chars)`) }} />
         <InputData label="Contact email" value={email} schema={TextInputSchema("ada@lovelace.dev", "email")} onChange={v => { setEmail(v); onAction(`email = "${v}"`) }} />
      </div>
      <div className="demo-card">
         <InputData label="Search" value={query} schema={TextInputSchema("type to filter…", "search")} onChange={v => { setQuery(v); onAction(`query = "${v}"`) }} />
         <InputData label="Phone" value={phone} schema={TextInputSchema("+33 6 12 34 56 78", "tel")} onChange={v => { setPhone(v); onAction(`phone = "${v}"`) }} />
      </div>
   </div>
}

function DemoConnectionCard({ onAction }: { onAction: (msg: string) => void }) {
   const [url, setUrl] = useState("https://eu45.salesforce.com")
   const [env, setEnv] = useState("sandbox")
   const [apiVersion, setApiVersion] = useState<number>(60)
   const [watch, setWatch] = useState(false)
   return <div className="demo-card" style={{ marginTop: 16 }}>
      <InputData label="Instance URL" value={url} schema={TextInputSchema("https://eu45.salesforce.com", "text")} onChange={setUrl} />
      <div className="demo-grid">
         <InputData
            label="Environment"
            value={env}
            schema={{ type: "string", enum: ["production", "sandbox", "scratch"] }}
            icon="bi:diagram-3"
            onChange={setEnv}
         />
         <InputData
            label="API version"
            value={apiVersion}
            schema={{ type: "integer" }}
            icon="bi:braces"
            onChange={setApiVersion}
         />
         <InputData
            label="Watch mode"
            value={watch}
            schema={{ type: "boolean" }}
            onChange={setWatch}
         />
      </div>
      <Stack>
         <Button label="Test connection" icon="bi:plug" variant="primary" onClick={() => onAction(`connecting to ${url} (${env}, v${apiVersion})`)} />
         <Button label="Reset" variant="neutral" onClick={() => { setUrl(""); setEnv("sandbox"); setApiVersion(60); setWatch(false); onAction("form reset") }} />
      </Stack>
   </div>
}

function DemoItems({ onAction }: { onAction: (msg: string) => void }) {
   const [picked, setPicked] = useState<string>(null)
   const rows = [
      {
         name: "Production org",
         icon: "standard:account",
         summary: "EU45 — hover me for live metrics",
         content: <div className="popup-hint"><Icon name="bi:activity" /> 1 284 093 API calls today</div>,
      },
      { name: "Sandbox", icon: "bi:box[secondary]", summary: "refreshed 2 days ago" },
      { name: "Scratch org", icon: "bi:lightning-charge-fill[success]", summary: "expires in 21 days" },
   ]
   return <div className="items-demo">
      {(["minimal", "outlined"] as const).map(variant => (
         <ul className="items" key={variant}>
            {rows.map(row => (
               <ItemRowRich
                  key={row.name}
                  {...row}
                  variant={variant}
                  selected={picked === row.name ? LabelSelected.EnabledEditable : undefined}
                  onSelect={() => { setPicked(row.name); onAction(`picked "${row.name}" (${variant})`) }}
                  onActivate={() => onAction(`activated "${row.name}"`)}
                  tooling={[{ name: "Settings", icon: "bi:sliders", onActivate: () => onAction(`${row.name} settings`) }]}
               />
            ))}
            <ItemRowShort
               name="compact row"
               icon="bi:align-start"
               variant={variant}
               onSelect={() => onAction(`compact picked (${variant})`)}
            />
         </ul>
      ))}
   </div>
}

function DemoItemStates({ onAction }: { onAction: (msg: string) => void }) {
   const states: [string, LabelSelected][] = [
      ["none", LabelSelected.None],
      ["enabled", LabelSelected.Enabled],
      ["disabled", LabelSelected.Disabled],
      ["editable", LabelSelected.EnabledEditable],
      ["disabled+editable", LabelSelected.DisabledEditable],
   ]
   const decorated: LabelProps[] = [
      {
          name: "Payment service",
         icon: "bi:credit-card",
         summary: "decorations: colored shape behind the glyph",
         decorations: [{ type: "shape", color: "#0e639c" }],
      },
      {
         name: "Audit log",
         icon: "bi:shield-check[success]",
         summary: "badge decoration pinned on the corner",
         decorations: [{ type: "badge", name: "bi:asterisk" }],
      },
   ]
   return <div className="items-demo">
      <ul className="items">
         {states.map(([label, selected]) => (
            <ItemRowRich
               key={label}
               name={`selected: ${label}`}
               icon="bi:ui-checks"
               summary="click me — the Switch toggles for editable flags"
               selected={selected}
               onSelect={() => onAction(`state ${label} clicked`)}
               onActivate={() => onAction(`state ${label} activated`)}
            />
         ))}
         <ItemRowRich
            name="Content as a function"
            icon="bi:braces"
            summary="hover me — content is (item) => node"
            content={(item) => <div className="popup-hint"><Icon name="bi:funnel" /> rendered for <b>{item.name}</b></div>}
            onActivate={() => onAction("function-content row activated")}
         />
      </ul>
      <ul className="items">
         {decorated.map(row => (
            <ItemRowRich key={row.name} {...row} onActivate={() => onAction(`${row.name} activated`)} />
         ))}
         <ItemRowRich
            name="Tooling with overflow"
            icon="bi:tools"
            summary="optional actions fold into the three-dots menu"
            onActivate={() => onAction("tooling row activated")}
            tooling={[
               { name: "Rename", icon: "bi:pencil", onActivate: () => onAction("tooling: rename") },
               { name: "Duplicate", icon: "bi:copy", onActivate: () => onAction("tooling: duplicate") },
               { name: "Archive", icon: "bi:archive", optional: true, onActivate: () => onAction("tooling: archive") },
               { name: "Delete", icon: "bi:trash", optional: true, onActivate: () => onAction("tooling: delete") },
            ]}
         />
         <ItemRowRich
            name="Rich row, icon fallback"
            summary="no icon prop — name becomes an avatar glyph"
            onActivate={() => onAction("avatar fallback row activated")}
         />
      </ul>
   </div>
}

function DemoItemOverflow({ onAction }: { onAction: (msg: string) => void }) {
   const longName = "Payment service — EU45 sandbox integration (org 00D5g000004Hh1wEAK)"
   const longSummary = "connected app · 1 284 093 API calls today · healthcheck every 5 min"
   return <div className="items-demo">
      {(["wrap", "truncate"] as const).map(mode => (
         <ul className="items" key={mode}>
            <ItemRowRich
               name={`textOverflow: "${mode}"`}
               icon="bi:input-cursor-text"
               summary={mode === "truncate" ? "one line per field — fixed row height" : "long labels flow onto several lines"}
               textOverflow={mode}
               onActivate={() => onAction(`${mode} caption row activated`)}
            />
            <ItemRowRich
               name={longName}
               icon="bi:credit-card"
               summary={longSummary}
               textOverflow={mode}
               onActivate={() => onAction(`${mode} long rich row activated`)}
            />
            <ItemRowShort
               name={longName}
               icon="bi:align-start"
               textOverflow={mode}
               onSelect={() => onAction(`${mode} long short row picked`)}
            />
         </ul>
      ))}
   </div>
}

function DemoItemAtoms({ onAction }: { onAction: (msg: string) => void }) {
   return <div className="demo-grid">
      <div className="demo-card">
         <div className="demo-row">
            <ItemIcon name="Runs" icon="bi:play-circle" summary="open the run list" onActivate={() => onAction("ItemIcon: runs")} />
            <ItemIcon name="Logs" icon="bi:file-text" summary="open the logs" onActivate={() => onAction("ItemIcon: logs")} />
            <ItemIcon name="Marie Curie" onActivate={() => onAction("ItemIcon: avatar fallback")} />
         </div>
         <div className="demo-row">
            <LabelButton name="Debug" icon="bi:bug" summary="attach a debugger" onActivate={() => onAction("LabelButton: debug")} />
            <LabelButton name="Publish" icon="bi:upload" summary="push to the registry" onActivate={() => onAction("LabelButton: publish")} />
            <LabelButton
               name="Details"
               icon="bi:info-circle"
               summary="no onActivate — opens content"
               content={<div className="popup-hint"><Icon name="bi:info-circle" /> LabelButton content menu</div>}
            />
         </div>
      </div>
      <div className="demo-card">
         <div className="items-toolbar">
            <ButtonIcon icon="bi:list-check" title="select mode" onClick={() => onAction("toolbar: select mode")} />
            <ButtonIcon icon="bi:funnel" title="filter" onClick={() => onAction("toolbar: filter")} />
            <ButtonIcon icon="bi:sort-down" title="sort" onClick={() => onAction("toolbar: sort")} />
            <ButtonIcon icon="bi:arrow-clockwise" title="refresh" onClick={() => onAction("toolbar: refresh")} />
            <LabelButton name="Group by" icon="bi:layers" summary="choose the grouping" onActivate={() => onAction("toolbar: group by")} />
         </div>
         <ul className="items">
            <ItemRowShort name="toolbar neighbour" icon="bi:pip" onSelect={() => onAction("toolbar row picked")} />
            <ItemRowShort name="another row" icon="bi:pip-fill" variant="outlined" onSelect={() => onAction("another row picked")} />
         </ul>
      </div>
   </div>
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
   const pickTarget = async (e: React.MouseEvent) => {
      e.stopPropagation()
      const target = await openContextualMenu<string>(e, close => (<>
         <Menu.Item name="This org" icon="standard:account" onClick={() => close("this org")} />
         <Menu.Item name="All orgs" icon="bi:globe" onClick={() => close("all orgs")} />
         <Menu.Separator />
         <Menu.LargeItem name="Deploy targets" icon="bi:hdd-network" summary="pick a scratch org">
            <Menu.Item name="EU45 (prod)" icon="bi:1-circle" onClick={() => close("EU45")} />
            <Menu.Item name="scratch-eu7" icon="bi:2-circle" onClick={() => close("scratch-eu7")} />
         </Menu.LargeItem>
      </>), { variant: "menu" })
      onAction(target ? `menu resolved: "${target}"` : "menu cancelled")
   }
   const configureDeploy = async () => {
      const config = await openDialog<{ env: string, dryRun: boolean }>(resolve => <DeployForm onDone={resolve} />)
      onAction(config ? `deploy configured: ${config.env}${config.dryRun ? " (dry run)" : ""}` : "deploy dialog cancelled")
   }
   return <Stack gap={16} vertical>
      <div className="demo-row">
         <Button label="Ask a question…" icon="bi:chat-dots" variant="outline-primary" onClick={askName} />
         <Button label="Open a menu" icon="bi:list" variant="neutral" onClick={openMenu} />
         <Button label="Pick a target…" icon="bi:crosshair" variant="neutral" onClick={pickTarget} />
         <Button label="Configure deploy…" icon="bi:rocket-takeoff" variant="primary" onClick={configureDeploy} />
      </div>
      <div className="demo-row">
         <Popup position="up-right" content={<div className="popup-hint"><Icon name="bi:lightbulb" /> a popover bubble, anchored and arrowed</div>}>
            <Button label="Hover me (up-right)" icon="bi:info-circle" variant="neutral" />
         </Popup>
         <Popup variant="menu" content={<div className="popup-hint"><Icon name="bi:palette" /> variant="menu" — bare chrome</div>}>
            <Button label="Hover me (menu)" icon="bi:brush" variant="neutral" />
         </Popup>
         <Menu.Anchor onClick={() => onAction("menu anchor clicked")}>
            <Icon name="bi:app-indicator" /> Menu.Anchor zone
         </Menu.Anchor>
      </div>
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
      <InputData label="What is the new name?" value={name} schema={TextInputSchema("Ada", "text")} onChange={setName} />
      <Stack>
         <Button label="Cancel" variant="neutral" onClick={() => onDone(undefined)} />
         <Button label="Rename" variant="primary" icon="bi:check-lg" onClick={() => onDone(name)} />
      </Stack>
   </Stack>
}

function DeployForm({ onDone }: { onDone: (config: { env: string, dryRun: boolean }) => void }) {
   const [env, setEnv] = useState("sandbox")
   const [dryRun, setDryRun] = useState(true)
   const [notes, setNotes] = useState("")
   return <Stack gap={10} padding={16} vertical>
      <InputData
         label="Environment"
         value={env}
         schema={{ type: "string", enum: ["production", "sandbox", "scratch"] }}
         icon="bi:diagram-3"
         onChange={setEnv}
      />
      <InputData
         label="Dry run"
         value={dryRun}
         schema={{ type: "boolean" }}
         onChange={setDryRun}
      />
      <InputData
         label="Notes"
         value={notes}
         schema={{ type: "string", format: "textarea" }}
         onChange={setNotes}
      />
      <Stack>
         <Button label="Cancel" variant="neutral" onClick={() => onDone(undefined)} />
         <Button label="Deploy" variant="primary" icon="bi:rocket-takeoff" disabled={!env} onClick={() => onDone({ env, dryRun })} />
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
