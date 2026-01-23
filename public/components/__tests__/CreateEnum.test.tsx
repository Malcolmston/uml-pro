import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEnum from '../window/enum/Create';
import React from 'react';

describe('CreateEnum component', () => {
    const mockOnAdd = vi.fn();
    const mockOnClose = vi.fn();

    const defaultProps = {
        onAdd: mockOnAdd,
        onClose: mockOnClose
    };

    beforeEach(() => {
        mockOnAdd.mockClear();
        mockOnClose.mockClear();
    });

    it('renders the enum creator form', () => {
        render(<CreateEnum {...defaultProps} />);
        expect(screen.getByText('Create New Enum')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter enum name/i)).toBeInTheDocument();
    });

    it('validates enum name input', async () => {
        render(<CreateEnum {...defaultProps} />);
        const nameInput = screen.getByPlaceholderText(/Enter enum name/i);
        const createButton = screen.getByRole('button', { name: /Create Enum/i });

        // Initially button should be disabled
        expect(createButton).toBeDisabled();

        // Enter invalid name
        fireEvent.change(nameInput, { target: { value: '123Invalid' } });
        fireEvent.blur(nameInput);

        await waitFor(() => {
            expect(screen.getByText(/must be a valid identifier/i)).toBeInTheDocument();
        });
    });

    it('adds enum constants', () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        // Add first constant
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addButton);

        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    it('enforces UPPER_CASE for constants', async () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        // Try to add lowercase constant
        fireEvent.change(constantNameInput, { target: { value: 'lowercase' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/should be in UPPER_CASE/i)).toBeInTheDocument();
        });
    });

    it('prevents duplicate constant names', async () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        // Add first constant
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addButton);

        // Try to add duplicate
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Constant name already exists/i)).toBeInTheDocument();
        });
    });

    it('adds constants with values', () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const constantValuesInput = screen.getByPlaceholderText(/Constructor Values/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        fireEvent.change(constantNameInput, { target: { value: 'RED' } });
        fireEvent.change(constantValuesInput, { target: { value: '255, 0, 0' } });
        fireEvent.click(addButton);

        expect(screen.getByText('RED')).toBeInTheDocument();
        expect(screen.getByText('(255, 0, 0)')).toBeInTheDocument();
    });

    it('removes enum constants', () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        // Add constant
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addButton);

        const removeButton = screen.getByLabelText('Remove constant');
        fireEvent.click(removeButton);

        expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
    });

    it('edits enum constants', async () => {
        render(<CreateEnum {...defaultProps} />);

        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addButton = screen.getByRole('button', { name: /\+ Add Constant/i });

        // Add constant
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addButton);

        // Edit constant
        const editButton = screen.getByLabelText('Edit constant');
        fireEvent.click(editButton);

        fireEvent.change(constantNameInput, { target: { value: 'ENABLED' } });

        const updateButton = screen.getByRole('button', { name: /✓ Update Constant/i });
        fireEvent.click(updateButton);

        expect(screen.getByText('ENABLED')).toBeInTheDocument();
        expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
    });

    it('applies common enum patterns', () => {
        render(<CreateEnum {...defaultProps} />);

        const statusButton = screen.getByRole('button', { name: /Status/i });
        fireEvent.click(statusButton);

        // Should populate with status constants
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        expect(screen.getByText('INACTIVE')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('SUSPENDED')).toBeInTheDocument();
    });

    it('suggests constants based on enum name', () => {
        render(<CreateEnum {...defaultProps} />);

        const nameInput = screen.getByPlaceholderText(/Enter enum name/i);
        fireEvent.change(nameInput, { target: { value: 'Status' } });

        // Should show suggestions
        expect(screen.getByText(/Suggested Constants/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ ACTIVE/i })).toBeInTheDocument();
    });

    it('adds fields to enum', () => {
        render(<CreateEnum {...defaultProps} />);

        const fieldNameInput = screen.getByPlaceholderText('Field Name');
        const fieldTypeInput = screen.getByPlaceholderText('Type');
        const addFieldButton = screen.getByRole('button', { name: /\+ Add Field/i });

        fireEvent.change(fieldNameInput, { target: { value: 'code' } });
        fireEvent.change(fieldTypeInput, { target: { value: 'int' } });
        fireEvent.click(addFieldButton);

        expect(screen.getByText(/code: int/)).toBeInTheDocument();
    });

    it('adds methods to enum', () => {
        render(<CreateEnum {...defaultProps} />);

        const methodNameInput = screen.getByPlaceholderText('Method Name');
        const methodTypeInput = screen.getByPlaceholderText('Return Type');
        const addMethodButton = screen.getByRole('button', { name: /\+ Add Method/i });

        fireEvent.change(methodNameInput, { target: { value: 'getCode' } });
        fireEvent.change(methodTypeInput, { target: { value: 'int' } });
        fireEvent.click(addMethodButton);

        expect(screen.getByText(/getCode\(\): int/)).toBeInTheDocument();
    });

    it('creates enum when form is valid', async () => {
        render(<CreateEnum {...defaultProps} />);

        // Fill enum name
        const nameInput = screen.getByPlaceholderText(/Enter enum name/i);
        fireEvent.change(nameInput, { target: { value: 'Status' } });

        // Add constant
        const constantNameInput = screen.getByPlaceholderText(/Constant Name/i);
        const addConstantButton = screen.getByRole('button', { name: /\+ Add Constant/i });
        fireEvent.change(constantNameInput, { target: { value: 'ACTIVE' } });
        fireEvent.click(addConstantButton);

        // Submit form
        const createButton = screen.getByRole('button', { name: /Create Enum/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(mockOnAdd).toHaveBeenCalledTimes(1);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    it('requires at least one constant', async () => {
        render(<CreateEnum {...defaultProps} />);

        const nameInput = screen.getByPlaceholderText(/Enter enum name/i);
        fireEvent.change(nameInput, { target: { value: 'Status' } });

        const createButton = screen.getByRole('button', { name: /Create Enum/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByText(/Add at least one enum constant/i)).toBeInTheDocument();
            expect(mockOnAdd).not.toHaveBeenCalled();
        });
    });

    it('handles constructor creation with fields', () => {
        render(<CreateEnum {...defaultProps} />);

        // Add a field first
        const fieldNameInput = screen.getByPlaceholderText('Field Name');
        const fieldTypeInput = screen.getByPlaceholderText('Type');
        const addFieldButton = screen.getByRole('button', { name: /\+ Add Field/i });

        fireEvent.change(fieldNameInput, { target: { value: 'value' } });
        fireEvent.change(fieldTypeInput, { target: { value: 'String' } });
        fireEvent.click(addFieldButton);

        // Add constructor
        const addConstructorButton = screen.getByRole('button', { name: /Use current fields as constructor/i });
        fireEvent.click(addConstructorButton);

        expect(screen.getByText(/private.*\(value: String\)/)).toBeInTheDocument();
    });

    it('auto-populates from initialData', () => {
        const initialData = {
            className: 'Priority',
            constants: [
                { id: '1', name: 'LOW', values: ['1'] },
                { id: '2', name: 'HIGH', values: ['2'] }
            ]
        };

        render(<CreateEnum {...defaultProps} initialData={initialData} />);

        expect(screen.getByDisplayValue('Priority')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText(/Auto-Population Active/i)).toBeInTheDocument();
    });

    it('closes form when close button is clicked', () => {
        render(<CreateEnum {...defaultProps} />);

        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
