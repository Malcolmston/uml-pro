import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Annotation from '../annotation/Annotation'
import React from 'react'

describe('Annotation component', () => {
  const defaultProps = {
    name: 'Entity',
    x: 100,
    y: 100,
    elements: [
      { name: 'tableName', type: 'String', defaultValue: '""' }
    ]
  }

  it('renders annotation name and stereotype', () => {
    render(
      <svg>
        <Annotation {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('Entity')).toBeInTheDocument()
    expect(screen.getByText('<<annotation>>')).toBeInTheDocument()
  })

  it('converts elements to methods for rendering', () => {
    render(
      <svg>
        <Annotation {...defaultProps} />
      </svg>
    )
    // Annotation elements are converted to public abstract methods in the implementation
    const elementText = screen.getByText((content, element) => {
      const hasText = (text: string) => element?.textContent?.includes(text);
      return element?.tagName.toLowerCase() === 'text' && 
             hasText('tableName') && 
             hasText('String');
    });
    expect(elementText).toBeInTheDocument()
    expect(elementText.textContent).toContain('default ""')
  })
})
