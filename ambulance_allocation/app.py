from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import requests
import datetime
import joblib
import threading
import webbrowser
from flask_cors import CORS
from dotenv import load_dotenv
import os
from time import sleep

# Load environment variables from .env file
load_dotenv()

# Flask App Initialization
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Secret Key for Flask Sessions
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'SEVADRIVE2025')

# Google Maps API Key
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'AIzaSyAL9FKmHqjFf8uH9svsTzD43QwZ00dvqNE')

# Initialize storage for emergency bookings
emergency_bookings = {}

# Load ML Model
try:
    model = joblib.load('model.pkl')
    print("ML model loaded successfully")
except Exception as e:
    print(f"Error loading ML model: {e}")
    model = None

# Load Ambulance Dataset
try:
    ambulance_data = pd.read_csv('final_dataset.csv')
    print("Ambulance dataset loaded successfully")
except Exception as e:
    print(f"Error loading ambulance dataset: {e}")
    ambulance_data = None

browser_opened = False  # Global flag for browser opening

def open_browser():
    """Open the default web browser to the Flask app's URL."""
    global browser_opened
    if not browser_opened:
        webbrowser.open("http://127.0.0.1:5001")
        browser_opened = True

def get_address_from_coordinates(lat, lng):
    """Fetch the address using the Google Maps Geocoding API."""
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data["results"]:
            return data["results"][0]["formatted_address"]
        return "Address not found"
    except requests.RequestException as e:
        print(f"Geocoding API error: {e}")
        return "Address not available"

