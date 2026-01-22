import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Constant from '../Constant'
import React from 'react'

describe('Constant component', () => {
  it('renders only the name when no values are provided', () => {
    render(
      <svg>
        <Constant name="MAX_SIZE" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('MAX_SIZE')).toBeInTheDocument()
  })

  it('renders name and values when provided', () => {
    render(
      <svg>
        <Constant name="COLORS" values={['RED', 'BLUE']} x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('COLORS(')).toBeInTheDocument()
    expect(screen.getByText('RED,BLUE')).toBeInTheDocument()
    expect(screen.getByText(')')).toBeInTheDocument()
  })
})
