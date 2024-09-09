"""add language in usr table final

Revision ID: f3e7a75611f1
Revises: ecced08285f0
Create Date: 2024-09-09 08:46:11.660564

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'f3e7a75611f1'
down_revision = 'ecced08285f0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('language', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'language')
    # ### end Alembic commands ###
