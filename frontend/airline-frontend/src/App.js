import React, { useState, useEffect } from 'react';
import {
    Plane,
    Plus,
    Pencil,
    Trash2,
    Clock,
    AlertCircle,
    User,
    Users,
    X,
    Search
} from 'lucide-react';
import './App.css';


//  CONFIGURATION: backend URL
// http://127.0.0.1:8000
// http://172.16.29.6:8000
const API_BASE_URL = 'http://127.0.0.1:8000';

const STATUS_COLORS = {
    'On Time': '#10b981',
    Delayed: '#f59e0b',
    Cancelled: '#ef4444',
    Boarding: '#3b82f6',
    Departed: '#8b5cf6',
    Arrived: '#6b7280'
};

function getStatusColor(status) {
    return STATUS_COLORS[status] || '#6b7280';
}

function App() {
    const path = window.location.pathname || '/';

    // Everything under /admin is the staff dashboard
    if (path.startsWith('/admin')) {
        return <AdminDashboard />;
    }

    // Default: passenger-facing front page (/ or /main_page)
    return <PassengerFront />;
}

/**
 * ADMIN DASHBOARD (localhost:3000/admin)
 * Flights + Airports management + per-flight passenger view
 */
function AdminDashboard() {
    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);
    const [passengers, setPassengers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('flights');

    const [showFlightForm, setShowFlightForm] = useState(false);
    const [showAirportForm, setShowAirportForm] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);

    const [flightFilters, setFlightFilters] = useState({
        departure_airport: '',
        arrival_airport: ''
    });
    const [filterDepartureInput, setFilterDepartureInput] = useState('');
    const [filterArrivalInput, setFilterArrivalInput] = useState('');

    const [selectedFlight, setSelectedFlight] = useState(null);

    async function fetchFlights(filtersOverride) {
        const effectiveFilters = filtersOverride || flightFilters;

        try {
            const params = new URLSearchParams();
            if (effectiveFilters.departure_airport) {
                params.append('departure_airport', effectiveFilters.departure_airport);
            }
            if (effectiveFilters.arrival_airport) {
                params.append('arrival_airport', effectiveFilters.arrival_airport);
            }

            const url = params.toString()
                ? `${API_BASE_URL}/flights/?${params.toString()}`
                : `${API_BASE_URL}/flights/`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch flights');

            const data = await response.json();
            setFlights(data);
        } catch (err) {
            console.error(err);
            setError('Could not connect to backend. Make sure your FastAPI server is running!');
        }
    }

    async function fetchAirports() {
        try {
            const response = await fetch(`${API_BASE_URL}/airports/`);
            if (!response.ok) throw new Error('Failed to fetch airports');
            const data = await response.json();
            setAirports(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchPassengers() {
        try {
            const response = await fetch(`${API_BASE_URL}/passengers/`);
            if (!response.ok) throw new Error('Failed to fetch passengers');
            const data = await response.json();
            setPassengers(data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                await Promise.all([fetchFlights(), fetchAirports(), fetchPassengers()]);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Could not connect to backend. Make sure your FastAPI server is running!');
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = () => {
        const newFilters = {
            departure_airport: filterDepartureInput.trim().toUpperCase(),
            arrival_airport: filterArrivalInput.trim().toUpperCase()
        };
        setFlightFilters(newFilters);
        fetchFlights(newFilters);
    };

    const handleClearFilters = () => {
        const cleared = { departure_airport: '', arrival_airport: '' };
        setFlightFilters(cleared);
        setFilterDepartureInput('');
        setFilterArrivalInput('');
        fetchFlights(cleared);
    };

    const createFlight = async (flightData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/flights/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            if (!response.ok) throw new Error('Failed to create flight');

            await fetchFlights();
            setShowFlightForm(false);
        } catch (err) {
            alert('Error creating flight: ' + err.message);
        }
    };

    const updateFlight = async (flightId, flightData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            if (!response.ok) throw new Error('Failed to update flight');

            await fetchFlights();
            setEditingFlight(null);
        } catch (err) {
            alert('Error updating flight: ' + err.message);
        }
    };

    const deleteFlight = async (flightId) => {
        if (!window.confirm('Are you sure you want to delete this flight?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete flight');

            await fetchFlights();
        } catch (err) {
            alert('Error deleting flight: ' + err.message);
        }
    };

    const createAirport = async (airportData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/airports/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(airportData)
            });

            if (!response.ok) throw new Error('Failed to add airport');

            await fetchAirports();
            setShowAirportForm(false);
        } catch (err) {
            alert('Error adding airport: ' + err.message);
        }
    };

    const handleFlightClick = (flight) => {
        setSelectedFlight(flight);
    };

    const passengerMap = new Map(passengers.map((p) => [p.passenger_id, p]));

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)' }}>
            <header style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Plane size={32} style={{ color: '#4f46e5' }} />
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>Airline Admin Console</h1>
                                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                    Manage flights, airports, and passenger manifests
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <a
                                href="/main_page"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                            >
                                View Passenger Site
                            </a>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setActiveTab('flights')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        backgroundColor: activeTab === 'flights' ? '#4f46e5' : '#e5e7eb',
                                        color: activeTab === 'flights' ? 'white' : '#374151'
                                    }}
                                >
                                    Flights
                                </button>
                                <button
                                    onClick={() => setActiveTab('airports')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        backgroundColor: activeTab === 'airports' ? '#4f46e5' : '#e5e7eb',
                                        color: activeTab === 'airports' ? 'white' : '#374151'
                                    }}
                                >
                                    Airports
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
                {error && (
                    <div
                        style={{
                            marginBottom: '24px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            gap: '12px'
                        }}
                    >
                        <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px' }} />
                        <div>
                            <p style={{ color: '#991b1b', fontWeight: '500', margin: '0 0 8px 0' }}>Connection Error</p>
                            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                            <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '8px' }}>
                                Make sure your FastAPI backend is running on <code>http://127.0.0.1:8000</code>.
                            </p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <div
                            style={{
                                display: 'inline-block',
                                width: '48px',
                                height: '48px',
                                border: '3px solid #e5e7eb',
                                borderTopColor: '#4f46e5',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}
                        />
                        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading data...</p>
                    </div>
                )}

                {!loading && activeTab === 'flights' && (
                    <div>
                        {/* Header row with Add Flight button */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}
                        >
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Flight Schedule</h2>
                            <button
                                onClick={() => {
                                    setEditingFlight(null);
                                    setShowFlightForm(true);
                                }}
                                style={{
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '999px',
                                    padding: '10px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                <Plus size={20} />
                                Add Flight
                            </button>
                        </div>

                        {/* Filters */}
                        <div
                            style={{
                                marginBottom: '16px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                padding: '16px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                                alignItems: 'flex-end'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Departure Airport Filter
                                </label>
                                <input
                                    type="text"
                                    value={filterDepartureInput}
                                    onChange={(e) => setFilterDepartureInput(e.target.value.toUpperCase())}
                                    placeholder="e.g., JFK"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Arrival Airport Filter
                                </label>
                                <input
                                    type="text"
                                    value={filterArrivalInput}
                                    onChange={(e) => setFilterArrivalInput(e.target.value.toUpperCase())}
                                    placeholder="e.g., LAX"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleApplyFilters}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Flights list */}
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {flights.length === 0 ? (
                                <div
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        padding: '64px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Plane size={64} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                                    <p style={{ color: '#6b7280' }}>No flights match the current filters.</p>
                                </div>
                            ) : (
                                flights.map((flight) => (
                                    <div
                                        key={flight.flight_id}
                                        onClick={() => handleFlightClick(flight)}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                            padding: '24px',
                                            transition: 'box-shadow 0.3s, transform 0.1s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                              style={{
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#111827'
                              }}
                          >
                            {flight.flight_number}
                          </span>
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            padding: '4px 10px',
                                                            borderRadius: '999px',
                                                            backgroundColor: getStatusColor(flight.status),
                                                            color: 'white',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                            {flight.status}
                          </span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                                    Flight ID: {flight.flight_id}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingFlight(flight);
                                                        setShowFlightForm(true);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#eff6ff',
                                                        border: 'none',
                                                        borderRadius: '999px',
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteFlight(flight.flight_id);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#fef2f2',
                                                        border: 'none',
                                                        borderRadius: '999px',
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        color: '#b91c1c'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginTop: '16px',
                                                gap: '16px',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <div>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    Departure
                                                </p>
                                                <p
                                                    style={{
                                                        fontWeight: '600',
                                                        margin: '0 0 4px 0'
                                                    }}
                                                >
                                                    {flight.departure_airport}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#4b5563',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        margin: 0
                                                    }}
                                                >
                                                    <Clock size={16} />
                                                    {flight.departure_time}
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    Arrival
                                                </p>
                                                <p
                                                    style={{
                                                        fontWeight: '600',
                                                        margin: '0 0 4px 0'
                                                    }}
                                                >
                                                    {flight.arrival_airport}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#4b5563',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        margin: 0
                                                    }}
                                                >
                                                    <Clock size={16} />
                                                    {flight.arrival_time}
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginLeft: 'auto'
                                                }}
                                            >
                                                <Users size={18} style={{ color: '#4b5563' }} />
                                                <span style={{ fontSize: '13px', color: '#4b5563' }}>
                          Click card to view passengers
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'airports' && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}
                        >
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Airports</h2>
                            <button
                                onClick={() => setShowAirportForm(true)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '500',
                                    backgroundColor: '#4f46e5',
                                    color: 'white'
                                }}
                            >
                                <Plus size={20} />
                                Add Airport
                            </button>
                        </div>

                        <div
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                padding: '16px'
                            }}
                        >
                            {airports.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', margin: '24px 0' }}>
                                    No airports added yet.
                                </p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '8px' }}>Code</th>
                                        <th style={{ padding: '8px' }}>Name</th>
                                        <th style={{ padding: '8px' }}>City</th>
                                        <th style={{ padding: '8px' }}>Country</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {airports.map((airport) => (
                                        <tr key={airport.airport_code} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px', fontWeight: '600' }}>{airport.airport_code}</td>
                                            <td style={{ padding: '8px' }}>{airport.airport_name}</td>
                                            <td style={{ padding: '8px' }}>{airport.city}</td>
                                            <td style={{ padding: '8px' }}>{airport.country}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {showFlightForm && (
                <FlightForm
                    flight={editingFlight}
                    onSubmit={(data) => {
                        if (editingFlight) {
                            updateFlight(editingFlight.flight_id, data);
                        } else {
                            createFlight(data);
                        }
                    }}
                    onClose={() => {
                        setShowFlightForm(false);
                        setEditingFlight(null);
                    }}
                />
            )}

            {showAirportForm && (
                <AirportForm
                    onSubmit={createAirport}
                    onClose={() => setShowAirportForm(false)}
                />
            )}

            {selectedFlight && (
                <FlightDetailModal
                    flight={selectedFlight}
                    passengers={passengers}
                    onPassengersRefresh={fetchPassengers}
                    onClose={() => setSelectedFlight(null)}
                />
            )}
        </div>
    );
}

/**
 * PASSENGER-FACING FRONT PAGE (localhost:3000/main_page)
 */
function PassengerFront() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [flightFilters, setFlightFilters] = useState({
        departure_airport: '',
        arrival_airport: ''
    });
    const [filterDepartureInput, setFilterDepartureInput] = useState('');
    const [filterArrivalInput, setFilterArrivalInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [buyingFlight, setBuyingFlight] = useState(null);

    async function fetchFlights(filtersOverride) {
        const effectiveFilters = filtersOverride || flightFilters;

        try {
            const params = new URLSearchParams();
            if (effectiveFilters.departure_airport) {
                params.append('departure_airport', effectiveFilters.departure_airport);
            }
            if (effectiveFilters.arrival_airport) {
                params.append('arrival_airport', effectiveFilters.arrival_airport);
            }

            const url = params.toString()
                ? `${API_BASE_URL}/flights/?${params.toString()}`
                : `${API_BASE_URL}/flights/`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch flights');

            const data = await response.json();
            setFlights(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Could not connect to backend. Make sure your FastAPI server is running!');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFlights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = () => {
        const newFilters = {
            departure_airport: filterDepartureInput.trim().toUpperCase(),
            arrival_airport: filterArrivalInput.trim().toUpperCase()
        };
        setFlightFilters(newFilters);
        setLoading(true);
        fetchFlights(newFilters);
    };

    const handleClearFilters = () => {
        const cleared = { departure_airport: '', arrival_airport: '' };
        setFlightFilters(cleared);
        setFilterDepartureInput('');
        setFilterArrivalInput('');
        setLoading(true);
        fetchFlights(cleared);
    };

    const filteredFlights = flights.filter((flight) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (flight.flight_number && flight.flight_number.toLowerCase().includes(q)) ||
            (flight.departure_airport && flight.departure_airport.toLowerCase().includes(q)) ||
            (flight.arrival_airport && flight.arrival_airport.toLowerCase().includes(q)) ||
            String(flight.flight_id).includes(q)
        );
    });

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)' }}>
            <header style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Plane size={32} style={{ color: '#4f46e5' }} />
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>Airline Flight Finder</h1>
                                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                    Browse available flights and book your seat
                                </p>
                            </div>
                        </div>
                        <a
                            href="/admin"
                            style={{
                                padding: '8px 16px',
                                borderRadius: '999px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                color: '#374151',
                                fontSize: '14px',
                                textDecoration: 'none'
                            }}
                        >
                            Admin Console
                        </a>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
                {error && (
                    <div
                        style={{
                            marginBottom: '24px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            gap: '12px'
                        }}
                    >
                        <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px' }} />
                        <div>
                            <p style={{ color: '#991b1b', fontWeight: '500', margin: '0 0 8px 0' }}>Connection Error</p>
                            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Search + filters bar */}
                <section
                    style={{
                        marginBottom: '24px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        padding: '16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'flex-end'
                    }}
                >
                    <div style={{ flex: 2, minWidth: '220px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Search flights
                        </label>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '999px',
                                border: '1px solid #d1d5db',
                                padding: '4px 10px'
                            }}
                        >
                            <Search size={16} style={{ color: '#9ca3af' }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Flight number, airport code, or ID"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            From (airport code)
                        </label>
                        <input
                            type="text"
                            value={filterDepartureInput}
                            onChange={(e) => setFilterDepartureInput(e.target.value.toUpperCase())}
                            placeholder="e.g., SFO"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            To (airport code)
                        </label>
                        <input
                            type="text"
                            value={filterArrivalInput}
                            onChange={(e) => setFilterArrivalInput(e.target.value.toUpperCase())}
                            placeholder="e.g., LAX"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleApplyFilters}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleClearFilters}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </section>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <div
                            style={{
                                display: 'inline-block',
                                width: '48px',
                                height: '48px',
                                border: '3px solid #e5e7eb',
                                borderTopColor: '#4f46e5',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}
                        />
                        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading flights...</p>
                    </div>
                ) : (
                    <section>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Available Flights</h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {filteredFlights.length === 0 ? (
                                <div
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        padding: '64px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Plane size={64} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                                    <p style={{ color: '#6b7280' }}>No flights found for the current filters/search.</p>
                                </div>
                            ) : (
                                filteredFlights.map((flight) => (
                                    <div
                                        key={flight.flight_id}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                            padding: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                              style={{
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#111827'
                              }}
                          >
                            {flight.flight_number}
                          </span>
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            padding: '4px 10px',
                                                            borderRadius: '999px',
                                                            backgroundColor: getStatusColor(flight.status),
                                                            color: 'white',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                            {flight.status}
                          </span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                                    Flight ID: {flight.flight_id}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setBuyingFlight(flight)}
                                                style={{
                                                    padding: '10px 18px',
                                                    borderRadius: '999px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: '500',
                                                    backgroundColor: '#4f46e5',
                                                    color: 'white'
                                                }}
                                            >
                                                <User size={18} />
                                                Buy Ticket
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: '16px',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <div>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    Departure
                                                </p>
                                                <p
                                                    style={{
                                                        fontWeight: '600',
                                                        margin: '0 0 4px 0'
                                                    }}
                                                >
                                                    {flight.departure_airport}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#4b5563',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        margin: 0
                                                    }}
                                                >
                                                    <Clock size={16} />
                                                    {flight.departure_time}
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    Arrival
                                                </p>
                                                <p
                                                    style={{
                                                        fontWeight: '600',
                                                        margin: '0 0 4px 0'
                                                    }}
                                                >
                                                    {flight.arrival_airport}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#4b5563',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        margin: 0
                                                    }}
                                                >
                                                    <Clock size={16} />
                                                    {flight.arrival_time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {buyingFlight && (
                    <BuyTicketModal
                        flight={buyingFlight}
                        onClose={() => setBuyingFlight(null)}
                        onTicketCreated={() => {
                            // Refresh flights list so admin dashboard sees new booking
                            setLoading(true);
                            fetchFlights(flightFilters);
                        }}
                    />
                )}
            </main>
        </div>
    );
}