def get_traffic_data(origin, destination):
    """Fetch traffic data using the Google Maps Directions API."""
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&departure_time=now&alternatives=true&key={API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Traffic data error: {e}")
        return None

def encode_path(path):
    """Encode a path for Google Maps Polyline."""
    encoded = []
    prev_lat = 0
    prev_lng = 0
    for point in path:
        lat = int(float(point['lat']) * 1e5)
        lng = int(float(point['lng']) * 1e5)
        encoded.extend(encode_number(lat - prev_lat))
        encoded.extend(encode_number(lng - prev_lng))
        prev_lat = lat
        prev_lng = lng
    return ''.join(chr(x) for x in encoded)

def encode_number(num):
    """Encode a single number for Google Maps Polyline."""
    num = num << 1
    if num < 0:
        num = ~num
    result = []
    while num >= 0x20:
        result.append((0x20 | (num & 0x1f)) + 63)
        num >>= 5
    result.append(num + 63)
    return result

def extract_route_path(route):
    """Extract path points from a route."""
    if not route or 'legs' not in route:
        return []
    
    path = []
    for leg in route['legs']:
        for step in leg['steps']:
            path.extend(decode_polyline(step['polyline']['points']))
    return path

def decode_polyline(polyline_str):
    """Decode a Google Maps polyline string into a list of lat/lng points."""
    points = []
    index = lat = lng = 0

    while index < len(polyline_str):
        result = 1
        shift = 0
        while True:
            b = ord(polyline_str[index]) - 63 - 1
            index += 1
            result += b << shift
            shift += 5
            if b < 0x1f:
                break
        lat += (~(result >> 1) if (result & 1) != 0 else (result >> 1))

        result = 1
        shift = 0
        while True:
            b = ord(polyline_str[index]) - 63 - 1
            index += 1
            result += b << shift
            shift += 5
            if b < 0x1f:
                break
        lng += (~(result >> 1) if (result & 1) != 0 else (result >> 1))

        points.append({
            'lat': lat * 1e-5,
            'lng': lng * 1e-5
        })

    return points

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Ambulance Allocation API", "status": "running"})

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        print("Received prediction request")
        data = request.get_json()
        print("Request data:", data)
        
        if not data or 'user_latitude' not in data or 'user_longitude' not in data:
            return jsonify({"error": "Missing required parameters"}), 400
            
        user_latitude = float(data['user_latitude'])
        user_longitude = float(data['user_longitude'])
        
        if not ambulance_data is not None:
            return jsonify({"error": "Ambulance data not available"}), 500
            
        # Calculate distances to all ambulances
        ambulance_data['Distance'] = np.sqrt(
            (ambulance_data['amb_latitude'] - user_latitude) ** 2 +
            (ambulance_data['amb_longitude'] - user_longitude) ** 2
        )
        
        # Get nearest ambulance
        nearest_ambulance = ambulance_data.loc[ambulance_data['Distance'].idxmin()]
        
        # Get ambulance address
        ambulance_address = get_address_from_coordinates(
            nearest_ambulance['amb_latitude'],
            nearest_ambulance['amb_longitude']
        )
        
        # Get traffic data
        origin = f"{user_latitude},{user_longitude}"
        destination = f"{nearest_ambulance['amb_latitude']},{nearest_ambulance['amb_longitude']}"
        traffic_data = get_traffic_data(origin, destination)
        
        # Process route information
        routes_info = []
        optimal_route = None
        if traffic_data and 'routes' in traffic_data:
            optimal_route = traffic_data['routes'][0]
            for route in traffic_data['routes'][1:]:
                if route['legs'][0]['duration_in_traffic']['value'] < optimal_route['legs'][0]['duration_in_traffic']['value']:
                    routes_info.append(optimal_route)
                    optimal_route = route
                else:
                    routes_info.append(route)
        
        response_data = {
            'ambulance_number': str(nearest_ambulance['ambulance_number']),
            'phone_number': str(nearest_ambulance['phone_number']),
            'ambulance_address': ambulance_address,
            'ambulance_coordinates': f"({nearest_ambulance['amb_latitude']}, {nearest_ambulance['amb_longitude']})",
            'optimal_route': {
                'route_name': optimal_route['summary'] if optimal_route else 'Direct Route',
                'distance': optimal_route['legs'][0]['distance']['text'] if optimal_route else 'Unknown',
                'duration_in_traffic': optimal_route['legs'][0]['duration_in_traffic']['text'] if optimal_route else 'Unknown',
                'traffic_percentage': f"{((optimal_route['legs'][0]['duration_in_traffic']['value'] / optimal_route['legs'][0]['duration']['value'] - 1) * 100):.2f}%" if optimal_route else '0%'
            } if optimal_route else None,
            'alternative_routes': routes_info
        }
        
        print("Sending response:", response_data)
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/predict-ambulance', methods=['POST'])
def predict_ambulance():
    try:
        data = request.get_json()
        if not data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({'error': 'Missing required location data'}), 400

        user_lat = float(data['latitude'])
        user_lng = float(data['longitude'])
        user_location = f"{user_lat},{user_lng}"
        user_address = get_address_from_coordinates(user_lat, user_lng)

        # Get nearest ambulance using ML model
        if model is not None and ambulance_data is not None:
            # Prepare data for prediction
            input_data = pd.DataFrame({
                'user_Latitude': [user_lat],
                'user_Longitude': [user_lng],
                'Emergency_Type': [data.get('emergencyType', 'General')],
                'Time_of_Day': [datetime.datetime.now().hour],
                'Day_of_Week': [datetime.datetime.now().weekday()],
                'Month': [datetime.datetime.now().month],
                'Traffic_Condition': ['Medium'],  # Default value
                'Distance (km)': [0]  # Will be calculated
            })

            # Get prediction from model
            prediction = model.predict(input_data)[0]
            
            # Get ambulance details based on prediction
            available_ambulances = ambulance_data[ambulance_data['allocate'] == 'yes']
            if len(available_ambulances) > 0:
                # Get the nearest available ambulance
                ambulance = available_ambulances.iloc[0]
                ambulance_location = f"{ambulance['Latitude']},{ambulance['Longitude']}"
                
                # Get traffic data
                traffic_data = get_traffic_data(user_location, ambulance_location)
                
                if traffic_data and 'routes' in traffic_data:
                    main_route = traffic_data['routes'][0]
                    leg = main_route['legs'][0]
                    
                    # Calculate traffic percentage
                    normal_duration = leg['duration']['value']
                    traffic_duration = leg.get('duration_in_traffic', {}).get('value', normal_duration)
                    traffic_percentage = ((traffic_duration - normal_duration) / normal_duration) * 100

                    # Format route details
                    route_details = {
                        'name': main_route.get('summary', 'Main Route'),
                        'distance': leg['distance']['text'],
                        'duration_in_traffic': leg.get('duration_in_traffic', leg['duration'])['text'],
                        'traffic_percentage': f"{traffic_percentage:.2f}%",
                        'route_description': f"Take {main_route.get('summary', 'Main Route')} for optimal route",
                        'alternative_routes': []
                    }

                    # Add alternative routes
                    if len(traffic_data['routes']) > 1:
                        for alt_route in traffic_data['routes'][1:]:
                            alt_leg = alt_route['legs'][0]
                            alt_normal_duration = alt_leg['duration']['value']
                            alt_traffic_duration = alt_leg.get('duration_in_traffic', {}).get('value', alt_normal_duration)
                            alt_traffic_percentage = ((alt_traffic_duration - alt_normal_duration) / alt_normal_duration) * 100
                            
                            route_details['alternative_routes'].append({
                                'name': alt_route.get('summary', 'Alternative Route'),
                                'traffic_percentage': f"{alt_traffic_percentage:.2f}%",
                                'duration_in_traffic': alt_leg.get('duration_in_traffic', alt_leg['duration'])['text']
                            })

                    predicted_ambulance = {
                        'ambulance_number': str(ambulance['Vehicle_Number']),
                        'phone_number': str(ambulance['Contact_Number']),
                        'ambulance_address': get_address_from_coordinates(ambulance['Latitude'], ambulance['Longitude']),
                        'ambulance_coordinates': f"({ambulance['Latitude']}, {ambulance['Longitude']})",
                        'optimal_route': route_details
                    }

                    return jsonify(predicted_ambulance), 200
                else:
                    return jsonify({'error': 'Unable to fetch route data'}), 500
            else:
                return jsonify({'error': 'No available ambulances found'}), 500
        else:
            return jsonify({'error': 'ML model or ambulance data not available'}), 500

    except Exception as e:
        print(f"Error in predict_ambulance: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emergency-booking/create', methods=['POST', 'OPTIONS'])
def create_emergency_booking():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response, 204
    
    try:
        print("Received emergency booking request")
        data = request.get_json()
        print("Booking data:", data)
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        required_fields = ['emergencyType', 'latitude', 'longitude', 'address', 'ambulanceNumber']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
        # Generate a unique booking ID
        booking_id = f"EMG-{len(emergency_bookings) + 1}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Get traffic data for the optimal route
        origin = f"{data['latitude']},{data['longitude']}"
        destination = data['ambulanceDetails']['coordinates'].strip('()')
        traffic_data = get_traffic_data(origin, destination)
        
        optimal_route = None
        if traffic_data and 'routes' in traffic_data:
            optimal_route = traffic_data['routes'][0]
            route_path = extract_route_path(optimal_route)
            encoded_path = encode_path(route_path)
        
        # Store the booking
        emergency_bookings[booking_id] = {
            "id": booking_id,
            "status": "CONFIRMED",
            "created_at": datetime.datetime.now().isoformat(),
            "emergency_type": data['emergencyType'],
            "location": {
                "latitude": data['latitude'],
                "longitude": data['longitude'],
                "address": data['address']
            },
            "ambulance": data['ambulanceDetails'],
            "optimal_route": {
                "encoded_path": encoded_path if optimal_route else None,
                "distance": optimal_route['legs'][0]['distance']['text'] if optimal_route else "Unknown",
                "duration_in_traffic": optimal_route['legs'][0]['duration_in_traffic']['text'] if optimal_route else "Unknown"
            } if optimal_route else None
        }
        
        response_data = {
            "booking_id": booking_id,
            "status": "CONFIRMED",
            "message": "Emergency booking created successfully",
            "ambulance": emergency_bookings[booking_id]["ambulance"],
            "optimal_route": emergency_bookings[booking_id]["optimal_route"]
        }
        
        print("Created emergency booking:", response_data)
        return jsonify(response_data), 201
        
    except Exception as e:
        print(f"Error creating emergency booking: {str(e)}")
        return jsonify({"error": f"Failed to create emergency booking: {str(e)}"}), 500

@app.route('/api/emergency-booking/status/<booking_id>', methods=['GET', 'OPTIONS'])
def get_booking_status(booking_id):
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response, 204
        
    try:
        print(f"Checking status for booking: {booking_id}")
        
        if booking_id not in emergency_bookings:
            return jsonify({"error": "Booking not found"}), 404
            
        booking = emergency_bookings[booking_id]
        return jsonify(booking), 200
        
    except Exception as e:
        print(f"Error getting booking status: {str(e)}")
        return jsonify({"error": f"Failed to get booking status: {str(e)}"}), 500

if __name__ == '__main__':
    threading.Thread(target=open_browser).start()
    print("Starting Flask server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)