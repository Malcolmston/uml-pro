import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ObjectNode from '../object/ObjectNode'
import React from 'react'
import Types from '../objects'

// Concrete implementation for testing
class MockNode extends ObjectNode {
  toJava(): string {
    return 'public class Mock {}'
  }
}

describe('ObjectNode component', () => {
  const defaultProps = {
    name: 'TestNode',
    x: 100,
    y: 100,
    params: [],
    constants: [],
    constructors: [],
    methods: []
  }

  it('renders correctly with name', () => {
    render(
      <svg>
        <MockNode {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('TestNode')).toBeInTheDocument()
  })

  it('renders type when not CLASS', () => {
    render(
      <svg>
        <MockNode {...defaultProps} type={Types.INTERFACE} />
      </svg>
    )
    expect(screen.getByText('<<interface>>')).toBeInTheDocument()
  })

  it('starts dragging on mousedown', () => {
    const { container } = render(
      <svg>
        <MockNode {...defaultProps} />
      </svg>
    )
    const g = container.querySelector('g')
    
    // We can't easily test the full drag cycle in happy-dom/vitest without more setup,
    // but we can check if handleMouseDown updates state (if it was exposed) 
    // or if the cursor changes.
    
    fireEvent.mouseDown(g!)
    // In ObjectNode.tsx: style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    expect(g).toHaveStyle({ cursor: 'grabbing' })
  })

  it('stops dragging on mouseup', () => {
    const { container } = render(
      <svg>
        <MockNode {...defaultProps} />
      </svg>
    )
    const g = container.querySelector('g')
    
    fireEvent.mouseDown(g!)
    expect(g).toHaveStyle({ cursor: 'grabbing' })
    
    fireEvent.mouseUp(g!)
    expect(g).toHaveStyle({ cursor: 'grab' })
  })
})
