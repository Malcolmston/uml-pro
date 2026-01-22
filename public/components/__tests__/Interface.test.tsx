import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Interface from '../Interface/Interface'
import Visibility from '../visibility'
import React from 'react'

describe('Interface component', () => {
  const defaultProps = {
    name: 'Repository',
    x: 100,
    y: 100,
    methods: [
      { name: 'findById', returnType: 'T', visibility: Visibility.PUBLIC, params: [{name: 'id', type: 'String'}] }
    ]
  }

  it('renders interface name and stereotype', () => {
    render(
      <svg>
        <Interface {...defaultProps} />
      </svg>
    )
    expect(screen.getByText('Repository')).toBeInTheDocument()
    expect(screen.getByText('<<interface>>')).toBeInTheDocument()
  })

  it('renders methods', () => {
    render(
      <svg>
        <Interface {...defaultProps} />
      </svg>
    )
    const methodText = screen.getByText((content, element) => {
      const hasText = (text: string) => element?.textContent?.includes(text);
      return element?.tagName.toLowerCase() === 'text' && 
             hasText('findById') && 
             hasText('id') && 
             hasText('String') && 
             hasText('T');
    });
    expect(methodText).toBeInTheDocument()
  })
})
