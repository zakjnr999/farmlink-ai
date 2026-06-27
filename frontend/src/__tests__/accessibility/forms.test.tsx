import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

describe('Accessible form controls', () => {
  it('associates labels with inputs', () => {
    render(
      <div>
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" />
      </div>,
    );

    expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
  });
});
