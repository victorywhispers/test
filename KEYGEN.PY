import os
import json
import random
import string
import asyncio
import datetime
from datetime import timedelta
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup, InputMediaPhoto
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
from telegram.constants import ParseMode
from telegram.error import BadRequest

# Configure logging
logging.basicConfig(level=logging.INFO)

# Bot configuration 
BOT_TOKEN = "7909216903:AAGJXAo1nWT0Wqs6ohOdNaWwtejUEKcHtZs"  # Get from @BotFather
CHANNEL_USERNAME = "hecabruss"
CHANNEL_LINK = "https://t.me/hecabruss"

# User data file
USER_DATA_FILE = os.path.join(os.path.dirname(__file__), 'user_data.json')

# Load or create user data
if os.path.exists(USER_DATA_FILE):
    with open(USER_DATA_FILE, 'r') as f:
        user_data = json.load(f)
else:
    user_data = {}

def save_user_data():
    try:
        with open(USER_DATA_FILE, 'w') as f:
            json.dump(user_data, f, indent=2)
        print(f"Data saved to {USER_DATA_FILE}")
    except Exception as e:
        print(f"Error saving user data: {e}")

def generate_key():
    key = "WR-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return key

def get_expiry_time():
    return (datetime.datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔑 Generate Key", callback_data="generate")],
        [InlineKeyboardButton("🌟 Validate Key", callback_data="validate")],
        [InlineKeyboardButton("⏰ Check Time Left", callback_data="time")]
    ])
    
    await update.message.reply_text(
        "Welcome to WormGPT Key Generator! Choose an option:",
        reply_markup=keyboard
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user_id = str(query.from_user.id)
    
    if query.data == "generate":
        # Generate new key
        key = generate_key()
        expiry = get_expiry_time()
        
        # Save key data
        if user_id not in user_data:
            user_data[user_id] = {}
        
        user_data[user_id].update({
            "key": key,
            "expiry_time": expiry,
            "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        save_user_data()
        
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Main Menu", callback_data="start")]
        ])
        
        await query.message.edit_text(
            f"✅ Your new key:\n`{key}`\n\nExpires: {expiry}",
            reply_markup=keyboard,
            parse_mode=ParseMode.MARKDOWN
        )

    elif query.data == "validate":
        # Show validation instructions
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Main Menu", callback_data="start")]
        ])
        
        if user_id in user_data and user_data[user_id].get("key"):
            key = user_data[user_id]["key"]
            await query.message.edit_text(
                f"Your current key:\n`{key}`\n\nUse this at: wormgpt-frontend.onrender.com",
                reply_markup=keyboard,
                parse_mode=ParseMode.MARKDOWN
            )
        else:
            await query.message.edit_text(
                "You don't have a key yet. Generate one first!",
                reply_markup=keyboard
            )

    elif query.data == "time":
        # Check remaining time
        if user_id in user_data and user_data[user_id].get("expiry_time"):
            expiry = datetime.datetime.strptime(user_data[user_id]["expiry_time"], "%Y-%m-%d %H:%M:%S")
            now = datetime.datetime.now()
            if now < expiry:
                remaining = expiry - now
                hours = remaining.seconds // 3600
                minutes = (remaining.seconds % 3600) // 60
                await query.message.edit_text(
                    f"Time remaining: {hours}h {minutes}m",
                    reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔄 Main Menu", callback_data="start")]])
                )
            else:
                await query.message.edit_text(
                    "Your key has expired. Generate a new one!",
                    reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔑 Generate Key", callback_data="generate")]])
                )
        else:
            await query.message.edit_text(
                "You don't have a key yet. Generate one first!",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔑 Generate Key", callback_data="generate")]])
            )

    elif query.data == "start":
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔑 Generate Key", callback_data="generate")],
            [InlineKeyboardButton("🌟 Validate Key", callback_data="validate")],
            [InlineKeyboardButton("⏰ Check Time Left", callback_data="time")]
        ])
        await query.message.edit_text(
            "Choose an option:",
            reply_markup=keyboard
        )

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CallbackQueryHandler(button_handler))
    print("Bot started...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