function FlightDetailModal({ flight, passengers, onPassengersRefresh, onClose }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editPassenger, setEditPassenger] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });
    const [editBooking, setEditBooking] = useState({
        seat_number: '',
        fare_class: '',
        status: ''
    });

    useEffect(() => {
        fetchBookings();
    }, [flight.flight_id]);

    async function fetchBookings() {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/?flight_id=${flight.flight_id}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            setBookings(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }

    const passengerMap = new Map(passengers.map((p) => [p.passenger_id, p]));

    const filteredBookings = bookings.filter((b) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const p = passengerMap.get(b.passenger_id);
        const name = p ? `${p.first_name} ${p.last_name}`.toLowerCase() : '';
        return (
            name.includes(q) ||
            String(b.booking_id).includes(q) ||
            String(b.passenger_id).includes(q) ||
            (b.seat_number && b.seat_number.toLowerCase().includes(q))
        );
    });

    const startEdit = (booking) => {
        const p = passengerMap.get(booking.passenger_id) || {};
        setEditingId(booking.booking_id);
        setEditPassenger({
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            email: p.email || ''
        });
        setEditBooking({
            seat_number: booking.seat_number || '',
            fare_class: booking.fare_class || '',
            status: booking.status || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (booking) => {
        try {
            // Update passenger
            const passengerResp = await fetch(`${API_BASE_URL}/passengers/${booking.passenger_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editPassenger)
            });
            if (!passengerResp.ok) throw new Error('Failed to update passenger');

            // Update booking
            const bookingResp = await fetch(`${API_BASE_URL}/bookings/${booking.booking_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editBooking)
            });
            if (!bookingResp.ok) throw new Error('Failed to update booking');

            await onPassengersRefresh();
            await fetchBookings();
            setEditingId(null);
        } catch (err) {
            alert(err.message || 'Error saving changes');
        }
    };

    const removeFromFlight = async (booking) => {
        if (!window.confirm('Remove this passenger from the flight?')) return;

        try {
            const resp = await fetch(`${API_BASE_URL}/bookings/${booking.booking_id}`, {
                method: 'DELETE'
            });
            if (!resp.ok) throw new Error('Failed to delete booking');
            await fetchBookings();
        } catch (err) {
            alert(err.message || 'Error removing passenger from flight');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15,23,42,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '960px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.25)'
                }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Plane size={24} style={{ color: '#4f46e5' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>
                                {flight.flight_number}{' '}
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>(ID {flight.flight_id})</span>
                            </h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                                {flight.departure_airport} → {flight.arrival_airport}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
                style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: getStatusColor(flight.status),
                    color: 'white',
                    fontWeight: '500'
                }}
            >
              {flight.status}
            </span>
                        <button
                            onClick={onClose}
                            style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '999px',
                                padding: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Flight meta */}
                <div
                    style={{
                        padding: '12px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap'
                    }}
                >
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Departure</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{flight.departure_airport}</p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '13px',
                                color: '#4b5563',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Clock size={14} />
                            {flight.departure_time}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Arrival</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{flight.arrival_airport}</p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '13px',
                                color: '#4b5563',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Clock size={14} />
                            {flight.arrival_time}
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Passenger search</p>
                        <div
                            style={{
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '999px',
                                border: '1px solid #d1d5db',
                                padding: '4px 10px'
                            }}
                        >
                            <Search size={14} style={{ color: '#9ca3af' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, booking ID, passenger ID, seat..."
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    fontSize: '13px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Passenger list */}
                <div style={{ padding: '16px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}
                    >
                        <Users size={18} style={{ color: '#4b5563' }} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Passengers</h3>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
              ({filteredBookings.length} booking{filteredBookings.length === 1 ? '' : 's'})
            </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div
                                style={{
                                    display: 'inline-block',
                                    width: '32px',
                                    height: '32px',
                                    border: '3px solid #e5e7eb',
                                    borderTopColor: '#4f46e5',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}
                            />
                        </div>
                    ) : error ? (
                        <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                    ) : filteredBookings.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No passengers booked on this flight.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '8px' }}>Booking ID</th>
                                <th style={{ padding: '8px' }}>Passenger</th>
                                <th style={{ padding: '8px' }}>Passenger ID</th>
                                <th style={{ padding: '8px' }}>Seat</th>
                                <th style={{ padding: '8px' }}>Fare Class</th>
                                <th style={{ padding: '8px' }}>Status</th>
                                <th style={{ padding: '8px', width: '150px' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredBookings.map((booking) => {
                                const p = passengerMap.get(booking.passenger_id);
                                const isEditing = editingId === booking.booking_id;

                                return (
                                    <tr key={booking.booking_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '8px' }}>{booking.booking_id}</td>
                                        <td style={{ padding: '8px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input
                                                            type="text"
                                                            value={editPassenger.first_name}
                                                            onChange={(e) =>
                                                                setEditPassenger({ ...editPassenger, first_name: e.target.value })
                                                            }
                                                            placeholder="First name"
                                                            style={{
                                                                flex: 1,
                                                                padding: '4px 6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #d1d5db'
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editPassenger.last_name}
                                                            onChange={(e) =>
                                                                setEditPassenger({ ...editPassenger, last_name: e.target.value })
                                                            }
                                                            placeholder="Last name"
                                                            style={{
                                                                flex: 1,
                                                                padding: '4px 6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #d1d5db'
                                                            }}
                                                        />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={editPassenger.email}
                                                        onChange={(e) =>
                                                            setEditPassenger({ ...editPassenger, email: e.target.value })
                                                        }
                                                        placeholder="Email"
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px 6px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #d1d5db'
                                                        }}
                                                    />
                                                </div>
                                            ) : p ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '500' }}>
                              {p.first_name} {p.last_name}
                            </span>
                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{p.email}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>Unknown passenger (ID {booking.passenger_id})</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '8px' }}>{booking.passenger_id}</td>
                                        <td style={{ padding: '8px' }}>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editBooking.seat_number}
                                                    onChange={(e) =>
                                                        setEditBooking({ ...editBooking, seat_number: e.target.value })
                                                    }
                                                    style={{
                                                        width: '80px',
                                                        padding: '4px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #d1d5db'
                                                    }}
                                                />
                                            ) : (
                                                booking.seat_number || '-'
                                            )}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editBooking.fare_class}
                                                    onChange={(e) =>
                                                        setEditBooking({ ...editBooking, fare_class: e.target.value })
                                                    }
                                                    style={{
                                                        width: '90px',
                                                        padding: '4px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #d1d5db'
                                                    }}
                                                />
                                            ) : (
                                                booking.fare_class || '-'
                                            )}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {isEditing ? (
                                                <select
                                                    value={editBooking.status}
                                                    onChange={(e) =>
                                                        setEditBooking({ ...editBooking, status: e.target.value })
                                                    }
                                                    style={{
                                                        padding: '4px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #d1d5db'
                                                    }}
                                                >
                                                    <option value="CONFIRMED">CONFIRMED</option>
                                                    <option value="CHECKED_IN">CHECKED_IN</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            ) : (
                                                booking.status
                                            )}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => saveEdit(booking)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '999px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            backgroundColor: '#4f46e5',
                                                            color: 'white',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '999px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            backgroundColor: '#e5e7eb',
                                                            color: '#374151',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => startEdit(booking)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '999px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            backgroundColor: '#eff6ff',
                                                            color: '#1d4ed8',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromFlight(booking)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '999px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            backgroundColor: '#fef2f2',
                                                            color: '#b91c1c',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}


