import { render, screen, fireEvent } from '@testing-library/react';
import '../setupTests';
import Booking from '../views/Booking';
import { vi, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import BookingInfo from '../components/BookingInfo/BookingInfo';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Booking from '../views/Booking';
import Confirmation from '../views/Confirmation';
import Shoes from '../components/Shoes/Shoes';
import Navigation from '../components/Navigation/Navigation';

//Booking test
describe('Booking tests', () => {
  // återger alla nödvändiga inmatningsfält med korrekta labels
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

  // kör updateBookingDetails med korrekta värden
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

  // kontrollerar att standardvärdena för inmatningsfälten är korrekt inställda
  it('uses default values correctly in input fields', () => {
    render(<BookingInfo updateBookingDetails={() => {}} />);

    expect(screen.getByLabelText(/date/i)).toHaveValue('');
    expect(screen.getByLabelText(/time/i)).toHaveValue('');
    expect(screen.getByLabelText(/number of awesome bowlers/i)).toHaveValue(
      null
    );
    expect(screen.getByLabelText(/number of lanes/i)).toHaveValue(null);
  });

  // kontrollerar att updateBookingDetails anropas med rätt struktur efter ändringar i inmatningsfält.
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

  // testar att användaren kan boka ett datum och en tid och skicka en reservation med korrekt validering
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

  // användare får inte skicka in om alla fält inte är ifyllda eller om spelarna överskrider maxkapaciteten per bana
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

  // felmeddelande när en eller flera fält ej fyllda
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
});

describe('errors and bookings tests', () => {
  let peopleInput, dateInput, lanesInput, timeInput, bookButton, addShoeButton;

  beforeEach(() => {
    sessionStorage.clear();
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );
    peopleInput = screen.getByLabelText('Number of awesome bowlers');
    dateInput = screen.getByLabelText('Date');
    lanesInput = screen.getByLabelText('Number of lanes');
    timeInput = screen.getByLabelText('Time');
    addShoeButton = screen.getByText('+');
    bookButton = screen.getByText('strIIIIIike!');
  });

  // felmeddelande när det fins mer är 4 spelare på en bana
  it('shows error when too many players per lane', async () => {
    fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
    fireEvent.change(timeInput, { target: { value: '18:00' } });
    fireEvent.change(peopleInput, { target: { value: '6' } });
    fireEvent.change(lanesInput, { target: { value: '1' } });

    // samma sko storlek för alla spelare
    for (let i = 0; i < 6; i++) {
      fireEvent.click(addShoeButton);
    }
    const shoeSizeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeSizeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: '45' } });
    });

    fireEvent.click(bookButton);

    expect(
      screen.getByText('Det får max vara 4 spelare per bana')
    ).toBeInTheDocument();
  });

  // felmeddelande om en eller flera sko storlek fällt ej fyllda
  it('shows error when shoe sizes are not filled', async () => {
    fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
    fireEvent.change(timeInput, { target: { value: '18:00' } });
    fireEvent.change(peopleInput, { target: { value: '2' } });
    fireEvent.change(lanesInput, { target: { value: '1' } });

    fireEvent.click(addShoeButton);
    fireEvent.click(addShoeButton);

    fireEvent.click(bookButton);

    expect(
      screen.getByText('Alla skor måste vara ifyllda')
    ).toBeInTheDocument();
  });

  // skickar ett felmeddelande om antal skor matchar inte antal spelare
  it("shows error when shoe count doesn't match player count", async () => {
    fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
    fireEvent.change(timeInput, { target: { value: '18:00' } });
    fireEvent.change(peopleInput, { target: { value: '2' } });
    fireEvent.change(lanesInput, { target: { value: '1' } });

    fireEvent.click(addShoeButton);
    const shoeInput = screen.getByLabelText(/Shoe size \/ person/);
    fireEvent.change(shoeInput, { target: { value: '42' } });

    fireEvent.click(bookButton);

    expect(
      screen.getByText('Antalet skor måste stämma överens med antal spelare')
    ).toBeInTheDocument();
  });

  //testar funktionaliteten av att välja antal spelare och banor
  it('allow user to select number of players and lanes', () => {
    fireEvent.change(peopleInput, { target: { value: '5' } });
    fireEvent.change(lanesInput, { target: { value: '2' } });

    expect(peopleInput.value).toBe('5');
    expect(lanesInput.value).toBe('2');
  });

  //Testar om användare kan lägga flera skor med storlek
  it('allows user to input shoe sizes for multiple players', () => {
    const mockUpdateSize = vi.fn();
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

  //Kollar om det finns en "ta bort" knapp för varje vald sko
  it('renders a remove button for each shoe size input ', () => {
    const mockRemoveShoe = vi.fn();
    const mockShoes = [
      { id: '1', size: '42' },
      { id: '2', size: '38' },
    ];

    render(
      <Shoes
        updateSize={() => {}}
        removeShoe={mockRemoveShoe}
        shoes={mockShoes}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: '-' });
    expect(removeButtons).toHaveLength(mockShoes.length);

    // simulera att ta bort första sko
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveShoe).toHaveBeenCalledWith('1');
  });
});

//Conformation tests
describe('Confirmation tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  //Om ingen "conformation details" hittas så visas ett meddelande
  it('renders a message stating no booking exists if confirmation details are absent', () => {
    render(
      <MemoryRouter>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText('Inga bokning gjord!')).toBeInTheDocument();
  });

  // visar bekräftelse
  it('renders confirmation details', () => {
    const mockBooking = {
      when: '2024-12-30T18:00',
      people: 6,
      lanes: 2,
      price: 920,
      id: '123-abc',
    };
    sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

    render(
      <MemoryRouter>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText('See you soon!')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-30 18:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123-abc')).toBeInTheDocument();
    expect(screen.getByText('920 sek')).toBeInTheDocument();
  });

  // Räknar rätt pris beroende på antal spelare och banor
  it('renders correct price calculation, considers the number of players and lanes', () => {
    const mockBooking = {
      when: '2024-12-30T18:00',
      people: 3,
      lanes: 1,
      price: 460,
      id: '123-abc',
    };
    sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

    render(
      <MemoryRouter>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText('460 sek')).toBeInTheDocument();
  });
});

//Navigation test
describe('Navigation Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // Testar om det går att navigera mellan de två "views"
  it('navigates between booking and confirmation views', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Booking />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('When, WHAT & Who')).toBeInTheDocument();

    const confirmationLink = screen.getAllByText(/confirmation/i)[0];
    fireEvent.click(confirmationLink);

    // Verifiera att vi har nått Conformation med hjälp av 'See you soon!'
    expect(screen.getByText('See you soon!')).toBeInTheDocument();
  });
});
