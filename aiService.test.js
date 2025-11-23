

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from './aiService.js';
import { fallbackQuests } from '../config/fallbackQuests.js';

// Mock the global fetch function
global.fetch = vi.fn();

describe('aiService', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('isConfigured should always be true', () => {
        expect(aiService.isConfigured).toBe(true);
    });

    it('generateQuests should call the proxy endpoint with the correct payload', async () => {
        const mockApiResponse = { quests: [], usage: { totalTokens: 120 } };
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const mockProfile = { id: 'p1', characterStats: { name: 'Test Operator' } };
        const mockSettings = { useLocalFallback: false };
        const mockMindsetState = 'neutral';
        const mockHistory = ['Old Quest'];

        await aiService.generateQuests(mockProfile, mockSettings, mockMindsetState, mockHistory);

        expect(fetch).toHaveBeenCalledOnce();
        const [url, options] = fetch.mock.calls[0];
        
        expect(url).toBe('/api/gemini-proxy');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body.service).toBe('generateQuests');
        expect(body.payload).toEqual({
            characterProfile: mockProfile,
            mindsetState: mockMindsetState,
            completedQuestHistory: mockHistory,
        });
    });

    it('generateQuests should return data directly from the proxy', async () => {
        const mockApiResponse = { quests: [{ title: 'Proxy Quest' }], usage: { totalTokens: 150, source: 'api' } };
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const result = await aiService.generateQuests({}, { useLocalFallback: false });

        expect(result).toEqual(mockApiResponse);
    });
    
    it('should use local fallback quests when useLocalFallback setting is true', async () => {
        const result = await aiService.generateQuests({}, { useLocalFallback: true });

        expect(fetch).not.toHaveBeenCalled();
        expect(result.quests).toEqual(fallbackQuests);
        expect(result.usage.source).toBe('local');
    });

    it('should throw a detailed error if the proxy fetch is not ok', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            text: () => Promise.resolve("Proxy function failed"),
        });
        
        await expect(aiService.generateQuests({}, { useLocalFallback: false }))
            .rejects
            .toThrow('API Proxy Error: 500 Internal Server Error - Proxy function failed');
    });

    it('getAIBetaProgramOpinion should call the proxy and return the text', async () => {
        const mockApiResponse = { text: "This is an opinion." };
         fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const result = await aiService.getAIBetaProgramOpinion();
        expect(fetch).toHaveBeenCalledWith('/api/gemini-proxy', expect.any(Object));
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.service).toBe('getAIBetaProgramOpinion');
        expect(result).toBe("This is an opinion.");
    });
});