function BuyTicketModal({ flight, onClose, onTicketCreated }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [seatNumber, setSeatNumber] = useState('');
    const [fareClass, setFareClass] = useState('Economy');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!firstName || !lastName || !email || !seatNumber) {
            alert('Please fill in at least name, email, and seat number');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const passengersResp = await fetch(`${API_BASE_URL}/passengers/`);
            if (!passengersResp.ok) throw new Error('Failed to fetch passengers');
            const passengers = await passengersResp.json();

            const existing = passengers.find(
                (p) => p.email && p.email.toLowerCase() === email.trim().toLowerCase()
            );

            let passengerId;

            if (existing) {
                passengerId = existing.passenger_id;
                // best-effort update
                await fetch(`${API_BASE_URL}/passengers/${passengerId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        email,
                        phone
                    })
                });
            } else {
                const createResp = await fetch(`${API_BASE_URL}/passengers/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        email,
                        phone
                    })
                });
                if (!createResp.ok) throw new Error('Failed to create passenger');

                // Re-fetch to get ID
                const refreshedResp = await fetch(`${API_BASE_URL}/passengers/`);
                if (!refreshedResp.ok) throw new Error('Failed to fetch passengers after create');
                const refreshed = await refreshedResp.json();
                const created = refreshed.find(
                    (p) => p.email && p.email.toLowerCase() === email.trim().toLowerCase()
                );
                if (!created) throw new Error('Could not resolve created passenger');
                passengerId = created.passenger_id;
            }

            const bookingResp = await fetch(`${API_BASE_URL}/bookings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passenger_id: passengerId,
                    flight_id: flight.flight_id,
                    seat_number: seatNumber,
                    fare_class: fareClass
                })
            });
            if (!bookingResp.ok) throw new Error('Failed to create booking');

            onTicketCreated();
            onClose();
            alert('Ticket successfully created!');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15,23,42,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '640px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.25)',
                    padding: '24px'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={22} style={{ color: '#4f46e5' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>Buy Ticket</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                {flight.flight_number} · {flight.departure_airport} → {flight.arrival_airport}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '999px',
                            padding: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: '12px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            color: '#b91c1c'
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                First name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Last name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Phone (optional)
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Seat number
                            </label>
                            <input
                                type="text"
                                value={seatNumber}
                                onChange={(e) => setSeatNumber(e.target.value)}
                                placeholder="e.g., 12A"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Fare class
                            </label>
                            <select
                                value={fareClass}
                                onChange={(e) => setFareClass(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="Economy">Economy</option>
                                <option value="Premium Economy">Premium Economy</option>
                                <option value="Business">Business</option>
                                <option value="First">First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px'
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {submitting ? 'Processing...' : 'Confirm Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
}


function FlightForm({ flight, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        flight_number: flight?.flight_number || '',
        departure_airport: flight?.departure_airport || '',
        arrival_airport: flight?.arrival_airport || '',
        departure_time: flight?.departure_time || '',
        arrival_time: flight?.arrival_time || '',
        status: flight?.status || 'On Time'
    });

    const handleSubmit = () => {
        if (
            !formData.flight_number ||
            !formData.departure_airport ||
            !formData.arrival_airport
        ) {
            alert('Please fill in flight number, departure airport and arrival airport');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15,23,42,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '640px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.25)'
                }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '18px' }}>
                        {flight ? 'Edit Flight' : 'Create Flight'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '999px',
                            padding: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px 24px', display: 'grid', gap: '12px' }}>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Flight Number
                        </label>
                        <input
                            type="text"
                            value={formData.flight_number}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    flight_number: e.target.value
                                })
                            }
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Departure Airport
                            </label>
                            <input
                                type="text"
                                value={formData.departure_airport}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        departure_airport: e.target.value.toUpperCase()
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Arrival Airport
                            </label>
                            <input
                                type="text"
                                value={formData.arrival_airport}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        arrival_airport: e.target.value.toUpperCase()
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Departure Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.departure_time}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        departure_time: e.target.value
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}
                            >
                                Arrival Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.arrival_time}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        arrival_time: e.target.value
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value
                                })
                            }
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        >
                            <option value="On Time">On Time</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Boarding">Boarding</option>
                            <option value="Departed">Departed</option>
                            <option value="Arrived">Arrived</option>
                        </select>
                    </div>
                </div>

                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {flight ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}


function AirportForm({ onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        airport_code: '',
        airport_name: '',
        city: '',
        country: ''
    });

    const handleSubmit = () => {
        if (
            !formData.airport_code ||
            !formData.airport_name ||
            !formData.city ||
            !formData.country
        ) {
            alert('Please fill in all fields');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15,23,42,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '480px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.25)'
                }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Add Airport</h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '999px',
                            padding: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px 24px', display: 'grid', gap: '12px' }}>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Airport Code
                        </label>
                        <input
                            type="text"
                            value={formData.airport_code}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    airport_code: e.target.value.toUpperCase()
                                })
                            }
                            placeholder="e.g., JFK"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Airport Name
                        </label>
                        <input
                            type="text"
                            value={formData.airport_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    airport_name: e.target.value
                                })
                            }
                            placeholder="e.g., John F. Kennedy International"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            City
                        </label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    city: e.target.value
                                })
                            }
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}
                        >
                            Country
                        </label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    country: e.target.value
                                })
                            }
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;