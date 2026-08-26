import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PickingTerminal } from '../components/picking/PickingTerminal.tsx';

describe('PickingTerminal Component', () => {
  it('should render picking terminal header and active batch details', async () => {
    render(<PickingTerminal />);

    const title = await screen.findByText(/WAREHOUSE FULFILLMENT TERMINAL/i);
    expect(title).toBeInTheDocument();

    expect(screen.getByText(/PK-8842/i)).toBeInTheDocument();
    expect(screen.getByText(/Rotterdam Central/i)).toBeInTheDocument();
    expect(screen.getByText(/Industrial Barcode Scanner Emulator/i)).toBeInTheDocument();
  });

  it('should render the list of items to pick with bin locations', async () => {
    render(<PickingTerminal />);

    const itemTitle = await screen.findByText(/Socks White/i);
    expect(itemTitle).toBeInTheDocument();

    expect(screen.getByText(/A3 \/ 06 \/ C \/ 02/i)).toBeInTheDocument();
  });

  it('should show scan error when invalid barcode is submitted', async () => {
    render(<PickingTerminal />);

    const input = await screen.findByPlaceholderText(/Enter or scan EAN-13 barcode/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '9999999999999' } });
    if (form) {
      fireEvent.submit(form);
    }

    const errorMsg = await screen.findByText(/Barcode 9999999999999 not found in checklist!/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('should successfully verify an item when valid barcode is entered', async () => {
    render(<PickingTerminal />);

    const input = await screen.findByPlaceholderText(/Enter or scan EAN-13 barcode/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '735008239006' } });
    if (form) {
      fireEvent.submit(form);
    }

    const successMsg = await screen.findByText(/Scanned SKU LGX-3002-SCK-WHT successfully!/i);
    expect(successMsg).toBeInTheDocument();
  });
});
