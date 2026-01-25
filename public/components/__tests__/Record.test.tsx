import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Record from '../record/record'
import Visibility from '../visibility'
import React from 'react'

describe('Record component', () => {
  const defaultProps = {
    name: 'User',
    x: 100,
    y: 100,
    params: [
      { name: 'id', type: 'int', visibility: Visibility.PRIVATE },
      { name: 'name', type: 'String', visibility: Visibility.PRIVATE }
    ]
  }

  it('renders record stereotype and signature', () => {
    render(
      <svg>
        <Record {...defaultProps} />
      </svg>
    )

    expect(screen.getByText('<<record>>')).toBeInTheDocument()
    expect(screen.getByText('User(id: int, name: String)')).toBeInTheDocument()
  })

  it('does not render a separate parameters section', () => {
    render(
      <svg>
        <Record {...defaultProps} />
      </svg>
    )

    expect(screen.queryByText('- id')).not.toBeInTheDocument()
    expect(screen.queryByText('- name')).not.toBeInTheDocument()
  })
})
