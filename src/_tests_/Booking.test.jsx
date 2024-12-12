import { render, screen, fireEvent } from '@testing-library/react';
import '../setupTests';
import Booking from '../views/Booking';
import { vi, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import BookingInfo from '../components/BookingInfo/BookingInfo';
import { MemoryRouter } from 'react-router-dom';

describe('Booking Tests', () => {
  // 1- Återger alla nödvändiga inmatningsfält med korrekta labels
  it('renders all necessary input fields with correct labels', () => {
    render(<BookingInfo updateBookingDetails={() => {}} />);

    const inputs = [
      { label: /date/i, role: 'textbox' },
      { label: /time/i, role: 'textbox' },
      { label: /number of awesome bowlers/i, role: 'spinbutton' },
      { label: /number of lanes/i, role: 'spinbutton' },
    ];

    inputs.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  // 2- Kör updateBookingDetails med korrekta värden
  it('triggers updateBookingDetails with proper values on change', () => {
    const updateMock = vi.fn();
    render(<BookingInfo updateBookingDetails={updateMock} />);

    const testCases = [
      { label: /date/i, newValue: '2023-12-31', expectedName: 'when' },
      { label: /time/i, newValue: '18:00', expectedName: 'time' },
      {
        label: /number of awesome bowlers/i,
        newValue: '3',
        expectedName: 'people',
      },
      { label: /number of lanes/i, newValue: '2', expectedName: 'lanes' },
    ];

    testCases.forEach(({ label, newValue, expectedName }) => {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value: newValue } });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: newValue,
            name: expectedName,
          }),
        })
      );
    });
  });

  // 3- Kontrollerar att standardvärdena för inmatningsfälten är korrekt inställda
  it('uses default values correctly in input fields', () => {
    render(<BookingInfo updateBookingDetails={() => {}} />);

    expect(screen.getByLabelText(/date/i)).toHaveValue('');
    expect(screen.getByLabelText(/time/i)).toHaveValue('');
    expect(screen.getByLabelText(/number of awesome bowlers/i)).toHaveValue(
      null
    );
    expect(screen.getByLabelText(/number of lanes/i)).toHaveValue(null);
  });

  //4- Kontrollerar att updateBookingDetails anropas med rätt struktur efter ändringar i inmatningsfält.
  it('ensures updateBookingDetails is called with the expected structure', () => {
    const mockCallback = vi.fn();
    render(<BookingInfo updateBookingDetails={mockCallback} />);

    const inputs = [
      { label: /date/i, newValue: '2023-12-31', name: 'when' },
      { label: /time/i, newValue: '18:00', name: 'time' },
      { label: /number of awesome bowlers/i, newValue: '4', name: 'people' },
      { label: /number of lanes/i, newValue: '2', name: 'lanes' },
    ];

    inputs.forEach(({ label, newValue, name }) => {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: newValue },
      });
    });

    inputs.forEach((_, index) => {
      expect(mockCallback).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          target: expect.objectContaining({
            value: inputs[index].newValue,
            name: inputs[index].name,
          }),
        })
      );
    });
  });

  // 5- Testar att användaren kan boka ett datum och en tid och skicka en reservation med korrekt validering
  it('should allow user to book a date and time and submit reservation with proper validation', async () => {
    render(
      //Då useNavigate behöver en Router
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    const numberOfBowlersInput = screen.getByLabelText(
      /number of awesome bowlers/i
    );
    const numberOfLanesInput = screen.getByLabelText(/number of lanes/i);

    fireEvent.change(dateInput, { target: { value: '2023-12-31' } });
    fireEvent.change(timeInput, { target: { value: '18:00' } });
    fireEvent.change(numberOfBowlersInput, { target: { value: '3' } });
    fireEvent.change(numberOfLanesInput, { target: { value: '2' } });

    const submitButton = screen.getByRole('button', { name: /strIIIIIike!/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/confirmation/i)).toBeInTheDocument();
  });

  // 6- Användare får inte skicka in om alla fält inte är ifyllda eller om spelarna överskrider maxkapaciteten per bana
  test('should not allow submission if all fields are not filled or if players exceed max capacity per lane', () => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    // Fyll i formuläret
    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: '2024-12-11' },
    });
    fireEvent.change(screen.getByLabelText(/Time/i), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), {
      target: { value: 9 },
    });
    fireEvent.change(screen.getByLabelText(/Number of lanes/i), {
      target: { value: 2 },
    });

    fireEvent.click(screen.getByText(/strIIIIIike!/i));
    const errorMessage = document.querySelector('.error-message__text');
    expect(errorMessage).toBeInTheDocument();
  });
});
