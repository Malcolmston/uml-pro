import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Abstract from '../abstract/Abstract'
import React from 'react'

describe('Abstract component', () => {
  const defaultProps = {
    name: 'Shape',
    x: 100,
    y: 100
  }

  it('renders abstract name and stereotype', () => {
    render(
      <svg>
        <Abstract {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('Shape')).toBeInTheDocument()
    expect(screen.getByText('<<abstract>>')).toBeInTheDocument()
  })
})
