import React from 'react'
import classNames from 'classnames'
import { getHtmlProps } from './getProps'
import { Icon, IconSize } from "@jointhedots/icon"

interface ButtonProps {
   assistiveText?: string
   className?: string | object | any[]
   disabled?: boolean
   hint?: boolean
   icon?: string
   iconPosition?: 'left' | 'right'
   iconSize?: 'xs' | 'sm' | 'md' | 'lg'
   iconVariant?: 'bare' | 'container' | 'border' | 'border-filled' | 'brand' | 'more' | 'global-header'
   id?: string
   inverse?: boolean
   label?: string | React.ReactNode
   onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
   onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: {}) => void
   onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
   onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
   onKeyPress?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
   onKeyUp?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
   onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
   onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
   onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
   onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void
   onRequestFocus?: (component: HTMLButtonElement) => void
   buttonRef?: (component: HTMLButtonElement | null) => void
   requestFocus?: boolean
   responsive?: boolean
   tabIndex?: string
   type?: 'reset' | 'submit' | 'button'
   title?: string
   tooltip?: React.ReactNode
   variant?: 'base' | 'link' | 'neutral' | 'brand' | 'outline-brand' | 'destructive' | 'success' | 'text-destructive' | 'icon'
   style?: React.CSSProperties
   children?: React.ReactNode
}

const defaultProps: Partial<ButtonProps> = {
   disabled: false,
   hint: false,
   iconSize: 'md',
   responsive: false,
   type: 'button',
   variant: 'neutral',
}

export function Button(inProps: ButtonProps) {
   const props = { ...defaultProps, ...inProps }

   const getClassName = (): string => {
      const isIcon = props.variant === 'icon'

      let { iconVariant } = props
      const iconBorder = iconVariant === 'border'
      // The global-header presentation is a container button
      if (iconVariant === 'global-header') {
         iconVariant = 'container'
      }

      return classNames(
         'jtd-button',
         {
            'jtd-button--link': props.variant === 'link',
            [`jtd-button--${props.variant}`]:
               !isIcon && props.variant !== 'base' && props.variant !== 'link' && !props.inverse && !iconVariant,
            'jtd-button--inverse': props.inverse && !isIcon,
            'jtd-button--icon': isIcon,
            [`jtd-button--icon-${iconVariant}`]: isIcon && iconVariant && iconVariant !== 'bare',
            'jtd-button--icon-inverse': props.inverse && isIcon && !iconBorder,
            'jtd-button--icon-border-inverse': props.inverse && isIcon && iconBorder,
            [`jtd-button--icon-${props.iconSize}`]:
               isIcon && iconVariant && props.iconSize !== 'md',
         },
         props.className
      )
   }

   const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (props.onClick) {
         props.onClick(event, {})
      }
   }

   const renderIcon = (name: string): React.ReactNode => {
      const iconSize = !props.iconSize || props.iconVariant ? null : props.iconSize
      return <Icon name={name} inverse={props.inverse} size={iconSize} />
   }

   const renderLabel = (): React.ReactNode => {
      if (props.icon && props.assistiveText) {
         return null
      }
      return props.label
   }

   const ariaLabel =
      props.assistiveText ||
      (props.variant === 'icon' && typeof props.label === 'string' ? props.label : undefined)

   const renderButton = (): React.ReactElement => {
      return (
         <button
            aria-label={ariaLabel}
            className={getClassName()}
            disabled={props.disabled}
            id={props.id}
            onBlur={props.onBlur}
            onClick={handleClick}
            onFocus={props.onFocus}
            onKeyDown={props.onKeyDown}
            onKeyPress={props.onKeyPress}
            onKeyUp={props.onKeyUp}
            onMouseDown={props.onMouseDown}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            onMouseUp={props.onMouseUp}
            ref={(component) => {
               if (props.buttonRef) {
                  props.buttonRef(component)
               }
               if (component && props.requestFocus && props.onRequestFocus) {
                  props.onRequestFocus(component)
               }
            }}
            title={props.title}
            type={props.type || 'button'}
            style={props.style}
            {...getHtmlProps(props)}
         >
            {props.iconPosition === 'right' ? renderLabel() : null}
            {props.icon ? renderIcon(props.icon || '') : null}
            {props.iconPosition === 'left' || !props.iconPosition
               ? renderLabel()
               : null}
            {props.children}
         </button>
      )
   }

   if (props.tooltip) {
      return (
         <span className="jtd-tooltip">
            {renderButton()}
            <span className="jtd-tooltip__content" role="tooltip">{props.tooltip}</span>
         </span>
      )
   }
   return renderButton()
}

export type ButtonIconProps = {
   icon: string
   hoveredIcon?: string
   size?: IconSize | string
   title?: string
   inversed?: boolean
   variant?: "primary" | "secondary" | "watermark"
   className?: string
   style?: React.CSSProperties
   onClick?: React.MouseEventHandler
}

export function ButtonIcon(props: ButtonIconProps) {
   const { icon, hoveredIcon, size, inversed, variant, className, style, ...others } = props
   const baseClass = variant ? `jtd-button-icon ${variant}` : "jtd-button-icon"
   const buttonClass = className ? baseClass + " " + className : baseClass
   const buttonStyle = size ? { ...style, fontSize: size && (IconSize[size] || size) } : style
   if (hoveredIcon) {
      const [hovered, setHovered] = React.useState(false)
      return <div {...others} className={buttonClass} style={buttonStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <Icon name={hovered ? hoveredIcon : icon} inverse={inversed} />
       </div>
   }
   return <div {...others} className={buttonClass} style={buttonStyle}>
       <Icon name={icon} inverse={inversed} />
    </div>
}
