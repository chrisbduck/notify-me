import React from 'react';
import './TableDisplay.css';

export interface TableAttribute<T> {
    label: string;
    render: (item: T) => React.ReactNode;
}

interface TableDisplayProps<T> {
    dataNow: T | null;
    dataLater: T | null;
    attributes: TableAttribute<T>[];
    laterColumnHeader: string;
}

const TableDisplay = <T,>({ dataNow, dataLater, attributes, laterColumnHeader }: React.PropsWithChildren<TableDisplayProps<T>>) => {
    if (!dataNow) {
        return <p>Loading data...</p>;
    }

    return (
        <table className="weather-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Now</th>
                    {dataLater && <th>{laterColumnHeader}</th>}
                </tr>
            </thead>
            <tbody>
                {attributes.map((attribute, index) => (
                    <tr key={index}>
                        <td><strong>{attribute.label}</strong></td>
                        <td>{dataNow ? attribute.render(dataNow) : 'N/A'}</td>
                        {dataLater && <td>{attribute.render(dataLater)}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableDisplay;
