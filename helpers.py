"""Contains helper functions login_required and send_verification_mail.
    - login_required decorates routes to require login.
    - send_verification_mail sends an email with a code for email
    verification."""

import base64
from functools import wraps
from flask import redirect, session


def decode_timer(encoded_timer_id: str) -> int:
    """Decodes encoded_timer_id

    pre: encoded_timer_id is an id encoded with base64 encoding
    post: returns the timer_id"""

    decoded_timer_id = int(base64.urlsafe_b64decode(
        encoded_timer_id))
    return decoded_timer_id


def encode_timer(timer_id: int) -> str:
    """Encodes timer_id using base64 encoding

    pre: timer_id is a unique id
    post: returns an encoded id"""

    string = str(timer_id)
    encoded_timer_id = base64.urlsafe_b64encode(
        string.encode('utf-8')).decode('utf-8')
    return encoded_timer_id


def format_duration(duration: int) -> str:
    """Format duration as [hh:][mm:]ss

    pre: duration in seconds (int).
    post: returns a string of [hh:][mm:]ss"""

    hours = duration // 3600
    minutes = (duration % 3600) // 60
    seconds = duration % 60

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    elif minutes > 0:
        return f"{minutes:02d}:{seconds:02d}"
    else:
        return f"{seconds:02d}"


def login_required(f):
    """Decorate routes to require login

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def to_seconds(time: str) -> int:
    """Turns hh:ss:mm to seconds

    pre: time is a string in the format hh:mm:ss
    post: returns the total time in seconds"""

    split_time = time.split(":")
    hours = split_time[0].strip()
    minutes = split_time[1].strip()
    seconds = split_time[2].strip()
    return 3600 * int(hours) + 60 * int(minutes) + int(seconds)
