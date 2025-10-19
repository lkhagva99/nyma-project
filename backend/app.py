from flask import Flask, render_template, request, jsonify
from netmiko import ConnectHandler
import json

app = Flask(__name__)

# Json oos Olt mapping hiih
with open("olt_data.json", "r") as file:
    OLT_MAPPING = json.load(file)

# index.html zam
@app.route("/")
def index():
    return render_template("index.html")

# name suggestion
@app.route("/get_olt_names", methods=["GET"])
def get_olt_names():
    olt_names = set()  # Using a set to avoid duplicates
    for details in OLT_MAPPING.values():
        for olt in details["Eth-Trunks"].values():
            if olt:  # Avoid empty values
                olt_names.add(olt)

    return jsonify({"olt_names": sorted(olt_names)})

#  VLAN configuratio handle hiih zamn
@app.route("/configure_vlan", methods=["POST"])
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
    app.run(host="10.128.50.83", port=5000)
