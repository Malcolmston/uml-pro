import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Parameter from '../Parameter'
import Visibility from '../visibility'
import React from 'react'

describe('Parameter component', () => {
  it('renders with default visibility (private)', () => {
    render(
      <svg>
        <Parameter name="id" type="long" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('- id')).toBeInTheDocument()
    expect(screen.getByText('long')).toBeInTheDocument()
  })

  it('renders with public visibility', () => {
    render(
      <svg>
        <Parameter name="count" type="int" visibility={Visibility.PUBLIC} x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('+ count')).toBeInTheDocument()
  })

  it('renders underlined when static', () => {
    const { container } = render(
      <svg>
        <Parameter name="instance" type="App" isStatic={true} x={0} y={0} />
      </svg>
    )
    const textElement = container.querySelector('text')
    expect(textElement).toHaveAttribute('text-decoration', 'underline')
  })

  it('renders uppercase when final', () => {
    render(
      <svg>
        <Parameter name="max value" type="int" isFinal={true} x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('- MAX_VALUE')).toBeInTheDocument()
  })
})
