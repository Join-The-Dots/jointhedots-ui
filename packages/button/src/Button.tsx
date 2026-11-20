import React from 'react'
import classNames from 'classnames'
import { getHtmlProps } from './getProps.ts'
import { Icon, IconSize, FadeIcon } from "@jointhedots/icon"

type ButtonAriaProps = Pick<React.AriaAttributes,
   'aria-haspopup' | 'aria-expanded' | 'aria-controls' | 'aria-pressed' | 'aria-current' | 'aria-describedby'>

interface ButtonProps extends ButtonAriaProps {
   assistiveText?: string
   className?: string | object | any[]
   disabled?: boolean
   href?: string
   target?: string
   rel?: string
   icon?: string
   iconPosition?: 'left' | 'right'
   iconVariant?: 'bare' | 'container' | 'border' | 'border-filled' | 'primary' | 'more' | 'global-header'
   id?: string
   inverse?: boolean
   label?: string | React.ReactNode
   onBlur?: (event: React.FocusEvent<HTMLElement>) => void
   onClick?: (event: React.MouseEvent<HTMLElement>) => void
   onFocus?: (event: React.FocusEvent<HTMLElement>) => void
   onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void
   onKeyUp?: (event: React.KeyboardEvent<HTMLElement>) => void
   onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void
   onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void
   onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void
   onMouseUp?: (event: React.MouseEvent<HTMLElement>) => void
   onRequestFocus?: (component: HTMLElement) => void
   buttonRef?: (component: HTMLElement | null) => void
   requestFocus?: boolean
   size?: 'xs' | 'sm' | 'md' | 'lg'
   tabIndex?: number
   type?: 'reset' | 'submit' | 'button'
   title?: string
   tooltip?: React.ReactNode
   variant?: 'base' | 'link' | 'neutral' | 'primary' | 'outline-primary' | 'error' | 'text-error' | 'success' | 'warning' | 'icon'
   style?: React.CSSProperties
   children?: React.ReactNode
   [key: `data-${string}`]: string | undefined
}

export function Button(props: ButtonProps) {
   const { variant = 'neutral', size = 'md', inverse, icon, assistiveText, label, href, disabled } = props
   const isIcon = variant === 'icon'
   const iconBorder = props.iconVariant === 'border'
   // The global-header presentation is a container button
   const iconVariant = props.iconVariant === 'global-header' ? 'container' : props.iconVariant

   const className = classNames(
      'jtd-button',
      {
         'jtd-button--link': variant === 'link',
         [`jtd-button--${variant}`]: !isIcon && variant !== 'base' && variant !== 'link' && !inverse && !iconVariant,
         'jtd-button--inverse': inverse && !isIcon,
         'jtd-button--icon': isIcon,
         [`jtd-button--icon-${iconVariant}`]: isIcon && iconVariant && iconVariant !== 'bare',
         'jtd-button--icon-inverse': inverse && isIcon && !iconBorder,
         'jtd-button--icon-border-inverse': inverse && isIcon && iconBorder,
         [`jtd-button--${size}`]: size !== 'md',
      },
      props.className,
   )
   const text = icon && assistiveText ? null : label
   const content = <>
      {props.iconPosition === 'right' ? text : null}
      {icon ? <Icon name={icon} inverse={inverse} /> : null}
      {props.iconPosition !== 'right' ? text : null}
      {props.children}
   </>
   const common = {
      'aria-label': assistiveText || (isIcon && typeof label === 'string' ? label : undefined),
      className,
      id: props.id,
      title: props.title,
      style: props.style,
      tabIndex: props.tabIndex,
      onBlur: props.onBlur,
      onClick: disabled ? undefined : props.onClick,
      onFocus: props.onFocus,
      onKeyDown: props.onKeyDown,
      onKeyUp: props.onKeyUp,
      onMouseDown: props.onMouseDown,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onMouseUp: props.onMouseUp,
      ref: (component: HTMLElement | null) => {
         props.buttonRef?.(component)
         if (component && props.requestFocus) props.onRequestFocus?.(component)
      },
      ...getHtmlProps(props),
   }

   const element = href !== undefined
      ? <a
         {...common}
         href={disabled ? undefined : href}
         aria-disabled={disabled || undefined}
         target={props.target}
         rel={props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined)}
      >{content}</a>
      : <button {...common} disabled={disabled} type={props.type || 'button'}>{content}</button>

   if (props.tooltip) {
      return (
         <span className="jtd-tooltip">
            {element}
            <span className="jtd-tooltip__content" role="tooltip">{props.tooltip}</span>
         </span>
      )
   }
   return element
}

export type ButtonIconProps = Pick<React.AriaAttributes, 'aria-haspopup' | 'aria-expanded' | 'aria-controls' | 'aria-pressed'> & {
   icon: string
   /** Accessible name, also shown as the native tooltip. */
   title: string
   hoveredIcon?: string
   size?: keyof typeof IconSize | string
   inversed?: boolean
   variant?: "primary" | "neutral" | "watermark"
   disabled?: boolean
   className?: string
   style?: React.CSSProperties
   onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export function ButtonIcon(props: ButtonIconProps) {
   const { icon, hoveredIcon, size, inversed, variant, className, style, title, ...others } = props
   const [hovered, setHovered] = React.useState(false)
   const buttonClass = classNames("jtd-button-icon", variant, className)
   const buttonStyle = size ? { ...style, fontSize: IconSize[size as keyof typeof IconSize] || size } : style
   return <button
      {...others}
      type="button"
      aria-label={title}
      title={title}
      className={buttonClass}
      style={buttonStyle}
      onMouseEnter={hoveredIcon ? () => setHovered(true) : undefined}
      onMouseLeave={hoveredIcon ? () => setHovered(false) : undefined}
   >
      {hoveredIcon
         ? <FadeIcon name={hovered ? hoveredIcon : icon} inverse={inversed} />
         : <Icon name={icon} inverse={inversed} />}
   </button>
}
