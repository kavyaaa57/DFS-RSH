from flask import Flask, request, jsonify

app = Flask(__name__)

# Endpoint to collect data
@app.route('/collect-data', methods=['POST'])
def collect_data():
    data = request.json
    print("Received Data:", data)

    # Save data to a file
    with open("collected_data.json", "a") as file:
        file.write(str(data) + "\n")

    return jsonify({"message": "Data received successfully!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
