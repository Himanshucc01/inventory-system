from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from database import get_db
import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.OrderStatus] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product),
    )
    if status:
        query = query.filter(models.Order.status == status)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    order_items_data = []

    # Validate all products and stock in one pass
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, Requested: {item.quantity}",
            )
        order_items_data.append((product, item.quantity, product.price))
        total_amount += product.price * item.quantity

    # Create order
    db_order = models.Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        notes=order_data.notes,
    )
    db.add(db_order)
    db.flush()

    # Deduct stock and create order items
    for product, quantity, unit_price in order_items_data:
        product.stock_quantity -= quantity
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
        )
        db.add(db_item)

    db.commit()

    # Return with relationships loaded
    db.refresh(db_order)
    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product),
    ).filter(models.Order.id == db_order.id).first()


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    pending_orders = db.query(models.Order).filter(models.Order.status == models.OrderStatus.PENDING).count()
    low_stock = db.query(models.Product).filter(models.Product.stock_quantity <= 10).count()
    revenue_result = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.status != models.OrderStatus.CANCELLED
    ).scalar()
    total_revenue = float(revenue_result or 0)

    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        pending_orders=pending_orders,
        low_stock_products=low_stock,
        total_revenue=total_revenue,
    )


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product),
    ).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int, update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If cancelling, restore stock
    if update.status == models.OrderStatus.CANCELLED and order.status != models.OrderStatus.CANCELLED:
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(order, field, value)

    db.commit()
    db.refresh(order)
    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product),
    ).filter(models.Order.id == order_id).first()


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Restore stock if order was not cancelled
    if order.status != models.OrderStatus.CANCELLED:
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
    db.delete(order)
    db.commit()
