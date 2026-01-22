import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Class from '../class/Class'
import Visibility from '../visibility'
import React from 'react'

describe('Class component', () => {
  const defaultProps = {
    name: 'User',
    x: 100,
    y: 100,
    params: [
      { name: 'username', type: 'String', visibility: Visibility.PRIVATE }
    ],
    autoGettersSetters: true
  }

  it('generates getters and setters automatically', () => {
    render(
      <svg>
        <Class {...defaultProps} />
      </svg>
    )
    // By default they are collapsed, so we should see the placeholder
    expect(screen.getByText('<getters and setters>')).toBeInTheDocument()
  })

  it('toggles getters and setters on click', () => {
    render(
      <svg>
        <Class {...defaultProps} />
      </svg>
    )
    const toggle = screen.getByText('<getters and setters>')
    fireEvent.click(toggle)
    
    expect(screen.getByText('[-] getters and setters')).toBeInTheDocument()
    expect(screen.getByText('+ getUsername(')).toBeInTheDocument()
    expect(screen.getByText('+ setUsername(')).toBeInTheDocument()
  })

  it('renders regular methods alongside generated ones', () => {
    const propsWithMethods = {
      ...defaultProps,
      methods: [
        { name: 'login', returnType: 'boolean', visibility: Visibility.PUBLIC, params: [] }
      ]
    }
    render(
      <svg>
        <Class {...propsWithMethods} />
      </svg>
    )
    expect(screen.getByText('+ login(')).toBeInTheDocument()
    expect(screen.getByText('<getters and setters>')).toBeInTheDocument()
  })
})
