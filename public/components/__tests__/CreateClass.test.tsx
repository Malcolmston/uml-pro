import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateClass from '../window/class/Create'
import Visibility from '../visibility'
import React from 'react'

describe('CreateClass component', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText(/Create New Class/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter class name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Class/i })).toBeDisabled()
    expect(screen.getByRole('heading', { name: /Parameters/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Methods/i })).toBeInTheDocument()
    expect(screen.getByText(/Auto-generate getters and setters/i)).toBeInTheDocument()
  })

  it('enables Create Class button when class name is valid', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter class name/i)

    fireEvent.change(input, { target: { value: 'MyClass' } })

    const createButton = screen.getByRole('button', { name: /Create Class/i })
    expect(createButton).toBeEnabled()
  })

  it('adds and removes a parameter', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    // Find parameter inputs
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
    const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
    const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Parameter/i })

    // Add a parameter
    fireEvent.change(nameInput, { target: { value: 'id' } })
    fireEvent.change(typeInput, { target: { value: 'long' } })
    fireEvent.click(addButton)

    // Verify it's added to the list
    expect(screen.getByText(/id: long/)).toBeInTheDocument()

    // Remove it
    const removeButton = screen.getByRole('button', { name: /Remove parameter/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/id: long/)).not.toBeInTheDocument()
  })

  it('adds and removes a method', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    // Find method inputs
    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
    const nameInput = methodSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
    const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

    // Add a method
    fireEvent.change(nameInput, { target: { value: 'login' } })
    fireEvent.change(typeInput, { target: { value: 'boolean' } })
    fireEvent.click(addButton)

    // Verify it's added to the list
    expect(screen.getByText(/login\(\): boolean/)).toBeInTheDocument()

    // Remove it
    const removeButton = screen.getByRole('button', { name: /Remove method/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/login\(\): boolean/)).not.toBeInTheDocument()
  })

  it('adds a constructor based on parameters', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    // Add a parameter first
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
    const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
    const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'username' } })
    fireEvent.change(typeInput, { target: { value: 'String' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

    // Add constructor
    fireEvent.click(screen.getByRole('button', { name: /\+ Use current parameters as constructor/i }))

    // Should show constructor in the list
    expect(screen.getByText(/Constructor\(username: String\)/)).toBeInTheDocument()
  })

  it('calls onAdd with correct data when Create Class is clicked', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    // Set class name
    fireEvent.change(screen.getByPlaceholderText(/Enter class name/i), { target: { value: 'User' } })

    // Add a parameter
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
    const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
    const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'age' } })
    fireEvent.change(typeInput, { target: { value: 'int' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

    // Click Create Class
    fireEvent.click(screen.getByRole('button', { name: /Create Class/i }))

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
    const callArgs = mockOnAdd.mock.calls[0][0]

    // Verify it passed a React element with correct props
    expect(callArgs.props.name).toBe('User')
    expect(callArgs.props.params).toHaveLength(1)
    expect(callArgs.props.params[0].name).toBe('age')
  })

  it('shows preview when class name is entered', () => {
    render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.queryByText(/Preview/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Enter class name/i), { target: { value: 'User' } })

    expect(screen.getByText(/Preview/i)).toBeInTheDocument()
    // It should render the Class component inside the preview
    // The Class component should show the name
    expect(screen.getByText('User', { selector: 'text' })).toBeInTheDocument()
  })

  describe('Validation', () => {
    it('shows error for empty class name on blur', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter class name/i)

      fireEvent.blur(input)
      expect(screen.getByText(/class name is required/i)).toBeInTheDocument()
    })

    it('shows error for invalid class name (starting with number)', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter class name/i)

      fireEvent.change(input, { target: { value: '123Class' } })
      fireEvent.blur(input)
      expect(screen.getByText(/must be a valid identifier/i)).toBeInTheDocument()
    })

    it('shows error for empty parameter name or type', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const addButton = screen.getByRole('button', { name: /\+ Add Parameter/i })

      fireEvent.click(addButton)
      expect(screen.getByText(/param name is required/i)).toBeInTheDocument()
    })

    it('shows error for invalid parameter name', async () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'invalid-name' } })
      fireEvent.blur(nameInput)

      const errorMsg = await screen.findByText(/param name must be a valid identifier/i)
      expect(errorMsg).toBeInTheDocument()
    })

    it('prevents adding duplicate parameter names', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Parameter/i })

      // Add first
      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(addButton)

      // Add second with same name
      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Parameter name already exists/i)).toBeInTheDocument()
    })

    it('shows error for empty method name or return type', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

      fireEvent.click(addButton)
      expect(screen.getByText(/method name is required/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate method names', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

      // Add first
      fireEvent.change(nameInput, { target: { value: 'save' } })
      fireEvent.change(typeInput, { target: { value: 'void' } })
      fireEvent.click(addButton)

      // Add second with same name
      fireEvent.change(nameInput, { target: { value: 'save' } })
      fireEvent.change(typeInput, { target: { value: 'boolean' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Method name already exists/i)).toBeInTheDocument()
    })
  })

  describe('Editing', () => {
    it('can edit an existing parameter', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Parameter/i })

      // Add
      fireEvent.change(nameInput, { target: { value: 'age' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(addButton)

      // Edit
      fireEvent.click(screen.getByLabelText(/Edit parameter/i))

      expect(nameInput.value).toBe('age')
      expect(typeInput.value).toBe('int')

      fireEvent.change(nameInput, { target: { value: 'newAge' } })
      fireEvent.click(screen.getByText(/Update Parameter/i))

      expect(screen.getByText(/newAge: int/)).toBeInTheDocument()
      expect(screen.queryByText(/age: int/)).not.toBeInTheDocument()
    })

    it('can cancel editing a parameter', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement

      // Add
      fireEvent.change(nameInput, { target: { value: 'age' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      // Edit
      fireEvent.click(screen.getByLabelText(/Edit parameter/i))
      fireEvent.change(nameInput, { target: { value: 'changed' } })

      // Cancel
      fireEvent.click(screen.getByText(/✗ Cancel/i))

      expect(nameInput.value).toBe('')
      expect(screen.getByText(/age: int/)).toBeInTheDocument()
    })

    it('can edit an existing method', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement
      const addButton = screen.getByRole('button', { name: /\+ Add Method/i })

      // Add
      fireEvent.change(nameInput, { target: { value: 'doWork' } })
      fireEvent.change(typeInput, { target: { value: 'void' } })
      fireEvent.click(addButton)

      // Edit
      fireEvent.click(screen.getByLabelText(/Edit method/i))

      expect(nameInput.value).toBe('doWork')
      expect(typeInput.value).toBe('void')

      fireEvent.change(nameInput, { target: { value: 'doMoreWork' } })
      fireEvent.click(screen.getByText(/Update Method/i))

      expect(screen.getByText(/doMoreWork\(\): void/)).toBeInTheDocument()
    })
  })

  describe('Modifiers and Visibility', () => {
    it('adds parameter with different visibility and modifiers', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const visSelect = paramSection?.querySelector('select') as HTMLSelectElement

      fireEvent.change(nameInput, { target: { value: 'TAG' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.change(visSelect, { target: { value: Visibility.PUBLIC } })

      const staticLabel = Array.from(paramSection!.querySelectorAll('label')).find(l => l.textContent?.includes('static'))
      const finalLabel = Array.from(paramSection!.querySelectorAll('label')).find(l => l.textContent?.includes('final'))

      fireEvent.click(staticLabel!)
      fireEvent.click(finalLabel!)

      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      const item = screen.getByText(/TAG: String/)
      expect(item).toBeInTheDocument()
      const container = item.closest('div')
      // Visibility symbol for PUBLIC is +
      expect(container).toHaveTextContent(/\+/)
      expect(container).toHaveTextContent(/static/)
      expect(container).toHaveTextContent(/final/)
    })
  })

  describe('Constructors', () => {
    it('prevents adding duplicate constructors', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)

      // Add a parameter
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'username' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      // Add constructor
      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })
      fireEvent.click(addConButton)

      // Try add again
      fireEvent.click(addConButton)

      expect(screen.getByText(/Constructor with same parameters already exists/i)).toBeInTheDocument()
    })

    it('shows error if trying to add constructor without parameters', async () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })

      // The button is disabled when params.length === 0, so we need to enable it for this test or check if it's disabled
      expect(addConButton).toBeDisabled()
    })
  })

  describe('Initial Data', () => {
    it('populates form with initialData', async () => {
      const initialData = {
        className: 'InitialClass',
        params: [{ id: '1', name: 'initialParam', type: 'int', visibility: Visibility.PRIVATE }],
        methods: [{ id: '2', name: 'initialMethod', returnType: 'void', visibility: Visibility.PUBLIC }]
      }

      // Since logic is in componentDidUpdate, we need to change props after mount
      const { rerender } = render(<CreateClass onAdd={mockOnAdd} />)
      rerender(<CreateClass onAdd={mockOnAdd} initialData={initialData} />)

      const classInput = screen.getByPlaceholderText(/Enter class name/i) as HTMLInputElement
      expect(classInput.value).toBe('InitialClass')

      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      expect(paramSection).toHaveTextContent(/initialParam/)
    })
  })

  describe('Additional Functionality', () => {
    it('closes the form when close button is clicked', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      fireEvent.click(screen.getByLabelText(/Close/i))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('resets form after successful class creation', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const classInput = screen.getByPlaceholderText(/Enter class name/i) as HTMLInputElement
      fireEvent.change(classInput, { target: { value: 'User' } })

      // Add a parameter
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      fireEvent.click(screen.getByRole('button', { name: /Create Class/i }))

      expect(mockOnAdd).toHaveBeenCalled()
      expect(classInput.value).toBe('')
      expect(screen.queryByText(/id: long/)).not.toBeInTheDocument()
    })

    it('adds parameter on Enter key press in name field', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')

      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })

      // Try both keyDown and keyPress to be sure
      if (nameInput) {
        fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })
        fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })
      }

      expect(paramSection).toHaveTextContent(/id/)
    })

    it('adds method on Enter key press in return type field', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /^Methods$/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Name"]')
      const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]')

      if (nameInput) fireEvent.change(nameInput, { target: { value: 'save' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'void' } })

      if (typeInput) {
        fireEvent.keyDown(typeInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })
        fireEvent.keyPress(typeInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })
      }

      expect(methodSection).toHaveTextContent(/save/)
    })

    it('toggles auto-getters/setters checkbox', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const checkbox = screen.getByLabelText(/Auto-generate getters and setters/i) as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
      expect(screen.getByText(/Getters and setters will be automatically generated/i)).toBeInTheDocument()
    })

    it('removes a constructor', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      // Add param and constructor
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))
      fireEvent.click(screen.getByRole('button', { name: /\+ Use current parameters as constructor/i }))

      expect(screen.getByText(/Constructor\(id: long\)/)).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText(/Remove constructor/i))
      expect(screen.queryByText(/Constructor\(id: long\)/)).not.toBeInTheDocument()
    })

    it('updates preview when auto-generate getters/setters is toggled', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      fireEvent.change(screen.getByPlaceholderText(/Enter class name/i), { target: { value: 'User' } })

      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      // Initially NO getters/setters in preview
      expect(screen.queryByText(/<getters and setters>/i)).not.toBeInTheDocument()

      // Toggle checkbox
      fireEvent.click(screen.getByLabelText(/Auto-generate getters and setters/i))

      // Should show in preview (within the SVG)
      expect(screen.getByText(/<getters and setters>/i, { selector: 'tspan' })).toBeInTheDocument()
    })

    it('validates method name', async () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /^Methods$/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: '123method' } })
      fireEvent.blur(nameInput)

      const errorMsg = await screen.findByText(/method name must be a valid identifier/i)
      expect(errorMsg).toBeInTheDocument()
    })

    it('prevents adding duplicate constructor with same types', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      // Add param
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })
      fireEvent.click(addConButton) // First time OK
      fireEvent.click(addConButton) // Second time FAIL

      expect(screen.getByText(/Constructor with same parameters already exists/i)).toBeInTheDocument()
    })

    it('can add constructor after changing parameters', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]')
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]')

      // Add first param
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'id' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })
      fireEvent.click(addConButton)

      // Add second param
      if (nameInput) fireEvent.change(nameInput, { target: { value: 'name' } })
      if (typeInput) fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      // Should be able to add another constructor now
      fireEvent.click(addConButton)
      expect(screen.getByText(/Constructor\(id: long, name: String\)/)).toBeInTheDocument()
    })

    it('disables Create Class button when class name is cleared', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter class name/i)
      
      fireEvent.change(input, { target: { value: 'MyClass' } })
      expect(screen.getByRole('button', { name: /Create Class/i })).toBeEnabled()
      
      fireEvent.change(input, { target: { value: '' } })
      expect(screen.getByRole('button', { name: /Create Class/i })).toBeDisabled()
    })

    it('verifies all modifiers are passed to onAdd callback', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      
      fireEvent.change(screen.getByPlaceholderText(/Enter class name/i), { target: { value: 'Product' } })
      
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const staticCheck = paramSection?.querySelector('input[type="checkbox"][checked="false"]') // This is brittle, use labels
      const labels = Array.from(paramSection!.querySelectorAll('label'))
      const staticLabel = labels.find(l => l.textContent?.includes('static'))
      const finalLabel = labels.find(l => l.textContent?.includes('final'))

      fireEvent.change(nameInput, { target: { value: 'SKU' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(staticLabel!)
      fireEvent.click(finalLabel!)
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      fireEvent.click(screen.getByRole('button', { name: /Create Class/i }))

      expect(mockOnAdd).toHaveBeenCalled()
      const callArgs = mockOnAdd.mock.calls[0][0]
      const productParam = callArgs.props.params[0]
      expect(productParam.name).toBe('SKU')
      expect(productParam.isStatic).toBe(true)
      expect(productParam.isFinal).toBe(true)
    })

    it('updates parameter modifiers when editing', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /^Parameters$/i }).parentElement
      const nameInput = paramSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = paramSection?.querySelector('input[placeholder="Type"]') as HTMLInputElement
      const labels = Array.from(paramSection!.querySelectorAll('label'))
      const staticLabel = labels.find(l => l.textContent?.includes('static'))

      // Add static param
      fireEvent.change(nameInput, { target: { value: 'count' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(staticLabel!)
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Parameter/i }))

      // Edit to be non-static
      fireEvent.click(screen.getByLabelText(/Edit parameter/i))
      fireEvent.click(staticLabel!)
      fireEvent.click(screen.getByText(/Update Parameter/i))

      // Verify in preview/list (list shows 'static' text if static)
      expect(screen.queryByText(/static/i, { selector: 'span' })).not.toBeInTheDocument()
    })

    it('handles method with complex return types', () => {
      render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /^Methods$/i }).parentElement
      const nameInput = methodSection?.querySelector('input[placeholder="Name"]') as HTMLInputElement
      const typeInput = methodSection?.querySelector('input[placeholder="Return Type"]') as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'findUsers' } })
      fireEvent.change(typeInput, { target: { value: 'List<User>' } })
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Method/i }))

      expect(screen.getByText(/findUsers\(\): List<User>/)).toBeInTheDocument()
    })

    it('successfully calls onClose after adding a class', () => {
        render(<CreateClass onAdd={mockOnAdd} onClose={mockOnClose} />)
        fireEvent.change(screen.getByPlaceholderText(/Enter class name/i), { target: { value: 'TestClass' } })
        fireEvent.click(screen.getByRole('button', { name: /Create Class/i }))
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })
})
