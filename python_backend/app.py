from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from netmiko import ConnectHandler
import json
import sqlite3
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
# CORS(app, 
#      origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
#      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#      allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
#      supports_credentials=True)

# Alternative: Allow all origins for development (uncomment if needed)
CORS(app, resources={r"/*": {"origins": "*"}})

# JWT secret key
app.config['JWT_SECRET'] = os.environ.get('JWT_SECRET', 'supersecret')

# Database setup
def init_db():
    conn = sqlite3.connect('sqlite.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database
init_db()

# JWT token validation decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(data, *args, **kwargs)
    return decorated

# Json oos Olt mapping hiih
olt_data_path = os.path.join(os.path.dirname(__file__), "olt_data.json")
if os.path.exists(olt_data_path):
    with open(olt_data_path, "r") as file:
        OLT_MAPPING = json.load(file)
else:
    # Fallback to backend utils path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend", "utils", "olt_data.json")
    with open(backend_path, "r") as file:
        OLT_MAPPING = json.load(file)

# Authentication routes
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = sqlite3.connect('sqlite.db')
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({'error': 'User already exists'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Insert user
    cursor.execute(
        'INSERT INTO users(email, password, created_at) VALUES(?, ?, ?)',
        (email, hashed_password, datetime.now())
    )
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = sqlite3.connect('sqlite.db')
    cursor = conn.cursor()
    
    # Get user
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate JWT token
    token_payload = {
        'id': user[0],
        'email': user[1],
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(token_payload, app.config['JWT_SECRET'], algorithm='HS256')
    
    return jsonify({'token': token})

@app.route('/auth/verify', methods=['GET'])
@token_required
def verify_token(token_data):
    return jsonify({
        'ok': True,
        'user': {
            'id': token_data['id'],
            'email': token_data['email']
        }
    })

# index.html zam
@app.route("/")
def index():
    print("Is working")
    return jsonify({"message": "Is working"})

# name suggestion
@app.route("/olt/get_olt_names", methods=["GET"])
def get_olt_names():
    olt_names = set()  # Using a set to avoid duplicates
    for details in OLT_MAPPING.values():
        for olt in details["Eth-Trunks"].values():
            if olt:  # Avoid empty values
                olt_names.add(olt)

    return jsonify({"olt_names": sorted(olt_names)})

#  VLAN configuratio handle hiih zamn
@app.route("/olt/configure_vlan", methods=["POST"])
def configure_vlan():
    data = request.json
    olt_name = data.get("olt_name")
    vlan = data.get("vlan")

    # Зөв eth-trunk түүнд харялагдах IP address
    router_ip = None
    eth_trunks = []
    for ip, details in OLT_MAPPING.items():
        for eth_trunk, olt in details["Eth-Trunks"].items():
            if olt_name == olt:
                router_ip = ip
                eth_trunks.append(eth_trunk)
    # OLT олдохгүй үед
    if not router_ip:
        return jsonify({"message": "OLT not found!"}), 400

    # логин
    router = {
        "device_type": "huawei_vrp",
        "ip": router_ip,
        "username": "nyamdorj",
        "password": "Up!@#03220211"
    }
    print(router)
    # Vlan тохируулах хэсэг
    commands = [f"vlan batch {vlan}"]
    for eth_trunk in eth_trunks:
        commands.append(f"interface {eth_trunk}")
        commands.append(f"port trunk allow-pass vlan {vlan}")

    try:
        with ConnectHandler(**router) as net_connect:
            output = net_connect.send_config_set(commands)
            net_connect.save_config()
        
        return jsonify({"message": f"VLAN {vlan} added to {eth_trunks} on {router_ip}", "output": output})

    except Exception as e:
        return jsonify({"message": "Error configuring VLAN", "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 3001))
    host = os.environ.get('HOST', '0.0.0.0')  # Allow external connections
    print(f"Starting server on {host}:{port}")
    app.run(host=host, port=port)
