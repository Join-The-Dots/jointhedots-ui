const formProps = new Set(['form', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget'])

export function getHtmlProps(props: object): Record<string, unknown> {
   return Object.fromEntries(Object.entries(props).filter(([key]) =>
      formProps.has(key) || key.startsWith("aria-") || key.startsWith("data-")))
}
