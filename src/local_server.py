import time
from flask import Flask, request, jsonify, send_from_directory
import requests
from flask_cors import CORS
import threading
import discord
from discord import app_commands
import inspect
import webbrowser
import os

SITE_FOLDER = os.path.join(os.path.dirname(__file__), "site")

app = Flask(__name__, static_folder=SITE_FOLDER, static_url_path="")
CORS(app)

bot_token = None

class MyBot(discord.Client):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tree = app_commands.CommandTree(self)

    async def on_ready(self):
        print(f"Logged app: {self.user}")
        print("------")
        await self.tree.sync()
        print("Commands synced!")

intents = discord.Intents.default()
discord_bot = MyBot(intents=intents)

@discord_bot.tree.command()
async def hello(interaction: discord.Interaction):
    print(f"> You used /hello command. Now you can close this by pressing Ctrl + C.")
    await interaction.response.send_message(inspect.cleandoc(f"""
        **{interaction.user}** just said Hello, World!
        Now you can go to step 9.
    """))

@discord_bot.tree.command()
async def shutdown(interaction: discord.Interaction):
    print(f"> {interaction.user} used /shutdown command.")
    await interaction.response.send_message("Bye...")
    await discord_bot.close()

def run_discord_bot(token):
    discord_bot.run(token)

@app.route("/start-bot", methods=["POST"])
def start_bot():
    global bot_token
    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"message": "Token is required"}), 400

        r = requests.get(
            "https://discord.com/api/v10/users/@me",
            headers={"Authorization": f"Bot {token}"}
        )

        if r.status_code == 200:
            user_data = r.json()
            client_id = user_data.get("id")
            invite_link = f"https://discord.com/api/oauth2/authorize?client_id={client_id}&scope=applications.commands%20bot"

            if not bot_token:
                bot_token = token
                threading.Thread(target=run_discord_bot, args=(bot_token,), daemon=True).start()

            return jsonify({"message": f"Success! Invite your bot using this link: {invite_link}"})
        else:
            error_data = r.json()
            return jsonify({"message": f"Failed to authenticate bot token (check it if it's right): {error_data.get('message', 'Unknown error')}"}), 400

    except requests.exceptions.RequestException as e:
        return jsonify({"message": f"Error connecting to Discord API: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/")
def index():
    return send_from_directory(SITE_FOLDER, "index.html")

@app.route("/<path:path>")
def serve_static_file(path):
    return send_from_directory(SITE_FOLDER, path)

if __name__ == "__main__":
    SITE_FOLDER = os.path.abspath("site")

    def open_browser():
        time.sleep(1)
        webbrowser.open("http://127.0.0.1:5000")

    threading.Thread(target=open_browser).start()

    app.run(debug=True, use_reloader=False)