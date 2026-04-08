from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Item
from schemas import ItemCreate, ItemUpdate, ItemResponse

Base.metadata.create_all(bind=engine)  

app = FastAPI()


@app.post("/items/", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = Item(
        name        = item.name,
        description = item.description,
        price       = item.price
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/items/", response_model=list[ItemResponse])
def get_all_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, updated: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.name        = updated.name
    item.description = updated.description
    item.price       = updated.price
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": f"Item {item_id} deleted successfully"}