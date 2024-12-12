import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Booking from '../views/Booking';
import BookingInfo from '../components/BookingInfo/BookingInfo';
import { MemoryRouter } from 'react-router-dom';
import Input from '../components/Input/Input';
import Shoes from '../components/Shoes/Shoes';
import Confirmation from '../views/Confirmation';

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
  it('should render a conformition when all the booking input is filled', async () => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );
  });
  // 6- Användare får inte skicka in om alla fält inte är ifyllda eller om spelarna överskrider maxkapaciteten per bana
  it('should not allow submission if all fields are not filled or if players exceed max capacity per lane', () => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: '2024-12-30' },
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

  // Visar ett felmeddelande när en eller flera fält ej fyllda
  it('displays error message when booking cannot be completed', async () => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    const completeBookingButton = screen.getByRole('button', {
      name: /strIIIIIike!/i,
    });

    fireEvent.click(completeBookingButton);

    const errorMessage = await screen.findByText(
      /alla fälten måste vara ifyllda/i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  //Testar om användare kan lägga flera skor med storlek
  it('allows user to input shoe sizes for multiple players', () => {
    const mockUpdateSize = vi.fn(); // Skapa en mock-funktion för att spåra anrop
    const mockShoes = [
      { id: '1', size: '' },
      { id: '2', size: '' },
    ];

    render(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={() => {}}
        removeShoe={() => {}}
        shoes={mockShoes}
      />
    );

    const inputs = screen.getAllByLabelText(/Shoe size \/ person/i);

    fireEvent.change(inputs[0], { target: { value: '39' } });
    fireEvent.change(inputs[1], { target: { value: '40' } });

    expect(mockUpdateSize).toHaveBeenCalledTimes(2);

    const firstCallEvent = mockUpdateSize.mock.calls[0][0];
    expect(firstCallEvent.target.name).toBe('1');
    expect(firstCallEvent.target.value).toBe('39');

    const secondCallEvent = mockUpdateSize.mock.calls[1][0];
    expect(secondCallEvent.target.name).toBe('2');
    expect(secondCallEvent.target.value).toBe('40');
  });
});
