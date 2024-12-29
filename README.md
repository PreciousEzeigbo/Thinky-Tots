# Thinky-Tots

Welcome to **Thinky-Tots**, a playful learning webapp where kids can log in and solve quizzes while learning in the process.
Thinky-Tots is here to support your kids amazing learning adventure.


## Table of Contents

- [Project Overview](#project-overview)
- [How Thinky-Tots Came to Be](#how-Thinky-Tots-came-to-be)
- [Key Features](#key-features)
- [How to Launch on Your PC](#how-to-launch-on-your-pc)
- [Technologies Used](#technologies-used)
- [Contact Information](#contact-information)

---

## Project Overview

Thinky-Tots helps users:
- **Learn through quizzes**: Choose a preffered quiz type and solve them.
- **View progress**: View the amount of quizzes the user has been able to amass. 
- **Leaderboard**: Although the Leaderboard feature is a future update, this aims to allow users motivate each other on how far they can reach answering quizzes.

## How Thinky-Tots Came to Be

THINKY TOTS came to be after realizing that there are ways to engage kids positivily and digitally in this times, it was created to be interactive educational web site designed to make learning fun and engaging for young children. Through playful puzzles, kids can explore the foundations of language and math while fostering creativity, critical thinking, and problem-solving skills. Our mission is to provide a safe, enjoyable, and enriching environment where children can learn, play, and grow.

Also, if you've ever found yourself wondering whether walking from the fridge to the couch counts as cardio – you’re in the right place.

## Key Features

- **Quizzes**: Choose your preffered quiz type and play.
- **Progress Tracker**: Track how much and how well you've accomplished in the quizzes.
- **Simple and Clean Design**: A responsive and visually appealing interface themed in shades of, blue, and white.

## How to Launch on Your PC

Follow the steps below to set up **Thinky-Tots** on your local machine.

### Prerequisites
- Python (version 3.8 or higher)
- Virtualenv (optional but recommended)
- SQLite (no installation required, it's included with Python)

### Step 1: Clone the Repository

bash
git clone https://github.com/PreciousEzeigbo/Thinky-Tots.git
```bash
cd Thinky-Tots
```
### Step 2: Set Up a Virtual Environment (Optional but Recommended)
```bash

python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```
### Step 3: Install Dependencies

```bash

pip install -r requirements.txt
```
### Step 4: Initialize the SQLite Database

```bash

flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# This will set up the database for Thinky-Tots. We're using SQLite, so you don't need any additional setup.
```
### Step 5: Run the App

```bash

flask run

# The app will be available at http://127.0.0.1:5000. Now you can start exploring
```
### Step 6: Troubleshooting

If you encounter any issues, make sure:

    You’ve activated your virtual environment.
    All dependencies have been installed (pip install -r requirements.txt).
    The database migration ran without errors.

### Technologies Used

    Python: For the backend models(PS, that's what I'm more familiar with at the moment). 
    Flask: For building the web app and routing.
    Flask-Migrate: For database migrations.
    SQLite: For the database (simple and lightweight).
    HTML/CSS: For the frontend interface.
    JavaScript: For interactivity.

## Contact Information

Developed by Christian Chibuike and Precious Ezeigbo, tech enthusiasts who are trying to create more engaging/interactive platforms for kids to learn faster and grow.

- **GitHub**: PreciousEzeigbo
- **LinkedIn**: Precious Ezeigbo
- **X**: preciousezeigbo


- **GitHub**: Awesome6192
- **LinkedIn**: www.linkedin.com/in/christian-chibuike-14a912102
- **X**: c_chibuzor_c

Feel free to reach out if you have questions, suggestions, or just want to chat about collaboartions.


## css


Feel free to tweak it further, but this version includes all the details for setting up the app, its backstory, and some jokes to keep things lighthearted!
