"""## Contains Models for Timer, Subtimer and Settings classes.

#### Timer class example:  
- timer = Timer()
- timer.duration = <duration in seconds>   
- timer.add_subtimer(<duration in seconds>)  


#### SubTimer class example:  
- subtimer = SubTimer()
- subtimer.duration = <duration in seconds>  
- subtimer.timer_id = <id of associated Timer>  


#### Settings class example:  
- settings = Settings(<browser_id>)  
- settings.add_settings(
    - [threshold_value: <threshold_value in seconds>](defaults to 10),  
    - [threshold_behaviour: <theshold behaviour as either "blink" or "colour">](defaults to "blink"),   
    - [timer_shape: <timer_shape as either "circle" or "rectangle">(defaults to "circle")],   
    - [colour_scheme: <colour_scheme as int in range(1,6)>](defaults to 1)
    )"""  # noqa

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Settings(db.Model):
    """## Class of Settings
    Stores the settings of the user.
    Includes:
        - a unique browser_id,
        - a threshold value in seconds,
        - threshold behaviour as "blink" or "colour",
        - timer shape as "circle" or "rectangle",
        - a colour scheme id in range(1,6)"""  # noqa

    __tablename__ = "settings"
    browser_id = db.Column(db.String, primary_key=True)
    threshold_value = db.Column(db.Integer)
    threshold_behaviour = db.Column(db.String)
    timer_shape = db.Column(db.String)
    colour_scheme = db.Column(db.Integer)

    def __init__(self, browser_id: str) -> None:
        self.browser_id = browser_id

    def add_settings(self, threshold_value: int = 10,
                     threshold_behaviour: str = "blink",
                     timer_shape: str = "circle",
                     colour_scheme: int = 1) -> None:
        """Add settings to the table
        pre: threshold_value is an int, threshold_behaviour is a string,
        timer_shape is a string, colour_scheme is an int"""

        self.threshold_value = threshold_value
        self.threshold_behaviour = threshold_behaviour
        self.timer_shape = timer_shape
        self.colour_scheme = colour_scheme


class SubTimer(db.Model):
    """## Class of Subtimers    
    Links to subtimers database.  
    Includes:  
        - a unique id,
        - a duration in seconds,
        - a name that users can enter to identify their timer by,
        - a many-to-one relationship with the Timer class/databese."""  # noqa

    __tablename__ = "subtimers"
    id = db.Column(db.Integer, primary_key=True)
    duration = db.Column(db.Integer)
    name = db.Column(db.String)
    timer_id = db.Column(db.Integer, db.ForeignKey("timers.id"))

    timer = db.relationship("Timer", back_populates="subtimers")


class Timer(db.Model):
    """## Class of Timers    
    Links to timers database.  
    Includes:
        - a unique id,
        - a duration in seconds,
        - a name that users can enter to identify their timer by,
        - a one-to-many relationship with the SubTimer class/database."""  # noqa

    __tablename__ = "timers"
    id = db.Column(db.Integer, primary_key=True)
    duration = db.Column(db.Integer)
    name = db.Column(db.String)

    # Relationship with subtimers, subtimers are removed when timer is removed
    subtimers = db.relationship(
        "SubTimer", back_populates="timer", cascade="all, delete-orphan")

    def add_subtimer(self, duration: int, name: str = "Section") -> None:
        """Add a subtimer to the timer.

        pre: duration in seconds  
        post: _subtimer is a SubTimer class and added to the subtimers list."""  # noqa
        _subtimer = SubTimer()
        _subtimer.duration = duration
        _subtimer.name = name
        self.subtimers.append(_subtimer)
