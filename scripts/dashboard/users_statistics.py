import pandas

from sqlalchemy import func

from models import Booking, User
from models.db import db
import repository.user_queries as user_repository
from repository.booking_queries import count_non_cancelled_bookings, count_non_cancelled_bookings_by_departement


def count_activated_users(departement_code: str = None):
    if departement_code is None:
        return user_repository.count_all_activated_users()

    return user_repository.count_all_activated_users_by_departement(departement_code)


def count_users_having_booked(departement_code: str = None):
    if departement_code is None:
        return user_repository.count_users_having_booked()

    return user_repository.count_users_having_booked_by_departement_code(departement_code)


def get_mean_number_of_bookings_per_user_having_booked(departement_code: str = None):
    number_of_users_having_booked = count_users_having_booked(departement_code)

    if not number_of_users_having_booked:
        return 0

    number_of_non_cancelled_bookings = count_non_cancelled_bookings() if (departement_code is None) \
        else count_non_cancelled_bookings_by_departement(departement_code)

    return number_of_non_cancelled_bookings / number_of_users_having_booked


def _query_amount_spent_by_departement(departement_code: str):
    query = db.session.query(func.sum(Booking.amount * Booking.quantity))

    if departement_code:
        query = query.join(User).filter(User.departementCode == departement_code)

    return query.filter(Booking.isCancelled == False)


def get_mean_amount_spent_by_user(departement_code: str = None):
    number_of_users_having_booked = count_users_having_booked(departement_code)
    amount_spent_on_bookings = _query_amount_spent_by_departement(departement_code).scalar()

    if not amount_spent_on_bookings:
        return 0

    return amount_spent_on_bookings / number_of_users_having_booked


def get_non_cancelled_bookings_by_user_departement():
    non_cancelled_bookings_by_user_departement = _query_get_non_cancelled_bookings_by_user_departement()
    return pandas.DataFrame(columns=["Département de l\'utilisateur", 'Nombre de réservations'],
                            data=non_cancelled_bookings_by_user_departement)


def _query_get_non_cancelled_bookings_by_user_departement():
    return db.engine.execute(
        """
        SELECT "user"."departementCode" as "departementCode", SUM("booking"."quantity")
        FROM booking
        JOIN "user" ON "user".id = booking."userId"
        WHERE booking."isCancelled" IS FALSE
        GROUP BY "user"."departementCode"
        ORDER BY "user"."departementCode";
        """).fetchall()
