import React, { PureComponent, cloneElement, createRef } from 'react'
import { createPortal } from 'react-dom'
import ButtonA11y from 'react-button-a11y'
import uniqueId from './uniqueId'

import PopoverContent from './PopoverContent'

export default class Popover extends PureComponent {
  constructor(...params) {
    super(...params)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickTrigger = this.handleClickTrigger.bind(this)
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.el = document.createElement('div')
    this.id = uniqueId('popover-')
    this.ref = createRef()
    this.triggerRef = createRef()
    this.popoverRef = createRef()
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props

    if (prevProps.isOpen && !isOpen) {
      this.teardown()
    } else if (!prevProps.isOpen && isOpen) {
      this.setup()
    }
  }

  componentWillUnmount() {
    const { isOpen } = this.props

    if (isOpen) {
      this.teardown()
    }
  }

  getTriggerRect() {
    const rect = this.triggerRef.current.getBoundingClientRect()

    return {
      left: rect.left,
      height: rect.height,
      width: rect.width,
      top: rect.top
    }
  }

  handleClick(e) {
    if (e.currentTarget === this.ref.current) {
      return
    }

    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleClickTrigger() {
    const { isOpen, onClose, onOpen } = this.props

    if (isOpen) {
      onClose()
      return
    }

    onOpen()
  }

  handleDocumentClick() {
    this.props.onClose()
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.triggerRef.current.focus()
      this.props.onClose()
    }
  }

  setup() {
    document.addEventListener('click', this.handleDocumentClick)
    document.addEventListener('keydown', this.handleKeyDown)
    document.body.appendChild(this.el)
  }

  teardown() {
    if (document.getElementById(this.el)) {
      document.body.removeChild(this.el)
    }
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('click', this.handleDocumentClick)
  }

  renderTrigger() {
    const {
      isOpen,
      label,
      trigger: { props, type }
    } = this.props

    return (
      <ButtonA11y
        {...props}
        aria-controls={this.id}
        aria-expanded={isOpen}
        aria-haspopup={true}
        aria-label={label}
        aria-owns={this.id}
        onClick={this.handleClickTrigger}
        element={type}
        ref={this.triggerRef}
      />
    )
  }

  renderPopover() {
    const { content, isOpen, label } = this.props

    if (!isOpen) {
      return null
    }

    const cProps = {
      id: this.id,
      label,
      ref: this.popoverRef,
      triggerRect: this.getTriggerRect()
    }

    if (content.type === PopoverContent) {
      return cloneElement(content, cProps)
    }

    return (
      <PopoverContent {...cProps}>
        {content}
      </PopoverContent>
    )
  }

  render() {
    return (
      <span // eslint-disable-line
        onClick={this.handleClick}
        ref={this.ref}
      >
        {this.renderTrigger()}
        {createPortal(this.renderPopover(), this.el)}
      </span>
    )
  }
}
