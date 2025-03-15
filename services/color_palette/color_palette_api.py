from flask import Flask, request, Response
from flask_cors import CORS
from neo4j import GraphDatabase
import os
import io
from dotenv import load_dotenv
from PIL import Image
import requests
import numpy as np
import colorgram
import colorsys
from tqdm import tqdm

# Load environment variables
load_dotenv()

NEO4J_PROTOCOL = "neo4j+s"
NEO4J_HOST = os.getenv("NEO4J_HOST", "localhost")
NEO4J_PORT = os.getenv("NEO4J_PORT", "7687")

NEO4J_URI = f"{NEO4J_PROTOCOL}://{NEO4J_HOST}:{NEO4J_PORT}"
NEO4J_USER = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

IMAGE_BASE_URL = "https://images.igdb.com/igdb/image/upload"
VALID_SIZES = ["cover_small", "cover_big"]


driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

app = Flask(__name__)
CORS(app)

def get_covers(driver, entity_type, entity_name):

    if entity_type == "User":
        query = """
        MATCH (e:User)-[:OWNS]-(g:Game)
        MATCH (g)-[:SHOWCASES]-(f:Franchise)
        WHERE e.username = $entity_name AND g.cover_image_id IS NOT NULL
        RETURN g.cover_image_id AS cover_image_id, g.release_date AS release_date, f.name AS franchise_name
        """
    elif entity_type == "Company":
        query = """
        MATCH (e:Company)-[:DEVELOPED_BY]-(g:Game)
        MATCH (g)-[:SHOWCASES]-(f:Franchise)
        WHERE e.name CONTAINS $entity_name AND g.cover_image_id IS NOT NULL
        RETURN g.cover_image_id AS cover_image_id, g.release_date AS release_date, f.name AS franchise_name
        UNION
        MATCH (e:Company)-[:PUBLISHED_BY]-(g:Game)
        MATCH (g)-[:SHOWCASES]-(f:Franchise)
        WHERE e.name CONTAINS $entity_name AND g.cover_image_id IS NOT NULL
        RETURN g.cover_image_id AS cover_image_id, g.release_date AS release_date, f.name AS franchise_name
        """
    else:
        raise ValueError("Invalid entity type. Must be 'User' or 'Company'.")

    query += """
    ORDER BY franchise_name, g.release_date"""
    query = query.format(entity_type=entity_type,)

    with driver.session() as session:
        results = session.run(query, entity_name=entity_name)

        # Ensure cover_image_id has at least 2 digits by converting to a string
        return [record["cover_image_id"] for record in results if len(str(record["cover_image_id"])) >= 2]

def get_igdb_image(image_id, size="cover_small"):
    if size not in VALID_SIZES:
        raise ValueError("Invalid image size.")

    image_url = f"{IMAGE_BASE_URL}/t_{size}/{image_id}.jpg"
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        raise Exception("Image not found or IGDB error.")

def adjust_proportion(rgb, proportion, boost=2.0):
    # Convert RGB (0-255) to HLS (Hue, Lightness, Saturation)
    r, g, b = [x / 255.0 for x in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)

    # Penalize high luminance (brighter colors) with a reciprocal function
    epsilon = 1e-5
    adjustment = boost * s * ((1 / (l + epsilon)) - 1)

    # Ensure the proportion remains positive
    return max(proportion * (1 + adjustment), 0)

def get_color_palette(image, num_colors=5, boost=2.0):
    palette = []
    colors = colorgram.extract(image, num_colors)
    colors.sort(key=lambda c: c.hsl.l)  # Sort by lightness (luminance)

    adjusted_palette = []

    for color in colors:
        rgb = (color.rgb.r, color.rgb.g, color.rgb.b)

        # Adjust the proportion with the luminance penalty
        adjusted_proportion = adjust_proportion(rgb, color.proportion, boost)

        adjusted_palette.append((rgb, adjusted_proportion))
    
    # Re-normalize proportions to sum to 1.0
    total = sum(p[1] for p in adjusted_palette)
    normalized_palette = [(rgb, prop / total) for rgb, prop in adjusted_palette]

    return normalized_palette

def create_palette_image(palettes, width=800, height=300):
    if len(palettes) > width: 
        width = len(palettes)
    
    else:
        width = len(palettes)*int(width/len(palettes))
    
    final_image = np.zeros((height, width, 3), dtype=np.uint8)

    palette_width = width // len(palettes)  # Use integer division
    current_x = 0

    for palette in palettes:
        current_y = 0
        accumulated_height = 0.0

        for i, (color, freq) in enumerate(palette):
            # Use floating-point for accurate height calculation
            color_height = freq * height
            accumulated_height += color_height

            # For the last color, fill the remaining height to avoid gaps
            if i == len(palette) - 1:
                color_height = height - current_y
            else:
                color_height = int(color_height)

            final_image[current_y:current_y + color_height, current_x:current_x + palette_width] = color
            current_y += color_height

        current_x += palette_width

    return Image.fromarray(final_image)

@app.route("/palette", methods=["GET"])
def palette():
    entity_type = request.args.get("type")
    entity_name = request.args.get("name")

    if not entity_type or not entity_name:
        return {"error": "Missing 'type' or 'name' parameter"}, 400

    try:
        covers = get_covers(driver, entity_type, entity_name)

        if not covers:
            return {"error": "No covers found."}, 404

        palettes = [
            get_color_palette(get_igdb_image(cover_id), num_colors=7)
            for cover_id in tqdm(covers, desc="Processing covers")
        ]

        palette_image = create_palette_image(palettes)
        img_io = io.BytesIO()
        palette_image.save(img_io, "PNG")
        img_io.seek(0)

        return Response(img_io.getvalue(), mimetype="image/png")

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8005)