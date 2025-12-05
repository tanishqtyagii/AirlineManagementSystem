# Minimal IATA airline code map and helpers.
# Expand as needed.
AIRLINE_BY_CODE = {
    "AA": "American Airlines",
    "DL": "Delta Air Lines",
    "UA": "United Airlines",
    "WN": "Southwest Airlines",
    "AS": "Alaska Airlines",
    "B6": "JetBlue",
    "NK": "Spirit Airlines",
    "F9": "Frontier Airlines",
    "AC": "Air Canada",
    "WS": "WestJet",
    "BA": "British Airways",
    "AF": "Air France",
    "KL": "KLM",
    "LH": "Lufthansa",
    "EK": "Emirates",
    "QR": "Qatar Airways",
    "SQ": "Singapore Airlines",
    "CX": "Cathay Pacific",
    "QF": "Qantas",
    "NH": "ANA",
    "JL": "Japan Airlines",
    "IB": "Iberia",
    "AZ": "ITA Airways",
}

def airline_from_flight_number(flight_number: str) -> str:
    """Return airline name derived from the first two characters of flight number, or '' if unknown."""
    if not flight_number:
        return ""
    s = str(flight_number).strip().upper()
    # Accept forms like 'AA1234' or 'AA 1234'
    if len(s) < 2:
        return ""
    code = s[:2]
    return AIRLINE_BY_CODE.get(code, "")

def normalize_airline_query(s: str) -> str:
    """Normalize a user-entered airline filter to canonical name if possible.
    Accepts either a 2-letter code (AA) or a partial/full airline name.
    Returns normalized canonical airline name if recognized; otherwise returns the original string.
    """
    if not s:
        return ""
    x = s.strip()
    if not x:
        return ""
    up = x.upper()
    if len(up) == 2 and up in AIRLINE_BY_CODE:
        return AIRLINE_BY_CODE[up]
    # Try exact case-insensitive match on value
    for name in AIRLINE_BY_CODE.values():
        if name.lower() == x.lower():
            return name
    # Fallback: return raw; caller can do substring contains on airline name
    return x
