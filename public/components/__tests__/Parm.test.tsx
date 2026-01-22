import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Parm from '../Parm'
import React from 'react'

describe('Parm component', () => {
  it('renders name and type', () => {
    render(
      <svg>
        <Parm name="user" type="User" x={0} y={0} />
      </svg>
    )
    expect(screen.getByText('user')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('correctly handles x and y props', () => {
    const { container } = render(
      <svg>
        <Parm name="user" type="User" x={10} y={20} />
      </svg>
    )
    const textElement = container.querySelector('text')
    expect(textElement).toHaveAttribute('x', '10')
    expect(textElement).toHaveAttribute('y', '20')
  })
})
