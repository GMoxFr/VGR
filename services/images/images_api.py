from flask import Flask, request, jsonify, Response
import requests
from io import BytesIO
import numpy as np
from sklearn.cluster import KMeans
from PIL import Image

app = Flask(__name__)

# IGDB Base Image URL
IMAGE_BASE_URL = "https://images.igdb.com/igdb/image/upload"

# Allowed size presets
VALID_SIZES = {
    "cover": ["cover_small", "cover_big"],
    "screenshot": ["screenshot_med", "screenshot_big", "screenshot_huge", "720p", "1080p"],
    "misc": ["thumb", "micro", "logo_med"]
}

def darken_color(color, factor=0.7):
    """Darken an RGB color by a given factor (default: 70% of original brightness)."""
    return tuple(max(0, int(c * factor)) for c in color)

def rgb_to_hex(rgb):
    """Convert an (R, G, B) tuple with float values to a HEX string."""
    rgb = tuple(int(c) for c in rgb)  # Convert floats to integers
    return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

def get_most_suitable_color(img_data, k=8, color_tol=10):
    """Returns the most suitable color using k-means clustering on the image."""
    # Open the image
    img = Image.open(img_data)
    img = img.convert("RGB")
    img = np.array(img)

    # Reshape the image into a list of RGB values
    img_reshaped = img.reshape((img.shape[0] * img.shape[1], 3))

    # Perform KMeans clustering to find the most prominent colors
    clt = KMeans(n_clusters=k)
    clt.fit(img_reshaped)

    # Get the cluster centers (the most prominent colors)
    centroids = clt.cluster_centers_

    # Find the most vibrant color (highest colorfulness index)
    colorfulness = [colorfulness_metric(c[0], c[1], c[2]) for c in centroids]
    most_vibrant_color = centroids[np.argmax(colorfulness)]

    return tuple(most_vibrant_color)

def colorfulness_metric(r, g, b):
    """Calculate colorfulness index of a color."""
    rg = np.absolute(r - g)
    yb = np.absolute(0.5 * (r + g) - b)
    rg_mean, rg_std = (np.mean(rg), np.std(rg))
    yb_mean, yb_std = (np.mean(yb), np.std(yb))
    std_root = np.sqrt((rg_std ** 2) + (yb_std ** 2))
    mean_root = np.sqrt((rg_mean ** 2) + (yb_mean ** 2))
    return std_root + (0.3 * mean_root)

@app.route("/colors/<string:image_id>", methods=["GET"])
def get_image_color(image_id):
    """Retrieve a suitable color"""
    
    size = "logo_med"  # Use a small size for color extraction
    image_url = f"{IMAGE_BASE_URL}/t_{size}/{image_id}.jpg"
    
    img_response = requests.get(image_url, stream=True)
    if img_response.status_code != 200:
        return jsonify({"error": "Image not found or IGDB error"}), 404

    img_data = BytesIO(img_response.content)
    
    # Get the most suitable color using k-means
    vibrant_color = get_most_suitable_color(img_data)

    return jsonify({
        "color": rgb_to_hex(vibrant_color)
    })

@app.route("/image/<string:image_id>", methods=["GET"])
def get_image(image_id):
    """Retrieve and return an IGDB image directly."""
    
    image_type = request.args.get("type", "cover")  # 'cover' or 'screenshot'
    size = request.args.get("size", "cover_big")    # Default: cover_big
    retina = request.args.get("retina", "false").lower() == "true"  # Retina mode (_2x)
    
    # Validate image type
    if image_type not in VALID_SIZES:
        return Response("Invalid type. Use 'cover' or 'screenshot'.", status=400)
    
    # Validate size
    if size not in VALID_SIZES[image_type] and size not in VALID_SIZES["misc"]:
        return Response(f"Invalid size. Choose from {VALID_SIZES}.", status=400)
    
    # Apply Retina Mode
    size += "_2x" if retina else ""

    # Construct IGDB image URL
    image_url = f"{IMAGE_BASE_URL}/t_{size}/{image_id}.jpg"

    # Fetch the image
    img_response = requests.get(image_url, stream=True)

    if img_response.status_code != 200:
        return Response("Image not found or IGDB error.", status=404)

    # Return the image directly
    return Response(img_response.content, content_type="image/jpeg")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
