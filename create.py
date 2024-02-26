import os
import models

from datetime import datetime
from sqlalchemy import text

from app import app

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")


def main():
    with app.app_context():
        # Find tables defined in models.py
        tables_to_archive = models.db.Model.metadata.tables.values()

        for table in tables_to_archive:
            # Append _archive_datetime to the table name
            date = datetime.now().strftime("%d%m%y_%H%M%S")
            archived_table_name = f"{table.name}_archive_{date}"
            # Change the table name to the new name
            with models.db.engine.connect() as connection:
                connection.execute(
                    text(f"ALTER TABLE {table.name} RENAME TO {archived_table_name}"))  # noqa
                connection.commit()

        # Create all tables referenced in models.py
        models.db.create_all()


if __name__ == "__main__":
    main()
