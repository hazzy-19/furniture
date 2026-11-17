"""add cloudinary public ids

Revision ID: b1e4c798a2d1
Revises: aa737875f0a0
Create Date: 2026-11-17 12:43:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1e4c798a2d1'
down_revision: Union[str, Sequence[str], None] = 'aa737875f0a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('categories', sa.Column('cloudinary_public_id', sa.String(length=255), nullable=True))
    op.add_column('product_images', sa.Column('cloudinary_public_id', sa.String(length=255), nullable=True))
    op.add_column('hero_banners', sa.Column('cloudinary_public_id_desktop', sa.String(length=255), nullable=True))
    op.add_column('hero_banners', sa.Column('cloudinary_public_id_mobile', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('hero_banners', 'cloudinary_public_id_mobile')
    op.drop_column('hero_banners', 'cloudinary_public_id_desktop')
    op.drop_column('product_images', 'cloudinary_public_id')
    op.drop_column('categories', 'cloudinary_public_id')
