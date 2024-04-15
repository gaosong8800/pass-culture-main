from geoalchemy2 import Geometry
import sqlalchemy as sa

from pcapi.core.geography.constants import WGS_SPATIAL_REFERENCE_IDENTIFIER
from pcapi.models import Base
from pcapi.models import Model
from pcapi.models.pc_object import PcObject


class IrisFrance(PcObject, Base, Model):
    __tablename__ = "iris_france"
    code = sa.Column(sa.String(9), nullable=False, unique=True)
    shape: str | Geometry = sa.Column("shape", Geometry(srid=WGS_SPATIAL_REFERENCE_IDENTIFIER), nullable=False)


class Address(PcObject, Base, Model):
    __tablename__ = "address"
    banId: str | None = sa.Column(sa.Text(), nullable=True, unique=True)
    inseeCode: str | None = sa.Column(sa.Text(), nullable=False)
    street: str = sa.Column(sa.Text(), nullable=False)
    postalCode: str = sa.Column(sa.Text(), nullable=False)
    city: str = sa.Column(sa.Text(), nullable=False)
    country: str = sa.Column(sa.Text(), nullable=False)
    latitude: float = sa.Column(sa.Numeric(8, 5), nullable=False)
    longitude: float = sa.Column(sa.Numeric(8, 5), nullable=False)

    __table_args__ = (
        sa.Index("ix_unique_address_per_banid", "banId", unique=True, postgresql_where=banId.isnot(None)),
        sa.Index(
            "ix_unique_address_per_street_and_insee_code",
            "street",
            "inseeCode",
            unique=True,
            postgresql_where=banId.is_(None),
        ),
        sa.CheckConstraint('length("postalCode") = 5'),
        sa.CheckConstraint('length("inseeCode") = 5'),
        sa.CheckConstraint('length("city") <= 50'),
        sa.CheckConstraint('length("country") <= 50'),
    )
