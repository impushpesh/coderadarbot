
# Coderadar bot


Coderadar Bot is a Telegram bot designed to track user statistics across popular coding platforms — LeetCode, Codeforces, and CodeChef. It automatically notifies users of any rating changes, allowing them to stay updated without having to open each platform. All you need is Telegram.

For a behind-the-scenes write-up on the architecture and development journey, check out this [Medium article](https://link.com).

![Image](https://github.com/user-attachments/assets/8a45c421-b1d9-43dc-9faa-0fbf556a73f6)


## Features

- **Track User Profiles**  
  Get real-time stats from:
  - LeetCode  
  - Codeforces  
  - CodeChef  

- **View Upcoming Contests**  
  Stay updated with upcoming contests on Codeforces directly through the bot.

- **Rating Change Alerts**  
  Uses **BullMQ** to periodically monitor user ratings across platforms and automatically notifies users when any change is detected.

- **Generate charts**  
  Generate rating charts of LeetCode and Codeforces

- **Admin Commands**  
  Includes powerful admin tools to:
  - View bot status (uptime, total users)  
  - Ban/unban users  
  - List all banned users  
  - Get specific user information  
  - Broadcast messages to all users

- **Advanced Logging with Winston**  
  - Custom log levels for better monitoring and debugging.
  - Log transported to telemetry.




## Demo



## Screenshots




## Tech Stack

This bot is built using **Node.js** and utilizes several powerful libraries and tools:

- **Telegraf.js** – For building the Telegram bot interface
- **BullMQ** – A robust queue system for scheduling background jobs (e.g. rating checks)
- **Mongoose** – MongoDB object modeling and schema validation
- **Axios** – To fetch data from coding platform APIs (LeetCode, Codeforces, CodeChef)
- **Chart.js + chartjs-node-canvas** – To generate performance graphs and charts
- **Winston** – Logging framework with multiple severity levels
- **winston-daily-rotate-file** – For rotating log files daily
- **@logtail/winston** – To send logs to Logtail for centralized monitoring
- **Express** – Lightweight server for webhooks or health checks

This stack enables the bot to perform efficient tracking, alerting, logging, and visualization of user data.



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file


```env
BOT_TOKEN=                # Telegram bot token from BotFather
MONGO_URI=               # MongoDB connection string
ADMIN_ID=                # Telegram user ID of the admin (only one admin supported for now)
NODE_ENV=                # Environment type (e.g., development, production)
LOG_LEVEL=               # Logging level (e.g., debug, info, warn, error, fatal)
REDIS_URL=               # Redis connection string for BullMQ (optional)
WEBHOOK_URL=             # Public URL for webhook setup
SOURCE_TOKEN=            # Token for telemetry
INGESTING_HOST=          # Host for telemetry ingestion
PORT=                    # Port number to run the bot server
```

To get the `SOURCE_TOKEN` and `INGESTING_HOST` follow the instruction - [Betterstack telemetry](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#centralizing-your-logs-in-the-cloud)

**NOTE:** Don't change the code of the files, just get the tokens.
## Getting Started

### Installation

1. **Fork** this repository to your GitHub account.
2. **Clone** the forked repository:
   ```bash
   git clone https://github.com/your-username/coderadarbot.git
   cd coderadarbot
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```


### Setting Up Ngrok (For Webhook Support)

1. Download and install Ngrok: [Ngrok Setup Guide](https://dashboard.ngrok.com/get-started/setup/windows)

2. In a new terminal window, run:
   ```bash
   ngrok http http://localhost:8080
   ```

3. Copy the **Forwarding URL** from the terminal (e.g. `https://something.ngrok-free.app`).

4. Add it to your `.env` file:
   ```env
   WEBHOOK_URL=https://something.ngrok-free.app
   ```


### Start Redis via Docker

Make sure Docker is installed, then run:
```bash
docker run -itd -p 6379:6379 redis
```


### Running the Bot

> Make sure you have `pm2` and `pm2-dev` installed globally:
```bash
npm install -g pm2 pm2-dev
```
**Note:** Only choose **one** mode out of Mode 1 and Mode 2.

#### Mode 1 – Development Mode
Runs the bot in watch mode using `pm2-dev`:
```bash
pm2-dev bot.js
```

####  Mode 2 – Cluster Mode (for Maximum CPU Utilization)
Runs the bot using all available CPU cores:
```bash
pm2 start bot.js -i max
```

> `-i max` starts the bot in cluster mode using all available CPU cores.

##  User Commands

| Command | Description |
|--------|-------------|
| `/setup` | Setup handles (LeetCode, Codeforces, etc.) |
| `/start` | Start the bot |
| `/help` | Show help with available commands |
| `/info` | Show your saved profile info from the database |
| `/delete` | Delete your profile from the bot database |
| `/togglecontestalerts` | Enable or disable upcoming contest alerts |
| `/leetcode` | Get LeetCode user info |
| `/leetcoderatinggraph` | Generate rating graph for LeetCode |
| `/codechef` | Get CodeChef profile info |
| `/codechefrating` | Get CodeChef user rating |
| `/codeforce` | Get Codeforces user info |
| `/codeforceratinggraph` | Generate rating graph for Codeforces |
| `/contest` | Get upcoming Codeforces contest details |
| `/status` | Get your status across all supported platforms |

---

## Admin Commands

| Command | Description |
|--------|-------------|
| `/banuser <telegram_id>` | Ban a user from using the bot |
| `/unbanuser <telegram_id>` | Unban a user |
| `/listbannedusers` | List all currently banned users |
| `/userinfo <telegram_id>` | Fetch user info from the database |
| `/broadcast <message>` | Broadcast a message to all users |
| `/uptime` | Show bot uptime |
| `/restartbot` | Restart the bot |
| `/botstats` | Show bot usage statistics |
| `/totalusers` | Show total number of registered users |

---