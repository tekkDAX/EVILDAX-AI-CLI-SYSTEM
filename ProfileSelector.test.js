

import { h } from 'preact';
import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileSelector } from './ProfileSelector.js';
import { AppContext } from '../store/AppContext.js';

// Mock JSZip at the top level to prevent resolution issues.
vi.mock('jszip', () => ({
    default: vi.fn()
}));

const mockActions = {
    loadProfile: vi.fn(),
    deleteProfile: vi.fn(),
    setGameState: vi.fn(),
};

const mockProfiles = [
    {
        id: '1',
        lastPlayed: new Date().toISOString(),
        characterStats: { displayName: 'John Doe' },
        isDeveloper: false,
        isBetaTester: true,
    },
    {
        id: '2',
        lastPlayed: new Date(0).toISOString(),
        characterStats: { displayName: 'Jane Smith' },
        isDeveloper: true,
        isBetaTester: false,
    }
];

const renderWithContext = (profiles = mockProfiles) => {
    const mockStore = {
        profiles: profiles,
        actions: mockActions,
    };
    return render(
        h(AppContext.Provider, { value: mockStore },
            h(ProfileSelector)
        )
    );
};

describe('ProfileSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.confirm for the delete button tests
        window.confirm = vi.fn(() => true);
    });

    it('should render the list of profiles sorted by lastPlayed date', () => {
        renderWithContext();
        
        const profileNames = screen.getAllByRole('heading', { level: 3 });
        // John Doe played more recently, so he should appear first.
        expect(profileNames[0].textContent).toBe('John Doe');
        expect(profileNames[1].textContent).toBe('Jane Smith');
    });

    it('should show a message if no profiles exist', () => {
        renderWithContext([]);
        expect(screen.getByText('Keine gespeicherten Profile gefunden. Starten Sie ein neues Spiel.')).toBeDefined();
    });

    it('should call loadProfile when a profile card is clicked', () => {
        renderWithContext();
        // The entire card is clickable
        fireEvent.click(screen.getByText('John Doe'));
        expect(mockActions.loadProfile).toHaveBeenCalledWith('1');
    });

    it('should call deleteProfile after confirmation', async () => {
        renderWithContext();
        const deleteButtons = screen.getAllByRole('button', { name: 'Löschen' });
        
        // First click triggers the confirmation
        fireEvent.click(deleteButtons[0]);
        expect(window.confirm).toHaveBeenCalled();

        // The button text changes to 'Bestätigen (5s)' after the first click
        const confirmButton = await screen.findByText(/Bestätigen/);
        fireEvent.click(confirmButton);
        
        expect(mockActions.deleteProfile).toHaveBeenCalledWith('1');
    });

    it('should call setGameState to go back to the main menu', () => {
        renderWithContext();
        const backButton = screen.getByRole('button', { name: 'Zurück zum Menü' });
        fireEvent.click(backButton);
        expect(mockActions.setGameState).toHaveBeenCalledWith('main-menu');
    });
});