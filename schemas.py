from pydantic import BaseModel

# For creating an item (no id — DB generates it)
class ItemCreate(BaseModel):
    name: str
    description: str | None = None
    price: float

# For updating an item
class ItemUpdate(BaseModel):
    name: str
    description: str | None = None
    price: float

# For responses (includes id)
class ItemResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float

    class Config:
        orm_mode = True   # allows reading SQLAlchemy objects directly