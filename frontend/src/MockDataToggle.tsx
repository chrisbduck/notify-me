import { useShouldUseMockTransitData } from './mockData';


export const MockDataToggle = () => {
    const [useMockData, setUseMockData] = useShouldUseMockTransitData();
    const isLocalHost = window.location.href.includes('localhost');

    if (!isLocalHost) return null;

    const toggleMockData = () => {
        setUseMockData(value => !value);
        window.location.reload();
    };

    return (
        <button
            onClick={toggleMockData}
            style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                zIndex: 9999,
                padding: '8px 12px',
                backgroundColor: useMockData ? '#f8d7da' : '#d4edda',
                color: useMockData ? '#721c24' : '#155724',
                border: '1px solid currentColor',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                fontSize: '14px',
            }}
        >
            {useMockData ? 'Disable Mock Alerts' : 'Enable Mock Alerts'}
        </button>
    );
};
