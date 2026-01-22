import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Enumeration from '../enum/Enum'
import React from 'react'

describe('Enumeration component', () => {
  const defaultProps = {
    name: 'Status',
    x: 100,
    y: 100,
    constants: [
      { name: 'OPEN' },
      { name: 'CLOSED' }
    ]
  }

  it('renders enum name and stereotype', () => {
    render(
      <svg>
        <Enumeration {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('<<enumeration>>')).toBeInTheDocument()
  })

  it('renders enum constants', () => {
    render(
      <svg>
        <Enumeration {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('OPEN')).toBeInTheDocument()
    expect(screen.getByText('CLOSED')).toBeInTheDocument()
  })
})
