import { useState } from "react";

const MOCK_DATA_KEY = 'useMockAlerts';

export function useShouldUseMockTransitData() {
    const [value, setValue] = useState<boolean>(() => {
        return localStorage.getItem(MOCK_DATA_KEY) === 'true';
    });

    const setAndSave = (newValue: boolean | ((prev: boolean) => boolean)) => {
        const nextValue = typeof newValue === 'function' ? newValue(value) : newValue;
        localStorage.setItem(MOCK_DATA_KEY, String(nextValue));
        setValue(nextValue);
    };

    return [value, setAndSave] as const;
}
