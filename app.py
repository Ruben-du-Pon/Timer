"""Flask app for a timer with subtimers which count up and turn red
when they run too long."""

# Import all necessary modules
import uuid6

from config import app
from datetime import datetime, timedelta
from flask import flash, make_response, redirect, render_template, request, \
    send_from_directory, session, url_for, jsonify
from flask_session import Session
from helpers import decode_timer, encode_timer, format_duration, to_seconds
from models import db, Timer, Settings
from typing import Dict

# Set a secret key
app.secret_key = "Echt_Super_Geheim_Man!!!"

# Initialize the Flask app
db.init_app(app)

# Configure Jinja filters
app.jinja_env.filters["format_duration"] = format_duration

Session(app)

# Default settings if none are entered in the settings page
DEFAULT_SETTINGS: Dict[str, str | int] = \
    {"threshold_value": 10,
     "threshold_behaviour": "blink",
     "timer_shape": "circle",
     "colour_scheme": 1}


@app.route("/static/js/<string:filename>")
def serve_js(filename):
    """Give JavaScript files the application/javascript mimetype
    to help with JavaScript module issues"""

    return send_from_directory("static/js", filename, mimetype="application/javascript")


@app.route("/", methods=["GET"])
def index():
    """Load the Home Page"""

    # Check if this person has visited before, if not set a cookie
    if "browser_id" not in request.cookies:
        # Create a unique id
        browser_id = str(uuid6.uuid7())
        # Set expiration date of 1 year
        expiration_date = datetime.now() + timedelta(days=365)
        # Render homepage
        response = make_response(render_template("index.html"))
        # Set cookie
        response.set_cookie("browser_id", browser_id,
                            expires=expiration_date, samesite="Strict")
        # Store id in session for later use
        session["browser_id"] = browser_id

        return response

    else:
        # Get the cookie
        browser_id = request.cookies.get("browser_id")
        # Reset the expiration date
        expiration_date = datetime.now() + timedelta(days=365)
        # Render homepage
        response = make_response(render_template("index.html"))
        # Reset cookie
        response.set_cookie("browser_id", browser_id,
                            expires=expiration_date, samesite="Strict") \
            if browser_id else None
        # Store id in session for later use
        session["browser_id"] = browser_id

        return response


@app.route("/api/css_loader")
def api_css_loader():
    """API that returns settings data as JSON:
    - threshold value in seconds
    - threshold behaviour as a string
    - timer shape as a string
    - colour scheme as an int"""

    # Make sure the browser_id cookie is read
    if "browser_id" not in session:
        return jsonify(), 404

    # Find if there are any settings stored for this browser_id
    settings = Settings.query.get(session["browser_id"])
    # If there are, send JSON with those settings
    if settings:
        settings_data = {
            "threshold_value": settings.threshold_value,
            "threshold_behaviour": settings.threshold_behaviour,
            "timer_shape": settings.timer_shape,
            "colour_scheme": settings.colour_scheme}
        return jsonify(settings_data)
    # If no settings are found send JSON with default settings
    else:
        return jsonify(DEFAULT_SETTINGS)


@app.route("/api/current_timer")
def api_current_timer():
    """API that returns current timer data as JSON:
    - id as a unique identifier string
    - name as a string
    - duration in seconds
    - a list of subtimers"""

    # If there is data for a timer in the session send it to JS
    if "current_timer" in session:
        current_timer = session["current_timer"]

        return jsonify(current_timer)
    # If no data is found send a 404 error
    else:
        return jsonify(), 404


@app.route("/set_timer", methods=["GET", "POST"])
def set_timer():
    """Set the timer"""

    # Make sure the browser_id cookie is read
    if "browser_id" not in session:
        return redirect("/")

    # Delete any active timers in the session
    session.pop("current_timer", None)

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure the main timer has ben set
        if not request.form.get("mainTimer"):
            flash("Please enter the duration for your timer", "safe")
            return redirect("/set_timer")

        # Get the main timer and subtimer durations
        main_timer_duration = to_seconds(
            request.form.get("mainTimer", default="0"))
        main_timer_name = request.form.get(
            "mainTimerName", default="mainTimer")
        subtimer_durations = [to_seconds(
            duration) for duration in request.form.getlist("subTimer")]
        subtimer_names = [
            name for name in request.form.getlist("subTimerName")]

        # Create the main timer
        main_timer = Timer()
        main_timer.duration = main_timer_duration
        main_timer.name = main_timer_name

        # Add subtimers based on the durations retrieved from the form
        for duration, name in zip(subtimer_durations, subtimer_names):
            main_timer.add_subtimer(duration, name)

        # Add main timer to database
        db.session.add(main_timer)
        db.session.commit()

        # Generate an encoded ID
        timer_id = encode_timer(main_timer.id)

        # Store timer in session
        session["current_timer"] = {
            "id": main_timer.id,
            "name": "mainTimer",
            "duration": main_timer.duration,
            "subtimers": [
                {"id": subtimer.id,
                 "duration": subtimer.duration,
                 "name": f"subTimer{index + 1}"}
                for index, subtimer in enumerate(
                    main_timer.subtimers)
            ]
        }

        return redirect(url_for('timer', id=timer_id,))

    # User reached route via GET (as by clicking a link or via redirect)
    else:

        return render_template("set_timer.html")


@app.route("/settings", methods=["GET", "POST"])
def settings():
    """Allow users to enter settings."""

    # Make sure the browser_id cookie is read
    if "browser_id" not in session:
        return redirect("/")

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Get the settings entered by the user
        threshold_value = int(request.form.get("threshold_value", 10))
        threshold_behaviour = request.form.get("threshold_behaviour", "blink")
        timer_shape = request.form.get("timer_shape", "circle")
        colour_scheme = int(request.form.get("colour_scheme", 1))

        # Ensure threshold value is an int
        if not isinstance(threshold_value, int):
            flash("Please enter threshold value in seconds.", category="safe")
            return redirect("/settings")

        # Get the browser_id stored in the session
        browser_id = session["browser_id"]

        # See if settings already exist for this user
        settings = Settings.query.get(browser_id)
        # Update settings if they exist
        if settings:
            settings.add_settings(
                threshold_value,
                threshold_behaviour,
                timer_shape,
                colour_scheme)
            db.session.commit()
        # If not, create a new db entry
        else:
            settings = Settings(browser_id)
            settings.add_settings(
                threshold_value,
                threshold_behaviour,
                timer_shape,
                colour_scheme)
            db.session.add(settings)
            db.session.commit()

        flash("Settings succesfully applied.", category="safe")
        return redirect("/settings")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("settings.html")


@app.route("/timer/<id>")
def timer(id):
    """Show the timer"""

    # Make sure the browser_id cookie is read
    if "browser_id" not in session:
        return redirect("/")

    decoded_id = decode_timer(id)
    current_timer = Timer.query.filter_by(id=decoded_id).first()

    return render_template("timer.html", timer=current_timer)
