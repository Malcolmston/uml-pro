import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateInterface from '../window/interface/Create'
import Visibility from '../visibility'
import React from 'react'

describe('CreateInterface component', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText(/Create New Interface/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter interface name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Interface/i })).toBeDisabled()
    expect(screen.getByRole('heading', { name: /Constants/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Methods/i })).toBeInTheDocument()
    expect(screen.getByText(/Interface Guidelines/i)).toBeInTheDocument()
  })

  it('enables Create Interface button when interface name is valid', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter interface name/i)

    fireEvent.change(input, { target: { value: 'IMyInterface' } })

    const createButton = screen.getByRole('button', { name: /Create Interface/i })
    expect(createButton).toBeEnabled()
  })

  it('adds and removes a constant', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    const constantSection = screen.getByRole('heading', { name: /Constants/i }).parentElement
    const nameInput = constantSection?.querySelector('input[placeholder="Constant Name"]') as HTMLInputElement
    const typeInput = constantSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Constant/i })

    // Add a constant
    fireEvent.change(nameInput, { target: { value: 'MAX_SIZE' } })
    fireEvent.change(typeInput, { target: { value: 'int' } })
    fireEvent.click(addButton)

    // Verify it's added to the list
    expect(screen.getByText(/MAX_SIZE: int/)).toBeInTheDocument()
    expect(screen.getByText(/public static final/)).toBeInTheDocument()

    // Remove it
    const removeButton = screen.getByRole('button', { name: /Remove constant/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/MAX_SIZE: int/)).not.toBeInTheDocument()
  })

  it('adds and removes a method', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
    const nameInput = methodSection?.querySelector('input[placeholder="Method Name"]') as HTMLInputElement
    const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

    // Add a method
    fireEvent.change(nameInput, { target: { value: 'draw' } })
    fireEvent.change(typeInput, { target: { value: 'void' } })
    fireEvent.click(addButton)

    // Verify it's added to the list
    expect(screen.getByText(/draw\(\): void/)).toBeInTheDocument()
    expect(screen.getByText(/public abstract/)).toBeInTheDocument()

    // Remove it
    const removeButton = screen.getByRole('button', { name: /Remove method/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/draw\(\): void/)).not.toBeInTheDocument()
  })

  it('handles default and static methods', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
    const nameInput = methodSection?.querySelector('input[placeholder="Method Name"]') as HTMLInputElement
    const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
    const defaultCheckbox = screen.getByLabelText(/default/i) as HTMLInputElement
    const staticCheckbox = screen.getByLabelText(/static/i) as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

    // Add default method
    fireEvent.change(nameInput, { target: { value: 'defaultMethod' } })
    fireEvent.change(typeInput, { target: { value: 'void' } })
    fireEvent.click(defaultCheckbox)
    fireEvent.click(addButton)

    expect(screen.getByText(/public default/)).toBeInTheDocument()
    expect(screen.getByText(/defaultMethod\(\): void/)).toBeInTheDocument()

    // Add static method
    fireEvent.change(nameInput, { target: { value: 'staticMethod' } })
    fireEvent.change(typeInput, { target: { value: 'int' } })
    // default checkbox should have been reset if the logic is correct in handleAddMethod, but let's check
    fireEvent.click(staticCheckbox)
    fireEvent.click(addButton)

    expect(screen.getByText(/public static/)).toBeInTheDocument()
    expect(screen.getByText(/staticMethod\(\): int/)).toBeInTheDocument()
  })

  it('calls onAdd with correct data when Create Interface is clicked', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    fireEvent.change(screen.getByPlaceholderText(/Enter interface name/i), { target: { value: 'IDrawable' } })

    // Add a constant
    const constantSection = screen.getByRole('heading', { name: /Constants/i }).parentElement
    const cNameInput = constantSection?.querySelector('input[placeholder="Constant Name"]') as HTMLInputElement
    const cTypeInput = constantSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
    fireEvent.change(cNameInput, { target: { value: 'PI' } })
    fireEvent.change(cTypeInput, { target: { value: 'double' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Constant/i }))

    // Add a method
    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
    const mNameInput = methodSection?.querySelector('input[placeholder="Method Name"]') as HTMLInputElement
    const mTypeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
    fireEvent.change(mNameInput, { target: { value: 'draw' } })
    fireEvent.change(mTypeInput, { target: { value: 'void' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Method/i }))

    fireEvent.click(screen.getByRole('button', { name: /Create Interface/i }))

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
    const callArgs = mockOnAdd.mock.calls[0][0]

    expect(callArgs.props.name).toBe('IDrawable')
    expect(callArgs.props.constants).toHaveLength(1)
    expect(callArgs.props.constants[0].name).toBe('PI')
    expect(callArgs.props.methods).toHaveLength(1)
    expect(callArgs.props.methods[0].name).toBe('draw')
  })

  it('shows preview when interface name is entered', () => {
    render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.queryByText(/Preview/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Enter interface name/i), { target: { value: 'IPrintable' } })

    expect(screen.getByText(/Preview/i)).toBeInTheDocument()
    // It should render the Interface component inside the preview
    expect(screen.getByText('IPrintable', { selector: 'text' })).toBeInTheDocument()
  })

  describe('Validation', () => {
    it('shows error for empty interface name on blur', () => {
      render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter interface name/i)

      fireEvent.blur(input)
      expect(screen.getByText(/interface name is required/i)).toBeInTheDocument()
    })

    it('shows error for invalid interface name', () => {
      render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter interface name/i)

      fireEvent.change(input, { target: { value: '123Interface' } })
      fireEvent.blur(input)
      expect(screen.getByText(/must be a valid identifier/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate constant names', () => {
      render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)
      const constantSection = screen.getByRole('heading', { name: /Constants/i }).parentElement
      const nameInput = constantSection?.querySelector('input[placeholder="Constant Name"]') as HTMLInputElement
      const typeInput = constantSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Constant/i })

      fireEvent.change(nameInput, { target: { value: 'X' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(addButton)

      fireEvent.change(nameInput, { target: { value: 'X' } })
      fireEvent.change(typeInput, { target: { value: 'float' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Constant name already exists/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate method names', () => {
      render(<CreateInterface onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Method Name"]') as HTMLInputElement
      const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

      fireEvent.change(nameInput, { target: { value: 'run' } })
      fireEvent.change(typeInput, { target: { value: 'void' } })
      fireEvent.click(addButton)

      fireEvent.change(nameInput, { target: { value: 'run' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Method name already exists/i)).toBeInTheDocument()
    })
  })

  describe('Initial Data', () => {
    it('populates form with initialData', () => {
      const initialData = {
        interfaceName: 'InitialInterface',
        constants: [{ name: 'C1', type: 'int', visibility: Visibility.PUBLIC, isStatic: true, isFinal: true }],
        methods: [{ name: 'M1', returnType: 'void', visibility: Visibility.PUBLIC, isAbstract: true }]
      }

      const { rerender } = render(<CreateInterface onAdd={mockOnAdd} />)
      rerender(<CreateInterface onAdd={mockOnAdd} initialData={initialData} />)

      const input = screen.getByPlaceholderText(/Enter interface name/i) as HTMLInputElement
      expect(input.value).toBe('InitialInterface')
      expect(screen.getByText(/C1: int/)).toBeInTheDocument()
      expect(screen.getByText(/M1\(\): void/)).toBeInTheDocument()
    })
  })
})
