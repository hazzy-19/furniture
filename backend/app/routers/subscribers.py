from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Subscriber
from app.schemas.subscribers import SubscriberCreate, SubscriberResponse


router = APIRouter(prefix="/api", tags=["subscribers"])


@router.post(
    "/subscribers",
    response_model=SubscriberResponse,
)
def subscribe(
    payload: SubscriberCreate,
    db: Session = Depends(get_db),
) -> SubscriberResponse:
    email = str(payload.email).strip().lower()

    subscriber = db.scalar(
        select(Subscriber).where(Subscriber.email == email)
    )

    if subscriber is None:
        subscriber = Subscriber(
            email=email,
            consent_at=datetime.now(timezone.utc),
            consent_source=payload.source,
            wants_new_arrivals=payload.wants_new_arrivals,
            wants_hot_items=payload.wants_hot_items,
            wants_low_stock=payload.wants_low_stock,
        )
        db.add(subscriber)
    else:
        subscriber.consent_at = datetime.now(timezone.utc)
        subscriber.consent_source = payload.source
        subscriber.wants_new_arrivals = payload.wants_new_arrivals
        subscriber.wants_hot_items = payload.wants_hot_items
        subscriber.wants_low_stock = payload.wants_low_stock
        subscriber.unsubscribed_at = None

    db.commit()

    return SubscriberResponse(
        ok=True,
        message="Thanks for signing up. Email updates are not enabled yet.",
    )