import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Method from '../Method'
import Visibility from '../visibility'
import React from 'react'

describe('Method component', () => {
  it('renders with name, return type and default visibility', () => {
    render(
      <svg>
        <Method name="getEmail" returnType="String" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('- getEmail(')).toBeInTheDocument()
    expect(screen.getByText('String')).toBeInTheDocument()
    expect(screen.getByText(')')).toBeInTheDocument()
  })

  it('renders with parameters', () => {
    render(
      <svg>
        <Method 
          name="setEmail" 
          returnType="void" 
          params={[{ name: 'email', type: 'String' }]} 
          visibility={Visibility.PUBLIC}
          x={0} y={0} 
        />
      </svg>
    )
    expect(screen.getByText('+ setEmail(')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('String')).toBeInTheDocument()
    expect(screen.getByText('void')).toBeInTheDocument()
  })

  it('renders with default value', () => {
    render(
      <svg>
        <Method name="getCount" returnType="int" defaultValue="0" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText(/default 0/)).toBeInTheDocument()
  })

  it('applies abstract and static styles', () => {
    const { container } = render(
      <svg>
        <Method name="process" returnType="void" isAbstract={true} isStatic={true} x={0} y={0} />
      </svg>
    )
    const textElement = container.querySelector('text')
    expect(textElement).toHaveAttribute('font-style', 'italic')
    expect(textElement).toHaveAttribute('text-decoration', 'underline')
  })
})
