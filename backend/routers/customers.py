from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.CustomerResponse])
def list_customers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            models.Customer.name.ilike(f"%{search}%") |
            models.Customer.email.ilike(f"%{search}%")
        )
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer.email}' already exists")
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(customer_id: int, update: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    update_data = update.model_dump(exclude_unset=True)
    if "email" in update_data:
        existing = db.query(models.Customer).filter(
            models.Customer.email == update_data["email"],
            models.Customer.id != customer_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email '{update_data['email']}' is already in use")
    for field, value in update_data.items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
