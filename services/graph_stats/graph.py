from flask import Flask, jsonify, Response
from flask_cors import CORS
from neo4j import GraphDatabase
import plotly.express as px
import pandas as pd
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False  # To handle non-ASCII characters in JSON
CORS(app)

# Load credentials from environment variables

# Load .env file
load_dotenv()

NEO4J_PROTOCOL = "neo4j+s"
NEO4J_HOST = os.getenv("NEO4J_HOST", "localhost")
NEO4J_PORT = os.getenv("NEO4J_PORT", "7687")

NEO4J_URI = f"{NEO4J_PROTOCOL}://{NEO4J_HOST}:{NEO4J_PORT}"
NEO4J_USER = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

print(f"Connecting to Neo4j at {NEO4J_URI} with user {NEO4J_USER}")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

#---------- GENRE DISTRIBUTION ----------

def get_genre_distribution(company_name):
    """Query Neo4j to get the count of each genre developed by a company."""
    with driver.session() as session:
        query = """
        MATCH (c:Company)-[:DEVELOPED_BY]-(g:Game)-[:BELONGS_TO]-(genre:Genre)
        WHERE c.name CONTAINS $company_name AND genre.name <> "NULL"
        RETURN genre.name AS genre, COUNT(g) AS count
        """
        result = session.run(query, company_name=company_name)
        data = [{"genre": record["genre"], "count": record["count"]} for record in result]
    return data

@app.route("/graphs/genre-distribution/<company_name>", methods=["GET"])
def genre_distribution(company_name):
    """Generate a plotly graph for genre distribution."""
    
    data = get_genre_distribution(company_name)  # Should return a list of dictionaries
    if not data:
        return jsonify({"error": "No data found"}), 404

    # Convert list of dictionaries to DataFrame
    df = pd.DataFrame(data)

    # Sort data by count (descending)
    df = df.sort_values(by="count", ascending=False)

    # Assign unique colors for each genre
    genre_colors = px.colors.qualitative.Set2  # You can change to another color set
    color_map = {genre: genre_colors[i % len(genre_colors)] for i, genre in enumerate(df["genre"])}

    # Create a sorted bar chart with colors
    fig = px.bar(
        df, 
        x="genre", 
        y="count", 
        title=f"Genres Developed by {company_name}",
        color="genre", 
        color_discrete_map=color_map  # Assign colors to each genre
    )

    # Remove toolbar (mode bar)
    fig.update_layout(
        dragmode=False, 
        showlegend=False, 
        xaxis_title="", 
        yaxis_title="Nombre de jeux",
        margin=dict(l=0, r=0, t=0, b=0),
        paper_bgcolor="#222222",  # Dark background
        plot_bgcolor="#222222",  # Dark background
        font=dict(color="#FFFFFF"),  # White font color
        width=1000,  # Adjust width (default is ~700)
        title=None,
    )
    
    # return jsonify(fig.to_json())
    return Response(
        fig.to_json(),
        mimetype='application/json'
    )


#--------- PLATFORM DISTRIBUTION ---------

def get_platform_distribution(company_name):
    """Query Neo4j to get the count of each platform and its generation developed by a company."""
    with driver.session() as session:
        query = """
        MATCH (c:Company)-[:DEVELOPED_BY]-(g:Game)-[:AVAILABLE_ON]-(platform:Platform)-[:BELONGS_TO]-(gen:Generation)
        WHERE c.name CONTAINS $company_name AND platform.name <> "NULL"
        RETURN platform.name AS platform, gen.name AS generation, COUNT(g) AS count
        """
        result = session.run(query, company_name=company_name)
        data = [{"platform": record["platform"], "generation": record["generation"], "count": record["count"]} for record in result]
    return data


@app.route("/graphs/platform-distribution/<company_name>", methods=["GET"])
def platform_distribution(company_name):
    """Generate a Plotly sunburst chart for platform distribution."""
    data = get_platform_distribution(company_name)  # Fetch data from Neo4j
    if not data:
        return jsonify({"error": "No data found"}), 404

    # Convert data into a DataFrame and sort by count (descending)
    df = pd.DataFrame(data).sort_values(by="count", ascending=False)

    # Generate a sunburst chart
    fig = px.sunburst(
        df,
        path=["generation", "platform"],  # Hierarchy: Generation -> Platform
        values="count",  # Number of games per platform
        title=f"Platforms where {company_name} released games",
        color_discrete_sequence=px.colors.qualitative.Set3  # Optional: Custom color scheme
    )

    # Remove mode bar
    fig.update_layout(
        width=700,  # Adjust width (default is ~700)
        height=700,  # Adjust height (default is ~450)
        paper_bgcolor="#222222",  # Dark background
        font=dict(color="#FFFFFF"),  # White font color
        showlegend=True,
        title=None,
        margin=dict(l=0, r=0, t=0, b=0),
    )

    return Response(
        fig.to_json(),
        mimetype='application/json'
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True, threaded=True)