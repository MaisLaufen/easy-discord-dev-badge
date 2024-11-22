from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import threading
import discord
from discord import app_commands
import inspect

app = Flask(__name__)
CORS(app)

bot_token = None

class MyBot(discord.Client):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tree = app_commands.CommandTree(self)

    async def on_ready(self):
        print(f"Logged app: {self.user}")
        print("------")
        # Синхронизация команд
        await self.tree.sync()
        print("Commands synced!")

# Создаём экземпляр Discord клиента
intents = discord.Intents.default()
discord_bot = MyBot(intents=intents)

@discord_bot.tree.command()
async def hello(interaction: discord.Interaction):
    """Print in chat"""
    print(f"> You used /hello command. Now you can close this by pressing Ctrl + C.")

    # Response in discord channel
    await interaction.response.send_message(inspect.cleandoc(f"""
        **{interaction.user}** just said Hello, World!
        Now you can go to step 9.
    """))

@discord_bot.tree.command()
async def shutdown(interaction: discord.Interaction):
    """Shuts down the bot"""
    print(f"> {interaction.user} used /shutdown command.")
    # Response in discord channel
    await interaction.response.send_message("Bye...")

    await discord_bot.close()

# Run bot in other thread
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

        # Token check
        r = requests.get(
            "https://discord.com/api/v10/users/@me",
            headers={"Authorization": f"Bot {token}"}
        )

        if r.status_code == 200:
            user_data = r.json()
            client_id = user_data.get("id")
            invite_link = f"https://discord.com/api/oauth2/authorize?client_id={client_id}&scope=applications.commands%20bot"

            # Run bot in other thread
            if not bot_token:  # Bot start only once
                bot_token = token
                threading.Thread(target=run_discord_bot, args=(bot_token,), daemon=True).start()

            return jsonify({"message": f"Success! Invite your bot using this link: {invite_link}"})
        else:
            error_data = r.json()
            return jsonify({"message": f"Failed to authenticate bot token (check it if its right): {error_data.get('message', 'Unknown error')}"}), 400

    except requests.exceptions.RequestException as e:
        return jsonify({"message": f"Error connecting to Discord API: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)