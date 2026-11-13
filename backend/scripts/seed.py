"""Add sample website content to the database."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    Category,
    HeroBanner,
    Product,
    ProductStatus,
    PromoMessage,
)


ROOMS = [
    {
        "slug": "living-room",
        "name": "Living room",
        "blurb": "Furniture for comfortable, considered living.",
        "categories": [
            ("sofas", "Sofas"),
            ("sectionals", "Sectionals"),
            ("recliners", "Recliners"),
            ("armchairs", "Armchairs"),
            ("coffee-tables", "Coffee tables"),
            ("tv-stands", "TV stands"),
        ],
    },
    {
        "slug": "dining",
        "name": "Dining",
        "blurb": "Pieces for gathering around the table.",
        "categories": [
            ("dining-sets", "Dining sets"),
            ("dining-tables", "Dining tables"),
            ("dining-chairs", "Dining chairs"),
            ("sideboards", "Sideboards"),
        ],
    },
    {
        "slug": "bedroom",
        "name": "Bedroom",
        "blurb": "Furniture for a restful bedroom.",
        "categories": [
            ("beds", "Beds"),
            ("wardrobes", "Wardrobes"),
            ("dressers", "Dressers"),
            ("nightstands", "Nightstands"),
            ("mattresses", "Mattresses"),
        ],
    },
    {
        "slug": "decor",
        "name": "Decor",
        "blurb": "Finishing touches for your home.",
        "categories": [
            ("wall-art", "Wall art"),
            ("rugs", "Rugs"),
            ("lighting", "Lighting"),
            ("mirrors", "Mirrors"),
        ],
    },
]


PRODUCTS = [
    {
        "slug": "zuri-3-seater-sofa",
        "name": "Zuri 3 seater sofa",
        "description": (
            "Generous three-seater sofa tailored in textured linen upholstery "
            "with deep foam cushions and a solid kiln-dried hardwood frame."
        ),
        "price_kes": 189000,
        "compare_at_price_kes": None,
        "category_slug": "sofas",
        "material": "Linen and hardwood frame",
        "color": "Oatmeal",
        "width_cm": 220,
        "depth_cm": 95,
        "height_cm": 85,
        "is_hot": False,
        "stock_quantity": 8,
        "published_days_ago": 3,
    },
    {
        "slug": "mara-6-seater-dining-set",
        "name": "Mara 6 seater dining set",
        "description": (
            "Solid mahogany dining table with soft eased edges, accompanied "
            "by six sculpted matching chairs with contoured timber backrests."
        ),
        "price_kes": 142500,
        "compare_at_price_kes": 165000,
        "category_slug": "dining-sets",
        "material": "Solid mahogany",
        "color": "Dark walnut",
        "width_cm": 180,
        "depth_cm": 90,
        "height_cm": 76,
        "is_hot": True,
        "stock_quantity": 5,
        "published_days_ago": 60,
    },
    {
        "slug": "imani-upholstered-bed",
        "name": "Imani upholstered bed",
        "description": (
            "Low-profile bed frame featuring an upholstered charcoal "
            "headboard and reinforced timber slats."
        ),
        "price_kes": 98000,
        "compare_at_price_kes": None,
        "category_slug": "beds",
        "material": "Upholstered headboard, hardwood frame",
        "color": "Charcoal",
        "width_cm": 205,
        "depth_cm": 165,
        "height_cm": 115,
        "is_hot": False,
        "stock_quantity": 4,
        "published_days_ago": 3,
    },
    {
        "slug": "amani-2-seater-sofa",
        "name": "Amani 2 seater sofa",
        "description": (
            "Compact two-seater sofa in serene sage linen upholstery, "
            "suited to contemporary apartment living."
        ),
        "price_kes": 119000,
        "compare_at_price_kes": 139000,
        "category_slug": "sofas",
        "material": "Linen and hardwood frame",
        "color": "Sage",
        "width_cm": 160,
        "depth_cm": 90,
        "height_cm": 85,
        "is_hot": False,
        "stock_quantity": 9,
        "published_days_ago": 60,
    },
    {
        "slug": "tuli-accent-armchair",
        "name": "Tuli accent armchair",
        "description": (
            "Sculptural accent armchair wrapped in plush ivory boucle fabric "
            "with solid oak legs."
        ),
        "price_kes": 54500,
        "compare_at_price_kes": None,
        "category_slug": "armchairs",
        "material": "Boucle and oak",
        "color": "Ivory",
        "width_cm": 80,
        "depth_cm": 82,
        "height_cm": 78,
        "is_hot": True,
        "stock_quantity": 2,
        "published_days_ago": 60,
    },
    {
        "slug": "safiri-coffee-table",
        "name": "Safiri coffee table",
        "description": (
            "Minimalist coffee table crafted from solid natural oak "
            "with smooth rounded edges."
        ),
        "price_kes": 36000,
        "compare_at_price_kes": None,
        "category_slug": "coffee-tables",
        "material": "Solid oak",
        "color": "Natural oak",
        "width_cm": 110,
        "depth_cm": 60,
        "height_cm": 40,
        "is_hot": False,
        "stock_quantity": 14,
        "published_days_ago": 3,
    },
    {
        "slug": "baraka-3-door-wardrobe",
        "name": "Baraka 3 door wardrobe",
        "description": (
            "Spacious three-door wardrobe finished in warm natural oak "
            "veneer, with hanging space and interior shelving."
        ),
        "price_kes": 128000,
        "compare_at_price_kes": 149000,
        "category_slug": "wardrobes",
        "material": "Oak veneer on engineered wood",
        "color": "Natural oak",
        "width_cm": 150,
        "depth_cm": 55,
        "height_cm": 210,
        "is_hot": False,
        "stock_quantity": 6,
        "published_days_ago": 60,
    },
    {
        "slug": "neema-nightstand",
        "name": "Neema nightstand",
        "description": (
            "Refined single-drawer bedside nightstand built from solid "
            "mahogany with an open lower shelf."
        ),
        "price_kes": 18500,
        "compare_at_price_kes": None,
        "category_slug": "nightstands",
        "material": "Solid mahogany",
        "color": "Dark walnut",
        "width_cm": 45,
        "depth_cm": 40,
        "height_cm": 55,
        "is_hot": False,
        "stock_quantity": 3,
        "published_days_ago": 3,
    },
]


PROMOS = [
    "Free delivery in Nairobi and Mombasa",
    "New arrivals every week",
    "Visit our showrooms",
]


def seed_database() -> None:
    now = datetime.now(timezone.utc)

    with SessionLocal.begin() as db:
        categories_by_slug: dict[str, Category] = {}

        # Create the top-level room categories first.
        for room_order, room_data in enumerate(ROOMS):
            room = db.scalar(
                select(Category).where(Category.slug == room_data["slug"])
            )

            if room is None:
                room = Category(slug=room_data["slug"])
                db.add(room)

            room.name = room_data["name"]
            room.blurb = room_data["blurb"]
            room.image_url = None
            room.parent_id = None
            room.sort_order = room_order
            db.flush()

            categories_by_slug[room_data["slug"]] = room

        # Create each room's child categories.
        for room_order, room_data in enumerate(ROOMS):
            parent = categories_by_slug[room_data["slug"]]

            for category_order, (slug, name) in enumerate(room_data["categories"]):
                category = db.scalar(
                    select(Category).where(Category.slug == slug)
                )

                if category is None:
                    category = Category(slug=slug)
                    db.add(category)

                category.name = name
                category.blurb = None
                category.image_url = None
                category.parent_id = parent.id
                category.sort_order = category_order
                db.flush()

                categories_by_slug[slug] = category

        # Create or update the sample products.
        products_by_slug: dict[str, Product] = {}

        for product_data in PRODUCTS:
            product = db.scalar(
                select(Product).where(Product.slug == product_data["slug"])
            )

            if product is None:
                product = Product(slug=product_data["slug"])
                db.add(product)

            product.name = product_data["name"]
            product.description = product_data["description"]
            product.price_kes = product_data["price_kes"]
            product.compare_at_price_kes = product_data["compare_at_price_kes"]
            product.category_id = categories_by_slug[
                product_data["category_slug"]
            ].id
            product.material = product_data["material"]
            product.color = product_data["color"]
            product.width_cm = product_data["width_cm"]
            product.depth_cm = product_data["depth_cm"]
            product.height_cm = product_data["height_cm"]
            product.is_hot = product_data["is_hot"]
            product.status = ProductStatus.PUBLISHED
            product.published_at = now - timedelta(
                days=product_data["published_days_ago"]
            )
            product.stock_quantity = product_data["stock_quantity"]
            product.low_stock_threshold = 3
            db.flush()

            products_by_slug[product.slug] = product

        # Link each room to its featured product for the navigation menu.
        featured_products = {
            "living-room": "zuri-3-seater-sofa",
            "dining": "mara-6-seater-dining-set",
            "bedroom": "imani-upholstered-bed",
        }

        for room_slug, product_slug in featured_products.items():
            categories_by_slug[room_slug].featured_product_id = (
                products_by_slug[product_slug].id
            )

        # Add the homepage hero if there is no active one already.
        hero = db.scalar(
            select(HeroBanner)
            .where(HeroBanner.is_active.is_(True))
            .limit(1)
        )

        if hero is None:
            db.add(
                HeroBanner(
                    headline_desktop="Furnish your home with quiet luxury",
                    headline_mobile="Quiet luxury for your home",
                    subtext="Sofas from KES 89,000",
                    cta_label="Shop the collection",
                    cta_url="/shop/living-room/sofas",
                    image_url_desktop="/hero.jpg",
                    image_url_mobile="/hero-mobile.jpg",
                    is_active=True,
                )
            )

        # Insert each promo only if it is not already present.
        for sort_order, promo_text in enumerate(PROMOS):
            promo = db.scalar(
                select(PromoMessage).where(PromoMessage.text == promo_text)
            )

            if promo is None:
                db.add(
                    PromoMessage(
                        text=promo_text,
                        sort_order=sort_order,
                        is_active=True,
                    )
                )


if __name__ == "__main__":
    seed_database()
    print("Sample catalog and homepage content saved.")