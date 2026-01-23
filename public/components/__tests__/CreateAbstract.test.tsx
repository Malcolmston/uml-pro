import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateAbstract from '../window/abstract/Create'
import Visibility from '../visibility'
import React from 'react'

describe('CreateAbstract component', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText(/Create New Abstract Class/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter abstract class name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Abstract Class/i })).toBeDisabled()
    expect(screen.getByRole('heading', { name: /Parameters/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Methods/i })).toBeInTheDocument()
  })

  it('enables Create Abstract Class button when name is valid', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter abstract class name/i)

    fireEvent.change(input, { target: { value: 'BaseService' } })

    const createButton = screen.getByRole('button', { name: /Create Abstract Class/i })
    expect(createButton).toBeEnabled()
  })

  it('adds and removes an abstract method', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
    const nameInput = within(methodSection).getByPlaceholderText('Name')
    const typeInput = within(methodSection).getByPlaceholderText('Return Type')
    const abstractLabel = within(methodSection).getByText(/abstract/i)
    const addButton = within(methodSection).getByRole('button', { name: /\+ Add Method/i })

    fireEvent.change(nameInput, { target: { value: 'execute' } })
    fireEvent.change(typeInput, { target: { value: 'void' } })
    fireEvent.click(abstractLabel)
    fireEvent.click(addButton)

    expect(screen.getByText(/execute\(\): void/)).toBeInTheDocument()
    expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: /Remove method/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/execute\(\): void/)).not.toBeInTheDocument()
  })

  it('calls onAdd with an Abstract component and correct data', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    fireEvent.change(screen.getByPlaceholderText(/Enter abstract class name/i), { target: { value: 'Shape' } })

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
    fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'draw' } })
    fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
    fireEvent.click(within(methodSection).getByText(/abstract/i))
    fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

    fireEvent.click(screen.getByRole('button', { name: /Create Abstract Class/i }))

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
    const callArgs = mockOnAdd.mock.calls[0][0]

    // Verify props passed to the component
    expect(callArgs.props.name).toBe('Shape')
    expect(callArgs.props.methods).toHaveLength(1)
    expect(callArgs.props.methods[0].name).toBe('draw')
    expect(callArgs.props.methods[0].isAbstract).toBe(true)
  })

  describe('Validation and Interaction', () => {
    it('shows error for invalid class name on blur', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter abstract class name/i)

      fireEvent.change(input, { target: { value: '123Base' } })
      fireEvent.blur(input)
      expect(screen.getByText(/class name must be a valid identifier/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate parameter names', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!
      const nameInput = within(paramSection).getByPlaceholderText('Name')
      const typeInput = within(paramSection).getByPlaceholderText('Type')
      const addButton = within(paramSection).getByRole('button', { name: /\+ Add Parameter/i })

      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(addButton)

      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Parameter name already exists/i)).toBeInTheDocument()
    })

    it('handles method editing with abstract modifier', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
      
      // Add non-abstract method
      fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'init' } })
      fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
      fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

      // Edit to be abstract
      fireEvent.click(screen.getByLabelText(/Edit method/i))
      fireEvent.click(within(methodSection).getByText(/abstract/i))
      fireEvent.click(screen.getByText(/Update Method/i))

      expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()
    })
  })

  describe('Initial Data and Preview', () => {
    it('populates from initialData', () => {
      const initialData = {
        className: 'InitialBase',
        params: [{ id: 'p1', name: 'config', type: 'Map', visibility: Visibility.PROTECTED }],
        methods: [{ id: 'm1', name: 'run', returnType: 'void', visibility: Visibility.PUBLIC, isAbstract: true }]
      }

      const { rerender } = render(<CreateAbstract onAdd={mockOnAdd} />)
      rerender(<CreateAbstract onAdd={mockOnAdd} initialData={initialData} />)

      expect(screen.getByDisplayValue('InitialBase')).toBeInTheDocument()
      expect(screen.getByText(/config: Map/)).toBeInTheDocument()
      expect(screen.getByText(/run\(\): void/)).toBeInTheDocument()
      expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()
    })

    it('shows preview with Abstract component', () => {
      render(<CreateAbstract onAdd={mockOnAdd} />)
      fireEvent.change(screen.getByPlaceholderText(/Enter abstract class name/i), { target: { value: 'Base' } })

      expect(screen.getByText(/Preview/i)).toBeInTheDocument()
      // Abstract component shows name and <<abstract>> stereotype
      expect(screen.getByText('Base', { selector: 'text' })).toBeInTheDocument()
      expect(screen.getByText('<<abstract>>', { selector: 'text' })).toBeInTheDocument()
    })
  })

  it('resets form after successful creation', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const nameInput = screen.getByPlaceholderText(/Enter abstract class name/i)
    fireEvent.change(nameInput, { target: { value: 'Base' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Abstract Class/i }))

    expect(mockOnAdd).toHaveBeenCalled()
    expect(nameInput).toHaveValue('')
    expect(mockOnClose).toHaveBeenCalled()
  })
})
