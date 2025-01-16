/**
 * This test file passes when VITE_USE_MOCK is set to false in .env
 * 
 * When VITE_USE_MOCK is set to true, the test will fail.
 * 
 * This is because the mockRequestAndGetRouteStatus function is not defined.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputForm from '../components/InputForm'
// import { mockRequestAndGetRouteStatus } from '../api/mock'
import { requestAndGetRouteStatus, RouteStatus } from '../api'

// Mock the API calls
// vi.mock('../api/mock', () => ({
//   mockRequestAndGetRouteStatus: vi.fn()
// }))
vi.mock('../api', () => ({
  requestAndGetRouteStatus: vi.fn()
}))

describe('InputForm', () => {
  const mockOnFinish = vi.fn()
  const mockOnReset = vi.fn()
  const defaultProps = {
    routeStatus: null,
    onFinish: mockOnFinish,
    onReset: mockOnReset
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<InputForm {...defaultProps} />)

    expect(screen.getByLabelText(/starting location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/drop-off point/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<InputForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    expect(await screen.findByText(/starting location is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/drop-off point is required/i)).toBeInTheDocument()
  })

  it('handles successful form submission', async () => {
    const successResponse = {
      status: 'success',
      path: [['22.372081', '114.107877']],
      total_distance: 20000,
      total_time: 1800
    }

    vi.mocked(requestAndGetRouteStatus).mockResolvedValueOnce(successResponse as RouteStatus)

    render(<InputForm {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/starting location/i), 'Test Origin')
    await userEvent.type(screen.getByLabelText(/drop-off point/i), 'Test Destination')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalledWith(successResponse)
    })
  })

  it('handles API error during submission', async () => {
    const errorMessage = 'Location not accessible by car'
    vi.mocked(requestAndGetRouteStatus).mockRejectedValueOnce(new Error(errorMessage))

    render(<InputForm {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/starting location/i), 'Test Origin')
    await userEvent.type(screen.getByLabelText(/drop-off point/i), 'Test Destination')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
    expect(mockOnFinish).toHaveBeenCalledWith(null)
  })

  it('displays route details when routeStatus is successful', () => {
    const successStatus = {
      status: 'success' as const,
      path: [['22.372081', '114.107877']],
      total_distance: 20000,
      total_time: 1800
    }

    render(<InputForm {...defaultProps} routeStatus={successStatus as RouteStatus} />)

    expect(screen.getByText(/total distance: 20000/i)).toBeInTheDocument()
    expect(screen.getByText(/total time: 1800/i)).toBeInTheDocument()
  })

  it('handles form reset correctly', async () => {
    render(<InputForm {...defaultProps} />)

    const originInput = screen.getByLabelText(/starting location/i)
    const destinationInput = screen.getByLabelText(/drop-off point/i)

    await userEvent.type(originInput, 'Test Origin')
    await userEvent.type(destinationInput, 'Test Destination')

    const resetButton = screen.getByRole('button', { name: /reset/i })
    await userEvent.click(resetButton)

    expect(originInput).toHaveValue('')
    expect(destinationInput).toHaveValue('')
    expect(mockOnReset).toHaveBeenCalled()
  })

  it('clears error message when form is reset', async () => {
    const errorMessage = 'Location not accessible by car'
    vi.mocked(requestAndGetRouteStatus).mockRejectedValueOnce(new Error(errorMessage))

    render(<InputForm {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/starting location/i), 'Test Origin')
    await userEvent.type(screen.getByLabelText(/drop-off point/i), 'Test Destination')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
  })
})
