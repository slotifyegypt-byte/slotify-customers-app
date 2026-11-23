import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider } from '@/theme';

import { Button } from './Button';
import { Chip } from './Chip';
import { Pill } from './Pill';
import { SegmentedControl } from './SegmentedControl';

// Android can measure a short label a pixel narrower than it draws it (at some font sizes, with this app's font), and
// the last word then wraps onto a hidden second line: "Continue with Google" showed as "Continue with". Every short
// label is held to one line and shrinks to fit instead, whatever the phone's font size.
const expectFitsOnOneLine = (text: string) => {
  const label = screen.getByText(text);
  expect(label.props.numberOfLines).toBe(1);
  expect(label.props.adjustsFontSizeToFit).toBe(true);
};

const renderThemed = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('short labels', () => {
  it('keep a button label whole on one line', async () => {
    await renderThemed(<Button label="Continue with Google" icon="logo-google" onPress={jest.fn()} />);
    expectFitsOnOneLine('Continue with Google');
  });

  it('keep chip, pill and segment labels whole on one line', async () => {
    await renderThemed(
      <>
        <Chip label="Nearby" onPress={jest.fn()} />
        <Pill label="Open now" dot />
        <SegmentedControl
          options={[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
          ]}
          value="upcoming"
          onChange={jest.fn()}
        />
      </>,
    );
    ['Nearby', 'Open now', 'Upcoming', 'Past'].forEach(expectFitsOnOneLine);
  });
});
