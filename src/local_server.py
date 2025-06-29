import time
from flask import Flask, request, jsonify, send_from_directory
import requests
import threading
import discord
from discord import Interaction, app_commands
import inspect
import webbrowser
import os

SITE_FOLDER = os.path.join(os.path.dirname(__file__), "site")

app = Flask(__name__)
bot_token = None

# ---------- Discord Bot ----------

class MyBot(discord.Client):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tree = app_commands.CommandTree(self)

    async def on_ready(self):
        print(f"✅ Logged in as {self.user}")
        await self.tree.sync()
        print("✅ Commands synced!")

intents = discord.Intents.default()
discord_bot = MyBot(intents=intents)

@discord_bot.tree.command(name="hello", description="Say hello and exit")
async def hello(interaction: Interaction):
    print("> /hello command received. Exiting bot...")

    await interaction.response.send_message(inspect.cleandoc(f"""
        **{interaction.user}** just said Hello, World!
        ✅ You can now go to step 9.
        The local server was shut down automatically..
    """))

    await discord_bot.close()
    os._exit(0)

def run_discord_bot(token: str):
    discord_bot.run(token)

# ---------- Flask Route ----------

@app.route("/start-bot", methods=["POST"])
def start_bot():
    global bot_token

    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"error_code": "token_required"}), 400

        r = requests.get(
            "https://discord.com/api/v10/users/@me",
            headers={"Authorization": f"Bot {token}"}
        )

        if r.status_code == 200:
            user_data = r.json()
            client_id = user_data.get("id")
            invite_link = (
                f"https://discord.com/api/oauth2/authorize"
                f"?client_id={client_id}&scope=applications.commands%20bot"
            )

            if not bot_token:
                bot_token = token
                threading.Thread(target=run_discord_bot, args=(token,), daemon=True).start()

            return jsonify({"message": f"Success! Invite your bot using this link: {invite_link}"})
        else:
            return jsonify({"error_code": "auth_failed"}), 400

    except requests.exceptions.RequestException:
        return jsonify({"error_code": "discord_api_unreachable"}), 500

    except Exception:
        return jsonify({"error_code": "unknown"}), 500

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