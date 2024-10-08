"""modify skills table

Revision ID: 7bb637385f51
Revises: b5d6291d6db9
Create Date: 2024-09-26 13:41:33.595237

"""

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "7bb637385f51"
down_revision = "b5d6291d6db9"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "skill",
        sa.Column("display_name", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )
    op.drop_column("skill", "icon")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "skill", sa.Column("icon", sa.VARCHAR(), autoincrement=False, nullable=True)
    )
    op.drop_column("skill", "display_name")
    # ### end Alembic commands ###
