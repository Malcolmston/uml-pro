import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Constructor from '../Constructor'
import Visibility from '../visibility'
import React from 'react'

describe('Constructor component', () => {
  it('renders with name and default visibility', () => {
    render(
      <svg>
        <Constructor name="User" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('+ User(')).toBeInTheDocument()
    expect(screen.getByText(')')).toBeInTheDocument()
  })

  it('renders with parameters', () => {
    render(
      <svg>
        <Constructor 
          name="User" 
          params={[{ name: 'username', type: 'String' }]} 
          x={0} y={0} 
        />
      </svg>
    )
    expect(screen.getByText('+ User(')).toBeInTheDocument()
    expect(screen.getByText('username')).toBeInTheDocument()
    expect(screen.getByText('String')).toBeInTheDocument()
    expect(screen.getByText(')')).toBeInTheDocument()
  })

  it('renders with specified visibility', () => {
    render(
      <svg>
        <Constructor name="User" vis={Visibility.PRIVATE} x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('- User(')).toBeInTheDocument()
  })

  it('applies static and abstract styles', () => {
    const { container } = render(
      <svg>
        <Constructor name="User" isStatic={true} isAbstract={true} x={0} y={0} />
      </svg>
    )
    const textElement = container.querySelector('text')
    expect(textElement).toHaveAttribute('font-style', 'italic')
    expect(textElement).toHaveAttribute('font-weight', 'bold')
  })
})
